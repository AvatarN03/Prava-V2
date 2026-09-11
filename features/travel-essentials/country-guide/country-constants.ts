export interface QuickPickCountry {
  name: string;
  code: string;
  flag: string;
  capital: string;
  region: "Europe" | "Asia" | "Americas" | "Middle East";
  visaStatus: "Citizen" | "Visa Free" | "Visa on Arrival" | "eVisa" | "Visa Required";
  visaDuration?: string;
  visaNote: string;
}

export const QUICK_PICK_COUNTRIES: QuickPickCountry[] = [
  {
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    capital: "New Delhi",
    region: "Asia",
    visaStatus: "Citizen",
    visaDuration: "Unlimited",
    visaNote: "Domestic national citizen. No visa or passport required for domestic travel.",
  },
  {
    name: "UAE",
    code: "AE",
    flag: "🇦🇪",
    capital: "Abu Dhabi",
    region: "Middle East",
    visaStatus: "Visa on Arrival",
    visaDuration: "14 - 30 Days",
    visaNote: "VOA available for Indian passport holders with valid US/UK/EU visas; otherwise pre-arranged tourist eVisa.",
  },
  {
    name: "Thailand",
    code: "TH",
    flag: "🇹🇭",
    capital: "Bangkok",
    region: "Asia",
    visaStatus: "Visa Free",
    visaDuration: "60 Days",
    visaNote: "Visa exemption for Indian tourists for up to 60 days. Return ticket & proof of funds required.",
  },
  {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    capital: "Singapore",
    region: "Asia",
    visaStatus: "eVisa",
    visaDuration: "30 Days",
    visaNote: "Must apply for an entry visa via authorized agents and submit SG Arrival Card within 3 days before departure.",
  },
  {
    name: "Malaysia",
    code: "MY",
    flag: "🇲🇾",
    capital: "Kuala Lumpur",
    region: "Asia",
    visaStatus: "Visa Free",
    visaDuration: "30 Days",
    visaNote: "Visa-free entry for Indian nationals. Complete digital Malaysia Arrival Card (MDAC) prior to travel.",
  },
  {
    name: "Indonesia",
    code: "ID",
    flag: "🇮🇩",
    capital: "Jakarta",
    region: "Asia",
    visaStatus: "Visa on Arrival",
    visaDuration: "30 Days",
    visaNote: "Electronic Visa on Arrival (e-VOA) or VOA at airport for 30 days (extendable once). Fee: ~500,000 IDR.",
  },
  {
    name: "Vietnam",
    code: "VN",
    flag: "🇻🇳",
    capital: "Hanoi",
    region: "Asia",
    visaStatus: "eVisa",
    visaDuration: "30 - 90 Days",
    visaNote: "Official 90-day multi-entry or 30-day single-entry online eVisa issued via Vietnam immigration portal.",
  },
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    capital: "London",
    region: "Europe",
    visaStatus: "Visa Required",
    visaDuration: "Up to 6 Months",
    visaNote: "Standard Visitor Visa application required via VFS Global with biometrics and financial documentation.",
  },
  {
    name: "Japan",
    code: "JP",
    flag: "🇯🇵",
    capital: "Tokyo",
    region: "Asia",
    visaStatus: "eVisa",
    visaDuration: "90 Days",
    visaNote: "Single-entry short-term tourist eVisa available online for Indian nationals residing in India.",
  },
  {
    name: "Switzerland",
    code: "CH",
    flag: "🇨🇭",
    capital: "Bern",
    region: "Europe",
    visaStatus: "Visa Required",
    visaDuration: "Up to 90 Days",
    visaNote: "Schengen short-stay visa required. Apply via VFS Switzerland at least 3 weeks before departure.",
  },
  {
    name: "France",
    code: "FR",
    flag: "🇫🇷",
    capital: "Paris",
    region: "Europe",
    visaStatus: "Visa Required",
    visaDuration: "Up to 90 Days",
    visaNote: "Schengen Visa (Type C) required for Indian passport holders. Apply via France-Visas & VFS Global.",
  },
  {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    capital: "Washington DC",
    region: "Americas",
    visaStatus: "Visa Required",
    visaDuration: "10 Years (Multi-entry)",
    visaNote: "B1/B2 tourist visa required. Requires DS-160 application, biometric appointment, and consulate interview.",
  },
  {
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    capital: "Canberra",
    region: "Asia",
    visaStatus: "eVisa",
    visaDuration: "3 - 12 Months",
    visaNote: "Subclass 600 Visitor Visa applied online via ImmiAccount. No physical passport stamp required.",
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    flag: "🇸🇦",
    capital: "Riyadh",
    region: "Middle East",
    visaStatus: "eVisa",
    visaDuration: "90 Days",
    visaNote: "Instant tourist eVisa / Visa on Arrival if holding active US, UK, or Schengen visa; otherwise tourist visa.",
  },
  {
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    capital: "Berlin",
    region: "Europe",
    visaStatus: "Visa Required",
    visaDuration: "Up to 90 Days",
    visaNote: "Schengen Visa required. Apply via VFS Germany with proof of accommodation, return flight, and travel insurance.",
  },
  {
    name: "Italy",
    code: "IT",
    flag: "🇮🇹",
    capital: "Rome",
    region: "Europe",
    visaStatus: "Visa Required",
    visaDuration: "Up to 90 Days",
    visaNote: "Schengen Visa required. Apply via VFS Italy with complete travel itinerary and financial statements.",
  },
  {
    name: "Spain",
    code: "ES",
    flag: "🇪🇸",
    capital: "Madrid",
    region: "Europe",
    visaStatus: "Visa Required",
    visaDuration: "Up to 90 Days",
    visaNote: "Schengen Visa required via BLS International. Medical travel insurance with €30,000 cover mandatory.",
  },
  {
    name: "South Korea",
    code: "KR",
    flag: "🇰🇷",
    capital: "Seoul",
    region: "Asia",
    visaStatus: "Visa Required",
    visaDuration: "Up to 90 Days",
    visaNote: "C-3-9 tourist visa required via Korea Visa Application Center (KVAC). Visa-free transit for select corridors.",
  },
];

/**
 * Look up Indian passport visa guidance for any country
 */
export function getIndianPassportVisaGuidance(countryName: string, countryCode?: string): {
  status: "Citizen" | "Visa Free" | "Visa on Arrival" | "eVisa" | "Visa Required";
  duration?: string;
  note: string;
} {
  const normName = countryName.toLowerCase().trim();
  const normCode = (countryCode || "").toUpperCase().trim();

  const found = QUICK_PICK_COUNTRIES.find(
    (c) => c.name.toLowerCase() === normName || c.code === normCode
  );

  if (found) {
    return {
      status: found.visaStatus,
      duration: found.visaDuration,
      note: found.visaNote,
    };
  }

  // Fallback heuristic for unlisted countries
  if (normName === "india" || normCode === "IN") {
    return {
      status: "Citizen",
      duration: "Unlimited",
      note: "Domestic national citizen. No visa or passport required.",
    };
  }

  return {
    status: "Visa Required",
    duration: "Varies",
    note: "Consult official consulate or embassy portal for Indian passport entry requirements prior to departure.",
  };
}
