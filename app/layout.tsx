import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "KenPOS™ - Point of Sale",
  description: "A responsive, offline-capable, web-based Point of Sale (POS) system designed for Kenyan retail and wholesale businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/icons/icon-72x72.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0D3B66" />
      </head>
      <body className="bg-white dark:bg-slate-900 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
