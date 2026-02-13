import { redirect } from "next/navigation";

export default async function TrackerIndexPage({
  params,
}: {
  params: Promise<{ brand: string; tracker: string }>;
}) {
  const { brand, tracker } = await params;
  redirect(`/${brand}/${tracker}/overview`);
}
