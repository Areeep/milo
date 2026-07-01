function getEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  SUPABASE_URL: getEnv("VITE_SUPABASE_URL"),
  SUPABASE_ANON_KEY: getEnv("VITE_SUPABASE_ANON_KEY"),
};
