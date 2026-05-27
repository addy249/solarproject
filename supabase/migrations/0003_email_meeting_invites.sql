alter table public.meeting_requests
add column if not exists email_status text not null default 'pending';

alter table public.meeting_requests
add column if not exists email_error text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'meeting_requests'
      and column_name = 'sms_status'
  ) then
    execute 'update public.meeting_requests set email_status = sms_status where email_status = ''pending''';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'meeting_requests'
      and column_name = 'sms_error'
  ) then
    execute 'update public.meeting_requests set email_error = sms_error where email_error is null';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'meeting_requests_email_status_check'
  ) then
    alter table public.meeting_requests
    add constraint meeting_requests_email_status_check
    check (email_status in ('pending', 'sent', 'failed', 'pending_config'));
  end if;
end $$;
