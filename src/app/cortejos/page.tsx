import type { Metadata } from "next";
import { AreaListing } from "@/components/AreaListing";

export const metadata: Metadata = { title: "Cortejos" };

export default async function Page({ searchParams }: PageProps<"/cortejos">) {
  const { categoria } = await searchParams;
  return <AreaListing kind="cortejo" categoria={categoria} />;
}
