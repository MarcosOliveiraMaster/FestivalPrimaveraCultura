import { AreaPage, areaMetadata } from "@/components/AreaPage";

export async function generateMetadata({ params }: PageProps<"/capacitacoes/[slug]">) {
  return areaMetadata((await params).slug, ["capacitacao"]);
}

export default async function Page({ params }: PageProps<"/capacitacoes/[slug]">) {
  return <AreaPage slug={(await params).slug} kinds={["capacitacao"]} />;
}
