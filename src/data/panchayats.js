// Comprehensive Panchayat Registry across all 26 Districts of Andhra Pradesh (Total: 13,326 Gram Panchayats)
// Fused with ISRO Bhuvan / SRTM 30m DEM physical elevation models and IMD agro-meteorological parameters

import {
  getAllPanchayats,
  CURATED_PANCHAYATS,
  TOTAL_AP_PANCHAYATS,
  AP_DISTRICTS_DATA,
  AP_REGIONS,
  getAllDistricts,
  getMandalsByDistrict,
  searchPanchayats,
  getPanchayatById
} from '../utils/panchayatRegistry.js';

export const AP_DISTRICTS = AP_DISTRICTS_DATA.map(d => d.name);

export const AP_DISTRICTS_TELUGU = {
  "Alluri Sitharama Raju": "అల్లూరి సీతారామరాజు",
  "Anakapalli": "అనకాపల్లి",
  "Ananthapuramu": "అనంతపురం",
  "Annamayya": "అన్నమయ్య",
  "Bapatla": "బాపట్ల",
  "Chittoor": "చిత్తూరు",
  "Dr. B.R. Ambedkar Konaseema": "డా. బి.ఆర్. అంబేద్కర్ కోనసీమ",
  "East Godavari": "తూర్పు గోదావరి",
  "Eluru": "ఏలూరు",
  "Guntur": "గుంటూరు",
  "Kakinada": "కాకినాడ",
  "Krishna": "కృష్ణా",
  "Kurnool": "కర్నూలు",
  "Nandyal": "నంద్యాల",
  "NTR": "ఎన్టీఆర్",
  "Palnadu": "పల్నాడు",
  "Parvathipuram Manyam": "పార్వతీపురం మన్యం",
  "Prakasam": "ప్రకాశం",
  "Sri Potti Sriramulu Nellore": "శ్రీ పొట్టి శ్రీరాములు నెల్లూరు",
  "Sri Sathya Sai": "శ్రీ సత్యసాయి",
  "Srikakulam": "శ్రీకాకుళం",
  "Tirupati": "తిరుపతి",
  "Visakhapatnam": "విశాఖపట్నం",
  "Vizianagaram": "విజయనగరం",
  "West Godavari": "పశ్చిమ గోదావరి",
  "YSR Kadapa": "వైఎస్సార్ కడప"
};

export {
  TOTAL_AP_PANCHAYATS,
  AP_DISTRICTS_DATA,
  AP_REGIONS,
  CURATED_PANCHAYATS,
  getAllDistricts,
  getMandalsByDistrict,
  searchPanchayats,
  getPanchayatById
};

// All 13,326 Gram Panchayats indexed and ready
export const PANCHAYATS_DATA = getAllPanchayats();

export function resolvePanchayat(idOrPartial) {
  if (!idOrPartial) return PANCHAYATS_DATA[0];
  const query = String(idOrPartial).toLowerCase().trim();
  if (!query) return PANCHAYATS_DATA[0];
  const exact = PANCHAYATS_DATA.find(p => p.id && p.id.toLowerCase() === query);
  if (exact) return exact;
  const partial = PANCHAYATS_DATA.find(p => 
    (p.id && p.id.toLowerCase().includes(query)) || 
    (p.taluk && p.taluk.toLowerCase().includes(query)) ||
    (p.mandal && p.mandal.toLowerCase().includes(query)) ||
    (p.name && p.name.toLowerCase().includes(query)) ||
    (p.localName && p.localName.toLowerCase().includes(query))
  );
  if (partial) return partial;
  return PANCHAYATS_DATA[0];
}

export default PANCHAYATS_DATA;

