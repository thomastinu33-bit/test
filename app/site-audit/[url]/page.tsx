"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Link as LinkIcon, Triangle } from "lucide-react";
import { Tabs, Dropdown, Toggle } from "@/components/Evertune";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14Z" fill="#7F7F7F" />
  </svg>
);


const MOCK_SNIPPETS = [
  {
    id: 1,
    content: "Immerse yourself in crystal clear audio with advanced noise cancellation that blocks out distractions. Whether you're in a busy coffee shop or traveling, these speakers deliver studio-quality sound wherever you go.",
    relevance: 95,
    topics: [
      {
        name: "Sound Quality",
        color: "#3B82F6",
        tracker: "Bluetooth Headphones",
        topicRelevance: 92,
        sourceShare: 8.3,
        prompts: [
          { text: "What makes these speakers sound better than competitors?", relevance: 92, sourceShare: 8.3 },
          { text: "How does noise cancellation improve audio clarity?", relevance: 85, sourceShare: 7.2 }
        ]
      },
      {
        name: "Audio Performance",
        color: "#10B981",
        tracker: "Home Cinema Audio",
        topicRelevance: 88,
        sourceShare: 6.5,
        prompts: [
          { text: "Which audio specs matter most for sound quality?", relevance: 88, sourceShare: 6.5 },
          { text: "How does driver size affect audio performance?", relevance: 81, sourceShare: 5.9 }
        ]
      }
    ]
  },
  {
    id: 2,
    content: "With 24-hour battery life and quick-charge technology, you can enjoy uninterrupted listening throughout your day. A 15-minute charge gives you up to 3 hours of playback, keeping you connected to your music without constant recharging.",
    relevance: 88,
    topics: [
      {
        name: "Endurance",
        color: "#F59E0B",
        tracker: "Portable Speakers",
        topicRelevance: 87,
        sourceShare: 7.1,
        prompts: [
          { text: "How long can you expect battery life in real use?", relevance: 87, sourceShare: 7.1 },
          { text: "What factors affect battery performance?", relevance: 79, sourceShare: 5.8 }
        ]
      },
      {
        name: "Power",
        color: "#10B981",
        tracker: "Home Cinema Audio",
        topicRelevance: 84,
        sourceShare: 6.2,
        prompts: [
          { text: "What wattage is needed for different room sizes?", relevance: 84, sourceShare: 6.2 },
          { text: "How does amplifier power affect speaker output?", relevance: 76, sourceShare: 5.4 }
        ]
      }
    ]
  },
  {
    id: 3,
    content: "Designed for portability and durability, these lightweight speakers weigh less than a pound but feel solid and premium in your hands. The premium materials ensure they withstand everyday use while maintaining their sleek aesthetic.",
    relevance: 82,
    topics: [
      {
        name: "Design",
        color: "#3B82F6",
        tracker: "Bluetooth Headphones",
        topicRelevance: 81,
        sourceShare: 6.8,
        prompts: [
          { text: "What design features make these speakers ergonomic?", relevance: 81, sourceShare: 6.8 },
          { text: "How important is aesthetics in speaker selection?", relevance: 74, sourceShare: 5.2 }
        ]
      },
      {
        name: "Materials",
        color: "#F59E0B",
        tracker: "Portable Speakers",
        topicRelevance: 78,
        sourceShare: 5.9,
        prompts: [
          { text: "What materials provide the best durability?", relevance: 78, sourceShare: 5.9 },
          { text: "How do materials affect sound quality?", relevance: 71, sourceShare: 4.7 }
        ]
      },
      {
        name: "Portability",
        color: "#10B981",
        tracker: "Home Cinema Audio",
        topicRelevance: 85,
        sourceShare: 7.4,
        prompts: [
          { text: "Which speakers are best for travel?", relevance: 85, sourceShare: 7.4 },
          { text: "How does size affect portability?", relevance: 77, sourceShare: 5.6 }
        ]
      }
    ]
  },
  {
    id: 4,
    content: "Perfect for outdoor adventures or bathroom use, the water-resistant design keeps your music playing in any environment. The sealed construction prevents water damage while maintaining acoustic integrity for optimal sound performance.",
    relevance: 76,
    topics: [
      {
        name: "Durability",
        color: "#3B82F6",
        tracker: "Bluetooth Headphones",
        topicRelevance: 79,
        sourceShare: 6.1,
        prompts: [
          { text: "How durable are these speakers for outdoor use?", relevance: 79, sourceShare: 6.1 },
          { text: "What warranty coverage is typical?", relevance: 72, sourceShare: 4.9 }
        ]
      },
      {
        name: "Protection",
        color: "#F59E0B",
        tracker: "Portable Speakers",
        topicRelevance: 75,
        sourceShare: 5.3,
        prompts: [
          { text: "What protection features do these speakers have?", relevance: 75, sourceShare: 5.3 },
          { text: "Are they waterproof or just water-resistant?", relevance: 68, sourceShare: 4.2 }
        ]
      }
    ]
  },
];

