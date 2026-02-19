import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardToastListener } from "@/components/dashboard/DashboardToastListener";
import MainLayout from "@/components/layout/mainLayout";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Suspense>
        <DashboardToastListener />
      </Suspense>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
