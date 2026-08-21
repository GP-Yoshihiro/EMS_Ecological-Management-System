-- AquaLife Manager: 水槽/ケージ・生態テーブル定義
-- Supabase の SQL Editor でそのまま実行してください。

create table if not exists tanks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('aquarium', 'cage', 'terrarium', 'other')),
  width_cm numeric not null default 0,
  depth_cm numeric not null default 0,
  height_cm numeric not null default 0,
  volume_liters numeric not null default 0,
  location text not null default '',
  layout_notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists creatures (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('fish', 'reptile', 'insect', 'other')),
  species_name text not null,
  individual_name text not null default '',
  introduced_at date,
  tank_id uuid references tanks(id) on delete set null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists creatures_tank_id_idx on creatures(tank_id);

create table if not exists creature_logs (
  id uuid primary key default gen_random_uuid(),
  creature_id uuid not null references creatures(id) on delete cascade,
  date date not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists creature_logs_creature_id_idx on creature_logs(creature_id);

alter table tanks enable row level security;
alter table creatures enable row level security;
alter table creature_logs enable row level security;

-- ログイン済み(Supabase Authで認証済み)ユーザーのみアクセス可能とするポリシー。
-- 個人利用(単一ユーザー)前提のため、行ごとの所有者チェックは行わず、
-- 「ログインしているかどうか」のみで許可/拒否する。
-- ユーザーアカウントはSupabaseダッシュボードの Authentication > Users から
-- 直接作成すること(アプリ内に公開のサインアップ画面は設けていない)。
drop policy if exists "Allow all for anon (personal use)" on tanks;
drop policy if exists "Allow authenticated users only" on tanks;
create policy "Allow authenticated users only" on tanks
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "Allow all for anon (personal use)" on creatures;
drop policy if exists "Allow authenticated users only" on creatures;
create policy "Allow authenticated users only" on creatures
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "Allow all for anon (personal use)" on creature_logs;
drop policy if exists "Allow authenticated users only" on creature_logs;
create policy "Allow authenticated users only" on creature_logs
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
