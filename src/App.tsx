import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  AirVent,
  Check,
  ChevronDown,
  CalendarDays,
  Droplets,
  ExternalLink,
  Menu,
  Phone,
  ShieldCheck,
  SunMedium,
  X,
} from "lucide-react";
import {
  getLocalLeads,
  getProductCategories,
  isSupabaseConfigured,
  saveLead,
  supabase,
  type LeadRecord,
  type ProductCategoryRecord,
} from "./lib/supabase";
import { metrics, processSteps, services, subsidyPrograms } from "./data/content";

const states = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "ACT", "NT"];
const productIcons = {
  "solar-pv": SunMedium,
  "heat-pump-hot-water": Droplets,
  "reverse-cycle-aircon": AirVent,
};

type ProductDisplay = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  detail: string;
  estimate: string;
  icon: typeof SunMedium;
};

function productFromDatabase(record: ProductCategoryRecord): ProductDisplay {
  return {
    id: record.slug,
    slug: record.slug,
    title: record.name,
    summary: record.description,
    detail: "Fetched from the Supabase product catalogue.",
    estimate: record.typical_incentive_note,
    icon: productIcons[record.slug as keyof typeof productIcons] || ShieldCheck,
  };
}

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  postcode: "",
  state: "VIC",
  home_type: "Detached house",
  services: ["Solar PV systems"],
  owns_home: true,
  bill_range: "$350 to $600 / quarter",
  timeframe: "Next 1-3 months",
  notes: "",
};

