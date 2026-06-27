declare module 'react' {
  export type ReactNode = unknown;
  export type FormEvent<T = unknown> = { preventDefault(): void; currentTarget: T };
  export function useState<T>(initialState: T): [T, (value: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export const Fragment: unknown;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

export {};
