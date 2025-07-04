import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "PASS-UA Пасажирські перевезення",
  description: "PASS-UA — це надійні та комфортні пасажирські перевезення по Україні та за кордон. Ми пропонуємо міжміські та міжнародні трансфери, гарантуючи безпеку, пунктуальність і високий рівень обслуговування. Подорожуйте з нами легко — сучасний автопарк, зручне бронювання та професійні водії зроблять вашу поїздку приємною та безтурботною.",
  keywords: "PASS-UA, пасажирські перевезення, міжміські перевезення, міжнародні перевезення, автобус Україна Європа, надійні перевезення, комфортні поїздки, трансфер Україна, автобусні перевезення, транспортні послуги Україна",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk-UA" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
