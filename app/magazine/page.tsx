import PublicMagazineIndex from "@/components/magazine/PublicMagazineIndex";
import { getEditorialPublicMagazineData } from "@/src/lib/editorial-public";

export default async function MagazinePage() {
  const { articles } = await getEditorialPublicMagazineData();

  return <PublicMagazineIndex articles={articles} />;
}
