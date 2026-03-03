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
  tab?: "your-brand" | "competitor" | "non-branded";
}

export interface CompetitorData {
  name: string;
  volume: string;
  change: string;
  changePositive: boolean;
}

export interface BrandInsights {
  brand: string;
  competitors: CompetitorData[];
  categories: CategoryData[];
  topics: TopicData[];
}

export const INSIGHTS_DATA: BrandInsights[] = [
  {
    brand: "Coach",
    competitors: [
      { name: "Chanel", volume: "1M", change: "+8%", changePositive: true },
      { name: "Hermès", volume: "510k", change: "+14%", changePositive: true },
      { name: "Celine", volume: "385k", change: "+22%", changePositive: true },
      { name: "Fashionphile", volume: "340k", change: "+5%", changePositive: true },
      { name: "Gucci", volume: "320k", change: "-3%", changePositive: false },
      { name: "Mulberry", volume: "310k", change: "+11%", changePositive: true },
      { name: "LVMH", volume: "275k", change: "+7%", changePositive: true },
      { name: "Prada", volume: "270k", change: "+18%", changePositive: true },
      { name: "Louis Vuitton", volume: "230k", change: "+2%", changePositive: true },
      { name: "Nordstrom Rack", volume: "220k", change: "-6%", changePositive: false },
      { name: "Ralph Lauren UK", volume: "220k", change: "+9%", changePositive: true },
      { name: "Miu Miu", volume: "190k", change: "+31%", changePositive: true },
      { name: "J.Crew", volume: "190k", change: "-4%", changePositive: false },
      { name: "Michael Kors", volume: "165k", change: "-8%", changePositive: false },
      { name: "Steve Madden", volume: "150k", change: "+3%", changePositive: true },
      { name: "Coach Bag", volume: "140k", change: "+12%", changePositive: true },
      { name: "Nine West", volume: "135k", change: "-2%", changePositive: false },
      { name: "Lafayette 148", volume: "130k", change: "+6%", changePositive: true },
      { name: "Loewe", volume: "130k", change: "+27%", changePositive: true },
      { name: "Burberry", volume: "130k", change: "+4%", changePositive: true },
      { name: "Belk", volume: "120k", change: "-1%", changePositive: false },
      { name: "Tory Burch", volume: "115k", change: "+10%", changePositive: true },
      { name: "Shopbop", volume: "115k", change: "+15%", changePositive: true },
      { name: "Jimmy Choo", volume: "115k", change: "+8%", changePositive: true },
      { name: "Neiman Marcus", volume: "110k", change: "-5%", changePositive: false },
      { name: "Jones New York", volume: "85k", change: "-9%", changePositive: false },
      { name: "Kate Spade", volume: "85k", change: "+1%", changePositive: true },
      { name: "Fendi", volume: "75k", change: "+19%", changePositive: true },
      { name: "Farfetch", volume: "70k", change: "-11%", changePositive: false },
      { name: "Revolve Clothing", volume: "60k", change: "+16%", changePositive: true },
    ],
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
      // Your Brand topics
      {
        topic: "Coach Model & Product Lookup",
        popularity: "high",
        category: "Handbags",
        tab: "your-brand",
        userIntent: "Identify specific Coach bag models, view detailed descriptions, or locate where to buy particular Coach handbags, backpacks, or charms.",
        prompts: [],
        subtopics: [
          {
            name: "Identifying Specific Models",
            prompts: [
              "What does the Coach Tabby shoulder bag look like?",
              "What is the Coach Pillow Tabby and how is it different from the original Tabby?",
              "What are the dimensions of the Coach Wyn crossbody?",
              "Does Coach make a bag called the Dreamer?",
              "What Coach bags come in pebble leather?",
              "What is the Coach Willow tote and what sizes does it come in?",
              "What is the difference between the Coach Mini and Micro Tabby?",
              "What does the Coach Borough bag look like?",
            ],
          },
          {
            name: "Backpacks & Charms",
            prompts: [
              "Does Coach make leather backpacks for women?",
              "What Coach backpacks are available for men?",
              "What bag charms does Coach currently sell?",
              "Where can I buy Coach bag charms online?",
              "What are the most popular Coach bag charms right now?",
              "Can I add a Coach charm to any Coach bag?",
              "Does Coach sell backpacks for kids or teens?",
            ],
          },
          {
            name: "Where to Buy",
            prompts: [
              "Where can I buy a Coach bag near me?",
              "Does Coach have an official online store?",
              "Can I buy authentic Coach bags on Amazon?",
              "Are Coach bags available at Nordstrom?",
              "Where can I find a discontinued Coach bag model?",
              "Does Coach ship internationally from their website?",
              "Can I buy Coach bags directly from their factory stores?",
            ],
          },
        ],
      },
      {
        topic: "Coach Brand Ownership & Authentication",
        popularity: "medium",
        category: "Accessories",
        tab: "your-brand",
        userIntent: "Understand Coach's brand ownership, whether Coach is considered designer or luxury, where Coach products are manufactured, or how to authenticate Coach items.",
        prompts: [],
        subtopics: [
          {
            name: "Brand Ownership & Luxury Status",
            prompts: [
              "Who owns the Coach brand?",
              "Is Coach considered a luxury brand?",
              "Is Coach a designer brand or a premium brand?",
              "What company owns Coach handbags?",
              "How does Coach compare to true luxury brands like Gucci or Louis Vuitton?",
              "Is Coach part of a larger fashion group?",
              "Has Coach always been an independent brand?",
            ],
          },
          {
            name: "Manufacturing Origins",
            prompts: [
              "Where are Coach bags manufactured?",
              "Are Coach bags made in the USA?",
              "Are any Coach bags still made in America?",
              "Does Coach manufacture its own bags or outsource production?",
              "Which countries does Coach produce its bags in?",
              "Does Coach use genuine leather in all its bags?",
              "What materials does Coach use to make its handbags?",
            ],
          },
          {
            name: "Authenticating Coach Items",
            prompts: [
              "How can I tell if a Coach bag is authentic?",
              "What are the signs of a fake Coach bag?",
              "Where is the serial number located on a Coach bag?",
              "What does the Coach creed patch look like on an authentic bag?",
              "How do I verify a Coach bag using its serial number?",
              "Does Coach offer an official authentication service?",
              "What stitching details indicate a genuine Coach product?",
              "How do counterfeit Coach bags differ in hardware quality?",
            ],
          },
        ],
      },
      {
        topic: "Coach Pricing & Promotions",
        popularity: "high",
        category: "Handbags",
        tab: "your-brand",
        userIntent: "Find current Coach prices, the cheapest options available, active promotions, or discount codes for Coach handbags.",
        prompts: [],
        subtopics: [
          {
            name: "Current Prices",
            prompts: [
              "How much does the Coach Tabby bag cost?",
              "What is the price range for Coach handbags?",
              "How much does the Coach Wyn crossbody cost?",
              "What is the cheapest Coach bag available right now?",
              "How much does a Coach leather wallet cost?",
              "What is the most affordable Coach crossbody bag?",
              "How much does a Coach mini bag cost?",
            ],
          },
          {
            name: "Discount Codes & Promotions",
            prompts: [
              "Are there any Coach promo codes available right now?",
              "Does Coach offer discount codes for first-time buyers?",
              "How do I get a discount on a Coach bag?",
              "Does Coach offer a student discount?",
              "Is there a Coach Friends & Family sale coming up?",
              "Does Coach have a loyalty or rewards program?",
              "How do I apply a promo code on the Coach website?",
            ],
          },
          {
            name: "Finding the Best Deal",
            prompts: [
              "Where can I find the cheapest authentic Coach bags?",
              "Is it cheaper to buy Coach bags at the outlet?",
              "When does Coach have its biggest sales of the year?",
              "Does Coach discount bags during Black Friday?",
              "What is the best time of year to buy a Coach bag?",
              "Are Coach bags cheaper on their website or in-store?",
              "Can I find Coach bags at a discount on Nordstrom Rack?",
            ],
          },
        ],
      },
      // Competitor topics
      {
        topic: "Coach vs. Competitor Brand Comparisons",
        popularity: "high",
        category: "Handbags",
        tab: "competitor",
        userIntent: "Compare Coach directly against competitor brands on quality, style, value, and reputation to make an informed purchase decision.",
        prompts: [],
        subtopics: [
          {
            name: "Coach vs. Michael Kors",
            prompts: [
              "Is Coach better quality than Michael Kors?",
              "What is the difference between Coach and Michael Kors handbags?",
              "Which is more expensive, Coach or Michael Kors?",
              "Is Coach considered a higher-end brand than Michael Kors?",
              "Which brand has better leather quality, Coach or Michael Kors?",
              "Coach vs. Michael Kors: which is better for everyday use?",
              "Does Michael Kors or Coach hold resale value better?",
            ],
          },
          {
            name: "Coach vs. Kate Spade",
            prompts: [
              "What is the difference between Coach and Kate Spade?",
              "Is Coach or Kate Spade better quality?",
              "Which brand is more playful, Coach or Kate Spade?",
              "Are Coach bags more durable than Kate Spade bags?",
              "Coach vs. Kate Spade: which is better for a first designer bag?",
              "Which brand is more affordable, Coach or Kate Spade?",
              "Is Kate Spade considered the same tier as Coach?",
            ],
          },
          {
            name: "Coach vs. Tory Burch & Others",
            prompts: [
              "Is Coach or Tory Burch considered more luxurious?",
              "What is the difference between Coach and Tory Burch bag quality?",
              "How does Coach compare to Marc Jacobs in terms of style?",
              "Is Coach better than Dooney & Bourke?",
              "How does Coach compare to Fossil for everyday bags?",
              "Which brand is the best value between Coach, Tory Burch, and Michael Kors?",
              "Is Coach considered in the same league as Tory Burch?",
            ],
          },
        ],
      },
      {
        topic: "Competitor Brand Identity & Positioning",
        popularity: "medium",
        category: "Accessories",
        tab: "competitor",
        userIntent: "Understand where competitor brands sit in the market — their ownership, luxury status, manufacturing, and how they differentiate from Coach.",
        prompts: [],
        subtopics: [
          {
            name: "Brand Ownership & Luxury Status",
            prompts: [
              "Is Michael Kors considered a luxury brand?",
              "Who owns Kate Spade?",
              "Is Tory Burch a luxury or designer brand?",
              "What fashion group owns Michael Kors?",
              "Is Marc Jacobs considered high fashion or accessible luxury?",
              "Is Dooney & Bourke a heritage American brand like Coach?",
              "How did Kate Spade become part of the Tapestry group?",
            ],
          },
          {
            name: "Manufacturing & Quality",
            prompts: [
              "Where are Michael Kors bags manufactured?",
              "Are Kate Spade bags made with real leather?",
              "Where are Tory Burch bags made?",
              "What materials does Marc Jacobs use in their bags?",
              "Are Dooney & Bourke bags made in the USA?",
              "How is the leather quality of Michael Kors compared to other brands at its price point?",
              "Does Kate Spade use genuine leather or vegan leather in their bags?",
            ],
          },
          {
            name: "Authenticating Competitor Items",
            prompts: [
              "How can I tell if a Michael Kors bag is authentic?",
              "What are the signs of a fake Kate Spade bag?",
              "Where is the serial number on a Tory Burch bag?",
              "How do I verify a Marc Jacobs bag is real?",
              "What distinguishes a genuine Dooney & Bourke from a counterfeit?",
              "Does Michael Kors have an authentication service?",
              "What hardware details prove a Kate Spade bag is authentic?",
            ],
          },
        ],
      },
      {
        topic: "Competitor Pricing & Deals",
        popularity: "high",
        category: "Handbags",
        tab: "competitor",
        userIntent: "Find current prices, discount codes, or the cheapest options for competitor brand handbags, and compare deals against Coach.",
        prompts: [],
        subtopics: [
          {
            name: "Competitor Price Ranges",
            prompts: [
              "How much does a Michael Kors handbag cost on average?",
              "What is the price range for Kate Spade bags?",
              "How much does a Tory Burch bag typically cost?",
              "Are Marc Jacobs bags cheaper than Coach bags?",
              "What is the most affordable Tory Burch handbag?",
              "How much does a Dooney & Bourke bag cost compared to Coach?",
              "Which is cheaper on average, Coach or Michael Kors?",
            ],
          },
          {
            name: "Competitor Discounts & Promos",
            prompts: [
              "Are there any Michael Kors promo codes available right now?",
              "Does Kate Spade offer discount codes for new customers?",
              "Does Tory Burch have a sale section on their website?",
              "How do I get a discount on a Marc Jacobs bag?",
              "Does Michael Kors have a student discount?",
              "When does Kate Spade have its biggest annual sale?",
              "Does Dooney & Bourke offer outlet pricing online?",
            ],
          },
          {
            name: "Best Value Comparisons",
            prompts: [
              "Is it cheaper to buy a Michael Kors or Coach bag?",
              "Which brand offers the best quality for the price, Coach or Kate Spade?",
              "Can I find Tory Burch bags cheaper than Coach bags of similar quality?",
              "Which designer brand has the best outlet discounts?",
              "Is Michael Kors Outlet better value than Coach Outlet?",
              "Where can I find the best deals on Kate Spade vs. Coach bags?",
              "Which brand depreciates in price the fastest: Coach, Michael Kors, or Kate Spade?",
            ],
          },
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
