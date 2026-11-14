-- Anggota boleh menghapus unggahan miliknya yang belum dipakai donasi (pembersihan bila insert gagal);
-- bukti yang sudah direferensikan donasi tidak bisa dihapus.
create policy donation_proofs_delete_orphan on storage.objects for delete to authenticated
  using (
    bucket_id = 'donation-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (select 1 from public.donations d where d.proof_path = storage.objects.name)
  );