const RELEVANT_TOPICS = [
  {
    id: 1,
    topic: "Sound Quality",
    description: "Audio Performance & Clarity",
    trackers: [
      { name: "Bluetooth Headphones", color: "#3B82F6", relevance: 95 },
      { name: "Home Cinema Audio", color: "#10B981", relevance: 98 },
      { name: "Portable Speakers", color: "#F59E0B", relevance: 92 }
    ]
  },
  {
    id: 2,
    topic: "Battery Life",
    description: "Endurance & Charging",
    trackers: [
      { name: "Bluetooth Headphones", color: "#3B82F6", relevance: 91 },
      { name: "Portable Speakers", color: "#F59E0B", relevance: 85 }
    ]
  },
  {
    id: 3,
    topic: "Connectivity",
    description: "Wireless & Bluetooth",
    trackers: [
      { name: "Bluetooth Headphones", color: "#3B82F6", relevance: 88 },
      { name: "Home Cinema Audio", color: "#10B981", relevance: 82 }
    ]
  },
  {
    id: 4,
    topic: "Portability",
    description: "Compact & Lightweight",
    trackers: [
      { name: "Bluetooth Headphones", color: "#3B82F6", relevance: 89 },
      { name: "Portable Speakers", color: "#F59E0B", relevance: 86 }
    ]
  },
  {
    id: 5,
    topic: "Price",
    description: "Value & Affordability",
    trackers: [
      { name: "Bluetooth Headphones", color: "#3B82F6", relevance: 81 },
      { name: "Home Cinema Audio", color: "#10B981", relevance: 79 },
      { name: "Portable Speakers", color: "#F59E0B", relevance: 83 }
    ]
  },
  {
    id: 6,
    topic: "Design & Build",
    description: "Aesthetics & Materials",
    trackers: [
      { name: "Bluetooth Headphones", color: "#3B82F6", relevance: 84 },
      { name: "Portable Speakers", color: "#F59E0B", relevance: 80 }
    ]
  },
  {
    id: 7,
    topic: "Power Output",
    description: "Loudness & Performance",
    trackers: [
      { name: "Home Cinema Audio", color: "#10B981", relevance: 96 },
      { name: "Portable Speakers", color: "#F59E0B", relevance: 87 }
    ]
  },
  {
    id: 8,
    topic: "Water Resistance",
    description: "Durability & Protection",
    trackers: [
      { name: "Bluetooth Headphones", color: "#3B82F6", relevance: 76 },
      { name: "Portable Speakers", color: "#F59E0B", relevance: 72 }
    ]
  },
];

