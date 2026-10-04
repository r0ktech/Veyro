import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCategories, getCurrentUser } from "@/lib/data";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Veyro: Laptops, Phones & Accessories", template: "%s · Veyro" },
  description: "MacBooks, Windows laptops, iPhones, Android phones and the accessories that go with them.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, categories] = await Promise.all([getCurrentUser(), getCategories()]);
  const meta = user?.user_metadata ?? {};
  const headerUser = user
    ? { name: (meta.full_name ?? meta.name ?? user.email ?? "Account") as string, avatarUrl: (meta.avatar_url ?? null) as string | null }
    : null;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col`}>
        <CartProvider initialUserId={user?.id ?? null}>
          <Header user={headerUser} categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer categories={categories} />
        </CartProvider>
      </body>
    </html>
  );
}
