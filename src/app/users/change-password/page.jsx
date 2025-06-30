"use client";

import { Toaster } from "sonner";
import { BreadcrumbNav } from "@/components/ui/breadcrumb";
import PasswordChange from "@/components/users/password-change";

export default function ChangePasswordPage() {
  const breadcrumbs = [
    { label: "Персональний кабінет", href: "/users" },
    { label: "Змінити пароль" },
  ];

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Toaster position="top-center" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <BreadcrumbNav items={breadcrumbs} />
          <h2 className="text-2xl font-bold tracking-tight mt-2">
              Змінити пароль
          </h2>
          <p className="text-muted-foreground">
            Оновіть пароль для безпеки Вашого облікового запису
          </p>
        </div>
      </div>

      <PasswordChange />
    </div>
  );
}
