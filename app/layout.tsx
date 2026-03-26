"use client";

import { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
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
