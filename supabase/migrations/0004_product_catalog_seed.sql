create extension if not exists pgcrypto;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  typical_incentive_note text not null,
  created_at timestamptz not null default now()
);

insert into public.product_categories (slug, name, description, typical_incentive_note)
values
  (
    'solar-pv',
    'Solar PV systems',
    'CEC-approved rooftop solar designs for homes, rentals and small businesses.',
    'Most eligible systems receive an upfront STC discount through the SRES.'
  ),
  (
    'heat-pump-hot-water',
    'Heat pump hot water',
    'Efficient electric hot water upgrades that can replace aging gas or electric storage units.',
    'Eligible registered air-source heat pumps can receive STCs, with extra state rebates in some locations.'
  ),
  (
    'reverse-cycle-aircon',
    'Reverse-cycle air conditioning',
    'Heating and cooling installs focused on comfort, efficiency and room-by-room control.',
    'State-based incentives may apply depending on customer location and supplier rules.'
  )
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    typical_incentive_note = excluded.typical_incentive_note;

alter table public.product_categories enable row level security;

drop policy if exists "Anyone can read product categories" on public.product_categories;

create policy "Anyone can read product categories"
on public.product_categories
for select
to anon, authenticated
using (true);
