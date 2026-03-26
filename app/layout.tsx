"use client";

import { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <MantineProvider
          theme={
            {
              // colors や fontFamily などを必要に応じて設定可能
            }
          }
          defaultColorScheme="light" // light / dark
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
