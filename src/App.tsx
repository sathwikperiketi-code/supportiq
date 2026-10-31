import { useMemo, useState } from 'react'
import {
  Activity, ArrowUpRight, BookOpen, Bot, Check, ChevronDown, CircleHelp,
  Clock3, Command, FileText, Filter, LayoutDashboard, MessageCircle, MoreHorizontal,
  LogOut, Plus, Search, Send, Settings2, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp, TrendingUp,
  Users, X, Zap
} from 'lucide-react'
import { activities, articles as initialArticles, questions, type Article } from './data'
import { isDemoMode } from './supabase'
import { useAuth } from './useAuth'

type Page = 'Overview' | 'AI Support Chat' | 'Knowledge Base' | 'Unanswered Questions' | 'Feedback' | 'Analytics' | 'Settings'
type Message = { role: 'assistant' | 'user'; text: string; sources?: Article[]; fallback?: boolean }

const nav = [
  { name: 'Overview' as Page, icon: LayoutDashboard, group: 'WORKSPACE' },
  { name: 'AI Support Chat' as Page, icon: MessageCircle, group: 'WORKSPACE' },
  { name: 'Knowledge Base' as Page, icon: BookOpen, group: 'WORKSPACE' },
  { name: 'Unanswered Questions' as Page, icon: CircleHelp, group: 'INSIGHTS', badge: '12' },
  { name: 'Feedback' as Page, icon: ThumbsUp, group: 'INSIGHTS' },
  { name: 'Analytics' as Page, icon: TrendingUp, group: 'INSIGHTS' },
  { name: 'Settings' as Page, icon: Settings2, group: 'ADMIN' },
]
const answerFor = (q: string, docs: Article[]): Message => {
  const terms = q.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 3)
  const ranked = docs.filter(d => d.status === 'Published').map(d => ({
    article: d,
    score: terms.reduce((s, t) => s + ((d.title + ' ' + d.category + ' ' + d.excerpt + ' ' + d.content).toLowerCase().includes(t) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score)
  if (!ranked.length || ranked[0].score === 0) return {
    role: 'assistant',
    text: "I couldn't find a verified answer in the current knowledge base. I've flagged this question for the support team rather than guessing.",
    fallback: true,
  }
  const source = ranked[0].article
  return { role: 'assistant', text: source.content, sources: ranked.filter(x => x.score > 0).slice(0, 2).map(x => x.article) }
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [page, setPage] = useState<Page>('Overview')
  const [docs, setDocs] = useState<Article[]>(initialArticles)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hi there! 👋 I’m SupportIQ, your support knowledge assistant. Ask me about orders, billing, account access, or support policies.', sources: [] },
  ])
  const [feedback, setFeedback] = useState<Record<number, string>>({})
  const [showNewArticle, setShowNewArticle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Account')
  const [newContent, setNewContent] = useState('')
  const [notice, setNotice] = useState('')

  const filteredDocs = useMemo(() => docs.filter(d =>
    (category === 'All categories' || d.category === category) &&
    `${d.title} ${d.excerpt} ${d.category}`.toLowerCase().includes(search.toLowerCase())
  ), [docs, search, category])

  const notify = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 2800) }
  const sendMessage = () => {
    const text = query.trim()
    if (!text) return
    const answer = answerFor(text, docs)
    setMessages(prev => [...prev, { role: 'user', text }, answer])
    setQuery('')
  }
  const publishArticle = () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setDocs(prev => [{ id: Math.max(0, ...prev.map(a => a.id)) + 1, title: newTitle.trim(), category: newCategory, updated: 'Just now', views: '0', status: 'Published', excerpt: newContent.trim().slice(0, 90), content: newContent.trim() }, ...prev])
    setNewTitle(''); setNewContent(''); setShowNewArticle(false); setPage('Knowledge Base')
    notify('Article published in this demo session')
  }

  const pageTitle = page === 'Overview' ? 'Good evening, Support team 👋' : page
  const pageSubtitle = page === 'Overview' ? 'Here’s what’s happening with your support knowledge today.' :
    page === 'AI Support Chat' ? 'Try answers grounded in your published knowledge articles.' :
    page === 'Knowledge Base' ? 'Create, manage, and keep your support content accurate.' :
    page === 'Unanswered Questions' ? 'Spot knowledge gaps before they become support tickets.' :
    page === 'Feedback' ? 'Review how helpful your answers have been.' :
    page === 'Analytics' ? 'Understand how customers use your support knowledge.' : 'Manage your workspace and integrations.'

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><div><strong>SupportIQ</strong><span>SUPPORT INTELLIGENCE</span></div></div>
      <button className="workspace-switch"><div className="workspace-avatar">S</div><div className="workspace-copy"><strong>Acme Support</strong><span>Free workspace</span></div><ChevronDown size={15} /></button>
      {['WORKSPACE', 'INSIGHTS', 'ADMIN'].map(group => <div className="nav-group" key={group}><div className="nav-label">{group}</div>
        {nav.filter(n => n.group === group).map(item => <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => setPage(item.name)}>
          <item.icon size={17} strokeWidth={1.8} /><span>{item.name}</span>{'badge' in item && <span className="nav-badge">{item.badge}</span>}
        </button>)}</div>)}
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Zap size={16} /></div><strong>Make support smarter</strong><p>Improve your knowledge base and let AI handle repetitive questions.</p><button onClick={() => setPage('Knowledge Base')}>Explore knowledge base <span>↗</span></button></div>
        <div className="user-row"><div className="user-avatar">{user?.email?.slice(0, 2).toUpperCase() ?? 'AS'}</div><div className="user-copy"><strong>{typeof user?.user_metadata.display_name === 'string' ? user.user_metadata.display_name : isDemoMode ? 'Support Admin' : 'Support team'}</strong><span>{user?.email ?? (isDemoMode ? 'admin@acme.co' : 'Demo workspace')}</span></div>{user && <button className="icon-button" aria-label="Sign out" title="Sign out" onClick={() => { void signOut().catch(error => notify(error instanceof Error ? error.message : 'Unable to sign out. Please try again.')) }}><LogOut size={17} /></button>}</div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><span className="slash">/</span><strong>{page}</strong></div>
        <div className="top-actions"><div className="global-search"><Search size={15} /><input placeholder="Search anything..." value={search} onChange={e => { setSearch(e.target.value); if (page !== 'Knowledge Base') setPage('Knowledge Base') }} /><kbd>⌘ K</kbd></div><button className="icon-button" aria-label="Activity" onClick={() => setPage('Analytics')}><Activity size={18} /></button><button className="icon-button" aria-label="Help" onClick={() => notify('Help center coming soon')}><CircleHelp size={18} /></button><div className="top-avatar">AS</div></div>
      </header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow"><span className="status-dot"></span> SUPPORT WORKSPACE <span className="eyebrow-separator">/</span> {page.toUpperCase()}</div><h1>{pageTitle}</h1><p>{pageSubtitle}</p></div>
          <div className="heading-actions"><span className={`demo-pill ${isDemoMode ? 'demo' : ''}`}><span></span>{isDemoMode ? 'Demo mode' : 'Connected'}</span>{page === 'Knowledge Base' && <button className="primary-button" onClick={() => setShowNewArticle(true)}><Plus size={16} /> New article</button>}{page === 'AI Support Chat' && <button className="secondary-button" onClick={() => setMessages([messages[0]])}>New conversation</button>}</div>
        </div>

        {page === 'Overview' && <Overview setPage={setPage} docs={docs} />}
        {page === 'AI Support Chat' && <Chat messages={messages} query={query} setQuery={setQuery} sendMessage={sendMessage} feedback={feedback} setFeedback={setFeedback} />}
        {page === 'Knowledge Base' && <KnowledgeBase docs={filteredDocs} category={category} setCategory={setCategory} onNew={() => setShowNewArticle(true)} />}
        {page === 'Unanswered Questions' && <Unanswered onReview={() => { setPage('Knowledge Base'); notify('Review the knowledge base and add a missing article') }} />}
        {page === 'Feedback' && <Feedback feedback={feedback} />}
        {page === 'Analytics' && <Analytics />}
        {page === 'Settings' && <Settings notify={notify} />}
      </div>
      <footer className="footer"><span>© 2026 SupportIQ</span><span><span className="footer-dot"></span> All systems operational <span className="footer-sep">·</span> Built for better support</span></footer>
    </main>
    {showNewArticle && <div className="modal-backdrop" onClick={() => setShowNewArticle(false)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><h2>Create knowledge article</h2><p>Write a clear, verified answer your customers can find.</p></div><button className="icon-button" onClick={() => setShowNewArticle(false)}><X size={18} /></button></div><label>Article title<input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. How to update account details" /></label><label>Category<select value={newCategory} onChange={e => setNewCategory(e.target.value)}>{['Account', 'Orders', 'Billing', 'Security', 'Support'].map(c => <option key={c}>{c}</option>)}</select></label><label>Verified answer<textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Add the steps, policy, or answer..." rows={5} /></label><div className="modal-actions"><button className="secondary-button" onClick={() => setShowNewArticle(false)}>Cancel</button><button className="primary-button" onClick={publishArticle}><Check size={16} /> Publish article</button></div></div></div>}
    {notice && <div className="toast"><Check size={16} />{notice}</div>}
  </div>
}

