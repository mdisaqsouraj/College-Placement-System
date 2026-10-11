import dotenv from 'dotenv';
dotenv.config();

export function validateEnv() {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 24) {
    console.error('JWT_SECRET is too short. Use at least 24 random characters.');
    process.exit(1);
  }
}

export const env = {
  get port() { return Number(process.env.PORT) || 5000; },
  get jwtSecret() { return process.env.JWT_SECRET; },
  get jwtExpires() { return process.env.JWT_EXPIRES_IN || '7d'; },
  get origins() { return (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()); },
};
