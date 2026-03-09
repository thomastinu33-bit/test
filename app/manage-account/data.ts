export const brands = [
  { id: "adidas", name: "Adidas", trackerCount: 2 },
  { id: "asus", name: "ASUS", trackerCount: 2 },
  { id: "bmw", name: "BMW", trackerCount: 6 },
  { id: "cetaphil", name: "Cetaphil", trackerCount: 1 },
  { id: "hm", name: "H&M", trackerCount: 3 },
  { id: "nike", name: "Nike", trackerCount: 12 },
  { id: "porsche", name: "Porsche", trackerCount: 19 },
] as const;

export const trackersByBrand: Record<string, { id: string; name: string; location: string }[]> = {
  asus: [
    { id: "laptops", name: "Laptops", location: "United States English" },
    { id: "gaming-laptops", name: "Gaming Laptops", location: "United States English" },
  ],
  bmw: [
    { id: "1", name: "Electric SUVs", location: "United States English" },
    { id: "2", name: "2026 Elektro SUVs", location: "United States English" },
    { id: "3", name: "Elektro SUVs", location: "United States English" },
    { id: "4", name: "Electric cars", location: "United States English" },
    { id: "5", name: "Luxury Cars", location: "United States English" },
    { id: "6", name: "Luxury cars, UK", location: "United States English" },
  ],
  porsche: [
    { id: "luxury-suvs", name: "Luxury SUVs", location: "United States English" },
    { id: "luxury-suvs-v2", name: "Luxury SUVs v2", location: "United States English" },
  ],
  cetaphil: [
    { id: "skincare", name: "Skincare", location: "United States English" },
  ],
  hm: [
    { id: "pants", name: "H&M Pants", location: "United States English" },
    { id: "heatmap", name: "H&M Heatmap", location: "United States English" },
    { id: "jeans", name: "H&M Jeans", location: "United States English" },
  ],
};

export function getTracker(brandId: string, trackerId: string) {
  const trackers = trackersByBrand[brandId];
  if (!trackers) return null;
  return trackers.find((t) => t.id === trackerId) ?? null;
}

export function getBrand(brandId: string) {
  return brands.find((b) => b.id === brandId) ?? null;
}