function Overview({ setPage, docs }: { setPage: (p: Page) => void; docs: Article[] }) {
  const stats = [
    { label: 'Questions answered', value: '12,846', change: '+18.6%', trend: 'up', icon: MessageCircle, color: 'violet', caption: 'vs. last 30 days' },
    { label: 'Resolution rate', value: '87.4%', change: '+4.2%', trend: 'up', icon: ShieldCheck, color: 'green', caption: 'vs. last 30 days' },
    { label: 'Knowledge articles', value: String(docs.length).padStart(2, '0'), change: '+3', trend: 'up', icon: BookOpen, color: 'blue', caption: 'this month' },
    { label: 'Needs attention', value: '12', change: '-8.1%', trend: 'down', icon: CircleHelp, color: 'orange', caption: 'unanswered questions' },
  ]
  return <>
    <div className="stats-grid">{stats.map(s => <div className="stat-card" key={s.label}><div className="stat-top"><span>{s.label}</span><div className={`stat-icon ${s.color}`}><s.icon size={17} /></div></div><div className="stat-value">{s.value}</div><div className="stat-bottom"><span className={`trend ${s.trend}`}><ArrowUpRight size={13} /> {s.change}</span><span>{s.caption}</span></div></div>)}</div>
    <div className="content-grid">
      <section className="panel performance-panel"><div className="panel-heading"><div><h2>Support performance</h2><p>Question volume and resolution rate</p></div><button className="select-button" onClick={() => setPage('Analytics')}>Last 7 days <ChevronDown size={14} /></button></div>
        <div className="chart-legend"><span><i className="legend-dot violet-bg"></i>Questions</span><span><i className="legend-dot green-bg"></i>Resolved</span><span className="chart-total">8,492 <small>total questions</small></span></div>
        <div className="chart"><div className="chart-y"><span>2k</span><span>1.5k</span><span>1k</span><span>500</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i></i><i></i><i></i><i></i><i></i></div><svg viewBox="0 0 620 190" preserveAspectRatio="none" role="img" aria-label="Demo support performance line chart"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8b7cff" stopOpacity=".23"/><stop offset="100%" stopColor="#8b7cff" stopOpacity="0"/></linearGradient></defs><path d="M0,132 C28,124 44,140 68,115 S110,96 134,110 S175,83 202,91 S243,58 270,81 S308,92 337,62 S378,79 405,51 S446,63 473,43 S516,53 540,30 S587,44 620,12 L620,190 L0,190 Z" fill="url(#area)"/><path d="M0,132 C28,124 44,140 68,115 S110,96 134,110 S175,83 202,91 S243,58 270,81 S308,92 337,62 S378,79 405,51 S446,63 473,43 S516,53 540,30 S587,44 620,12" fill="none" stroke="#9285ff" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"/><path d="M0,158 C28,148 44,159 68,143 S110,126 134,140 S175,117 202,128 S243,100 270,116 S308,127 337,99 S378,111 405,90 S446,101 473,80 S516,91 540,68 S587,78 620,53" fill="none" stroke="#42cba5" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round"/></svg><div className="chart-x"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div>
      </section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest workspace updates</p></div><button className="more-button" onClick={() => setPage('Analytics')}><MoreHorizontal size={19} /></button></div><div className="activity-list">{activities.map((a, i) => <div className="activity-item" key={a.title}><div className={`activity-icon activity-${a.kind}`}>{i === 0 ? <FileText size={16} /> : i === 1 ? <CircleHelp size={16} /> : i === 2 ? <Check size={16} /> : <TrendingUp size={16} />}</div><div className="activity-copy"><strong>{a.title}</strong><span>{a.detail}</span></div><span className="activity-arrow">↗</span></div>)}</div><button className="text-link" onClick={() => setPage('Analytics')}>View all activity <span>→</span></button></section>
    </div>
    <div className="content-grid lower-grid"><section className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Jump back into your workflow</p></div><Command size={17} className="muted-icon" /></div><div className="quick-actions"><button onClick={() => setPage('AI Support Chat')}><div className="quick-icon quick-violet"><Bot size={19} /></div><span><strong>Test AI responses</strong><small>Try a question against your knowledge base</small></span><span className="quick-arrow">↗</span></button><button onClick={() => setPage('Knowledge Base')}><div className="quick-icon quick-blue"><BookOpen size={19} /></div><span><strong>Manage articles</strong><small>Review and update support content</small></span><span className="quick-arrow">↗</span></button><button onClick={() => setPage('Unanswered Questions')}><div className="quick-icon quick-orange"><CircleHelp size={19} /></div><span><strong>Review knowledge gaps</strong><small>See what customers are asking</small></span><span className="quick-arrow">↗</span></button></div></section>
      <section className="panel health-panel"><div className="panel-heading"><div><h2>Knowledge health</h2><p>How ready is your knowledge base?</p></div><span className="health-score">82<span>/100</span></span></div><div className="health-meter"><span></span></div><div className="health-row"><span><i className="health-check"><Check size={12} /></i> Articles published</span><strong>{docs.filter(d => d.status === 'Published').length} articles</strong></div><div className="health-row"><span><i className="health-check"><Check size={12} /></i> Recently reviewed</span><strong>78%</strong></div><div className="health-row"><span><i className="health-warning">!</i> Unanswered questions</span><strong className="orange-text">12 to review</strong></div><button className="health-button" onClick={() => setPage('Knowledge Base')}>Improve knowledge health <span>→</span></button></section></div>
  </>
}

