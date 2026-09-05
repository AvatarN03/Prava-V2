export interface QuickPickCountry {
  name: string;
  code: string;
  flag: string;
  capital: string;
  region: "Europe" | "Asia" | "Americas" | "Middle East";
}

export const QUICK_PICK_COUNTRIES: QuickPickCountry[] = [
  { name: "Japan",          code: "JP", flag: "🇯🇵", capital: "Tokyo",         region: "Asia" },
  { name: "France",         code: "FR", flag: "🇫🇷", capital: "Paris",         region: "Europe" },
  { name: "Germany",        code: "DE", flag: "🇩🇪", capital: "Berlin",        region: "Europe" },
  { name: "Italy",          code: "IT", flag: "🇮🇹", capital: "Rome",          region: "Europe" },
  { name: "Spain",          code: "ES", flag: "🇪🇸", capital: "Madrid",        region: "Europe" },
  { name: "Poland",         code: "PL", flag: "🇵🇱", capital: "Warsaw",        region: "Europe" },
  { name: "Netherlands",    code: "NL", flag: "🇳🇱", capital: "Amsterdam",     region: "Europe" },
  { name: "Portugal",       code: "PT", flag: "🇵🇹", capital: "Lisbon",        region: "Europe" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", capital: "London",        region: "Europe" },
  { name: "United States",  code: "US", flag: "🇺🇸", capital: "Washington DC", region: "Americas" },
  { name: "Canada",         code: "CA", flag: "🇨🇦", capital: "Ottawa",        region: "Americas" },
  { name: "Mexico",         code: "MX", flag: "🇲🇽", capital: "Mexico City",   region: "Americas" },
  { name: "Brazil",         code: "BR", flag: "🇧🇷", capital: "Brasília",      region: "Americas" },
  { name: "Thailand",       code: "TH", flag: "🇹🇭", capital: "Bangkok",       region: "Asia" },
  { name: "India",          code: "IN", flag: "🇮🇳", capital: "New Delhi",     region: "Asia" },
  { name: "South Korea",    code: "KR", flag: "🇰🇷", capital: "Seoul",         region: "Asia" },
  { name: "Singapore",      code: "SG", flag: "🇸🇬", capital: "Singapore",     region: "Asia" },
  { name: "Australia",      code: "AU", flag: "🇦🇺", capital: "Canberra",      region: "Asia" },
  { name: "UAE",            code: "AE", flag: "🇦🇪", capital: "Abu Dhabi",     region: "Middle East" },
  { name: "Turkey",         code: "TR", flag: "🇹🇷", capital: "Ankara",        region: "Middle East" },
  { name: "Saudi Arabia",   code: "SA", flag: "🇸🇦", capital: "Riyadh",        region: "Middle East" },
];
