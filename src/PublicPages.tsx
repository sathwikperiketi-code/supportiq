import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, CircleHelp,
  Eye, EyeOff, FileCheck2, LayoutDashboard, LockKeyhole, Mail, MessageSquareText, Search, ShieldCheck,
  Sparkles, ThumbsUp, X,
} from 'lucide-react'
import { useAuth } from './useAuth'
import { supabase } from './supabase'

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password'

const features = [
  { icon: MessageSquareText, title: 'AI-powered customer support', text: 'Give customers a direct path to answers grounded in your support content.' },
  { icon: BookOpen, title: 'Knowledge base management', text: 'Keep the guidance your team relies on organized and easy to maintain.' },
  { icon: FileCheck2, title: 'Source-based answers', text: 'Show the knowledge articles behind an answer so customers can verify it.' },
  { icon: CircleHelp, title: 'Unanswered questions', text: 'Surface questions without enough supporting knowledge for your team to review.' },
  { icon: ThumbsUp, title: 'Customer feedback', text: 'Collect feedback on answers and use it to improve the support experience.' },
  { icon: Search, title: 'Support analytics', text: 'Explore support activity and knowledge gaps from a single workspace.' },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link className="public-brand" to="/" aria-label="SupportIQ home">
    <span className="public-brand-mark"><Sparkles size={18} strokeWidth={1.8} /></span>
    {!compact && <span><strong>SupportIQ</strong><small>AI</small></span>}
  </Link>
}

function PublicNav() {
  return <header className="public-header">
    <div className="public-header-inner">
      <Brand />
      <nav className="public-nav-links" aria-label="Main navigation">
        <Link to="/#features">Features</Link>
        <Link to="/#how-it-works">How it works</Link>
        <Link to="/#about">About</Link>
      </nav>
      <div className="public-nav-actions">
        <Link className="public-login-link" to="/login">Log in</Link>
        <Link className="public-button public-button-small" to="/signup">Get started <ArrowUpRight size={15} /></Link>
      </div>
    </div>
  </header>
}

function ProductPreview() {
  return <div className="product-preview" aria-label="SupportIQ product interface preview">
    <div className="preview-window-bar"><span className="preview-dot"></span><span className="preview-dot"></span><span className="preview-dot"></span><span className="preview-window-title">SupportIQ workspace</span><span className="preview-window-status">Knowledge assistant</span></div>
    <div className="preview-app">
      <aside className="preview-sidebar">
        <Brand compact />
        <div className="preview-workspace"><span className="preview-workspace-icon">S</span><span>Support workspace</span><ChevronRight size={13} /></div>
        <span className="preview-label">WORKSPACE</span>
        <div className="preview-nav-item"><LayoutDashboard size={14} /> Overview</div>
        <div className="preview-nav-item preview-nav-active"><MessageSquareText size={14} /> AI Support Chat</div>
        <div className="preview-nav-item"><BookOpen size={14} /> Knowledge Base</div>
        <span className="preview-label preview-insights-label">INSIGHTS</span>
        <div className="preview-nav-item"><CircleHelp size={14} /> Unanswered Questions</div>
        <div className="preview-nav-item"><ThumbsUp size={14} /> Feedback</div>
      </aside>
      <div className="preview-main">
        <div className="preview-toolbar"><span>Workspace <i>/</i> AI Support Chat</span><span className="preview-live"><span></span> Knowledge connected</span></div>
        <div className="preview-chat">
          <div className="preview-chat-heading"><span className="preview-chat-icon"><Sparkles size={16} /></span><span><strong>Support knowledge assistant</strong><small>Answers grounded in published articles</small></span></div>
          <div className="preview-message preview-customer">How can I update my billing information?</div>
          <div className="preview-message preview-answer"><p>Open Settings, then Billing. Choose Edit next to your billing information, update the required fields, and save.</p><div className="preview-source"><FileCheck2 size={14} /><span><b>Update billing information</b><small>Knowledge base · Billing</small></span><Check size={14} /></div><div className="preview-answer-note"><ShieldCheck size={13} /> Answer supported by your knowledge base</div></div>
          <div className="preview-composer"><span>Ask a support question...</span><span><ArrowUpRight size={15} /></span></div>
        </div>
      </div>
    </div>
    <div className="preview-caption"><span><span className="preview-caption-dot"></span> Interface preview</span><span>Answers link back to supporting knowledge</span></div>
  </div>
}

