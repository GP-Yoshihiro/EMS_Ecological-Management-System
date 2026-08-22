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
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table tanks add column if not exists sort_order integer not null default 0;

-- 清掃スケジュールの手動設定(任意)。未設定(count is null かつ weekdays が空)の場合は
-- 従来通り水槽サイズ・水量・収容生体数から自動算出する。
alter table tanks add column if not exists cleaning_schedule_count integer;
alter table tanks add column if not exists cleaning_schedule_unit text not null default 'week';
alter table tanks add column if not exists cleaning_schedule_weekdays integer[] not null default '{}';
alter table tanks drop constraint if exists tanks_cleaning_schedule_unit_check;
alter table tanks add constraint tanks_cleaning_schedule_unit_check
  check (cleaning_schedule_unit in ('year', 'month', 'week', 'day'));

-- 水槽/ケージの環境情報(任意入力)。時刻は24時間表記(HH:MM)、温度は℃、湿度は%。
alter table tanks add column if not exists ambient_temperature_c numeric;
alter table tanks add column if not exists humidity_percent numeric;
alter table tanks add column if not exists water_temperature_c numeric;
alter table tanks add column if not exists light_types text[] not null default '{}';
alter table tanks add column if not exists light_start_time time;
alter table tanks add column if not exists light_end_time time;
alter table tanks add column if not exists heater_enabled boolean not null default false;
alter table tanks add column if not exists heater_start_time time;
alter table tanks add column if not exists heater_end_time time;
alter table tanks add column if not exists fan_enabled boolean not null default false;
alter table tanks add column if not exists fan_start_time time;
alter table tanks add column if not exists fan_end_time time;
alter table tanks drop constraint if exists tanks_light_types_check;
alter table tanks add constraint tanks_light_types_check
  check (light_types <@ array['led', 'uv', 'infrared']::text[]);

create table if not exists creatures (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('fish', 'reptile', 'insect', 'other')),
  species_name text not null,
  individual_name text not null default '',
  introduced_at date,
  tank_id uuid references tanks(id) on delete set null,
  notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table creatures add column if not exists sort_order integer not null default 0;

-- 給餌スケジュールの手動設定(任意)。未設定(count is null かつ weekdays が空)の場合は
-- 従来通り生体分類から自動算出する。
alter table creatures add column if not exists feeding_schedule_count integer;
alter table creatures add column if not exists feeding_schedule_unit text not null default 'week';
alter table creatures add column if not exists feeding_schedule_weekdays integer[] not null default '{}';
alter table creatures drop constraint if exists creatures_feeding_schedule_unit_check;
alter table creatures add constraint creatures_feeding_schedule_unit_check
  check (feeding_schedule_unit in ('year', 'month', 'week', 'day'));

create index if not exists creatures_tank_id_idx on creatures(tank_id);

-- sort_orderの初期値を登録順(created_at)で採番する。
-- 既にドラッグ操作等でsort_orderが設定済み(0以外の値が1件でもある)の場合は
-- ユーザーが手動で並び替えた順序を壊さないよう、再実行してもスキップする。
do $$
begin
  if not exists (select 1 from tanks where sort_order <> 0) then
    update tanks set sort_order = sub.rn - 1
    from (select id, row_number() over (order by created_at) as rn from tanks) sub
    where tanks.id = sub.id;
  end if;

  if not exists (select 1 from creatures where sort_order <> 0) then
    update creatures set sort_order = sub.rn - 1
    from (select id, row_number() over (order by created_at) as rn from creatures) sub
    where creatures.id = sub.id;
  end if;
end $$;

create table if not exists creature_logs (
  id uuid primary key default gen_random_uuid(),
  creature_id uuid not null references creatures(id) on delete cascade,
  date date not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists creature_logs_creature_id_idx on creature_logs(creature_id);

-- 給餌の実施記録(予定ではなく「実際に行った」記録)
create table if not exists feeding_records (
  id uuid primary key default gen_random_uuid(),
  creature_id uuid not null references creatures(id) on delete cascade,
  date date not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists feeding_records_creature_id_idx on feeding_records(creature_id);

-- 清掃の実施記録(予定ではなく「実際に行った」記録)
create table if not exists cleaning_records (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references tanks(id) on delete cascade,
  date date not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists cleaning_records_tank_id_idx on cleaning_records(tank_id);

alter table tanks enable row level security;
alter table creatures enable row level security;
alter table creature_logs enable row level security;
alter table feeding_records enable row level security;
alter table cleaning_records enable row level security;

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

drop policy if exists "Allow authenticated users only" on feeding_records;
create policy "Allow authenticated users only" on feeding_records
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "Allow authenticated users only" on cleaning_records;
create policy "Allow authenticated users only" on cleaning_records
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
