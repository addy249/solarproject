create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null,
  postcode text not null,
  state text not null check (state in ('VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT')),
  home_type text not null default 'Detached house',
  services text[] not null default '{}',
  owns_home boolean not null default true,
  bill_range text not null,
  timeframe text not null,
  notes text not null default '',
  estimated_rebate_focus text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost'))
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  typical_incentive_note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subsidy_programs (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  name text not null,
  applies_to text not null,
  description text not null,
  source_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.product_categories (slug, name, description, typical_incentive_note)
values
  ('solar-pv', 'Solar PV systems', 'CEC-approved rooftop solar designs for homes, rentals and small businesses.', 'Most eligible systems receive an upfront STC discount through the SRES.'),
  ('heat-pump-hot-water', 'Heat pump hot water', 'Efficient electric hot water upgrades that can replace aging gas or electric storage units.', 'Eligible registered air-source heat pumps can receive STCs, with extra state rebates in some locations.'),
  ('reverse-cycle-aircon', 'Reverse-cycle air conditioning', 'Heating and cooling installs focused on comfort, efficiency and room-by-room control.', 'State-based incentives may apply depending on customer location and supplier rules.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    typical_incentive_note = excluded.typical_incentive_note;

insert into public.subsidy_programs (scope, name, applies_to, description, source_url)
values
  ('National', 'Small-scale Renewable Energy Scheme', 'Solar PV, solar hot water and eligible air-source heat pump hot water', 'Creates small-scale technology certificates that are commonly assigned for an upfront discount.', 'https://cer.gov.au/schemes/renewable-energy-target/small-scale-renewable-energy-scheme/small-scale-renewable-energy-systems/solar-water-heaters-and-air-source-heat-pumps'),
  ('National', 'Household Energy Upgrades Fund', 'Solar PV, modern appliances, hot water and air conditioning upgrades', 'Discounted finance through participating lenders for eligible home energy upgrades.', 'https://www.energy.gov.au/rebates/household-energy-upgrades-fund'),
  ('VIC', 'Solar Homes Program', 'Solar PV and heat pump or solar hot water', 'Eligible Victorians can access solar panel rebates and hot water rebates, subject to program rules.', 'https://www.energy.gov.au/rebates/solar-panel-pv-rebate'),
  ('NSW', 'Household energy saving upgrades', 'Air conditioning, batteries and hot water systems', 'NSW incentives are delivered through approved suppliers who assess eligibility before the upgrade begins.', 'https://www.energy.gov.au/rebates/household-energy-saving-upgrades'),
  ('WA', 'Air Conditioning Rebate', 'Air conditioner operating costs in eligible high heat areas', 'A WA subsidy for eligible households in areas of high heat discomfort.', 'https://www.energy.gov.au/rebates/air-conditioning-rebate')
on conflict do nothing;

alter table public.leads enable row level security;
alter table public.product_categories enable row level security;
alter table public.subsidy_programs enable row level security;

create policy "Anyone can create leads"
on public.leads
for insert
to anon, authenticated
with check (true);

create policy "Authenticated users can manage leads"
on public.leads
for all
to authenticated
using (true)
with check (true);

create policy "Anyone can read product categories"
on public.product_categories
for select
to anon, authenticated
using (true);

create policy "Anyone can read subsidy programs"
on public.subsidy_programs
for select
to anon, authenticated
using (active);
