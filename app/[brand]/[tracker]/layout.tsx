import { TrackerShell } from "./TrackerShell";

export default async function TrackerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: string; tracker: string }>;
}) {
  const { brand, tracker } = await params;
  return (
    <TrackerShell brandId={brand} trackerId={tracker}>
      {children}
    </TrackerShell>
  );
}