function Chat({ messages, query, setQuery, sendMessage, feedback, setFeedback }: { messages: Message[]; query: string; setQuery: (v: string) => void; sendMessage: () => void; feedback: Record<number, string>; setFeedback: (v: Record<number, string>) => void }) {
  return <div className="chat-layout"><section className="panel chat-panel"><div className="chat-top"><div className="bot-avatar"><Bot size={19} /></div><div><strong>SupportIQ Assistant</strong><span><i className="online-dot"></i> Knowledge-grounded responses</span></div><span className="model-tag"><Sparkles size={12} /> Support assistant</span></div><div className="messages">{messages.map((m, i) => <div className={`message-row ${m.role}`} key={i}><div className={`message-avatar ${m.role}`}>{m.role === 'assistant' ? <Bot size={16} /> : 'AS'}</div><div className="message-content"><div className="message-author">{m.role === 'assistant' ? 'SupportIQ' : 'You'} <span>{m.role === 'assistant' ? '· AI assistant' : '· just now'}</span></div><div className={`bubble ${m.fallback ? 'fallback-bubble' : ''}`}>{m.text}</div>{m.sources && m.sources.length > 0 && <div className="source-list"><div className="source-label"><ShieldCheck size={13} /> SOURCES USED</div>{m.sources.map(s => <div className="source-card" key={s.id}><div className="source-file"><FileText size={15} /></div><div><strong>{s.title}</strong><span>{s.category} · Published article</span></div><Check size={15} className="source-check" /></div>)}</div>}{m.fallback && <div className="fallback-note"><CircleHelp size={14} /> Added to the knowledge-gap review queue in this prototype.</div>}{m.role === 'assistant' && i > 0 && <div className="message-feedback"><span>Was this helpful?</span><button className={feedback[i] === 'up' ? 'selected' : ''} onClick={() => setFeedback({ ...feedback, [i]: 'up' })} aria-label="Helpful"><ThumbsUp size={14} /></button><button className={feedback[i] === 'down' ? 'selected' : ''} onClick={() => setFeedback({ ...feedback, [i]: 'down' })} aria-label="Not helpful"><ThumbsDown size={14} /></button></div>}</div></div>)}</div><div className="chat-composer"><div className="composer-box"><textarea rows={1} placeholder="Ask a support question..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} /><button className="send-button" onClick={sendMessage} aria-label="Send message"><Send size={16} /></button></div><div className="composer-hint"><span><ShieldCheck size={12} /> Answers use published articles in this demo</span><span>Enter to send · Shift + Enter for new line</span></div></div></section>
    <aside className="chat-aside"><section className="panel suggestion-panel"><div className="panel-heading"><div><h3><Sparkles size={15} /> Try asking</h3><p>Example questions to test</p></div></div>{['How do I reset my password?', 'How long do refunds take?', 'Where can I track my order?', 'How do I contact support?'].map(q => <button key={q} className="suggestion" onClick={() => setQuery(q)}>{q}<span>↗</span></button>)}</section><section className="panel grounding-panel"><div className="grounding-icon"><ShieldCheck size={18} /></div><h3>Grounded in your knowledge</h3><p>Answers in this prototype are matched against published articles. If no useful source is found, SupportIQ says so instead of inventing a response.</p><div className="grounding-stat"><span>Published sources</span><strong>05</strong></div><div className="grounding-stat"><span>Unsupported fallback</span><strong>Enabled</strong></div></section></aside></div>
}

