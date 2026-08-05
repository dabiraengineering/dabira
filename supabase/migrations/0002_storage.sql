-- Public media bucket for logos, hero images, current-study photos.
-- Public READ (browsers load these via next/image), writes are
-- service-role only (admin uploads go through a Server Action).

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

create policy "Public read access for site-media"
  on storage.objects for select
  using (bucket_id = 'site-media');
