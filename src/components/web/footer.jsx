import Link from "next/link";

const footerLinks = {
  quickLinks: [
    { href: "/about", label: "Про нас" },
    { href: "/services", label: "Сервіси" },
    { href: "/contact", label: "Контакти" },
    // { href: "/privacy", label: "Правила користування" },
  ],
  services: [
    { href: "/bus-tickets", label: "Квитки" },
    // { href: "/routes", label: "Routes" },
    // { href: "/packages", label: "Travel Packages" },
    // { href: "/offers", label: "Special Offers" },
  ],
  contact: [
    { label: "Email: tickets@pass-ua.com" },
    { label: "Телефон: +38099 116 7788" },
    { label: "Адреса: вул. Жуковського, 68" },
    { label: "Запоріжжя, Україна" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">PASS-UA</h3>
            <p className="text-sm text-muted-foreground">
              Ваш надійний перевізник
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Швидкі посилання</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-yellow-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Сервіси</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-yellow-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Контакти</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.contact.map((item, index) => (
                <li key={index}>{item.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Pass-UA.
          </p>
        </div>
      </div>
    </footer>
  );
}
