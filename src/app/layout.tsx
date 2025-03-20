
import type { Metadata } from "next";
import { Arvo } from "next/font/google";
import "./globals.css";
import { Providers } from "./Provider";
const geistSans = Arvo({
  variable: "--font-geist-sans",
  weight: ["400", "700"]
});



export const metadata: Metadata = {
  title: "ChatChain",
  description: "Metaverse Chat blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable}  antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html >

  );
}
