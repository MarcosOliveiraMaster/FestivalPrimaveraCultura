import { AreaPage, areaMetadata } from "@/components/AreaPage";

export async function generateMetadata({ params }: PageProps<"/cortejos/[slug]">) {
  return areaMetadata((await params).slug, ["cortejo"]);
}

export default async function Page({ params }: PageProps<"/cortejos/[slug]">) {
  return <AreaPage slug={(await params).slug} kinds={["cortejo"]} />;
}
