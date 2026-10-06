import type { Metadata } from "next";
import { AreaListing } from "@/components/AreaListing";

export const metadata: Metadata = { title: "Eventos" };

export default async function EventsPage({ searchParams }: PageProps<"/eventos">) {
  const { categoria } = await searchParams;
  return <AreaListing kind="evento" categoria={categoria} />;
}
