export type Popularity = "high" | "medium" | "low";

export interface TopicData {
  topic: string;
  prompts: string[];
  popularity: Popularity;
  userIntent: string;
}

export interface BrandInsights {
  brand: string;
  topics: TopicData[];
}

export const INSIGHTS_DATA: BrandInsights[] = [
  {
    brand: "Coach",
    topics: [
      {
        topic: "Handbag Discovery & Style Exploration",
        popularity: "high",
        userIntent: "Discover or browse handbag categories, styles, or current trends — often to explore options or narrow choices.",
        prompts: [
          "What are the best crossbody styles for commuting?",
          "Where can I find a small white tote with short handles?",
          "What are the best structured evening clutches for weddings?",
          "What are the best lightweight travel backpacks for city trips?",
          "Which quilted shoulder bags look elegant?",
          "What are the top handbag trends for spring 2026?",
          "What are the best compact satchels for daily use?",
          "What are the top toiletry pouches for weekend trips?",
          "What are the most stylish messenger bags for cyclists?",
          "What are the best suitcase-style backpacks for business travel?",
          "What are the most chic handbags for office wear?",
          "Which mini backpacks can fit a tablet?",
          "Where can I find soft hobo bags in chocolate brown?",
          "Where can I find a leather satchel with a classic silhouette?",
          "What are the best small handheld bags with stands?",
          "Where can I find white carry-all bags with handles?",
          "What are the best sporty golf carry bags with pockets?",
          "What are the best everyday backpacks with a laptop sleeve?",
        ],
      },
      {
        topic: "Brand Authenticity",
        popularity: "medium",
        userIntent: "Identify a bag, confirm brand or model, or learn product-specific details to assess authenticity or learn more about a particular item.",
        prompts: [
          "Which maker produces a burgundy top-handle bag with embossing like this?",
          "Can you identify the purse in this photo?",
          "What brand makes an embossed leather double bag with a croc pattern?",
          "Where can I find information on classic top-handle models?",
          "Which labels are known for that style of leather satchel?",
          "What are the details of the top-handle embossed burgundy bag model?",
          "Who manufactures structured bags in brocade fabric?",
          "Is this type of purse considered vintage or current?",
          "What are the hallmarks of a high-quality toiletry pouch?",
          "Which brands offer embossed double-handle designs?",
          "How can I tell which company made a particular purse?",
          "Can you provide information on the \"Pimlico\" style top-handle model?",
          "What distinguishes a designer top-handle bag from similar styles?",
          "Which makers are known for crocodile-embossed leather bags?",
          "Can you tell me the origin of this double-handle bag?",
          "What companies produce durable canvas grocery totes?",
          "Which brands are known for signature toiletry cases?",
          "What are common makers of structured brocade handbags?",
          "How can I identify the maker of a Herschel-style backpack?",
          "Which purse brands are popular for women's everyday bags?",
        ],
      },
      {
        topic: "Handbag Pricing",
        popularity: "medium",
        userIntent: "Compare prices, find deals, see rankings or market data to inform purchasing or research decisions.",
        prompts: [
          "What is the average price range for high-end leather handbags?",
          "Are designer purses typically discounted after major holidays?",
          "What are the top-rated makeup bags under $50?",
          "How do luxury handbags rank by resale value?",
          "What have tote bag sales trends looked like over the past year?",
          "What is the typical selling price for structured brocade handbags?",
          "During which seasons are premium handbags most commonly discounted?",
          "What statistics show backpack popularity among commuters?",
          "Which makeup bags receive the highest customer ratings?",
          "Which handbag styles tend to hold their resale value best?",
          "How do messenger bag prices compare across major retailers?",
          "Are handcrafted handbags generally more expensive to repair than mass-produced ones?",
          "What are the top-rated travel toiletry bags according to reviewers?",
          "What is the current market share of luxury versus mid-range handbags?",
          "What defines a \"high-end\" purse, and what are its typical price benchmarks?",
          "How does the price of a suitcase-style backpack compare to a regular backpack?",
          "How do discounts influence handbag purchase decisions?",
          "Which handbag materials are considered the most valuable by cost?",
          "Which handbag categories sell the fastest online?",
          "What data shows seasonal spikes in handbag search trends?",
        ],
      },
    ],
  },
];

export function getBrandInsights(brand: string): BrandInsights | undefined {
  return INSIGHTS_DATA.find((d) => d.brand.toLowerCase() === brand.toLowerCase());
}
