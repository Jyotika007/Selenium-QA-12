import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var "${name}". Did you create a .env file? See .env.example.`);
  }
  return value;
}

export const config = {
  baseUrl: (process.env.BASE_URL ?? "https://qa03.stage.chairlyo.com").replace(/\/+$/, ""),
  loginPath: "/login",
  credentials: {
    email: requireEnv("LOGIN_EMAIL"),
    password: requireEnv("LOGIN_PASSWORD"),
  },
  headless: (process.env.HEADLESS ?? "true").trim().toLowerCase() !== "false",
};
