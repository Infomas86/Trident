-- Let admin delete accounts: donation records are kept (donor name stays, link to the account
-- is cleared); the account's agenda RSVPs go with it. UKT rows already unlink (set null).
alter table public.donations drop constraint donations_user_id_fkey;
alter table public.donations add constraint donations_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete set null;

alter table public.agenda_rsvps drop constraint agenda_rsvps_user_id_fkey;
alter table public.agenda_rsvps add constraint agenda_rsvps_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
