import type { Language } from './translations';

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.PRODUCTION === 'yes') {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (
    process.env.VERCEL_ENV === 'production' &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

export const getBasePathname = (path: string) => {
  const parts = path.split('/');

  // Check if the first part after '/' is a two-letter locale code
  if (
    parts.length > 1 &&
    parts[1]?.length === 2 &&
    /^[a-z]{2}$/.test(parts[1])
  ) {
    return `/${parts.slice(2).join('/')}`; // Remove locale and rejoin the rest
  }

  return path; // Return the path as is if no locale is detected
};

// Define a mapping of country codes to their most common languages
const countryCodeToLanguage: { [key: string]: Language } = {
  '91': 'english', // India - Hindi
  '971': 'arabic', // UAE - Arabic
  '966': 'arabic', // KSA - Arabic
  '55': 'portuguese', // Brazil - Portuguese
  // Add more mappings here
};

export function getLanguageFromPhoneNumber(clientid: string): Language {
  // Extract the country code by checking against known country codes
  const possibleCodes = Object.keys(countryCodeToLanguage);
  let countryCode: string | undefined;

  // Check for each possible country code starting from the longest
  for (const code of possibleCodes.sort((a, b) => b.length - a.length)) {
    if (clientid.startsWith(code)) {
      countryCode = code;
      break;
    }
  }

  if (!countryCode) {
    return 'english'; // Default to English if no country code is matched
  }

  // Find the most common language for the extracted country code
  const language = countryCodeToLanguage[countryCode];

  // Return the language or 'en' if not found
  return language || 'english';
}
