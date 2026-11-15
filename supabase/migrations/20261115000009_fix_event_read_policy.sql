-- The read policy looked the event up by id inside a STABLE function, which cannot see a row
-- inserted in the same statement, so INSERT ... RETURNING (create UKT) was rejected.
-- Check the row's own pac instead; examiners still read through their assignment.
drop policy event_read on public.ukt_events;
create policy event_read on public.ukt_events for select to authenticated
  using (
    (public.is_admin() and (public.my_pac() is null or pac = public.my_pac()))
    or exists (select 1 from public.ukt_examiners x where x.event_id = id and x.user_id = auth.uid())
  );