type AdminLead = Partial<LeadRecord> & { id?: string; created_at?: string };

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("VIC");
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLeads, setAdminLeads] = useState<AdminLead[]>([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [products, setProducts] = useState<ProductDisplay[]>(services.map((service) => ({ ...service, slug: service.id })));
  const [productsSource, setProductsSource] = useState<"database" | "fallback">("fallback");

  const serviceOptions = products.map((service) => service.title);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const productRows = await getProductCategories();
        if (!active || productRows.length === 0) return;

        setProducts(productRows.map(productFromDatabase));
        setProductsSource("database");
        setForm((current) => ({
          ...current,
          services: current.services.length ? current.services : [productRows[0].name],
        }));
      } catch (error) {
        console.warn("Using fallback products because Supabase product loading failed.", error);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const visiblePrograms = useMemo(() => {
    return subsidyPrograms.filter((program) => program.scope === "National" || program.scope === selectedState);
  }, [selectedState]);

  const selectedServiceCount = form.services.length || 1;
  const estimatedAnnualSaving = selectedServiceCount * 420 + (form.services.includes("Solar PV systems") ? 680 : 0);

  function toggleService(service: string) {
    setForm((current) => {
      const exists = current.services.includes(service);
      const servicesNext = exists
        ? current.services.filter((item) => item !== service)
        : [...current.services, service];
      return { ...current, services: servicesNext.length ? servicesNext : [service] };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const estimated_rebate_focus = visiblePrograms.map((program) => program.title).join(", ");
    try {
      const result = await saveLead({ ...form, estimated_rebate_focus });
      setStatus("saved");
      const inviteNote =
        result.inviteStatus === "sent"
          ? " We also emailed a booking link so they can choose a meeting time."
          : result.inviteStatus === "pending_config"
            ? " Meeting email is ready, but email provider secrets and booking URL still need to be configured."
            : result.inviteStatus === "failed"
              ? " The enquiry saved, but the meeting email could not be sent yet."
              : " Meeting invite request created.";

      setMessage(
        result.mode === "supabase"
          ? `Thanks. Your request has been saved in Supabase.${inviteNote}`
          : `Thanks. Demo mode saved this request locally.${inviteNote}`,
      );
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong while saving the lead.");
    }
  }

  async function loadAdminLeads(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setAdminMessage("");

    if (!supabase) {
      setAdminLeads(await getLocalLeads());
      setAdminMessage("Supabase is not configured, showing locally saved demo leads.");
      return;
    }

    if (adminEmail && adminPassword) {
      const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
      if (error) {
        setAdminMessage(error.message);
        return;
      }
    }

    const { data, error } = await supabase
      .from("leads")
      .select("*, meeting_requests(*)")
      .order("created_at", { ascending: false });
    if (error) {
      setAdminMessage(error.message);
      return;
    }
    setAdminLeads(data || []);
    setAdminMessage(data?.length ? "Latest Supabase leads loaded." : "No leads found yet.");
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Green Grid Energy home">
          <span className="brand-mark">GG</span>
          <span>Green Grid Energy</span>
        </a>
        <nav className={mobileOpen ? "nav nav-open" : "nav"} aria-label="Main navigation">
          <a href="#services" onClick={() => setMobileOpen(false)}>
            Services
          </a>
          <a href="#subsidies" onClick={() => setMobileOpen(false)}>
            Subsidies
          </a>
          <a href="#quote" onClick={() => setMobileOpen(false)}>
            Quote
          </a>
          <button type="button" className="ghost-button" onClick={() => setAdminOpen(true)}>
            Admin
          </button>
        </nav>
        <a className="phone-link" href="tel:1300000000">
          <Phone size={18} />
          1300 000 000
        </a>
        <button className="menu-button" type="button" onClick={() => setMobileOpen((open) => !open)} aria-label="Menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <img src="/assets/hero-home-energy.png" alt="Australian home with solar, heat pump and air conditioning" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">Solar, heat pump hot water and reverse-cycle aircon</p>
            <h1>Home electrification with subsidy checks built in.</h1>
            <p className="hero-copy">
              Plan a cleaner, cheaper home upgrade with accredited products, practical quote guidance and current
              Australian government incentive pathways.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#quote">
                Get my eligibility check
                <ArrowRight size={18} />
              </a>
              <a className="secondary-button" href="#subsidies">
                View subsidy programs
              </a>
            </div>
          </div>
        </section>

        <section className="metrics-band" aria-label="Company metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div className="metric" key={metric.label}>
                <Icon size={22} />
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            );
          })}
        </section>

        <section id="services" className="section services-section">
          <div className="section-heading">
            <p className="eyebrow">What we install</p>
            <h2>Three upgrades, one coordinated plan</h2>
            <p>
              Customers can compare solar, hot water and air conditioning in one place instead of juggling three
              separate trades and rebate conversations.
            </p>
          </div>
          <div className="service-grid">
            {products.map((service) => {
              const Icon = service.icon;
              return (
                <article className="service-card" key={service.id}>
                  <div className="icon-tile">
                    <Icon size={26} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.summary}</p>
                  <span>{service.detail}</span>
                  <strong>{service.estimate}</strong>
                </article>
              );
            })}
          </div>
        </section>

        <section id="subsidies" className="section subsidy-section">
          <div className="subsidy-layout">
            <div>
              <p className="eyebrow">Australian incentives</p>
              <h2>Subsidy guidance that changes by postcode</h2>
              <p>
                Federal support is available through certificate schemes and finance programs, while state incentives
                depend on the property, equipment, supplier and funding rules.
              </p>
              <label className="select-label" htmlFor="state">
                Choose customer state
                <span>
                  <select id="state" value={selectedState} onChange={(event) => setSelectedState(event.target.value)}>
                    {states.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} />
                </span>
              </label>
            </div>
            <div className="program-list">
              {visiblePrograms.map((program) => (
                <article className="program-row" key={`${program.scope}-${program.title}`}>
                  <div>
                    <span className="scope-pill">{program.scope}</span>
                    <h3>{program.title}</h3>
                    <p>{program.description}</p>
                    <small>{program.appliesTo}</small>
                  </div>
                  <a href={program.url} target="_blank" rel="noreferrer" aria-label={`Open ${program.source}`}>
                    <ExternalLink size={18} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section process-section">
          <div className="section-heading">
            <p className="eyebrow">MVP workflow</p>
            <h2>From inquiry to installation-ready quote</h2>
          </div>
          <div className="process-grid">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="process-step" key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Icon size={24} />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="quote" className="section quote-section">
          <div className="quote-panel">
            <div className="quote-copy">
              <p className="eyebrow">Instant lead capture</p>
              <h2>Request an upgrade plan</h2>
              <p>
                The form saves directly to Supabase when environment keys are configured. In demo mode it stores leads
                locally so the MVP can be tested straight away.
              </p>
              <div className="estimate-box">
                <ShieldCheck size={24} />
                <div>
                  <span>Indicative annual bill impact</span>
                  <strong>${estimatedAnnualSaving.toLocaleString()}+</strong>
                  <small>Based on selected upgrade categories. Final savings depend on site and usage.</small>
                </div>
              </div>
              <div className="estimate-box">
                <CalendarDays size={24} />
                <div>
                  <span>Next step</span>
                  <strong>Email booking link</strong>
                  <small>After enquiry, customers receive your calendar page and choose a meeting time.</small>
                </div>
              </div>
            </div>
            <form className="quote-form" onSubmit={handleSubmit}>
              <p className="catalog-note">
                Product catalogue: {productsSource === "database" ? "loaded from Supabase" : "local fallback"}
              </p>
              <div className="field-pair">
                <label>
                  Full name
                  <input
                    required
                    value={form.full_name}
                    onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                    placeholder="Alex Nguyen"
                  />
                </label>
                <label>
                  Phone
                  <input
                    required
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="04..."
                  />
                </label>
              </div>
              <label>
                Email
                <input
                  required
                  inputMode="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="alex@example.com"
                />
              </label>
              <div className="field-pair">
                <label>
                  State
                  <select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
                    {states.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Postcode
                  <input
                    required
                    inputMode="numeric"
                    value={form.postcode}
                    onChange={(event) => setForm({ ...form, postcode: event.target.value })}
                    placeholder="3000"
                  />
                </label>
              </div>
              <div className="checkbox-group" aria-label="Upgrade services">
                {serviceOptions.map((service) => (
                  <button
                    key={service}
                    type="button"
                    className={form.services.includes(service) ? "chip active" : "chip"}
                    onClick={() => toggleService(service)}
                  >
                    {form.services.includes(service) && <Check size={15} />}
                    {service}
                  </button>
                ))}
              </div>
              <div className="field-pair">
                <label>
                  Current bill
                  <select
                    value={form.bill_range}
                    onChange={(event) => setForm({ ...form, bill_range: event.target.value })}
                  >
                    <option>$0 to $350 / quarter</option>
                    <option>$350 to $600 / quarter</option>
                    <option>$600 to $900 / quarter</option>
                    <option>$900+ / quarter</option>
                  </select>
                </label>
                <label>
                  Timeframe
                  <select
                    value={form.timeframe}
                    onChange={(event) => setForm({ ...form, timeframe: event.target.value })}
                  >
                    <option>ASAP</option>
                    <option>Next 1-3 months</option>
                    <option>Next 3-6 months</option>
                    <option>Researching options</option>
                  </select>
                </label>
              </div>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={form.owns_home}
                  onChange={(event) => setForm({ ...form, owns_home: event.target.checked })}
                />
                I own the home or can approve the upgrade
              </label>
              <label>
                Notes
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  placeholder="Tell us about roof type, old hot water system, number of rooms or preferred install date."
                />
              </label>
              <button className="primary-button full-width" type="submit" disabled={status === "saving"}>
                {status === "saving" ? "Saving..." : "Submit quote request"}
                <ArrowRight size={18} />
              </button>
              {message && <p className={`form-message ${status}`}>{message}</p>}
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Green Grid Energy MVP</span>
        <span>{isSupabaseConfigured ? "Supabase connected" : "Demo mode until Supabase env keys are added"}</span>
      </footer>

      {adminOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-title">
          <div className="modal">
            <button className="close-button" type="button" onClick={() => setAdminOpen(false)} aria-label="Close admin">
              <X size={20} />
            </button>
            <h2 id="admin-title">Lead admin</h2>
            <p>
              Supabase projects use email and password auth. Demo mode reads the browser's locally saved submissions.
            </p>
            <form className="admin-form" onSubmit={loadAdminLeads}>
              <input
                type="email"
                placeholder="Admin email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
              />
              <input
                type="password"
                placeholder="Admin password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
              />
              <button type="submit" className="secondary-button">
                Load leads
              </button>
            </form>
            {adminMessage && <p className="admin-message">{adminMessage}</p>}
            <div className="lead-list">
              {adminLeads.map((lead) => (
                <article className="lead-row" key={lead.id || `${lead.email}-${lead.created_at}`}>
                  <strong>{lead.full_name}</strong>
                  <span>
                    {lead.phone} | {lead.email}
                  </span>
                  <small>
                    {lead.state} {lead.postcode} | {lead.services?.join(", ")}
                  </small>
                  {lead.meeting_requests?.[0] && (
                    <small>
                      Meeting email: {lead.meeting_requests[0].email_status} |{" "}
                      <a href={lead.meeting_requests[0].booking_url} target="_blank" rel="noreferrer">
                        booking link
                      </a>
                    </small>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
