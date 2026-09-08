const ZONE_RATES = {
  'Lagos': 100,
  'Abuja': 90,
  'FCT Abuja': 90,
  'Kano': 85,
  'Kaduna': 80,
  'Plateau': 60,
  'Jos': 60,
  'Enugu': 75,
  'Oyo': 85,
  'Ibadan': 85,
  'Rivers': 95,
  'Port Harcourt': 95,
  'Delta': 90,
  'Edo': 85,
  'Benin City': 85,
  'Anambra': 80,
  'Imo': 80,
  'Abia': 80,
  'Cross River': 90,
  'Benue': 70,
  'Nasarawa': 65,
  'Niger': 75,
  'Kwara': 80,
  'Kogi': 75,
  'Bauchi': 85,
  'Gombe': 90,
  'Adamawa': 95,
  'Borno': 100,
  'Yobe': 100,
  'Sokoto': 100,
  'Kebbi': 95,
  'Zamfara': 95,
  'Katsina': 90,
  'Jigawa': 90,
  'Taraba': 95,
  'Bayelsa': 100,
  'Akwa Ibom': 95,
  'Ebonyi': 80,
  'Ekiti': 85,
  'Ondo': 85,
  'Osun': 85,
  'Ogun': 90,
}

export function getTransportCost(location) {
  if (!location) return 5000
  const match = Object.keys(ZONE_RATES).find(zone =>
    location.toLowerCase().includes(zone.toLowerCase())
  )
  return match ? ZONE_RATES[match] * 100 : 5000
}