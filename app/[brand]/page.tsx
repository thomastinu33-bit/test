"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getBrand, trackersByBrand } from "@/app/manage-account/data";

export default function BrandPage() {
  const params = useParams();
  const brandId = params.brand as string;
  const brand = getBrand(brandId);
  const trackers = trackersByBrand[brandId] ?? [];

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h1 className="text-xl font-semibold text-[#262626]">Brand not found</h1>
        <Link href="/manage-account" className="mt-4 text-[#262626] underline hover:no-underline">
          Back to Manage Account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#f6f6f6]">
      <header className="flex-shrink-0 h-16 bg-white border-b border-[#eeeeee] flex items-center px-8">
        <h1 className="text-xl font-semibold text-[#262626]">{brand.name}</h1>
      </header>
      <main className="flex-1 p-8">
        <section>
          <h2 className="text-sm font-medium text-[#262626] mb-4">Trackers</h2>
          <ul className="space-y-2">
            {trackers.length === 0 ? (
              <li className="text-sm text-[#7F7F7F]">No trackers yet.</li>
            ) : (
              trackers.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/${brandId}/${t.id}`}
                    className="text-sm text-[#262626] hover:underline"
                  >
                    {t.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
