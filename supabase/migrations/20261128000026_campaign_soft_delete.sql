-- "Hapus" program donasi = sembunyikan (soft delete): program hilang dari halaman Donasi, tetapi
-- donasinya tetap tercatat dan tetap masuk Laporan Donasi (diberi tanda "(dihapus)").
alter table public.campaigns add column if not exists deleted_at timestamptz;

create or replace view public.donation_report
with (security_invoker = true)
as
select
  d.campaign_id,
  case when c.deleted_at is not null then c.title || ' (dihapus)' else c.title end as campaign_title,
  date_trunc('month', d.created_at)::date as period_month,
  count(*) filter (where d.status = 'accepted') as donors_count,
  coalesce(sum(d.amount) filter (where d.status = 'accepted'), 0) as total_amount
from public.donations d
join public.campaigns c on c.id = d.campaign_id
group by d.campaign_id, c.title, c.deleted_at, date_trunc('month', d.created_at);

-- Donasi baru tidak boleh masuk ke program yang sudah dihapus (lewat API langsung).
create or replace function public.force_pending_donation() returns trigger language plpgsql as $$
begin
  new.status := 'pending'; new.verified_by := null; new.verified_at := null; new.user_id := auth.uid();
  new.ref_number := 'TRD-DON-' || to_char(now() at time zone 'Asia/Jakarta','YYYYMMDD') || '-' || upper(substr(gen_random_uuid()::text,1,6));
  new.created_at := now();
  if auth.uid() is not null and split_part(new.proof_path, '/', 1) <> auth.uid()::text then
    raise exception 'bukti donasi harus di folder sendiri';
  end if;
  if exists (select 1 from public.campaigns where id = new.campaign_id and deleted_at is not null) then
    raise exception 'Program donasi ini sudah dihapus';
  end if;
  return new;
end $$;
