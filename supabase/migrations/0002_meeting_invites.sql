create table if not exists public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  booking_url text not null,
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed', 'pending_config')),
  email_error text,
  sent_at timestamptz
);

create index if not exists meeting_requests_lead_id_idx on public.meeting_requests(lead_id);
create index if not exists meeting_requests_created_at_idx on public.meeting_requests(created_at desc);

alter table public.meeting_requests enable row level security;

create policy "Authenticated users can manage meeting requests"
on public.meeting_requests
for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read meeting requests"
on public.meeting_requests
for select
to authenticated
using (true);
