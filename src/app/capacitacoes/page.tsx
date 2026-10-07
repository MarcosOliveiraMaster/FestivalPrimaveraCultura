import type { Metadata } from "next";
import { AreaListing } from "@/components/AreaListing";

export const metadata: Metadata = { title: "Capacitações" };

export default async function Page({ searchParams }: PageProps<"/capacitacoes">) {
  const { categoria } = await searchParams;
  return <AreaListing kind="capacitacao" categoria={categoria} />;
}
