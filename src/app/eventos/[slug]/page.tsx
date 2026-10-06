import { AreaPage, areaMetadata } from "@/components/AreaPage";

// Institucionais também ficam em /eventos/… (links já compartilhados).
const KINDS = ["evento", "institucional"] as const;

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">) {
  return areaMetadata((await params).slug, [...KINDS]);
}

export default async function EventPage({ params }: PageProps<"/eventos/[slug]">) {
  return <AreaPage slug={(await params).slug} kinds={[...KINDS]} />;
}