export default function URLAuditPage() {
  const params = useParams();
  const decodedUrl = decodeURIComponent(params.url as string);
  const [activeTab, setActiveTab] = useState("issues");
  const [issueSearch, setIssueSearch] = useState("");
  const [issueSeverity, setIssueSeverity] = useState("All Severities");
  const [issueType, setIssueType] = useState("All Types");
  const [selectedModel, setSelectedModel] = useState("Select Model");
  const [selectedTracker, setSelectedTracker] = useState("Select Tracker");
  const [selectedSnippet, setSelectedSnippet] = useState(MOCK_SNIPPETS[0]);
  const [snippetView, setSnippetView] = useState("snippet");
  const [snippetSort, setSnippetSort] = useState("most-relevant");
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);

  return (
    <div className="bg-[#f6f6f6] w-full min-h-screen flex flex-col m-5">
      {/* Tabs */}
      <div className="bg-[#f6f6f6] pt-5 w-full">
        <div className="flex gap-0 px-8">
          <button
            type="button"
            className="px-6 py-3 font-medium text-base transition-colors bg-[#E1EBF8] text-[#262626] opacity-70 rounded-tr-lg"
          >
            Overview
          </button>
          <button
            type="button"
            className="px-6 py-3 font-medium text-base transition-colors bg-[#048BC5] text-white rounded-tl-lg"
          >
            Audited pages
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white font-sans pt-8 pb-8 w-full flex-1">
        <div className="space-y-8 px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/site-audit" className="text-[#048BC5] hover:underline">
              Audited pages
            </Link>
            <ChevronRight size={16} />
            <span className="text-[#262626] font-medium">{decodedUrl}</span>
          </div>

          {/* Page Title */}
          <div>
            <h2 className="text-2xl font-bold text-[#262626]">Discover Premium Bose Speakers</h2>
          </div>

          {/* URL Header Card */}
          <div className="border border-[#eee] rounded-lg overflow-hidden">
            {/* URL Details */}
            <div className="flex gap-4 items-start p-4 bg-white">
              <div className="bg-[#f6f6f6] p-3 rounded-lg flex-shrink-0">
                <LinkIcon size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[#048BC5] font-semibold text-lg break-all">{decodedUrl}</p>
                  <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">Product</span>
                </div>
                <p className="text-[#7f7f7f] text-sm">Snapshot captured <span className="font-semibold">Mar 15, 2026 02:30 PM ET</span></p>
              </div>
            </div>

            {/* Mentioned as a Source */}
            <div className="border-t border-[#eee] px-4 py-3 bg-white">
              <p className="text-[#7f7f7f] text-xs font-medium uppercase mb-3">Mentioned as a Source</p>
              <div className="flex flex-wrap gap-2">
                <div className="bg-[#f6f6f6] px-3 py-2 rounded-full flex items-center gap-2">
                  <img src="/chatgpt-logo.svg" alt="ChatGPT" className="w-4 h-4" />
                  <span className="text-sm text-[#262626]">ChatGPT Search</span>
                </div>
                <div className="bg-[#f6f6f6] px-3 py-2 rounded-full flex items-center gap-2">
                  <img src="/gemini-logo.svg" alt="Gemini" className="w-4 h-4" />
                  <span className="text-sm text-[#262626]">Gemini Search</span>
                </div>
                <div className="bg-[#f6f6f6] px-3 py-2 rounded-full flex items-center gap-2">
                  <img src="/perplexity-logo.svg" alt="Perplexity" className="w-4 h-4" />
                  <span className="text-sm text-[#262626]">Perplexity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={[
              { id: "issues", label: "Issues" },
              { id: "content", label: "Content" },
            ]}
            value={activeTab}
            onValueChange={setActiveTab}
          />

          {/* Tab Content */}
          {activeTab === "issues" && (
            <div className="space-y-4 -mt-2">
              {/* Search and Filters */}
              <div className="flex gap-4 items-end flex-wrap">
                {/* Search Bar */}
                <div className="flex items-center gap-2 bg-[#f6f6f6] px-4 py-2 rounded-lg">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Search issues"
                    value={issueSearch}
                    onChange={(e) => setIssueSearch(e.target.value)}
                    className="bg-transparent flex-1 text-sm text-[#262626] placeholder-[#7f7f7f] outline-none"
                  />
                </div>

                {/* Severity Dropdown */}
                <div className="w-40">
                  <Dropdown
                    label="Severity"
                    options={["All Severities", "Critical", "High", "Medium", "Low"]}
                    value={issueSeverity}
                    onChange={setIssueSeverity}
                  />
                </div>

                {/* Type of Issue Dropdown */}
                <div className="w-40">
                  <Dropdown
                    label="Type of Issue"
                    options={["All Types", "Broken Links", "Performance", "SEO", "Accessibility", "Security"]}
                    value={issueType}
                    onChange={setIssueType}
                  />
                </div>
              </div>

              {/* Issues Table */}
              <div className="border border-[#eee] rounded-lg overflow-hidden mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f6f6f6] border-b border-[#eee]">
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">
                          Issue
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">
                          Severity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-[#262626] whitespace-nowrap">
                          Explanation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#eee] hover:bg-[#f6f6f6] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#262626]">Missing Alt Text on Images</td>
                        <td className="px-4 py-3">
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                            Warning
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#7f7f7f]">
                          3 images are missing alt text which impacts accessibility and SEO performance.
                        </td>
                      </tr>
                      <tr className="border-b border-[#eee] hover:bg-[#f6f6f6] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#262626]">Page Load Time</td>
                        <td className="px-4 py-3">
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                            Warning
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#7f7f7f]">
                          Page takes 3.2 seconds to load. Consider optimizing images and minifying CSS/JS.
                        </td>
                      </tr>
                      <tr className="border-b border-[#eee] hover:bg-[#f6f6f6] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#262626]">Missing H1 Tag</td>
                        <td className="px-4 py-3">
                          <span className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
                            Critical
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#7f7f7f]">
                          Page is missing a primary H1 heading which is important for SEO and accessibility.
                        </td>
                      </tr>
                      <tr className="border-b border-[#eee] hover:bg-[#f6f6f6] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#262626]">Proper Image Optimization</td>
                        <td className="px-4 py-3">
                          <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                            Good
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#7f7f7f]">
                          Images are properly optimized for web with appropriate file sizes and formats.
                        </td>
                      </tr>
                      <tr className="hover:bg-[#f6f6f6] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#262626]">Mobile Responsive Design</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                            Excellent
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#7f7f7f]">
                          Page is fully responsive and displays perfectly on all device sizes.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-4 -mt-2">
              {/* Select Model and Tracker */}
              <div className="flex gap-4 items-end flex-wrap">
                <div className="w-40">
                  <Dropdown
                    label="Select Model"
                    options={["Select Model", "GPT-4", "Claude", "Gemini", "Llama"]}
                    value={selectedModel}
                    onChange={setSelectedModel}
                  />
                </div>
                <div className="w-40">
                  <Dropdown
                    label="Select Tracker"
                    options={["Select Tracker", "Tracker 1", "Tracker 2", "Tracker 3"]}
                    value={selectedTracker}
                    onChange={setSelectedTracker}
                  />
                </div>
              </div>

              {/* Score Cards */}
              <div className="flex gap-4 mt-4 flex-wrap">
                {/* Overall Topic Relevance */}
                <div className="bg-white border border-[#eee] rounded-lg p-4 max-w-[1000px]">
                  <p className="text-[#7f7f7f] text-xs mb-2">Overall Topic Relevance</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-[#262626]">78</p>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums uppercase tracking-wide bg-emerald-50 text-emerald-700 gap-0.5">
                      <Triangle size={8} className="fill-current" />
                      5.2%
                    </span>
                  </div>
                </div>

                {/* Overall Source Share */}
                <div className="bg-white border border-[#eee] rounded-lg p-4 max-w-[1000px]">
                  <p className="text-[#7f7f7f] text-xs mb-2">Overall Source Share</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-[#262626]">62%</p>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums uppercase tracking-wide bg-red-50 text-red-600 gap-0.5">
                      <Triangle size={8} className="fill-current rotate-180" />
                      2.1%
                    </span>
                  </div>
                </div>
              </div>

              {/* Relevant Topics */}
              <div>
                <h3 className="text-lg font-semibold text-[#262626] mb-4">Relevant Topics</h3>
                <div className="flex gap-4 flex-wrap">
                  {RELEVANT_TOPICS.flatMap((item) =>
                    item.trackers.map((tracker, trackerIdx) => ({
                      id: `${item.id}-${trackerIdx}`,
                      topic: item.topic,
                      tracker,
                    }))
                  )
                    .slice(0, 8)
                    .map((card) => (
                      <div key={card.id} className="bg-white border border-[#eee] rounded-lg p-2.5 w-48">
                        {/* Tracker Name */}
                        <p
                          className="text-xs font-medium mb-0.5"
                          style={{ color: card.tracker.color }}
                        >
                          {card.tracker.name}
                        </p>

                        {/* Topic Name */}
                        <p className="text-sm font-semibold text-[#262626] mb-3">{card.topic}</p>

                        {/* Relevance Section */}
                        <div className="flex flex-row justify-center items-center gap-4 h-[15px]">
                          <p className="text-xs font-medium text-[#7f7f7f] whitespace-nowrap">Relevance</p>
                          <div className="flex-1 bg-[#eee] rounded-full h-1 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${card.tracker.relevance}%`,
                                backgroundColor: card.tracker.color
                              }}
                            />
                          </div>
                          <p className="text-xs font-semibold text-[#262626] min-w-[28px] text-right -ml-1">
                            {card.tracker.relevance}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Snippets Card */}
              <div className="border border-[#eee] rounded-lg overflow-hidden mt-6">
                {/* Content */}
                {snippetView === "snippet" && (
                <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
                  {/* Left Column - Snippets List */}
                  <div className="border-r border-[#eee] overflow-y-auto flex flex-col">
                    {/* Toggle and Sort */}
                    <div className="p-4 border-b border-[#eee] flex items-center gap-4">
                      <Toggle
                        options={["Snippet View", "Page View"]}
                        value={snippetView === "snippet" ? "Snippet View" : "Page View"}
                        onChange={(option) => setSnippetView(option === "Snippet View" ? "snippet" : "page")}
                      />
                      <div className="w-40 h-10">
                        <Dropdown
                          label="Sort By"
                          options={["Most Relevant", "Least Relevant"]}
                          value={snippetSort === "most-relevant" ? "Most Relevant" : "Least Relevant"}
                          onChange={(value) => setSnippetSort(value === "Most Relevant" ? "most-relevant" : "least-relevant")}
                        />
                      </div>
                    </div>

                    {/* Snippets List */}
                    <div className="overflow-y-auto">
                    {MOCK_SNIPPETS.sort((a, b) =>
                      snippetSort === "most-relevant"
                        ? b.relevance - a.relevance
                        : a.relevance - b.relevance
                    ).map((snippet) => (
                      <button
                        key={snippet.id}
                        onClick={() => setSelectedSnippet(snippet)}
                        className={`w-full px-4 py-3 text-left border-b border-[#eee] transition-colors ${
                          selectedSnippet.id === snippet.id
                            ? "bg-[#f6f6f6]"
                            : "hover:bg-[#f9f9f9]"
                        }`}
                      >
                        <div className="flex flex-wrap gap-1 mb-2">
                          {snippet.topics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center h-5 px-2 rounded text-xs font-normal"
                              style={{
                                backgroundColor: topic.color + "20",
                                color: topic.color
                              }}
                            >
                              {topic.name}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-[#262626] line-clamp-3">{snippet.content}</p>
                      </button>
                    ))}
                    </div>
                  </div>

                  {/* Right Column - Topics Accordion */}
                  <div className="bg-white flex flex-col overflow-y-auto">
                    {selectedSnippet.topics.map((topic, idx) => {
                      const isExpanded = expandedTopics.includes(idx);
                      return (
                        <div key={idx} className="border-b border-[#eee] last:border-b-0">
                          <button
                            onClick={() => {
                              setExpandedTopics(prev =>
                                prev.includes(idx)
                                  ? prev.filter(i => i !== idx)
                                  : [...prev, idx]
                              );
                            }}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f9f9f9] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[#262626]">{topic.name}</p>
                              <span
                                className="inline-flex items-center h-5 px-2 rounded text-xs font-normal"
                                style={{
                                  backgroundColor: topic.color + "20",
                                  color: topic.color
                                }}
                              >
                                {topic.tracker}
                              </span>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-[10px] font-medium text-[#7f7f7f] uppercase">Topic Relevance</p>
                                <p className="text-xs font-bold text-[#262626]">{topic.topicRelevance}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-medium text-[#7f7f7f] uppercase">Source Share</p>
                                <p className="text-xs font-bold text-[#262626]">{topic.sourceShare}%</p>
                              </div>
                              <ChevronRight
                                size={16}
                                className="text-[#7f7f7f] transition-transform"
                                style={{
                                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                                }}
                              />
                            </div>
                          </button>

                          {/* Expanded Prompts Section */}
                          {isExpanded && (
                            <div>
                              {/* Prompts Header */}
                              <div className="px-4 py-2 bg-[#f6f6f6] border-b border-[#eee] flex items-center justify-between gap-4 text-xs font-medium text-[#7f7f7f] uppercase">
                                <p className="flex-1">Prompt</p>
                                <div className="flex gap-6 whitespace-nowrap">
                                  <p>Topic Relevance</p>
                                  <p>Source Share</p>
                                </div>
                              </div>

                              {/* Prompt Rows */}
                              {topic.prompts.map((prompt, promptIdx) => (
                                <div key={promptIdx} className="px-4 py-3 border-b border-[#eee] flex items-start justify-between gap-4 text-sm hover:bg-[#f9f9f9]">
                                  <p className="text-[#262626] flex-1">{prompt.text}</p>
                                  <div className="flex gap-6 whitespace-nowrap">
                                    <div className="text-right">
                                      <p className="text-[#262626] font-semibold text-xs">{prompt.relevance}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[#262626] font-semibold text-xs">{prompt.sourceShare}%</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}

                {/* Page View Placeholder */}
                {snippetView === "page" && (
                  <div className="p-6 bg-[#f6f6f6]">
                    <p className="text-[#7f7f7f]">Page view content goes here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
