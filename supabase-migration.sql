-- ============================================================
-- HiredBabe: Interview Sessions + Answers tables
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Sessions table (one row per "Launch Interview Session" click)
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role_target text not null,
  company_target text default '',
  interview_mode text default 'video',
  pressure_mode text default 'coach',
  question_count int default 0,
  avg_score int default 0,
  best_score int default 0,
  created_at timestamptz default now()
);

-- 2. Answers table (one row per question answered)
create table public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.interview_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  transcript text default '',
  overall_score int default 0,
  technical_score int default 0,
  vibe_score int default 0,
  star_score int default 0,
  clarity_score int default 0,
  confidence_score int default 0,
  relevance_score int default 0,
  hiring_signal text default 'borderline',
  top_strength text default '',
  top_improvement text default '',
  rewritten_answer text default '',
  weakness_tags text[] default '{}',
  strengths text[] default '{}',
  action_items text[] default '{}',
  filler_word_count int default 0,
  estimated_wpm int default 0,
  created_at timestamptz default now()
);

-- 3. Enable Row Level Security
alter table public.interview_sessions enable row level security;
alter table public.interview_answers enable row level security;

-- 4. RLS Policies — users can only access their own data
create policy "Users can read own sessions"
  on public.interview_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.interview_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.interview_sessions for delete
  using (auth.uid() = user_id);

create policy "Users can read own answers"
  on public.interview_answers for select
  using (auth.uid() = user_id);

create policy "Users can insert own answers"
  on public.interview_answers for insert
  with check (auth.uid() = user_id);

-- 5. Indexes for performance
create index idx_sessions_user_id on public.interview_sessions(user_id);
create index idx_sessions_created_at on public.interview_sessions(created_at desc);
create index idx_answers_session_id on public.interview_answers(session_id);
create index idx_answers_user_id on public.interview_answers(user_id);
create index idx_answers_created_at on public.interview_answers(created_at desc);