export function LandingPage() {
  return <div className="public-site">
    <PublicNav />
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-kicker"><span></span> SUPPORT KNOWLEDGE, MADE USEFUL</div>
          <h1>Customer support powered by knowledge, <span>not guesswork.</span></h1>
          <p>Help customers find reliable answers through AI grounded in your organization's verified knowledge.</p>
          <div className="hero-actions"><Link className="public-button" to="/signup">Get started <ArrowRight size={16} /></Link><a className="public-button-secondary" href="#features">Explore features <ArrowDown size={15} /></a></div>
          <div className="hero-assurance"><ShieldCheck size={15} /> Answers reference your published support content</div>
        </div>
        <ProductPreview />
      </section>

      <section className="feature-section public-section" id="features">
        <div className="section-intro"><span className="section-eyebrow">A MORE GROUNDED SUPPORT EXPERIENCE</span><h2>Knowledge that works<br />for everyone.</h2><p>Bring support content and customer questions together in one considered workspace.</p></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={18} strokeWidth={1.7} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="workflow-section public-section" id="how-it-works">
        <div className="workflow-heading"><div><span className="section-eyebrow">HOW IT WORKS</span><h2>From question to<br />a source-backed answer.</h2></div><p>SupportIQ looks for relevant information in your published knowledge before it responds.</p></div>
        <div className="workflow-steps">
          {[['01', 'Customer question', 'A customer asks for help in the support chat.'], ['02', 'Knowledge retrieval', 'Relevant published support information is found.'], ['03', 'AI response', 'A response is formed from the available guidance.'], ['04', 'Source references', 'Supporting articles are shown alongside the answer.']].map(([number, title, description], index) => <article className="workflow-step" key={number}><span className="workflow-number">{number}</span><div className="workflow-connector">{index < 3 && <ArrowRight size={16} />}</div><h3>{title}</h3><p>{description}</p></article>)}
        </div>
        <div className="safe-fallback"><span className="fallback-icon"><LockKeyhole size={17} /></span><p><strong>When the knowledge isn't there, SupportIQ won't guess.</strong><br />If supporting information is unavailable, the assistant explains that it couldn't verify an answer and flags the question for the support team.</p></div>
      </section>

      <section className="about-section public-section" id="about">
        <div className="about-mark"><Sparkles size={21} /></div><div><span className="section-eyebrow">ABOUT SUPPORTIQ</span><h2>Clear answers start with<br />trusted knowledge.</h2><p>SupportIQ is a customer-support intelligence workspace designed to connect helpful answers with the knowledge behind them.</p></div><Link className="about-link" to="/signup">Explore SupportIQ <ArrowUpRight size={16} /></Link>
      </section>

      <section className="closing-section"><div><span className="section-eyebrow">SUPPORT, WITH MORE CLARITY</span><h2>Make your knowledge<br />easier to put to work.</h2></div><Link className="public-button" to="/signup">Get started <ArrowRight size={16} /></Link></section>
    </main>
    <PublicFooter />
  </div>
}

function PublicFooter() {
  return <footer className="public-footer"><div className="footer-main"><div className="footer-brand"><Brand /><p>AI-powered customer support intelligence.</p></div><div className="footer-links"><div><strong>Product</strong><Link to="/#features">Features</Link><Link to="/#how-it-works">How it works</Link><Link to="/#about">About</Link></div><div><strong>Account</strong><Link to="/login">Log in</Link><Link to="/signup">Sign up</Link></div><div><strong>Information</strong><Link to="/privacy">Privacy Policy <span>Placeholder</span></Link><Link to="/terms">Terms and Conditions <span>Placeholder</span></Link></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} SupportIQ AI</span><span>Legal pages are placeholders and require review before publication.</span></div></footer>
}

function EyeToggle({ visible, onClick, id }: { visible: boolean; onClick: () => void; id: string }) {
  return <button className="password-toggle" type="button" onClick={onClick} aria-label={visible ? 'Hide password' : 'Show password'} aria-controls={id} aria-pressed={visible}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
}