function KnowledgeBase({ docs, category, setCategory, onNew }: { docs: Article[]; category: string; setCategory: (v: string) => void; onNew: () => void }) {
  return <><div className="kb-summary"><div><span>Total articles</span><strong>{docs.length}</strong></div><div><span>Published</span><strong>{docs.filter(d => d.status === 'Published').length}</strong></div><div><span>Drafts</span><strong>{docs.filter(d => d.status === 'Draft').length}</strong></div><div><span>Views this month</span><strong>18.2k</strong></div></div><section className="panel kb-panel"><div className="panel-heading"><div><h2>All articles</h2><p>Keep support answers accurate and easy to discover.</p></div><div className="kb-actions"><button className="select-button" onClick={() => setCategory(category === 'All categories' ? 'Billing' : 'All categories')}><Filter size={14} /> {category} <ChevronDown size={14} /></button><button className="primary-button" onClick={onNew}><Plus size={16} /> New article</button></div></div><div className="table-wrap"><table><thead><tr><th>ARTICLE</th><th>CATEGORY</th><th>STATUS</th><th>VIEWS</th><th>LAST UPDATED</th><th></th></tr></thead><tbody>{docs.map(d => <tr key={d.id}><td><div className="article-cell"><div className="article-file"><FileText size={17} /></div><div><strong>{d.title}</strong><span>{d.excerpt}</span></div></div></td><td><span className={`category-pill cat-${d.category.toLowerCase()}`}>{d.category}</span></td><td><span className={`status-pill ${d.status === 'Published' ? 'published' : 'draft'}`}><i></i>{d.status}</span></td><td className="views-cell">{d.views}</td><td className="date-cell">{d.updated}</td><td><button className="more-button" aria-label={`Options for ${d.title}`}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table>{docs.length === 0 && <div className="empty-state">No articles match this search.</div>}</div><div className="table-footer"><span>Showing <strong>{docs.length}</strong> articles</span><div><button disabled>← Previous</button><button disabled>Next →</button></div></div></section></>
}

function Unanswered({ onReview }: { onReview: () => void }) { return <section className="panel questions-panel"><div className="panel-heading"><div><h2>Questions needing an answer</h2><p>Repeated questions that do not have a clear knowledge-base match.</p></div><span className="count-pill">12 open</span></div>{questions.map((q, i) => <div className="question-row" key={q.text}><div className="question-number">{String(i + 1).padStart(2, '0')}</div><div className="question-copy"><strong>{q.text}</strong><span><span className={`category-pill cat-${q.tag.toLowerCase()}`}>{q.tag}</span> · Seen {q.count} times in the last 30 days</span></div><button className="secondary-button" onClick={onReview}>Create article <Plus size={14} /></button></div>)}</section> }
function Feedback({ feedback }: { feedback: Record<number, string> }) { const vals = Object.values(feedback); return <div className="stats-grid feedback-stats"><div className="stat-card"><div className="stat-top"><span>Helpful responses</span><div className="stat-icon green"><ThumbsUp size={17} /></div></div><div className="stat-value">{vals.filter(v => v === 'up').length + 124}</div><div className="stat-bottom"><span className="trend up">+12.4%</span><span>demo period</span></div></div><div className="stat-card"><div className="stat-top"><span>Needs improvement</span><div className="stat-icon orange"><ThumbsDown size={17} /></div></div><div className="stat-value">{vals.filter(v => v === 'down').length + 18}</div><div className="stat-bottom"><span className="trend down">-4.1%</span><span>demo period</span></div></div><div className="stat-card"><div className="stat-top"><span>Helpfulness score</span><div className="stat-icon violet"><Sparkles size={17} /></div></div><div className="stat-value">87.3%</div><div className="stat-bottom"><span className="trend up">+3.8%</span><span>demo data</span></div></div><div className="stat-card"><div className="stat-top"><span>Your session feedback</span><div className="stat-icon blue"><MessageCircle size={17} /></div></div><div className="stat-value">{vals.length}</div><div className="stat-bottom"><span>responses rated</span></div></div><section className="panel feedback-note"><h2>Feedback insights</h2><p>Use negative feedback to identify stale articles, missing context, or questions that need human review. The figures above are sample values until real feedback storage is connected.</p></section></div> }
function Analytics() { return <><div className="stats-grid"><div className="stat-card"><div className="stat-top"><span>Total conversations</span><div className="stat-icon violet"><MessageCircle size={17} /></div></div><div className="stat-value">8,492</div><div className="stat-bottom"><span className="trend up"><ArrowUpRight size={13} /> 18.6%</span><span>sample data</span></div></div><div className="stat-card"><div className="stat-top"><span>Self-service resolution</span><div className="stat-icon green"><ShieldCheck size={17} /></div></div><div className="stat-value">87.4%</div><div className="stat-bottom"><span className="trend up">+4.2%</span><span>sample data</span></div></div><div className="stat-card"><div className="stat-top"><span>Avg. response time</span><div className="stat-icon blue"><Clock3 size={17} /></div></div><div className="stat-value">1.8s</div><div className="stat-bottom"><span className="trend up">-0.4s</span><span>sample data</span></div></div><div className="stat-card"><div className="stat-top"><span>Active users</span><div className="stat-icon orange"><Users size={17} /></div></div><div className="stat-value">2,104</div><div className="stat-bottom"><span className="trend up">+8.2%</span><span>sample data</span></div></div></div><section className="panel analytics-panel"><div className="panel-heading"><div><h2>Top knowledge topics</h2><p>Illustrative distribution of questions by topic</p></div></div>{[['Account access', 82, '3,210'], ['Orders & shipping', 68, '2,648'], ['Billing & refunds', 54, '2,104'], ['Product setup', 39, '1,522'], ['Security', 27, '1,008']].map(([label, pct, n]) => <div className="topic-row" key={String(label)}><span>{label}</span><div className="topic-track"><i style={{ width: `${pct}%` }} /></div><strong>{n}</strong></div>)}<div className="demo-disclaimer"><Activity size={15} /> These are illustrative metrics, not live customer data.</div></section></> }
function Settings({ notify }: { notify: (t: string) => void }) { return <div className="settings-grid"><section className="panel settings-panel"><div className="panel-heading"><div><h2>Workspace settings</h2><p>General settings for your SupportIQ workspace.</p></div></div><label>Workspace name<input defaultValue="Acme Support" /></label><label>Support email<input defaultValue="support@acme.co" /></label><label>Default answer language<select defaultValue="English"><option>English</option><option>Hindi</option><option>Telugu</option></select></label><button className="primary-button" onClick={() => notify('Settings are local demo values; persistence is not connected yet.')}>Save settings</button></section><section className="panel settings-panel"><div className="panel-heading"><div><h2>Integrations</h2><p>Connect your data and deployment services.</p></div></div>{[['Supabase database', 'Not configured'], ['AI answer provider', 'Not configured'], ['GitHub source control', 'Connect through repository setup'], ['Vercel deployment', 'Connect through Vercel dashboard']].map(([n, s]) => <div className="integration-row" key={n}><div className="integration-icon"><Zap size={17} /></div><div><strong>{n}</strong><span>{s}</span></div><span className="status-pill draft"><i></i> Setup needed</span></div>)}</section></div> }
