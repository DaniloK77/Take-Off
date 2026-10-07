// Shared by server and client code: keep this module free of server-only imports.
//
// A bundled list of popular airports powers the autocomplete, so typing never
// costs SerpApi quota. Any other valid IATA code can still be typed directly.

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
  /** ISO 3166-1 alpha-2, used for flag emoji. */
  countryCode: string;
}

const a = (
  code: string,
  city: string,
  name: string,
  country: string,
  countryCode: string,
): Airport => ({ code, city, name, country, countryCode });

const AIRPORTS: Airport[] = [
  // Balkans & South-East Europe
  a("BEG", "Belgrade", "Nikola Tesla Airport", "Serbia", "RS"),
  a("INI", "Niš", "Constantine the Great Airport", "Serbia", "RS"),
  a("KVO", "Kraljevo", "Morava Airport", "Serbia", "RS"),
  a("TGD", "Podgorica", "Podgorica Airport", "Montenegro", "ME"),
  a("TIV", "Tivat", "Tivat Airport", "Montenegro", "ME"),
  a("SJJ", "Sarajevo", "Sarajevo International Airport", "Bosnia and Herzegovina", "BA"),
  a("BNX", "Banja Luka", "Banja Luka International Airport", "Bosnia and Herzegovina", "BA"),
  a("TZL", "Tuzla", "Tuzla International Airport", "Bosnia and Herzegovina", "BA"),
  a("ZAG", "Zagreb", "Franjo Tuđman Airport", "Croatia", "HR"),
  a("SPU", "Split", "Split Airport", "Croatia", "HR"),
  a("DBV", "Dubrovnik", "Dubrovnik Airport", "Croatia", "HR"),
  a("ZAD", "Zadar", "Zadar Airport", "Croatia", "HR"),
  a("PUY", "Pula", "Pula Airport", "Croatia", "HR"),
  a("LJU", "Ljubljana", "Jože Pučnik Airport", "Slovenia", "SI"),
  a("SKP", "Skopje", "Skopje International Airport", "North Macedonia", "MK"),
  a("OHD", "Ohrid", "St. Paul the Apostle Airport", "North Macedonia", "MK"),
  a("TIA", "Tirana", "Tirana International Airport", "Albania", "AL"),
  a("SOF", "Sofia", "Sofia Airport", "Bulgaria", "BG"),
  a("VAR", "Varna", "Varna Airport", "Bulgaria", "BG"),
  a("BOJ", "Burgas", "Burgas Airport", "Bulgaria", "BG"),
  a("OTP", "Bucharest", "Henri Coandă International Airport", "Romania", "RO"),
  a("CLJ", "Cluj-Napoca", "Cluj International Airport", "Romania", "RO"),
  a("TSR", "Timișoara", "Traian Vuia International Airport", "Romania", "RO"),
  a("BUD", "Budapest", "Ferenc Liszt International Airport", "Hungary", "HU"),
  a("ATH", "Athens", "Athens International Airport", "Greece", "GR"),
  a("SKG", "Thessaloniki", "Thessaloniki Airport", "Greece", "GR"),
  a("HER", "Heraklion", "Heraklion Airport", "Greece", "GR"),
  a("JTR", "Santorini", "Santorini Airport", "Greece", "GR"),
  a("CFU", "Corfu", "Corfu Airport", "Greece", "GR"),
  a("RHO", "Rhodes", "Rhodes Airport", "Greece", "GR"),
  a("IST", "Istanbul", "Istanbul Airport", "Turkey", "TR"),
  a("SAW", "Istanbul", "Sabiha Gökçen Airport", "Turkey", "TR"),
  a("AYT", "Antalya", "Antalya Airport", "Turkey", "TR"),
  a("ESB", "Ankara", "Esenboğa Airport", "Turkey", "TR"),
  a("LCA", "Larnaca", "Larnaca International Airport", "Cyprus", "CY"),
  a("MLA", "Valletta", "Malta International Airport", "Malta", "MT"),

  // Central & Western Europe
  a("VIE", "Vienna", "Vienna International Airport", "Austria", "AT"),
  a("SZG", "Salzburg", "Salzburg Airport", "Austria", "AT"),
  a("ZRH", "Zurich", "Zurich Airport", "Switzerland", "CH"),
  a("GVA", "Geneva", "Geneva Airport", "Switzerland", "CH"),
  a("MUC", "Munich", "Munich Airport", "Germany", "DE"),
  a("FRA", "Frankfurt", "Frankfurt Airport", "Germany", "DE"),
  a("BER", "Berlin", "Berlin Brandenburg Airport", "Germany", "DE"),
  a("HAM", "Hamburg", "Hamburg Airport", "Germany", "DE"),
  a("DUS", "Düsseldorf", "Düsseldorf Airport", "Germany", "DE"),
  a("CGN", "Cologne", "Cologne Bonn Airport", "Germany", "DE"),
  a("STR", "Stuttgart", "Stuttgart Airport", "Germany", "DE"),
  a("PRG", "Prague", "Václav Havel Airport", "Czechia", "CZ"),
  a("BTS", "Bratislava", "M. R. Štefánik Airport", "Slovakia", "SK"),
  a("WAW", "Warsaw", "Chopin Airport", "Poland", "PL"),
  a("KRK", "Kraków", "John Paul II International Airport", "Poland", "PL"),
  a("CDG", "Paris", "Charles de Gaulle Airport", "France", "FR"),
  a("ORY", "Paris", "Orly Airport", "France", "FR"),
  a("NCE", "Nice", "Côte d'Azur Airport", "France", "FR"),
  a("LYS", "Lyon", "Saint-Exupéry Airport", "France", "FR"),
  a("MRS", "Marseille", "Marseille Provence Airport", "France", "FR"),
  a("AMS", "Amsterdam", "Schiphol Airport", "Netherlands", "NL"),
  a("EIN", "Eindhoven", "Eindhoven Airport", "Netherlands", "NL"),
  a("BRU", "Brussels", "Brussels Airport", "Belgium", "BE"),
  a("CRL", "Brussels", "Brussels South Charleroi Airport", "Belgium", "BE"),
  a("LUX", "Luxembourg", "Luxembourg Airport", "Luxembourg", "LU"),
  a("LHR", "London", "Heathrow Airport", "United Kingdom", "GB"),
  a("LGW", "London", "Gatwick Airport", "United Kingdom", "GB"),
  a("STN", "London", "Stansted Airport", "United Kingdom", "GB"),
  a("LTN", "London", "Luton Airport", "United Kingdom", "GB"),
  a("MAN", "Manchester", "Manchester Airport", "United Kingdom", "GB"),
  a("EDI", "Edinburgh", "Edinburgh Airport", "United Kingdom", "GB"),
  a("DUB", "Dublin", "Dublin Airport", "Ireland", "IE"),

  // Northern Europe
  a("CPH", "Copenhagen", "Copenhagen Airport", "Denmark", "DK"),
  a("ARN", "Stockholm", "Arlanda Airport", "Sweden", "SE"),
  a("OSL", "Oslo", "Gardermoen Airport", "Norway", "NO"),
  a("HEL", "Helsinki", "Helsinki Airport", "Finland", "FI"),
  a("KEF", "Reykjavík", "Keflavík International Airport", "Iceland", "IS"),
  a("RIX", "Riga", "Riga International Airport", "Latvia", "LV"),
  a("VNO", "Vilnius", "Vilnius International Airport", "Lithuania", "LT"),
  a("TLL", "Tallinn", "Lennart Meri Tallinn Airport", "Estonia", "EE"),

  // Southern Europe
  a("FCO", "Rome", "Fiumicino Airport", "Italy", "IT"),
  a("MXP", "Milan", "Malpensa Airport", "Italy", "IT"),
  a("LIN", "Milan", "Linate Airport", "Italy", "IT"),
  a("BGY", "Milan", "Bergamo Airport", "Italy", "IT"),
  a("VCE", "Venice", "Marco Polo Airport", "Italy", "IT"),
  a("NAP", "Naples", "Naples International Airport", "Italy", "IT"),
  a("BLQ", "Bologna", "Guglielmo Marconi Airport", "Italy", "IT"),
  a("FLR", "Florence", "Florence Airport", "Italy", "IT"),
  a("CTA", "Catania", "Catania–Fontanarossa Airport", "Italy", "IT"),
  a("MAD", "Madrid", "Adolfo Suárez Madrid–Barajas Airport", "Spain", "ES"),
  a("BCN", "Barcelona", "Josep Tarradellas Barcelona–El Prat Airport", "Spain", "ES"),
  a("PMI", "Palma de Mallorca", "Palma de Mallorca Airport", "Spain", "ES"),
  a("AGP", "Málaga", "Málaga Airport", "Spain", "ES"),
  a("VLC", "Valencia", "Valencia Airport", "Spain", "ES"),
  a("LIS", "Lisbon", "Humberto Delgado Airport", "Portugal", "PT"),
  a("OPO", "Porto", "Francisco Sá Carneiro Airport", "Portugal", "PT"),

  // Middle East & Africa
  a("DXB", "Dubai", "Dubai International Airport", "United Arab Emirates", "AE"),
  a("AUH", "Abu Dhabi", "Zayed International Airport", "United Arab Emirates", "AE"),
  a("DOH", "Doha", "Hamad International Airport", "Qatar", "QA"),
  a("TLV", "Tel Aviv", "Ben Gurion Airport", "Israel", "IL"),
  a("CAI", "Cairo", "Cairo International Airport", "Egypt", "EG"),
  a("HRG", "Hurghada", "Hurghada International Airport", "Egypt", "EG"),
  a("SSH", "Sharm El Sheikh", "Sharm El Sheikh International Airport", "Egypt", "EG"),
  a("CMN", "Casablanca", "Mohammed V International Airport", "Morocco", "MA"),
  a("RAK", "Marrakesh", "Menara Airport", "Morocco", "MA"),
  a("TUN", "Tunis", "Tunis–Carthage International Airport", "Tunisia", "TN"),

  // Americas
  a("JFK", "New York", "John F. Kennedy International Airport", "United States", "US"),
  a("EWR", "Newark", "Newark Liberty International Airport", "United States", "US"),
  a("BOS", "Boston", "Logan International Airport", "United States", "US"),
  a("ORD", "Chicago", "O'Hare International Airport", "United States", "US"),
  a("IAD", "Washington", "Dulles International Airport", "United States", "US"),
  a("ATL", "Atlanta", "Hartsfield–Jackson International Airport", "United States", "US"),
  a("MIA", "Miami", "Miami International Airport", "United States", "US"),
  a("LAX", "Los Angeles", "Los Angeles International Airport", "United States", "US"),
  a("SFO", "San Francisco", "San Francisco International Airport", "United States", "US"),
  a("SEA", "Seattle", "Seattle–Tacoma International Airport", "United States", "US"),
  a("YYZ", "Toronto", "Pearson International Airport", "Canada", "CA"),
  a("YUL", "Montréal", "Trudeau International Airport", "Canada", "CA"),
  a("MEX", "Mexico City", "Mexico City International Airport", "Mexico", "MX"),
  a("CUN", "Cancún", "Cancún International Airport", "Mexico", "MX"),
  a("GRU", "São Paulo", "Guarulhos International Airport", "Brazil", "BR"),
  a("EZE", "Buenos Aires", "Ministro Pistarini International Airport", "Argentina", "AR"),

  // Asia & Oceania
  a("HND", "Tokyo", "Haneda Airport", "Japan", "JP"),
  a("NRT", "Tokyo", "Narita International Airport", "Japan", "JP"),
  a("ICN", "Seoul", "Incheon International Airport", "South Korea", "KR"),
  a("PEK", "Beijing", "Capital International Airport", "China", "CN"),
  a("PVG", "Shanghai", "Pudong International Airport", "China", "CN"),
  a("HKG", "Hong Kong", "Hong Kong International Airport", "Hong Kong", "HK"),
  a("SIN", "Singapore", "Changi Airport", "Singapore", "SG"),
  a("BKK", "Bangkok", "Suvarnabhumi Airport", "Thailand", "TH"),
  a("HKT", "Phuket", "Phuket International Airport", "Thailand", "TH"),
  a("KUL", "Kuala Lumpur", "Kuala Lumpur International Airport", "Malaysia", "MY"),
  a("DPS", "Bali", "Ngurah Rai International Airport", "Indonesia", "ID"),
  a("DEL", "Delhi", "Indira Gandhi International Airport", "India", "IN"),
  a("BOM", "Mumbai", "Chhatrapati Shivaji Maharaj International Airport", "India", "IN"),
  a("MLE", "Malé", "Velana International Airport", "Maldives", "MV"),
  a("SYD", "Sydney", "Kingsford Smith Airport", "Australia", "AU"),
  a("MEL", "Melbourne", "Melbourne Airport", "Australia", "AU"),
];

const BY_CODE = new Map(AIRPORTS.map((airport) => [airport.code, airport]));

export const IATA_CODE = /^[A-Z]{3}$/;

export function findAirport(code: string): Airport | undefined {
  return BY_CODE.get(code.toUpperCase());
}

function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Ranks exact code matches first, then city, then airport name or country. */
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const scored: { airport: Airport; score: number }[] = [];
  for (const airport of AIRPORTS) {
    const code = airport.code.toLowerCase();
    const city = normalize(airport.city);
    let score = -1;
    if (code === q) score = 0;
    else if (city.startsWith(q)) score = 1;
    else if (code.startsWith(q)) score = 2;
    else if (normalize(airport.name).includes(q)) score = 3;
    else if (normalize(airport.country).startsWith(q)) score = 4;
    if (score >= 0) scored.push({ airport, score });
  }

  return scored
    .sort((x, y) => x.score - y.score)
    .slice(0, limit)
    .map(({ airport }) => airport);
}

/** "RS" -> "🇷🇸" */
export function flagEmoji(countryCode: string): string {
  if (!/^[A-Za-z]{2}$/.test(countryCode)) return "";
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((char) => 0x1f1a5 + char.charCodeAt(0)),
  );
}
