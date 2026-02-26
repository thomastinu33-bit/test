export type Popularity = "high" | "medium" | "low";

export interface CategoryData {
  name: string;
  volume: string;
  change: string;
  changePositive: boolean;
}

export interface SubtopicData {
  name: string;
  prompts: string[];
}

export interface TopicData {
  topic: string;
  prompts: string[];
  subtopics?: SubtopicData[];
  popularity: Popularity;
  userIntent: string;
  category: string;
}

export interface BrandInsights {
  brand: string;
  competitors: string[];
  categories: CategoryData[];
  topics: TopicData[];
}

export const INSIGHTS_DATA: BrandInsights[] = [
  {
    brand: "Coach",
    competitors: ["Kate Spade", "Michael Kors", "Tory Burch", "Marc Jacobs", "Fossil", "Dooney & Bourke"],
    categories: [
      { name: "Handbags", volume: "5.7M", change: "+12%", changePositive: true },
      { name: "Wallets", volume: "3.4M", change: "+8%", changePositive: true },
      { name: "Women's Shoes", volume: "2.9M", change: "+18%", changePositive: true },
      { name: "Men's Bags", volume: "2.1M", change: "+31%", changePositive: true },
      { name: "Accessories", volume: "1.8M", change: "+5%", changePositive: true },
      { name: "Men's Shoes", volume: "1.4M", change: "+22%", changePositive: true },
      { name: "Ready-to-Wear", volume: "1.1M", change: "-3%", changePositive: false },
      { name: "Luggage & Travel", volume: "0.9M", change: "+9%", changePositive: true },
      { name: "Sunglasses", volume: "0.7M", change: "+14%", changePositive: true },
      { name: "Jewelry", volume: "0.6M", change: "+28%", changePositive: true },
      { name: "Fragrance", volume: "0.5M", change: "+19%", changePositive: true },
      { name: "Outerwear", volume: "0.4M", change: "-6%", changePositive: false },
      { name: "Scarves & Hats", volume: "0.3M", change: "+11%", changePositive: true },
      { name: "Belts", volume: "0.3M", change: "-2%", changePositive: false },
      { name: "Tech Accessories", volume: "0.2M", change: "+45%", changePositive: true },
      { name: "Gifts", volume: "0.2M", change: "+33%", changePositive: true },
      { name: "Men's Wallets", volume: "1.2M", change: "+7%", changePositive: true },
    ],
    topics: [
      {
        topic: "Handbag Discovery & Style Exploration",
        popularity: "high",
        category: "Handbags",
        userIntent: "Discover or browse handbag styles, or current trends — often to explore options or narrow choices.",
        prompts: [],
        subtopics: [
          {
            name: "Everyday & Commuter Use",
            prompts: [
              "What are the best crossbody styles for commuting?",
              "What are the best compact satchels for daily use?",
              "What are the most chic handbags for office wear?",
              "What are the most stylish messenger bags for cyclists?",
              "What are the best everyday backpacks with a laptop sleeve?",
            ],
          },
          {
            name: "Occasions & Events",
            prompts: [
              "What are the best structured evening clutches for weddings?",
              "What are the best small handheld bags with stands?",
              "Which quilted shoulder bags look elegant?",
              "Where can I find soft hobo bags in chocolate brown?",
            ],
          },
          {
            name: "Travel & Outdoor",
            prompts: [
              "What are the best lightweight travel backpacks for city trips?",
              "What are the best suitcase-style backpacks for business travel?",
              "Which mini backpacks can fit a tablet?",
              "What are the top toiletry pouches for weekend trips?",
              "What are the best sporty golf carry bags with pockets?",
            ],
          },
          {
            name: "Browsing & Trend Discovery",
            prompts: [
              "What are the top handbag trends for spring 2026?",
              "Where can I find a small white tote with short handles?",
              "Where can I find white carry-all bags with handles?",
              "Where can I find a leather satchel with a classic silhouette?",
            ],
          },
        ],
      },
      {
        topic: "Brand Authenticity",
        popularity: "medium",
        category: "Handbags",
        userIntent: "Identify a bag, confirm brand or model, or learn product-specific details to assess authenticity or learn more about a particular item.",
        prompts: [],
        subtopics: [
          {
            name: "\"What is this bag?\"",
            prompts: [
              "Which maker produces a burgundy top-handle bag with embossing like this?",
              "Can you identify the purse in this photo?",
              "Can you tell me the origin of this double-handle bag?",
              "How can I tell which company made a particular purse?",
              "How can I identify the maker of a Herschel-style backpack?",
            ],
          },
          {
            name: "Researching Specific Models",
            prompts: [
              "What brand makes an embossed leather double bag with a croc pattern?",
              "Where can I find information on classic top-handle models?",
              "Can you provide information on the \"Pimlico\" style top-handle model?",
              "What are the details of the top-handle embossed burgundy bag model?",
              "Which makers are known for crocodile-embossed leather bags?",
              "Which brands offer embossed double-handle designs?",
            ],
          },
          {
            name: "Quality & Authenticity Cues",
            prompts: [
              "What distinguishes a designer top-handle bag from similar styles?",
              "What are the hallmarks of a high-quality toiletry pouch?",
              "Is this type of purse considered vintage or current?",
              "Which labels are known for that style of leather satchel?",
              "Which purse brands are popular for women's everyday bags?",
              "Who manufactures structured bags in brocade fabric?",
              "Which brands are known for signature toiletry cases?",
              "What companies produce durable canvas grocery totes?",
            ],
          },
        ],
      },
      {
        topic: "Handbag Pricing",
        popularity: "medium",
        category: "Handbags",
        userIntent: "Compare prices, find deals, see rankings or market data to inform purchasing or research decisions.",
        prompts: [],
        subtopics: [
          {
            name: "How much should I spend?",
            prompts: [
              "What is the average price range for high-end leather handbags?",
              "What defines a \"high-end\" purse, and what are its typical price benchmarks?",
              "What is the typical selling price for structured brocade handbags?",
              "Which handbag materials are considered the most valuable by cost?",
              "How does the price of a suitcase-style backpack compare to a regular backpack?",
            ],
          },
          {
            name: "Finding a Deal",
            prompts: [
              "Are designer purses typically discounted after major holidays?",
              "During which seasons are premium handbags most commonly discounted?",
              "What are the top-rated makeup bags under $50?",
              "How do discounts influence handbag purchase decisions?",
              "How do messenger bag prices compare across major retailers?",
            ],
          },
          {
            name: "Investment & Resale Value",
            prompts: [
              "How do luxury handbags rank by resale value?",
              "Which handbag styles tend to hold their resale value best?",
              "What is the current market share of luxury versus mid-range handbags?",
              "Are handcrafted handbags generally more expensive to repair than mass-produced ones?",
            ],
          },
          {
            name: "Market Trends & Data",
            prompts: [
              "What have tote bag sales trends looked like over the past year?",
              "Which handbag categories sell the fastest online?",
              "What data shows seasonal spikes in handbag search trends?",
              "What statistics show backpack popularity among commuters?",
              "Which makeup bags receive the highest customer ratings?",
              "What are the top-rated travel toiletry bags according to reviewers?",
            ],
          },
        ],
      },
      {
        topic: "Handbag Sewing",
        popularity: "low",
        category: "Handbags",
        userIntent: "Get instructions, material advice, or creative/copywriting help for making, customizing, or marketing handbags and related accessories.",
        prompts: [],
        subtopics: [
          {
            name: "DIY Instructions",
            prompts: [
              "How can I sew a small evening clutch at home step by step?",
              "Can you provide a step-by-step guide to making a reusable grocery tote bag?",
              "What are the guidelines for making a washable cloth shopping bag?",
              "How should I size a messenger bag for daily carry?",
              "Can you provide a sewing tutorial for making a lined passport wallet?",
              "What are some creative ideas for sewing a cute, kid-friendly purse?",
            ],
          },
          {
            name: "Materials & Techniques",
            prompts: [
              "What are the best thread and needle types for sewing a leather-look tote bag?",
              "What are the best pattern recommendations for a lined makeup pouch?",
              "What lining fabric works best for a structured handbag and why?",
              "What are the best techniques for finishing edges on a handmade satchel?",
              "What materials are needed to craft a crossbody bag?",
              "How can I add a zipper pocket inside a toiletry bag?",
              "Are there templates available for a compact stand-up cosmetic pouch?",
              "What are the best tips for stitching croc-embossed faux leather?",
            ],
          },
          {
            name: "Hardware & Finishing",
            prompts: [
              "How can I reinforce handles on a heavy-duty tote bag?",
              "What are the best adhesives for attaching handbag hardware?",
              "How do I securely attach a top handle to a structured bag?",
            ],
          },
          {
            name: "Product Copywriting",
            prompts: [
              "Can you write a compelling product description for a small house manager tote?",
              "Can you create engaging product copy for a signature travel toiletry kit listing?",
              "What are some creative naming ideas for a custom reusable market tote?",
            ],
          },
        ],
      },
      {
        topic: "Sustainability & Ethical Fashion",
        popularity: "high",
        category: "Ready-to-Wear",
        userIntent: "Research eco-friendly materials, ethical sourcing, and sustainable practices when choosing fashion accessories.",
        prompts: [
          "What handbag brands use recycled or upcycled materials?",
          "How can I tell if a leather bag is ethically sourced?",
          "What are the most sustainable alternatives to leather for handbags?",
          "Which luxury brands have committed to carbon-neutral production?",
          "What certifications should I look for on sustainable handbags?",
          "How is vegan leather different from genuine leather in terms of durability?",
          "Which brands use deadstock fabric for their accessories?",
          "What is the environmental impact of manufacturing a leather handbag?",
          "Are there handbag brands that offset their carbon footprint?",
          "How do I care for a canvas bag to extend its lifespan?",
          "Which fashion labels have transparent supply chains?",
          "What are the most eco-friendly tote bag materials for everyday use?",
          "How does secondhand handbag buying compare to buying new in sustainability terms?",
          "Which brands donate a portion of bag sales to environmental causes?",
          "What is the difference between recycled PU leather and bio-based leather?",
          "How do I dispose of or recycle an old leather handbag responsibly?",
          "What are fair trade standards for accessories manufacturing?",
        ],
      },
      {
        topic: "Handbag Care & Maintenance",
        popularity: "medium",
        category: "Handbags",
        userIntent: "Find advice on cleaning, storing, and preserving handbags to extend their life and maintain appearance.",
        prompts: [],
        subtopics: [
          {
            name: "Cleaning & Stain Removal",
            prompts: [
              "How do I remove a stain from a light-colored leather bag?",
              "How often should I condition a leather handbag?",
              "What products are safe to use on patent leather?",
              "How do I clean the interior lining of a structured bag?",
              "Can I use baby wipes to clean a leather bag?",
              "What household items can I use to clean a canvas tote?",
              "How do I clean hardware like gold clasps and chains on a handbag?",
              "Is it safe to machine wash a fabric shoulder bag?",
            ],
          },
          {
            name: "Storage & Protection",
            prompts: [
              "What is the best way to store handbags to keep their shape?",
              "What is the best way to protect a suede bag from rain?",
              "How do I get rid of musty smells inside a stored handbag?",
              "How do I protect a bag's corners from wear and scuffing?",
              "How should I pack a handbag when traveling to avoid damage?",
            ],
          },
          {
            name: "Repair & Restoration",
            prompts: [
              "How can I prevent leather handles from cracking over time?",
              "What should I do if my bag's zipper stops working smoothly?",
              "How do I fix peeling faux leather on a bag?",
              "What is the best way to reshape a slouchy leather bag?",
              "What are the signs that a leather bag needs professional restoration?",
            ],
          },
        ],
      },
      {
        topic: "Gift Buying & Occasions",
        popularity: "high",
        category: "Gifts",
        userIntent: "Find the right handbag as a gift for a specific person, budget, or occasion such as birthdays, anniversaries, or graduations.",
        prompts: [
          "What is a good handbag gift for a college graduate?",
          "What are the best handbag gift ideas for a mother's birthday?",
          "Which handbag styles make great anniversary gifts?",
          "What is an appropriate handbag budget for a bridesmaid gift?",
          "What are the most popular handbag gift sets under $200?",
          "Which handbag brands offer gift wrapping and personalization?",
          "What is a good starter luxury handbag for someone new to designer brands?",
          "What handbag styles are popular gifts for teenagers?",
          "Are there handbag brands that offer monogramming as a gift option?",
          "What are good everyday handbag gifts for working professionals?",
          "Which handbag styles are considered timeless and universally appreciated?",
          "What size handbag is most practical as a gift?",
          "Are crossbody bags a good gift for frequent travelers?",
          "What are the best small luxury handbags to gift under $500?",
          "Which handbag brands offer virtual gift cards?",
          "What are trendy handbag colors for gifting this season?",
          "How do I choose a handbag gift for someone with a minimalist style?",
          "What are good accessories to pair with a handbag gift?",
          "Which bags make the best graduation gifts for professional settings?",
        ],
      },
      {
        topic: "Resale & Second-Hand Market",
        popularity: "medium",
        category: "Handbags",
        userIntent: "Buy, sell, or appraise pre-owned designer handbags, or understand the resale market and what affects bag value.",
        prompts: [
          "Where is the best place to sell a pre-owned designer handbag?",
          "How do I authenticate a secondhand luxury bag before buying?",
          "What factors affect the resale value of a designer handbag?",
          "Which handbag styles appreciate in value over time?",
          "How do I price a used handbag for resale?",
          "What is the best platform for buying authenticated pre-owned bags?",
          "How can I spot a counterfeit designer handbag?",
          "What condition criteria do resale platforms use to grade bags?",
          "Is it worth buying a bag with hardware tarnish for resale?",
          "Which limited edition handbag releases tend to sell for more on the secondary market?",
          "What documentation should I keep to protect a handbag's resale value?",
          "How do I clean a secondhand bag before selling it?",
          "What are the most sought-after vintage handbag styles right now?",
          "How does a bag's color affect its resale price?",
          "What are the risks of buying luxury bags from social media sellers?",
          "How long should I hold a designer bag before reselling it?",
          "Are dust bags and original packaging important for resale?",
          "What is the average depreciation rate for a mid-tier luxury handbag?",
        ],
      },
      {
        topic: "Styling & Outfit Pairing",
        popularity: "high",
        category: "Accessories",
        userIntent: "Get advice on how to style handbags with different outfits, occasions, or personal aesthetics.",
        prompts: [
          "What handbag colors pair well with a neutral wardrobe?",
          "How do I style a structured tote for a business casual look?",
          "What bag shape works best with a maxi dress?",
          "Can I carry a crossbody bag to a formal event?",
          "What is the best bag size for a petite frame?",
          "How do I mix textures when pairing a bag with an outfit?",
          "What color bag goes with everything?",
          "Which handbag styles work for both day and night looks?",
          "How do I style a bucket bag for a weekend outfit?",
          "What bags pair well with athleisure wear?",
          "Can a clutch bag be worn during the day?",
          "What is the best bag to wear with wide-leg trousers?",
          "How do I choose between a shoulder bag and a backpack for travel outfits?",
          "What bag style suits a minimalist aesthetic?",
          "How do I balance a bold-colored bag with a patterned outfit?",
          "Which bag shapes are most flattering for tall women?",
          "What bags are trending for spring and summer styling?",
          "How do I style a saddle bag for casual outings?",
          "What handbag styles complement vintage or retro fashion?",
          "Can I wear the same bag for work and evening events?",
        ],
      },
    ],
  },
];

export function getBrandInsights(brand: string): BrandInsights | undefined {
  return INSIGHTS_DATA.find((d) => d.brand.toLowerCase() === brand.toLowerCase());
}
