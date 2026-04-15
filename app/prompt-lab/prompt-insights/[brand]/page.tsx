"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Toggle, Dropdown, Button, IntentBadge } from "@/components/Evertune";
import type { IntentType } from "@/components/Evertune";
import { TrackerBuilder } from "@/components/TrackerBuilder";
import type { TrackerItem } from "@/components/TrackerBuilder";
import { useTracker, useSideNav } from "@/app/TrackerContext";

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6l6 6-6 6" stroke="#7F7F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PopularityBadge = ({ popularity }: { popularity: "High" | "Medium" | "Low" }) => {
  const getColors = () => {
    switch (popularity) {
      case "High":
        return { bars: ["#10B981", "#10B981", "#10B981"], tooltip: "Popularity: High" };
      case "Medium":
        return { bars: ["#F59E0B", "#F59E0B", "#D1D5DB"], tooltip: "Popularity: Medium" };
      case "Low":
        return { bars: ["#EF4444", "#D1D5DB", "#D1D5DB"], tooltip: "Popularity: Low" };
    }
  };

  const { bars, tooltip } = getColors();

  return (
    <div className="group relative inline-flex items-center gap-1">
      <div className="flex items-end gap-1 h-4">
        {bars.map((color, idx) => (
          <div
            key={idx}
            className="w-1 rounded-sm"
            style={{
              backgroundColor: color,
              height: popularity === "High" ? "16px" : popularity === "Medium" ? (idx === 2 ? "8px" : "16px") : (idx === 0 ? "16px" : "8px"),
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#262626] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {tooltip}
      </div>
    </div>
  );
};

interface Topic {
  name: string;
  prompts: string[];
}

interface Subcategory {
  name: string;
  type: "Branded" | "Non-Branded";
  topics: Topic[];
  popularity: "High" | "Medium" | "Low";
  intent: IntentType;
}

interface CategoryData {
  name: string;
  subcategories: number;
  prompts: number;
  details?: Subcategory[];
}

const BRAND_CATEGORIES: Record<string, CategoryData[]> = {
  "Bose": [
    {
      name: "Headphones",
      subcategories: 25,
      prompts: 1456,
      details: [
        {
          name: "Bose Headphones Comparisons",
          type: "Branded",
          popularity: "High",
          intent: "Commercial",
          topics: [
            {
              name: "Compare Bose Models",
              prompts: [
                "What's the difference between Bose QuietComfort Ultra and QuietComfort 45?",
                "Bose Ultra vs Sony WH-1000XM5 - which is better?",
                "How does QuietComfort Ultra compare to Sport Earbuds?",
                "Bose QuietComfort 45 vs Ultra - is it worth upgrading?",
                "What are the main differences in noise cancellation between Bose models?",
                "Bose Frames Audio vs QuietComfort headphones - which should I choose?",
              ],
            },
            {
              name: "Bose vs Competitors",
              prompts: [
                "How do Bose headphones compare to Sony?",
                "Bose vs Apple AirPods Max",
                "Best noise-canceling comparison",
              ],
            },
            {
              name: "Model Selection",
              prompts: [
                "Best Bose headphones for travel",
                "Which Bose headphones are best for working out?",
                "Bose headphones for office work and video calls",
                "Best Bose model for outdoor activities",
                "Bose headphones for commuting - which model to pick?",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Reviews",
          type: "Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Sound Quality",
              prompts: [
                "Do Bose headphones have good sound quality?",
                "Are Bose headphones good for bass?",
                "How is the treble on Bose QuietComfort headphones?",
                "Bose sound signature - bright or warm?",
                "Do Bose headphones have good audio clarity?",
                "Is the soundstage on Bose headphones good?",
              ],
            },
            {
              name: "Overall Reviews",
              prompts: [
                "Bose QuietComfort Ultra review",
                "Are Bose QuietComfort headphones worth it?",
                "Bose Sport Earbuds review - pros and cons",
                "User reviews of Bose QuietComfort 45",
                "What do people think about Bose headphones?",
                "Is Bose a reliable headphone brand?",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Feature Checks",
          type: "Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Connectivity",
              prompts: [
                "Do Bose QuietComfort headphones have Bluetooth 5.0?",
                "Can I connect Bose headphones to multiple devices?",
                "What's the Bluetooth range on Bose headphones?",
                "Do Bose headphones work with all Bluetooth devices?",
              ],
            },
            {
              name: "Features",
              prompts: [
                "What features does the Bose Ultra have?",
                "Bose noise cancellation features",
                "Does Bose have transparency mode?",
                "What is Aware mode on Bose headphones?",
                "Do Bose headphones have touch controls?",
                "Spatial audio on Bose headphones - how does it work?",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Battery",
          type: "Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Battery Life",
              prompts: [
                "How long is the battery life on Bose QuietComfort headphones?",
                "Bose Ultra battery specifications",
              ],
            },
            {
              name: "Charging",
              prompts: [
                "How to charge Bose headphones",
              ],
            },
            {
              name: "Battery Issues",
              prompts: [
                "Battery drain issues",
                "Battery troubleshooting",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Tracking",
          type: "Branded",
          popularity: "Low",
          intent: "Informational",
          topics: [
            {
              name: "Find My",
              prompts: [
                "Can Bose headphones be tracked if lost?",
              ],
            },
            {
              name: "Recovery Options",
              prompts: [
                "Find My Bose feature",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Pricing",
          type: "Branded",
          popularity: "High",
          intent: "Transactional",
          topics: [
            {
              name: "Price Points",
              prompts: [
                "How much do Bose QuietComfort headphones cost?",
                "Price comparison between models",
              ],
            },
            {
              name: "Deals and Discounts",
              prompts: [
                "Best Bose headphone deals",
                "Bose headphones on sale",
              ],
            },
            {
              name: "Value",
              prompts: [
                "Are they worth it?",
                "Refurbished options",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Buying",
          type: "Branded",
          popularity: "High",
          intent: "Transactional",
          topics: [
            {
              name: "Where to Buy",
              prompts: [
                "Where to buy Bose headphones?",
                "Best retailers",
              ],
            },
            {
              name: "Purchase Options",
              prompts: [
                "Official Bose store",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Replacements",
          type: "Branded",
          popularity: "Medium",
          intent: "Transactional",
          topics: [
            {
              name: "Parts",
              prompts: [
                "Bose replacement ear pads",
              ],
            },
            {
              name: "Accessories",
              prompts: [
                "Buy Bose headphone parts",
                "Replacement cables",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Support",
          type: "Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Warranty",
              prompts: [
                "Bose headphones warranty",
              ],
            },
            {
              name: "Customer Service",
              prompts: [
                "Bose customer support",
                "Troubleshooting issues",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Use Cases",
          type: "Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Activities",
              prompts: [
                "Best Bose headphones for gaming",
                "Bose headphones for running",
              ],
            },
            {
              name: "Environments",
              prompts: [
                "Work and office use",
                "Travel use cases",
              ],
            },
          ],
        },
        {
          name: "Bose Headphones Setup",
          type: "Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Pairing",
              prompts: [
                "How to pair Bose headphones",
              ],
            },
            {
              name: "Mobile App",
              prompts: [
                "Bose app setup guide",
                "App features",
              ],
            },
          ],
        },
        {
          name: "Headphones and Earbuds Compatibility",
          type: "Non-Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Device Compatibility",
              prompts: [
                "Will these headphones work with my phone?",
                "Wireless headphone compatibility",
                "Can I use Bluetooth headphones with my laptop?",
                "Do these earbuds work with tablets?",
                "Headphone compatibility with Android devices",
                "Are wireless headphones compatible with older phones?",
                "Can I use gaming headsets with my phone?",
                "What devices can I connect headphones to?",
              ],
            },
            {
              name: "Platform Support",
              prompts: [
                "Mac compatibility",
                "iOS compatibility",
                "Windows 10 headphone compatibility",
                "Linux audio device support",
                "PlayStation 5 headphone compatibility",
                "Xbox Series X wireless headsets",
                "Nintendo Switch compatible headphones",
                "Chromebook audio device support",
              ],
            },
          ],
        },
        {
          name: "Headphones and Earbuds Recommendations",
          type: "Non-Branded",
          popularity: "High",
          intent: "Commercial",
          topics: [
            {
              name: "Budget Options",
              prompts: [
                "What are the best headphones under $300?",
                "Best headphones under $100",
                "Affordable wireless earbuds with good sound",
                "Budget-friendly noise-canceling headphones",
                "Best value headphones for the money",
                "Cheap high-quality headphones",
                "Mid-range wireless headphones $150-250",
              ],
            },
            {
              name: "Top Rated",
              prompts: [
                "Top-rated wireless headphones 2024",
                "Best headphones on the market",
                "Highest rated earbuds by consumers",
                "Most popular headphones of 2024",
                "Best selling wireless headphones",
                "Award-winning headphone models",
                "Customer favorite headphones",
                "5-star rated audio headsets",
              ],
            },
          ],
        },
        {
          name: "Gaming Headsets",
          type: "Non-Branded",
          popularity: "High",
          intent: "Commercial",
          topics: [
            {
              name: "Console Gaming",
              prompts: [
                "Best gaming headsets",
                "Headsets for PS5",
                "Xbox headset compatibility",
              ],
            },
            {
              name: "PC Gaming",
              prompts: [
                "PC gaming headsets",
              ],
            },
            {
              name: "Audio Features",
              prompts: [
                "Gaming microphone quality",
                "7.1 surround sound",
              ],
            },
          ],
        },
        {
          name: "Headphones and Earbuds Fit",
          type: "Non-Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Comfort",
              prompts: [
                "Most comfortable headphones",
              ],
            },
            {
              name: "Special Sizes",
              prompts: [
                "Best headphones for small ears",
              ],
            },
          ],
        },
        {
          name: "Waterproof Sports Headphones",
          type: "Non-Branded",
          popularity: "High",
          intent: "Commercial",
          topics: [
            {
              name: "Water Resistance",
              prompts: [
                "Waterproof headphones for swimming",
              ],
            },
            {
              name: "Sports Activities",
              prompts: [
                "Best headphones for running",
              ],
            },
            {
              name: "Performance",
              prompts: [
                "Sweat resistant options",
                "Secure fit for workouts",
              ],
            },
          ],
        },
        {
          name: "Audiophile Headphones and Earbuds",
          type: "Non-Branded",
          popularity: "Low",
          intent: "Informational",
          topics: [
            {
              name: "High Fidelity",
              prompts: [
                "Best audiophile headphones",
                "Studio headphones",
              ],
            },
            {
              name: "Sound Quality",
              prompts: [
                "High fidelity options",
              ],
            },
          ],
        },
        {
          name: "Headphones and Earbuds Research",
          type: "Non-Branded",
          popularity: "Medium",
          intent: "Informational",
          topics: [
            {
              name: "Reviews",
              prompts: [
                "Headphone reviews",
              ],
            },
            {
              name: "Comparisons",
              prompts: [
                "Detailed comparison guides",
                "Feature analysis",
              ],
            },
            {
              name: "Testing",
              prompts: [
                "Sound quality testing",
              ],
            },
          ],
        },
        {
          name: "Noise-Canceling Headphones and Earbuds",
          type: "Non-Branded",
          popularity: "High",
          intent: "Commercial",
          topics: [
            {
              name: "Best Options",
              prompts: [
                "Best noise-canceling headphones",
              ],
            },
            {
              name: "Technology",
              prompts: [
                "How does ANC work?",
              ],
            },
          ],
        },
        {
          name: "Bone Conduction Headphones",
          type: "Non-Branded",
          popularity: "Medium",
          intent: "Informational",
          topics: [
            {
              name: "Overview",
              prompts: [
                "Are bone conduction headphones good?",
              ],
            },
            {
              name: "Technology",
              prompts: [
                "Bone conduction technology explained",
              ],
            },
            {
              name: "Selection",
              prompts: [
                "Best bone conduction options",
              ],
            },
          ],
        },
        {
          name: "Best Noise Cancelling Headphones",
          type: "Non-Branded",
          popularity: "High",
          intent: "Commercial",
          topics: [
            {
              name: "Top Recommendations",
              prompts: [
                "Best noise cancelling headphones 2024",
                "Premium ANC headphones",
              ],
            },
            {
              name: "Technology",
              prompts: [
                "Active vs passive noise cancellation",
              ],
            },
          ],
        },
        {
          name: "Best Wireless Earbuds",
          type: "Non-Branded",
          popularity: "High",
          intent: "Commercial",
          topics: [
            {
              name: "Top Picks",
              prompts: [
                "Best wireless earbuds",
                "Top-rated earbuds",
              ],
            },
            {
              name: "Price Ranges",
              prompts: [
                "Budget earbuds",
                "Premium earbuds",
              ],
            },
            {
              name: "Features",
              prompts: [
                "Earbud fit tips",
                "Case battery life",
                "Bluetooth stability",
              ],
            },
          ],
        },
        {
          name: "Best Open Ear Earbuds",
          type: "Non-Branded",
          popularity: "Medium",
          intent: "Commercial",
          topics: [
            {
              name: "Top Options",
              prompts: [
                "Best open ear earbuds",
              ],
            },
            {
              name: "Benefits",
              prompts: [
                "Open earbuds for awareness",
                "Safety benefits",
              ],
            },
          ],
        },
        {
          name: "Work Call Headphones",
          type: "Non-Branded",
          popularity: "High",
          intent: "Informational",
          topics: [
            {
              name: "Professional Use",
              prompts: [
                "Best headphones for calls",
              ],
            },
            {
              name: "Remote Work",
              prompts: [
                "Work from home headsets",
              ],
            },
          ],
        },
        {
          name: "TV Listening Headphones",
          type: "Non-Branded",
          popularity: "Medium",
          intent: "Informational",
          topics: [
            {
              name: "Features",
              prompts: [
                "Best headphones for watching TV",
              ],
            },
            {
              name: "Performance",
              prompts: [
                "TV headphones with low latency",
              ],
            },
          ],
        },
      ],
    },
    { name: "Earbuds", subcategories: 22, prompts: 1089 },
    { name: "Bluetooth Speakers", subcategories: 20, prompts: 892 },
    { name: "Soundbars", subcategories: 20, prompts: 1123 },
    { name: "Home Theater Speakers", subcategories: 22, prompts: 676 },
  ],
  "Tesla": [
    { name: "Electric Vehicles", subcategories: 18, prompts: 2100 },
    { name: "Energy Storage", subcategories: 12, prompts: 1450 },
    { name: "Solar Panels", subcategories: 10, prompts: 968 },
  ],
  "ASUS": [
    { name: "Laptops", subcategories: 28, prompts: 2340 },
    { name: "Desktop PCs", subcategories: 22, prompts: 1890 },
    { name: "Motherboards", subcategories: 18, prompts: 1567 },
    { name: "Graphics Cards", subcategories: 20, prompts: 2105 },
    { name: "Monitors", subcategories: 15, prompts: 1110 },
  ],
  "NordicTrack": [
    { name: "Treadmills", subcategories: 16, prompts: 1234 },
    { name: "Exercise Bikes", subcategories: 14, prompts: 987 },
    { name: "Ellipticals", subcategories: 12, prompts: 756 },
    { name: "Rowing Machines", subcategories: 10, prompts: 344 },
  ],
  "BMW": [
    { name: "Sedans", subcategories: 20, prompts: 1678 },
    { name: "SUVs", subcategories: 18, prompts: 1543 },
    { name: "Coupes", subcategories: 14, prompts: 987 },
    { name: "Convertibles", subcategories: 12, prompts: 756 },
    { name: "Electric Vehicles", subcategories: 16, prompts: 1285 },
  ],
};

export default function BrandResearchPage() {
  const router = useRouter();
  const params = useParams();
  const brand = params.brand as string;
  const { setIsTrackerOpen } = useTracker();
  const { isCollapsed } = useSideNav();
  const [mainTab, setMainTab] = useState<"prompt-research" | "prompt-volume">("prompt-research");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [brandType, setBrandType] = useState<"Non-Branded" | "Branded">("Non-Branded");
  const [intent, setIntent] = useState("All Intents");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>([]);
  const [showTracker, setShowTracker] = useState(false);
  const [trackerWidth, setTrackerWidth] = useState(600);
  const [trackerItems2, setTrackerItems2] = useState<TrackerItem[]>([]);
  const [showTracker2, setShowTracker2] = useState(false);
  const [trackerHeight2, setTrackerHeight2] = useState(300);

  // Update global tracker state when local showTracker changes
  useEffect(() => {
    setIsTrackerOpen(showTracker);
  }, [showTracker, setIsTrackerOpen]);

  const handleAddToTracker = (
    name: string,
    promptCount: number,
    type: "subcategory" | "topic" = "topic",
    topics?: Topic[]
  ) => {
    let newItems: TrackerItem[] = [];

    if (type === "subcategory" && topics) {
      // Add individual topics from the subcategory
      newItems = topics.map((topic) => ({
        name: topic.name,
        promptCount: topic.prompts.length,
        type: "topic" as const,
        prompts: topic.prompts,
      }));
    } else {
      // Add single topic
      newItems = [{ name, promptCount, type }];
    }

    setTrackerItems([...trackerItems, ...newItems]);
    setShowTracker(true);
  };

  const handleAddToTracker2 = (
    name: string,
    promptCount: number,
    type: "subcategory" | "topic" = "topic",
    topics?: Topic[]
  ) => {
    let newItems: TrackerItem[] = [];

    if (type === "subcategory" && topics) {
      // Add individual topics from the subcategory
      newItems = topics.map((topic) => ({
        name: topic.name,
        promptCount: topic.prompts.length,
        type: "topic" as const,
        prompts: topic.prompts,
      }));
    } else {
      // Add single topic
      newItems = [{ name, promptCount, type }];
    }

    setTrackerItems2([...trackerItems2, ...newItems]);
    setShowTracker2(true);
  };

  const handleRemoveTrackerItem = (name: string) => {
    setTrackerItems(trackerItems.filter(item => item.name !== name));
  };

  const handleUpdateTrackerItem = (oldName: string, newName: string) => {
    setTrackerItems(trackerItems.map(item =>
      item.name === oldName ? { ...item, name: newName } : item
    ));
  };

  const handleUpdatePrompt = (topicName: string, promptIndex: number, newPrompt: string) => {
    setTrackerItems(trackerItems.map(item =>
      item.name === topicName && item.prompts
        ? { ...item, prompts: item.prompts.map((p, idx) => idx === promptIndex ? newPrompt : p) }
        : item
    ));
  };

  const handleRemoveTrackerItem2 = (name: string) => {
    setTrackerItems2(trackerItems2.filter(item => item.name !== name));
  };

  const handleUpdateTrackerItem2 = (oldName: string, newName: string) => {
    setTrackerItems2(trackerItems2.map(item =>
      item.name === oldName ? { ...item, name: newName } : item
    ));
  };

  const handleUpdatePrompt2 = (topicName: string, promptIndex: number, newPrompt: string) => {
    setTrackerItems2(trackerItems2.map(item =>
      item.name === topicName && item.prompts
        ? { ...item, prompts: item.prompts.map((p, idx) => idx === promptIndex ? newPrompt : p) }
        : item
    ));
  };

  const handleCloseTracker = () => {
    setShowTracker(false);
  };

  const handleCloseTracker2 = () => {
    setShowTracker2(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = trackerWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX; // Negative because we're dragging from right to left
      const newWidth = Math.max(300, startWidth + delta); // Minimum width of 300px
      setTrackerWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="bg-[#f6f6f6] w-full min-h-screen flex flex-col">
      {/* Tabs */}
      <div className="bg-[#f6f6f6] px-8 pt-5 w-full">
        <div className="flex gap-0">
          {(["prompt-research", "prompt-volume"] as const).map((tab) => {
            const label = tab === "prompt-research" ? "Prompt Research" : "Prompt Volume";
            const isActive = mainTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setMainTab(tab)}
                className={`w-48 py-3 text-center font-medium text-base transition-colors ${
                  isActive
                    ? "bg-[#048BC5] text-white rounded-tl-lg"
                    : "bg-[#E1EBF8] text-[#262626] opacity-70 rounded-tr-lg"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative bg-white font-sans flex w-full" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <div className={`flex flex-col flex-1 w-full`}>
          <div className="p-5 w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-[#048BC5] hover:underline font-medium"
          >
            Prompt Research
          </button>
          <ChevronRightIcon />
          <span className="text-sm text-[#262626] font-medium">{decodeURIComponent(brand)}</span>
        </div>

        {/* Title */}
        <h1 className="text-[25px] font-bold text-[#262626] mb-4">{decodeURIComponent(brand)} Research</h1>

        {/* Key Insights */}
        <div className="relative bg-[#E0F3FE] rounded-lg pl-5 pr-4 py-3 flex flex-col gap-0.5 overflow-hidden mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#048BC5] rounded-l-lg" />
          <p className="text-base font-semibold text-[#262626]">Key Insights</p>
          <p className="text-[13px] text-[#262626] leading-relaxed">
            User-entered prompts are mostly short, conversational, and focused on making purchase decisions—often framed as comparisons, recommendations, or "best for X" queries. They reflect strong mid-funnel intent, with users looking for help choosing between options rather than learning general information.
          </p>
        </div>

        {/* Categories */}
        {BRAND_CATEGORIES[decodeURIComponent(brand)] && (
          <div>
            <h2 className="text-[20px] font-semibold text-[#262626] mb-4">Categories</h2>

            {/* Categories Grid */}
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {/* All Categories Card */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-2 rounded-lg border transition-colors text-left ${
                  selectedCategory === null
                    ? "bg-[#E0F3FE] border-[#BBE9FC]"
                    : "border-[#EEE] hover:bg-[#F9F9F9]"
                }`}
              >
                <h3 className={`text-base font-medium mb-1 ${
                  selectedCategory === null ? "text-[#048BC5] font-semibold" : "text-[#262626]"
                }`}>
                  All
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7F7F7F]">
                    {BRAND_CATEGORIES[decodeURIComponent(brand)].reduce((sum, cat) => sum + cat.subcategories, 0)} subcategories
                  </span>
                  <div className="w-px h-3 bg-[#C7C6C6]" />
                  <span className="text-xs text-[#7F7F7F]">
                    {BRAND_CATEGORIES[decodeURIComponent(brand)].reduce((sum, cat) => sum + cat.prompts, 0)} prompts
                  </span>
                </div>
              </button>

              {/* Individual Category Cards */}
              {BRAND_CATEGORIES[decodeURIComponent(brand)].map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-3 py-2 rounded-lg border transition-colors text-left ${
                    selectedCategory === category.name
                      ? "bg-[#E0F3FE] border-[#BBE9FC]"
                      : "border-[#EEE] hover:bg-[#F9F9F9]"
                  }`}
                >
                  <h3 className={`text-base font-medium mb-1 ${
                    selectedCategory === category.name ? "text-[#048BC5] font-semibold" : "text-[#262626]"
                  }`}>
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7F7F7F]">{category.subcategories} subcategories</span>
                    <div className="w-px h-3 bg-[#C7C6C6]" />
                    <span className="text-xs text-[#7F7F7F]">{category.prompts} prompts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories */}
        <div className="mt-12">
          <h2 className="text-[20px] font-semibold text-[#262626] mb-4">Subcategories</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-stretch">
            <div className="flex-shrink-0">
              <Toggle
                options={["Non-Branded", "Branded"]}
                value={brandType}
                onChange={setBrandType}
              />
            </div>
            <div className="w-64">
              <Dropdown
                label="Intent"
                options={["All Intents", "Commercial", "Informational", "Navigational", "Transactional"]}
                value={intent}
                onChange={setIntent}
              />
            </div>
          </div>

          {selectedCategory !== undefined ? (
            (() => {
              let filteredSubcategories: Subcategory[] = [];

              if (selectedCategory === null) {
                // Show all subcategories from all categories
                const allCategories = BRAND_CATEGORIES[decodeURIComponent(brand)] || [];
                allCategories.forEach((cat) => {
                  if (cat.details) {
                    filteredSubcategories.push(
                      ...cat.details.filter((sub) => sub.type === brandType)
                    );
                  }
                });
              } else {
                // Show subcategories from selected category
                const category = BRAND_CATEGORIES[decodeURIComponent(brand)]?.find(
                  (c) => c.name === selectedCategory
                );
                filteredSubcategories = category?.details?.filter(
                  (sub) => sub.type === brandType
                ) || [];
              }

              const totalPrompts = filteredSubcategories.reduce(
                (sum, sub) => sum + sub.topics.reduce((topicSum, topic) => topicSum + topic.prompts.length, 0),
                0
              );

              return (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {filteredSubcategories.map((subcategory) => (
                      <div key={subcategory.name} className="border border-[#EEE] rounded-lg overflow-hidden">
                        <div
                          onClick={() =>
                            setOpenAccordion(
                              openAccordion === subcategory.name ? null : subcategory.name
                            )
                          }
                          className="w-full px-4 py-3 flex flex-wrap items-start bg-white hover:bg-[#F9F9F9] transition-colors gap-2 relative pr-10 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm font-medium text-[#262626] text-left">
                              {subcategory.name}
                            </span>
                            <IntentBadge intent={subcategory.intent} />
                          </div>
                          <div className="flex items-center gap-4">
                            <PopularityBadge popularity={subcategory.popularity} />
                            <span className="text-xs text-[#7F7F7F]">
                              {subcategory.topics.reduce((sum, topic) => sum + topic.prompts.length, 0)} prompts
                            </span>
                            <Button
                              variant="primaryOutline"
                              onClick={(e) => {
                                e.stopPropagation();
                                const promptCount = subcategory.topics.reduce((sum, topic) => sum + topic.prompts.length, 0);
                                handleAddToTracker(subcategory.name, promptCount, "subcategory", subcategory.topics);
                              }}
                              className="py-1 px-2 text-xs"
                            >
                              Add to tracker 1
                            </Button>
                            <Button
                              variant="primaryOutline"
                              onClick={(e) => {
                                e.stopPropagation();
                                const promptCount = subcategory.topics.reduce((sum, topic) => sum + topic.prompts.length, 0);
                                handleAddToTracker2(subcategory.name, promptCount, "subcategory", subcategory.topics);
                              }}
                              className="py-1 px-2 text-xs"
                            >
                              Add to tracker 2
                            </Button>
                          </div>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-transform ${
                              openAccordion === subcategory.name ? "rotate-180" : ""
                            }`}
                          >
                            <path
                              d="M6 9l6 6 6-6"
                              stroke="#7F7F7F"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {openAccordion === subcategory.name && (
                          <div className="bg-[#F9F9F9] border-t border-[#EEE] p-4 space-y-4">
                            {subcategory.topics.map((topic, topicIdx) => (
                              <div
                                key={topic.name}
                                className={`flex gap-3 items-start ${
                                  topicIdx < subcategory.topics.length - 1
                                    ? "pb-4 border-b border-[#EEE]"
                                    : ""
                                }`}
                              >
                                <div className="flex flex-col gap-2 flex-1">
                                  <p className="text-xs font-semibold text-[#262626]">
                                    {topic.name}
                                  </p>
                                  <div>
                                    {topic.prompts.map((prompt, idx) => (
                                      <p
                                        key={idx}
                                        className="text-sm text-[#262626] leading-[1.4]"
                                      >
                                        {prompt}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-xs text-[#7F7F7F] font-medium whitespace-nowrap">
                                    {topic.prompts.length} prompts
                                  </span>
                                  <Button
                                    variant="primaryOutline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToTracker(topic.name, topic.prompts.length, "topic");
                                    }}
                                    className="py-1 px-2 text-xs shrink-0"
                                  >
                                    Add to tracker 1
                                  </Button>
                                  <Button
                                    variant="primaryOutline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToTracker2(topic.name, topic.prompts.length, "topic");
                                    }}
                                    className="py-1 px-2 text-xs shrink-0"
                                  >
                                    Add to tracker 2
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-sm text-[#7F7F7F]">
              Select a category to view subcategories
            </p>
          )}
        </div>

        {/* Content goes here */}
          </div>
        </div>

        {/* Tracker Builder */}
        {showTracker && (
          <div
            style={{ width: `${trackerWidth}px`, borderLeft: '1px solid #EEE', position: 'relative' }}
            className="flex"
          >
            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className="w-1 bg-[#EEE] hover:bg-[#048BC5] cursor-col-resize transition-colors"
              title="Drag to resize"
            />
            <div className="flex-1 overflow-hidden">
              <TrackerBuilder
                items={trackerItems}
                onRemoveItem={handleRemoveTrackerItem}
                onUpdateItem={handleUpdateTrackerItem}
                onUpdatePrompt={handleUpdatePrompt}
                onClose={handleCloseTracker}
              />
            </div>
          </div>
        )}
      </div>
      {showTracker2 && mainTab === "prompt-research" && (
        <div className="fixed bottom-0 bg-white border-t border-[#EEE] flex flex-col transition-all duration-200" style={{ height: `${trackerHeight2}px`, zIndex: 40, left: isCollapsed ? '72px' : '280px', right: 0 }}>
          <div className="h-1 bg-[#DDD] cursor-ns-resize hover:bg-[#BBE9FC] transition-colors" onMouseDown={(e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startHeight = trackerHeight2;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaY = moveEvent.clientY - startY;
              const newHeight = Math.max(200, startHeight - deltaY);
              setTrackerHeight2(newHeight);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }} />
          <div className="flex-1 overflow-y-auto">
            <TrackerBuilder
              items={trackerItems2}
              onRemoveItem={handleRemoveTrackerItem2}
              onUpdateItem={handleUpdateTrackerItem2}
              onUpdatePrompt={handleUpdatePrompt2}
              onClose={handleCloseTracker2}
            />
          </div>
        </div>
      )}

      {!showTracker && mainTab === "prompt-research" && trackerItems.length > 0 && (
        <button
          onClick={() => setShowTracker(true)}
          className="fixed right-6 top-20 bg-[#048BC5] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#037BA8] transition-colors shadow-lg z-30"
        >
          Tracker 1 ({trackerItems.length})
        </button>
      )}

      {!showTracker2 && mainTab === "prompt-research" && trackerItems2.length > 0 && (
        <button
          onClick={() => setShowTracker2(true)}
          className="fixed bottom-6 right-6 bg-[#048BC5] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#037BA8] transition-colors shadow-lg z-30"
          style={{ left: isCollapsed ? '88px' : '296px' }}
        >
          Tracker 2 ({trackerItems2.length})
        </button>
      )}
    </div>
  );
}
