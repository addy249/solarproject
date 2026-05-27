import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Lead = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  state: string;
  postcode: string;
  services: string[];
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getEnv(name: string) {
  return Deno.env.get(name)?.trim() || "";
}

function bookingUrlForLead(baseUrl: string, lead: Lead) {
  const url = new URL(baseUrl);
  url.searchParams.set("name", lead.full_name);
  url.searchParams.set("email", lead.email);
  url.searchParams.set("phone", lead.phone);
  url.searchParams.set("lead_id", lead.id);
  url.searchParams.set("location", `${lead.state} ${lead.postcode}`);
  return url.toString();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendMeetingEmail(lead: Lead, bookingUrl: string) {
  const resendApiKey = getEnv("RESEND_API_KEY");
  const fromEmail = getEnv("MEETING_FROM_EMAIL") || "Green Grid Energy <onboarding@resend.dev>";

  if (!resendApiKey) {
    return { status: "pending_config" as const, error: "RESEND_API_KEY is not configured." };
  }

  const services = lead.services?.length ? lead.services.join(", ") : "your energy upgrade";
  const safeName = escapeHtml(lead.full_name);
  const safeServices = escapeHtml(services);
  const safeBookingUrl = escapeHtml(bookingUrl);
  const subject = "Choose a time for your Green Grid Energy consultation";
  const text = [
    `Hi ${lead.full_name},`,
    "",
    `Thanks for your enquiry about ${services}.`,
    "Please choose a meeting time and day using this link:",
    bookingUrl,
    "",
    "Green Grid Energy",
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17211d">
      <h2 style="margin:0 0 12px">Choose a consultation time</h2>
      <p>Hi ${safeName},</p>
      <p>Thanks for your enquiry about <strong>${safeServices}</strong>.</p>
      <p>Please choose a meeting time and day using the button below.</p>
      <p>
        <a href="${safeBookingUrl}" style="display:inline-block;background:#1d6b4f;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
          Choose meeting time
        </a>
      </p>
      <p>Or copy this link into your browser:<br><a href="${safeBookingUrl}">${safeBookingUrl}</a></p>
      <p>Green Grid Energy</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: lead.email,
      subject,
      text,
      html,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    return { status: "failed" as const, error: payload?.message || "Email invite request failed." };
  }

  return { status: "sent" as const, providerId: payload?.id as string | undefined };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bookingBaseUrl = getEnv("BOOKING_URL");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Supabase service role environment is missing." }, 500);
  }

  const { leadId } = await req.json();
  if (!leadId) {
    return jsonResponse({ error: "leadId is required." }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, full_name, phone, email, state, postcode, services")
    .eq("id", leadId)
    .single<Lead>();

  if (leadError || !lead) {
    return jsonResponse({ error: leadError?.message || "Lead not found." }, 404);
  }

  const bookingUrl = bookingBaseUrl ? bookingUrlForLead(bookingBaseUrl, lead) : "";
  const initialStatus = bookingUrl ? "pending" : "pending_config";
  const initialError = bookingUrl ? null : "BOOKING_URL is not configured.";

  const { data: meetingRequest, error: meetingError } = await supabase
    .from("meeting_requests")
    .insert({
      lead_id: lead.id,
      booking_url: bookingUrl || "BOOKING_URL not configured",
      email_status: initialStatus,
      email_error: initialError,
    })
    .select("id")
    .single();

  if (meetingError) {
    return jsonResponse({ error: meetingError.message }, 500);
  }

  if (!bookingUrl) {
    return jsonResponse({
      meetingRequestId: meetingRequest.id,
      emailStatus: "pending_config",
      bookingUrl: null,
    });
  }

  const emailResult = await sendMeetingEmail(lead, bookingUrl);

  await supabase
    .from("meeting_requests")
    .update({
      email_status: emailResult.status,
      email_error: emailResult.error || null,
      sent_at: emailResult.status === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", meetingRequest.id);

  return jsonResponse({
    meetingRequestId: meetingRequest.id,
    emailStatus: emailResult.status,
    bookingUrl,
    providerId: emailResult.providerId || null,
    error: emailResult.error || null,
  });
});
