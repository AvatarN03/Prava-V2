import type { EmergencyContacts } from "../types";

export const EMERGENCY_DIRECTORY: EmergencyContacts[] = [
  { country: "United States & Canada", code: "US/CA", dialCode: "+1", general: "911", police: "911", ambulance: "911", fire: "911" },
  { country: "European Union (Standard)", code: "EU", dialCode: "+33/+49/+39", general: "112", police: "112", ambulance: "112", fire: "112", notes: "112 is the free single emergency number valid across all 27 EU member states." },
  { country: "United Kingdom", code: "GB", dialCode: "+44", general: "999", police: "999 (101 non-emergency)", ambulance: "999 (111 non-emergency)", fire: "999" },
  { country: "Japan", code: "JP", dialCode: "+81", general: "110 / 119", police: "110", ambulance: "119", fire: "119", notes: "Japan Helpline: 0570-000-911 for English emergency assistance." },
  { country: "Australia", code: "AU", dialCode: "+61", general: "000", police: "000 (131 444 non-emergency)", ambulance: "000", fire: "000" },
  { country: "France", code: "FR", dialCode: "+33", general: "112", police: "17", ambulance: "15 (SAMU)", fire: "18 (Pompiers)" },
  { country: "Italy", code: "IT", dialCode: "+39", general: "112", police: "113", ambulance: "118", fire: "115" },
  { country: "Spain", code: "ES", dialCode: "+34", general: "112", police: "091 (National) / 092 (Local)", ambulance: "061", fire: "080" },
  { country: "Germany", code: "DE", dialCode: "+49", general: "112", police: "110", ambulance: "112", fire: "112" },
  { country: "Switzerland", code: "CH", dialCode: "+41", general: "112", police: "117", ambulance: "144", fire: "118" },
  { country: "Thailand", code: "TH", dialCode: "+66", general: "191", police: "191 (Tourist Police: 1155)", ambulance: "1669", fire: "199", notes: "Tourist Police speak English and can be reached 24/7 at 1155." },
  { country: "United Arab Emirates", code: "AE", dialCode: "+971", general: "999", police: "999", ambulance: "998", fire: "997" },
  { country: "Singapore", code: "SG", dialCode: "+65", general: "999", police: "999", ambulance: "995", fire: "995" },
  { country: "India", code: "IN", dialCode: "+91", general: "112", police: "112 / 100", ambulance: "102 / 108", fire: "101" },
  { country: "Indonesia (Bali)", code: "ID", dialCode: "+62", general: "112", police: "110", ambulance: "118", fire: "113", notes: "Bali Tourist Police: (0361) 224111" },
  { country: "New Zealand", code: "NZ", dialCode: "+64", general: "111", police: "111", ambulance: "111", fire: "111" },
  { country: "Mexico", code: "MX", dialCode: "+52", general: "911", police: "911", ambulance: "911 (Red Cross: 065)", fire: "911" },
  { country: "Brazil", code: "BR", dialCode: "+55", general: "190", police: "190 (Military Police)", ambulance: "192 (SAMU)", fire: "193" },
  { country: "South Korea", code: "KR", dialCode: "+82", general: "112", police: "112", ambulance: "119", fire: "119", notes: "Korea Travel Helpline: 1330 (English available 24/7)." },
];
