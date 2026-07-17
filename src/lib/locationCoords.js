// Approximate coordinates for known demo towns
export const TOWN_COORDS = {
  'Jos Hub': { lat: 9.8965, lng: 8.8583 },
  'Jos Central': { lat: 9.9000, lng: 8.8600 },
  'Bukuru': { lat: 9.7833, lng: 8.8667 },
  'Shendam': { lat: 8.8833, lng: 9.5333 },
  'Pankshin': { lat: 9.3333, lng: 9.4333 },
  'Kano': { lat: 12.0022, lng: 8.5920 },
}

// Fallback: if location text doesn't match exactly, try partial match, else default to Techiman
export function getCoordsForLocation(locationText) {
  if (!locationText) return TOWN_COORDS['Techiman Hub']

  const exact = TOWN_COORDS[locationText]
  if (exact) return exact

  const partial = Object.keys(TOWN_COORDS).find((town) =>
    locationText.toLowerCase().includes(town.toLowerCase().split(' ')[0])
  )
  if (partial) return TOWN_COORDS[partial]

 return TOWN_COORDS['Jos Hub'] // default fallback
}