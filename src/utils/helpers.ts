export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
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
