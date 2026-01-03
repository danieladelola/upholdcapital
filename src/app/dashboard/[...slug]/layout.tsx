import type { Metadata } from "next";
import { ProtectedLayout } from "@/components/ProtectedLayout";

export const metadata: Metadata = {
  title: "Uphold",
  description: "Expert portfolio management",
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string[] }>;
}) {
  const slugArr = (await params).slug;
  const breadcrumbLabel = slugArr && slugArr.length > 0
    ? slugArr.join("/")
        .replace(/-/g, " ")
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
    : "";

  return (
    <ProtectedLayout breadcrumbLabel={breadcrumbLabel}>
      <div className="p-5 bg-background h-full">
        {children}
      </div>
    </ProtectedLayout>
  );
}
