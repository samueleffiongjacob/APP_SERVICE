declare module 'next' {
  export type Metadata = {
    title?: string;
    description?: string;
  };
}

declare module 'next/link' {
  const Link: unknown;
  export default Link;
}

declare module 'next/font/google' {
  export function IBM_Plex_Mono(_options: unknown): { variable: string };
  export function Space_Grotesk(_options: unknown): { variable: string };
}
