export const TOWN_COORDS = {
  'Jos': { lat: 9.8965, lng: 8.8583 },
  'Jos Hub': { lat: 9.8965, lng: 8.8583 },
  'Jos Central': { lat: 9.9000, lng: 8.8600 },
  'Bukuru': { lat: 9.7833, lng: 8.8667 },
  'Shendam': { lat: 8.8833, lng: 9.5333 },
  'Pankshin': { lat: 9.3333, lng: 9.4333 },
  'Plateau': { lat: 9.8965, lng: 8.8583 },
  'Kano': { lat: 12.0022, lng: 8.5920 },
  'Lagos': { lat: 6.5244, lng: 3.3792 },
  'Abuja': { lat: 9.0579, lng: 7.4951 },
  'FCT Abuja': { lat: 9.0579, lng: 7.4951 },
  'Ibadan': { lat: 7.3775, lng: 3.9470 },
  'Benin City': { lat: 6.3350, lng: 5.6037 },
  'Edo': { lat: 6.3350, lng: 5.6037 },
  'Port Harcourt': { lat: 4.8156, lng: 7.0498 },
  'Rivers': { lat: 4.8156, lng: 7.0498 },
  'Enugu': { lat: 6.4584, lng: 7.5464 },
  'Kaduna': { lat: 10.5222, lng: 7.4383 },
  'Oyo': { lat: 7.8526, lng: 3.9470 },
}

export function getCoordsForLocation(locationText) {
  if (!locationText) return TOWN_COORDS['Jos']

  const exact = TOWN_COORDS[locationText]
  if (exact) return exact

  const partial = Object.keys(TOWN_COORDS).find((town) =>
    locationText.toLowerCase().includes(town.toLowerCase().split(' ')[0])
  )
  if (partial) return TOWN_COORDS[partial]

  return TOWN_COORDS['Jos']
}