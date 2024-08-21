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
const countryCodeToLanguageCode: Record<string, string> = {
  '971': 'ar', // UAE
  '1': 'en', // USA, Canada
  '55': 'pt',
  // Add more country codes and languages as needed
  // Example: '44': 'English', // UK
  // Example: '81': 'Japanese', // Japan
};

// Function to get the most common language based on clientid
export function getLanguageCodeFromPhoneNumber(
  clientid: string,
): string | null {
  // Extract the country code from the clientid
  const countryCode = clientid.match(/^\d+/)?.[0];

  if (!countryCode) {
    return 'en';
  }

  // Find the most common language for the extracted country code
  const language = countryCodeToLanguageCode[countryCode];

  // Return the language or null if not found
  return language || null;
}
