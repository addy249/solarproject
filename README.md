# Green Grid Energy MVP

A functional React and Supabase MVP for an Australian energy upgrade company selling:

- Solar PV systems
- Heat pump hot water systems
- Reverse-cycle air conditioning

The site includes a subsidy explorer, savings estimate, lead capture form, local demo storage, and an admin lead view that works with Supabase Auth once connected.

## Run locally

```bash
npm install
npm run dev
```

## Connect Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/0001_mvp_schema.sql` in the Supabase SQL editor or with the Supabase CLI.
3. Copy `.env.example` to `.env`.
4. Add your project URL and anon key.
5. Create an admin user in Supabase Auth for the lead admin modal.

Anonymous visitors can insert leads. Authenticated users can read and manage leads.

## Subsidy notes

The website uses conservative eligibility language because incentives depend on state, postcode, supplier, installer accreditation and funding availability. Source links point to energy.gov.au and the Clean Energy Regulator pathway for current program details.
# solarproject
