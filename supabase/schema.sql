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

alter table tanks enable row level security;
alter table creatures enable row level security;

-- 個人利用・未認証(anon key)前提の暫定ポリシー。
-- 本アプリを公開URLへデプロイする場合は、認証(Supabase Auth)を追加し
-- auth.uid() に基づくポリシーへ差し替えること。
drop policy if exists "Allow all for anon (personal use)" on tanks;
create policy "Allow all for anon (personal use)" on tanks
  for all using (true) with check (true);

drop policy if exists "Allow all for anon (personal use)" on creatures;
create policy "Allow all for anon (personal use)" on creatures
  for all using (true) with check (true);
