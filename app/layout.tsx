"use client";

import { ReactNode } from "react";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const metadata = {
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" sizes="192x192" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <MantineProvider defaultColorScheme="light">
            {children}
          </MantineProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
