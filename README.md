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

## Email meeting invites

The enquiry form now creates a meeting request and calls the Supabase Edge Function at `supabase/functions/send-meeting-invite`.

Run the second migration after the original schema:

```bash
supabase db push
```

Or paste this file into the Supabase SQL editor:

```text
supabase/migrations/0002_meeting_invites.sql
```

Create a booking page in Calendly, Cal.com or another scheduler, then configure Supabase secrets:

```bash
supabase secrets set BOOKING_URL=https://calendly.com/your-company/energy-consult
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set MEETING_FROM_EMAIL="Green Grid Energy <hello@yourdomain.com>"
```

Deploy the Edge Function:

```bash
supabase functions deploy send-meeting-invite
```

When a visitor submits an enquiry, the app saves the lead, creates a `meeting_requests` row, and emails the booking link. If `RESEND_API_KEY` or `BOOKING_URL` is missing, the request is still saved with `email_status = pending_config`.

## Subsidy notes

The website uses conservative eligibility language because incentives depend on state, postcode, supplier, installer accreditation and funding availability. Source links point to energy.gov.au and the Clean Energy Regulator pathway for current program details.
# solarproject
