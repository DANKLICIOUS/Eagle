import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  environment: process.env.NODE_ENV || 'development',
};

export function validateConfig(): void {
  const requiredKeys = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = requiredKeys.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(', ')}. Some features may not work.`
    );
  }
}
