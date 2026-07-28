// Список стран для phone-инпута.
// Приоритетные страны (СНГ) идут первыми, затем остальные по алфавиту.
// iso — ISO 3166-1 alpha-2 код, используется libphonenumber-js для валидации/форматирования.

export const priorityCountries = [
  { iso: "RU", name: "Россия", dial: "7", flag: "🇷🇺" },
  { iso: "KZ", name: "Казахстан", dial: "7", flag: "🇰🇿" },
  { iso: "UZ", name: "Узбекистан", dial: "998", flag: "🇺🇿" },
  { iso: "KG", name: "Киргизия", dial: "996", flag: "🇰🇬" },
  { iso: "TJ", name: "Таджикистан", dial: "992", flag: "🇹🇯" },
];

export const otherCountries = [
  { iso: "AM", name: "Армения", dial: "374", flag: "🇦🇲" },
  { iso: "AT", name: "Австрия", dial: "43", flag: "🇦🇹" },
  { iso: "AZ", name: "Азербайджан", dial: "994", flag: "🇦🇿" },
  { iso: "BY", name: "Беларусь", dial: "375", flag: "🇧🇾" },
  { iso: "BE", name: "Бельгия", dial: "32", flag: "🇧🇪" },
  { iso: "BG", name: "Болгария", dial: "359", flag: "🇧🇬" },
  { iso: "GB", name: "Великобритания", dial: "44", flag: "🇬🇧" },
  { iso: "HU", name: "Венгрия", dial: "36", flag: "🇭🇺" },
  { iso: "DE", name: "Германия", dial: "49", flag: "🇩🇪" },
  { iso: "GE", name: "Грузия", dial: "995", flag: "🇬🇪" },
  { iso: "GR", name: "Греция", dial: "30", flag: "🇬🇷" },
  { iso: "DK", name: "Дания", dial: "45", flag: "🇩🇰" },
  { iso: "IL", name: "Израиль", dial: "972", flag: "🇮🇱" },
  { iso: "IE", name: "Ирландия", dial: "353", flag: "🇮🇪" },
  { iso: "ES", name: "Испания", dial: "34", flag: "🇪🇸" },
  { iso: "IT", name: "Италия", dial: "39", flag: "🇮🇹" },
  { iso: "CY", name: "Кипр", dial: "357", flag: "🇨🇾" },
  { iso: "LV", name: "Латвия", dial: "371", flag: "🇱🇻" },
  { iso: "LT", name: "Литва", dial: "370", flag: "🇱🇹" },
  { iso: "NL", name: "Нидерланды", dial: "31", flag: "🇳🇱" },
  { iso: "AE", name: "ОАЭ", dial: "971", flag: "🇦🇪" },
  { iso: "PL", name: "Польша", dial: "48", flag: "🇵🇱" },
  { iso: "PT", name: "Португалия", dial: "351", flag: "🇵🇹" },
  { iso: "RO", name: "Румыния", dial: "40", flag: "🇷🇴" },
  { iso: "RS", name: "Сербия", dial: "381", flag: "🇷🇸" },
  { iso: "SK", name: "Словакия", dial: "421", flag: "🇸🇰" },
  { iso: "SI", name: "Словения", dial: "386", flag: "🇸🇮" },
  { iso: "TR", name: "Турция", dial: "90", flag: "🇹🇷" },
  { iso: "US", name: "США", dial: "1", flag: "🇺🇸" },
  { iso: "FI", name: "Финляндия", dial: "358", flag: "🇫🇮" },
  { iso: "FR", name: "Франция", dial: "33", flag: "🇫🇷" },
  { iso: "HR", name: "Хорватия", dial: "385", flag: "🇭🇷" },
  { iso: "ME", name: "Черногория", dial: "382", flag: "🇲🇪" },
  { iso: "CZ", name: "Чехия", dial: "420", flag: "🇨🇿" },
  { iso: "CH", name: "Швейцария", dial: "41", flag: "🇨🇭" },
  { iso: "SE", name: "Швеция", dial: "46", flag: "🇸🇪" },
  { iso: "EE", name: "Эстония", dial: "372", flag: "🇪🇪" },
];

export const allCountries = [...priorityCountries, ...otherCountries];

export function findCountryByIso(iso) {
  return allCountries.find((c) => c.iso === iso);
}
