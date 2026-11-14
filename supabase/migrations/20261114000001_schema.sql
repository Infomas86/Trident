-- Skema Trident. RLS diaktifkan di migrasi berikutnya.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role text not null default 'anggota' check (role in ('anggota','penguji','admin')),
  belt text, branch text,
  reg_number text unique,
  photo_url text,
  created_at timestamptz not null default now()
);

create table news (
  id uuid primary key default gen_random_uuid(),
  title text not null, category text, summary text, content text, image_url text,
  tags text[] not null default '{}',
  author_id uuid default auth.uid(), author_name text,
  created_at timestamptz not null default now()
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  athlete_name text not null, championship text, scope text, medal text, category text,
  year text, notes text, photo_url text,
  created_at timestamptz not null default now()
);

create table agendas (
  id uuid primary key default gen_random_uuid(),
  title text not null, date date, time_text text, location text, speaker text, description text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create table agenda_rsvps (
  agenda_id uuid not null references agendas on delete cascade,
  user_id uuid not null default auth.uid() references profiles,
  full_name text,
  status text not null check (status in ('hadir','izin')),
  reason text,
  updated_at timestamptz not null default now(),
  primary key (agenda_id, user_id)
);

create view agenda_rsvps_public as
  select agenda_id, user_id, full_name, status from agenda_rsvps;

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null, category text,
  target_amount bigint not null check (target_amount > 0),
  deadline date, description text,
  created_at timestamptz not null default now()
);

create table donations (
  id uuid primary key default gen_random_uuid(),
  ref_number text unique default 'TRD-DON-' || to_char(now() at time zone 'Asia/Jakarta','YYYYMMDD') || '-' || upper(substr(gen_random_uuid()::text,1,6)),
  campaign_id uuid not null references campaigns on delete restrict,
  user_id uuid default auth.uid() references profiles,
  donor_name text not null,
  amount bigint not null check (amount > 0),
  message text, payment_method text,
  proof_path text not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  verified_by uuid, verified_at timestamptz,
  created_at timestamptz not null default now()
);

create view campaign_totals as
  select c.id as campaign_id,
         coalesce(sum(d.amount), 0)::bigint as collected_amount,
         count(d.id)::int as donors_count
  from campaigns c
  left join donations d on d.campaign_id = c.id and d.status = 'accepted'
  group by c.id;

create view public_donations as
  select id, campaign_id, donor_name, amount, message, created_at
  from donations where status = 'accepted';

create table ukt_candidates (
  id uuid primary key default gen_random_uuid(),
  reg_number text unique not null,
  name text not null, branch text, current_belt text, target_belt text, photo_url text,
  user_id uuid references profiles on delete set null,
  pos1 numeric(4,1) not null default 0 check (pos1 between 0 and 100),
  pos2 numeric(4,1) not null default 0 check (pos2 between 0 and 100),
  pos3 numeric(4,1) not null default 0 check (pos3 between 0 and 100),
  pos4 numeric(4,1) not null default 0 check (pos4 between 0 and 100),
  sub_scores jsonb not null default '{}',
  final_score numeric generated always as (round(pos1*0.25 + pos2*0.30 + pos3*0.20 + pos4*0.25, 1)) stored,
  examiner_notes text, examiner_id uuid, examiner_name text, exam_date date,
  struct_pp text default '', struct_pw text default '', struct_pc text default '',
  struct_pac text default '', struct_pr text default '', struct_par text default '',
  updated_at timestamptz not null default now()
);

create table site_stats (
  id int primary key check (id = 1),
  active_members int not null default 0, medals_count int not null default 0,
  padepokan_branches int not null default 0, ukt_pass_rate numeric not null default 0,
  master_council int not null default 0
);
insert into site_stats (id) values (1);

create table site_content (
  id int primary key check (id = 1),
  hero_badge text, hero_title_main text, hero_title_highlight text, hero_subtitle text,
  bank_name text, bank_account text, bank_holder text, qris_image_url text
);
insert into site_content (id, hero_badge, hero_title_main, hero_title_highlight, hero_subtitle) values (
  1,
  'Padepokan Agung Seni Bela Diri Kesatria',
  'TRIDENT',
  'ACADEMY',
  'Membina raga, menata rasa, dan menggembleng jiwa kesatria sejati melalui kurikulum bela diri terpadu serta standarisasi evaluasi kenaikan tingkat 4 Pos yang presisi.'
);

create table pillars (
  id uuid primary key default gen_random_uuid(),
  title text not null, "desc" text, icon text,
  sort_order int not null default 0
);
insert into pillars (title, "desc", icon, sort_order) values
  ('Integritas & Kehormatan Kesatria', 'Menjunjung tinggi sportivitas, kejujuran batin, dan pantang menyerah dalam setiap langkah kehidupan.', 'Shield', 1),
  ('Keunggulan Fisik & Teknik Jurus', 'Mempertajam refleks, ketahanan stamina prima, dan presisi eksekusi setiap jurus secara disiplin.', 'Zap', 2),
  ('Persaudaraan Selaras Jiwa', 'Menyatukan pesilat dari berbagai latar belakang dalam satu ikatan kekeluargaan padepokan yang kokoh.', 'Users', 3),
  ('Pengabdian bagi Bangsa', 'Menggunakan kemampuan beladiri untuk membela kebenaran, menjaga kedamaian, dan berprestasi membanggakan negeri.', 'Award', 4);

create table training_grounds (
  id uuid primary key default gen_random_uuid(),
  name text not null, tier text, parent_pr text, address text,
  trainer_name text, trainer_belt text, trainer_phone text, trainer_photo_url text,
  schedule text,
  facilities text[] not null default '{}',
  active_students int not null default 0,
  badge text, description text,
  created_at timestamptz not null default now()
);

-- Triggers
create function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger ukt_candidates_updated before update on ukt_candidates for each row execute function set_updated_at();
create trigger agenda_rsvps_updated before update on agenda_rsvps for each row execute function set_updated_at();

create function link_candidate_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.user_id := (select id from profiles where reg_number = new.reg_number);
  return new;
end $$;
create trigger link_candidate_user before insert or update of reg_number on ukt_candidates
  for each row execute function link_candidate_user();

create function link_profile_candidates() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update ukt_candidates set user_id = null where user_id = new.id and reg_number is distinct from new.reg_number;
  if new.reg_number is not null then
    update ukt_candidates set user_id = new.id where reg_number = new.reg_number;
  end if;
  return new;
end $$;
create trigger link_profile_candidates after insert or update of reg_number on profiles
  for each row execute function link_profile_candidates();

create function force_pending_donation() returns trigger language plpgsql as $$
begin
  new.status := 'pending'; new.verified_by := null; new.verified_at := null; new.user_id := auth.uid();
  return new;
end $$;
create trigger force_pending_donation before insert on donations
  for each row execute function force_pending_donation();
