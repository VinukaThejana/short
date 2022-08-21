/**
 * @description - Seperate tailwind utility classes with ease
 * */
export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * @description - Get the Base URL of the application depending on its location
 **/
export const getBaseUrl = (): string => {
  const url =
    typeof window !== "undefined"
      ? ""
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3000}`;

  return url;
};