function AuthShell({ title, intro, children, footer }: { title: string; intro: string; children: ReactNode; footer: ReactNode }) {
  return <div className="auth-page"><div className="auth-top"><Brand /><Link to="/">Back to home <ArrowUpRight size={14} /></Link></div><main className="auth-card"><div className="auth-card-mark"><Sparkles size={19} /></div><h1>{title}</h1><p className="auth-intro">{intro}</p>{children}<div className="auth-card-footer">{footer}</div></main><p className="auth-security"><LockKeyhole size={13} /> Your account is secured by Supabase authentication.</p></div>
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  const { user, initializationError, signIn, signUp, requestPasswordReset, updatePassword } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot-password'
  const isReset = mode === 'reset-password'
  const title = isSignup ? 'Create your account' : isReset || isForgot ? 'Reset your password' : 'Welcome back'
  const intro = isSignup ? 'Set up your SupportIQ workspace account.' : isReset ? 'Choose a new password for your account.' : isForgot ? 'Enter your email and we’ll send a secure reset link.' : 'Sign in to continue to your support workspace.'

  useEffect(() => {
    if (user && (mode === 'login' || mode === 'signup')) navigate('/dashboard', { replace: true })
  }, [mode, navigate, user])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    const normalizedEmail = email.trim().toLowerCase()
    if (isSignup && !name.trim()) return setError('Enter your full name.')
    if (!isForgot && !isReset && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return setError('Enter a valid email address.')
    if (isReset && !user) return setError('Open the password reset link from your email to choose a new password.')
    if (!isForgot && !isSignup && !password) return setError('Enter your password.')
    if (isSignup || isReset) {
      if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return setError('Use at least 10 characters, including an uppercase letter, a lowercase letter, and a number.')
      }
      if (password !== confirmation) return setError('Passwords do not match.')
    }

    setSubmitting(true)
    try {
      if (isForgot) {
        await requestPasswordReset(normalizedEmail)
        setSuccess('If an account exists for this email, a password reset link is on its way.')
      } else if (isReset) {
        await updatePassword(password)
        setSuccess('Your password has been updated. You can now continue to your workspace.')
      } else if (isSignup) {
        const result = await signUp(name.trim(), normalizedEmail, password)
        if (result.user?.identities?.length === 0) {
          setError('An account may already exist for this email. Try signing in instead.')
        } else if (result.session) {
          navigate('/dashboard', { replace: true })
        } else {
          setSuccess('Your account is registered. Check your email for a verification link before signing in.')
        }
      } else {
        await signIn(normalizedEmail, password)
        navigate('/dashboard', { replace: true })
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const footer = isSignup ? <>Already have an account? <Link to="/login">Log in</Link></> : isForgot || isReset ? <>Remember your password? <Link to="/login">Back to login</Link></> : <>New to SupportIQ? <Link to="/signup">Create an account</Link></>

  return <AuthShell title={title} intro={intro} footer={footer}>
    {initializationError && <div className="auth-alert auth-error" role="alert">{initializationError}</div>}
    {!supabase && <div className="auth-alert auth-setup" role="status">Authentication is unavailable until Supabase is configured. You can still explore the demo workspace.</div>}
    {isReset && !user && <div className="auth-alert auth-setup" role="status">Open the password reset link sent to your email to continue.</div>}
    {success ? <div className="auth-success" role="status"><span><Check size={17} /></span><p>{success}</p>{isForgot ? <Link to="/login">Return to login <ArrowRight size={14} /></Link> : isReset && <Link to="/dashboard">Continue to workspace <ArrowRight size={14} /></Link>}</div> :
      <form className="auth-form" onSubmit={submit} noValidate>
        {isSignup && <label className="auth-field"><span>Full name</span><input autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your name" required disabled={submitting} /></label>}
        {!isReset && <label className="auth-field"><span>Email address</span><span className="auth-input-wrap"><Mail size={16} /><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com" required disabled={submitting} /></span></label>}
        {!isForgot && <label className="auth-field"><span>Password</span><span className="auth-input-wrap"><LockKeyhole size={16} /><input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup || isReset ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} placeholder={isSignup || isReset ? 'At least 10 characters' : 'Enter your password'} required disabled={submitting || (isReset && !user)} /><EyeToggle visible={showPassword} onClick={() => setShowPassword(value => !value)} id="auth-password" /></span>{(isSignup || isReset) && <small>At least 10 characters, with uppercase, lowercase, and a number.</small>}</label>}
        {(isSignup || isReset) && <label className="auth-field"><span>Confirm password</span><span className="auth-input-wrap"><LockKeyhole size={16} /><input id="auth-confirm-password" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Re-enter your password" required disabled={submitting || (isReset && !user)} /><EyeToggle visible={showConfirmation} onClick={() => setShowConfirmation(value => !value)} id="auth-confirm-password" /></span></label>}
        {!isSignup && !isForgot && !isReset && supabase && <div className="auth-form-options"><span></span><Link to="/forgot-password">Forgot password?</Link></div>}
        {error && <div className="auth-alert auth-error" role="alert"><X size={15} /> {error}</div>}
        <button className="public-button auth-submit" type="submit" disabled={submitting || (isReset && !user)}>{submitting ? <><span className="auth-spinner"></span> Please wait…</> : isSignup ? 'Create account' : isForgot ? 'Send reset link' : isReset ? 'Update password' : 'Log in'} {!submitting && <ArrowRight size={16} />}</button>
      </form>}
    {!success && <div className="auth-form-disclaimer"><ShieldCheck size={14} /> Your information is handled by the configured authentication provider.</div>}
  </AuthShell>
}

export function LegalPlaceholder({ page }: { page: 'privacy' | 'terms' }) {
  const title = page === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions'
  return <div className="public-site"><PublicNav /><main className="legal-placeholder"><span className="section-eyebrow">SUPPORTIQ AI · {title.toUpperCase()}</span><div className="legal-review-label"><X size={15} /> Placeholder — requires final legal review</div><h1>{title}</h1><p>This page is a placeholder and does not describe finalized {page === 'privacy' ? 'privacy practices' : 'terms of service'}. It must be reviewed and replaced with organization-approved legal content before this site is published for customers.</p><Link className="public-button-secondary" to="/">Return to SupportIQ <ArrowRight size={15} /></Link></main><PublicFooter /></div>
}
