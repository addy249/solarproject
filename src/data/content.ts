import {
  AirVent,
  BadgeDollarSign,
  BatteryCharging,
  CalendarCheck,
  ClipboardCheck,
  Droplets,
  Home,
  PiggyBank,
  ShieldCheck,
  SunMedium,
  TimerReset,
  Zap,
} from "lucide-react";

export const services = [
  {
    id: "solar",
    title: "Solar PV systems",
    icon: SunMedium,
    summary: "CEC-approved rooftop solar designs for homes, rentals and small businesses.",
    detail: "System sizing, inverter selection, export-limit checks and accredited installation coordination.",
    estimate: "$900 to $2,500 typical upfront STC discount depending on system, zone and certificate price.",
  },
  {
    id: "heat-pump",
    title: "Heat pump hot water",
    icon: Droplets,
    summary: "Efficient electric hot water upgrades that can replace aging gas or electric storage units.",
    detail: "Model eligibility checks, noise placement, tariff advice and rebate paperwork preparation.",
    estimate: "Eligible Victorian households may access up to $1,400, plus national STCs where the model qualifies.",
  },
  {
    id: "aircon",
    title: "Reverse-cycle air conditioning",
    icon: AirVent,
    summary: "Heating and cooling installs focused on comfort, efficiency and room-by-room control.",
    detail: "Split-system selection, licensed installation booking and state scheme eligibility screening.",
    estimate: "State incentives can apply in NSW and selected WA households; eligibility depends on location and program rules.",
  },
];

export const subsidyPrograms = [
  {
    scope: "National",
    title: "Small-scale Renewable Energy Scheme",
    appliesTo: "Solar PV, solar hot water and eligible air-source heat pump hot water",
    description:
      "The Australian Government SRES creates small-scale technology certificates that are commonly assigned for an upfront discount. Products and installers must meet scheme rules.",
    source: "Clean Energy Regulator SRES",
    url: "https://cer.gov.au/schemes/renewable-energy-target/small-scale-renewable-energy-scheme/small-scale-renewable-energy-systems/solar-water-heaters-and-air-source-heat-pumps",
  },
  {
    scope: "National",
    title: "Household Energy Upgrades Fund",
    appliesTo: "Solar PV, modern appliances, hot water and air conditioning upgrades",
    description:
      "A $1 billion Australian Government program delivered through participating lenders for discounted finance on eligible home energy upgrades.",
    source: "energy.gov.au HEUF",
    url: "https://www.energy.gov.au/rebates/household-energy-upgrades-fund",
  },
  {
    scope: "VIC",
    title: "Solar Homes Program",
    appliesTo: "Solar PV and heat pump or solar hot water",
    description:
      "Eligible Victorians can access solar panel rebates up to $1,400 and hot water rebates up to $1,400, subject to program rules and funding.",
    source: "energy.gov.au Victorian rebates",
    url: "https://www.energy.gov.au/rebates/solar-panel-pv-rebate",
  },
  {
    scope: "NSW",
    title: "Household energy saving upgrades",
    appliesTo: "Air conditioning, batteries and hot water systems",
    description:
      "NSW incentives are delivered through approved suppliers, who assess customer eligibility before an upgrade begins.",
    source: "energy.gov.au NSW ESS",
    url: "https://www.energy.gov.au/rebates/household-energy-saving-upgrades",
  },
  {
    scope: "WA",
    title: "Air Conditioning Rebate",
    appliesTo: "Air conditioner operating costs in eligible high heat areas",
    description:
      "A WA subsidy is available for eligible households in areas of high heat discomfort. The amount varies by location.",
    source: "energy.gov.au WA rebate",
    url: "https://www.energy.gov.au/rebates/air-conditioning-rebate",
  },
];

export const processSteps = [
  {
    title: "Check rebates",
    icon: ShieldCheck,
    text: "We screen your postcode, home details and preferred products against available national and state programs.",
  },
  {
    title: "Design the plan",
    icon: Home,
    text: "You get a practical solar, hot water and heating or cooling pathway based on the home you actually live in.",
  },
  {
    title: "Separate incentives",
    icon: BadgeDollarSign,
    text: "The quote separates equipment costs, expected incentives, finance options and installer requirements.",
  },
  {
    title: "Book a consult",
    icon: Zap,
    text: "A booking link is emailed after enquiry so you can choose a time that suits you.",
  },
];

export const metrics = [
  { label: "Upgrade categories", value: "3", icon: BatteryCharging },
  { label: "States screened", value: "8", icon: Home },
  { label: "Consult booking link", value: "Instant", icon: CalendarCheck },
];

export const acquisitionBenefits = [
  {
    title: "Lower upfront cost",
    icon: PiggyBank,
    text: "We check available subsidies and certificate discounts before you make a buying decision.",
  },
  {
    title: "One home energy plan",
    icon: ClipboardCheck,
    text: "Solar, heat pump hot water and reverse-cycle aircon are compared together instead of as separate quotes.",
  },
  {
    title: "Fast next step",
    icon: TimerReset,
    text: "Submit the enquiry and receive a calendar link to book a consultation while the details are fresh.",
  },
];
