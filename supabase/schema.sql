create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tx_date date not null,
  description text not null,
  merchant text not null,
  category text not null check (category in (
    'salary','rent','groceries','transport','utilities','insurance','loan_repayment',
    'credit_card_payment','payday_loan','subscription','gambling','dining','entertainment',
    'shopping','savings_transfer','medical','education','bank_fees','other'
  )),
  amount numeric(14,2) not null,
  type text not null check (type in ('income','expense','transfer')),
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.health_score_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  health_score int not null check (health_score between 0 and 100),
  category text not null check (category in ('Critical','Weak','Fair','Good','Excellent')),
  pillar_scores jsonb not null,
  top_risk_factors text[] not null default '{}',
  recommended_actions jsonb not null default '[]'::jsonb,
  projected_score_improvement numeric(6,2) not null default 0,
  confidence_level text not null check (confidence_level in ('Low','Medium','High')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.health_score_runs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

drop policy if exists "health_score_runs_select_own" on public.health_score_runs;
create policy "health_score_runs_select_own"
  on public.health_score_runs for select
  using (auth.uid() = user_id);

drop policy if exists "health_score_runs_insert_own" on public.health_score_runs;
create policy "health_score_runs_insert_own"
  on public.health_score_runs for insert
  with check (auth.uid() = user_id);

create index if not exists transactions_user_date_idx on public.transactions(user_id, tx_date desc);
create index if not exists health_score_runs_user_created_idx on public.health_score_runs(user_id, created_at desc);
