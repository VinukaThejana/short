declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    NODE_ENV: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    PLANETSCALE_HOST: string;
    PLANETSCALE_USERNAME: string;
    PLANETSCALE_PASSWORD: string;
  }
}
