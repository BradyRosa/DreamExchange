import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="" />
        <meta name="theme-color" content="#170824" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>DreamExchange</title>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
