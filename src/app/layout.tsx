import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "sugarWise — Minuman favorit, pilihan lebih sadar",
  description:
    "Pahami gula dalam minuman sehari-hari dari label, simulasi, atau takaran resep.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
