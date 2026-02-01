declare module "@h0rn0chse/socket-server" {
  interface ServerOptions {
    publicPaths?: Record<string, string>;
    [key: string]: unknown;
  }

  export function startServer(options: ServerOptions): void;
}
