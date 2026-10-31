-- SupportIQ initial schema. Review and apply in your own Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  excerpt text,
  content text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  source_article_ids uuid[] not null default '{}',
  fallback_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating text not null check (rating in ('helpful','not_helpful')),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.unanswered_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  normalized_question text,
  occurrences integer not null default 1,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_category_idx on public.articles(status, category);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists unanswered_status_idx on public.unanswered_questions(status, occurrences desc);

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.feedback enable row level security;
alter table public.unanswered_questions enable row level security;

-- Profiles: users can read/update their own profile.
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Published articles are readable by signed-in users; article writes are admin-only.
create policy "articles_read_published" on public.articles for select to authenticated using (status = 'published');
create policy "articles_admin_all" on public.articles for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Users can access only conversations associated with their user id.
create policy "conversations_read_own" on public.conversations for select to authenticated using (user_id = auth.uid());
create policy "conversations_insert_own" on public.conversations for insert to authenticated with check (user_id = auth.uid());
create policy "conversations_update_own" on public.conversations for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "messages_read_own_conversations" on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "messages_insert_own_conversations" on public.messages for insert to authenticated
  with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

create policy "feedback_read_own" on public.feedback for select to authenticated using (user_id = auth.uid());
create policy "feedback_insert_own" on public.feedback for insert to authenticated with check (user_id = auth.uid());

-- Admin-only access to unanswered-question review queue.
create policy "unanswered_admin_all" on public.unanswered_questions for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Important: profile role provisioning and role changes should be handled by trusted server-side
-- logic or a tightly scoped database trigger. Do not let users self-assign the admin role.
