import { ResourceDetailPage } from "@/features/resources/components/ResourceDetailPage";
import { collectDetailResourceIds } from "@/features/resources/data/resourcesDummyData";

type PageProps = {
  params: Promise<{ resourceId: string }>;
};

export function generateStaticParams() {
  return collectDetailResourceIds().map((resourceId) => ({ resourceId }));
}

export default async function ResourceDetailRoute({ params }: PageProps) {
  const { resourceId } = await params;
  return <ResourceDetailPage resourceId={resourceId} />;
}
