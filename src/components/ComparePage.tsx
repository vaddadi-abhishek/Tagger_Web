import { useParams, useNavigate } from "react-router-dom";
import { Check, ArrowLeft, ArrowRight, Sparkles, Shield, Eye, Layers } from "lucide-react";
import { MindspaceLogo } from "./ui/MindspaceLogo";

interface CompetitorData {
  name: string;
  slug: string;
  tagline: string;
  metaTitle: string;
  metaDesc: string;
  heroHeadline: string;
  heroSubheadline: string;
  summary: string;
  storyTitle: string;
  storyQuote: string;
  comparisonPoints: {
    feature: string;
    mindspace: string;
    competitor: string;
    mindspaceAdvantage: boolean;
  }[];
  verdict: string;
}

const COMPARISONS: Record<string, CompetitorData> = {
  "raindrop-alternative": {
    name: "Raindrop.io",
    slug: "raindrop-alternative",
    tagline: "The Frustration-Free Alternative to Raindrop.io",
    metaTitle: "Best Raindrop.io Alternative in 2026 — MindSpace AI Bookmarks",
    metaDesc: "Tired of ugly link cards and folder fatigue in Raindrop? MindSpace shows authentic social cards, reads text inside screenshots with OCR, and auto-tags everything.",
    heroHeadline: "Why People Are Leaving Raindrop.io for MindSpace",
    heroSubheadline: "You shouldn't have to spend your weekend organizing bookmarks into 40 folders. MindSpace makes saved tweets, reels, and articles look like real social cards and finds them by what you remember.",
    summary: "Raindrop is a powerful bookmark tool, but it was designed in the 2010s when the internet was mostly blue links and blogs. Today, we learn from tweets, video reels, Reddit discussions, and infographics. In Raindrop, saving an Instagram reel or X thread turns it into an ugly rectangular preview with missing context. In MindSpace, it looks and feels like the real thing.",
    storyTitle: "The Common Complaint on Reddit: 'I spend more time organizing my folders than reading'",
    storyQuote: "\"I have over 2,000 links in Raindrop scattered across 35 collections and 200 tags. When I save something new, I freeze because I don't know which folder it belongs to. Six months later, I can never find that one infographic I swear I saved.\" — r/productivity user",
    comparisonPoints: [
      {
        feature: "Saving a tweet, reel, or Reddit post",
        mindspace: "Looks exactly like the app you saved it from. Creator avatar, verified badges, readable thread text, multi-image carousels, and upvotes.",
        competitor: "A plain box with a blurry cropped thumbnail and a website title. You can't read the tweet or swipe the carousel without leaving the app.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Finding words inside screenshots & memes",
        mindspace: "AI reads the text inside every image automatically (OCR). Remember two words from a chart or meme 4 months ago? Search for them and it pops right up.",
        competitor: "Completely blind to images. If the quote or stat was inside a photo or diagram, search finds 0 results. You have to scroll manually through hundreds of pictures.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Deciding where a saved link goes",
        mindspace: "Zero filing. Save the link and walk away. MindSpace understands the topic, creator, and concepts, organizing everything for you.",
        competitor: "Folder Fatigue. Pops up asking you to pick from 40 nested folders and type tags. If you don't file it immediately, it gets lost forever in 'Unsorted'.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Searching inside your saved links",
        mindspace: "Deep search across all your saved links and text is 100% free forever.",
        competitor: "Locked behind a Pro paywall ($3.50/mo). Free users can only search basic page titles.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Asking ChatGPT or Claude about your links",
        mindspace: "Direct Model Context Protocol (MCP) bridge. Claude and ChatGPT can read, search, and reference your bookmarks in real time.",
        competitor: "Closed walled garden. You have to copy-paste links into ChatGPT one by one like it's 2015.",
        mindspaceAdvantage: true,
      },
    ],
    verdict: "If you love manually filing every bookmark into color-coded folders like a virtual filing cabinet, Raindrop is great. But if you want your saved links to look like real social media, read text inside images, and organize themselves, MindSpace is built for you.",
  },
  "pocket-alternative": {
    name: "Pocket",
    slug: "pocket-alternative",
    tagline: "The Modern Multimodal Alternative to Pocket",
    metaTitle: "Best Pocket Alternative in 2026 — MindSpace AI Bookmarks",
    metaDesc: "Looking for a Pocket alternative? Pocket is stuck in 2007. MindSpace saves tweets, reels, video transcripts, and articles with clean reader mode and AI auto-tagging.",
    heroHeadline: "Pocket Was Built for 2007 Blogs. MindSpace Is Built for Today.",
    heroSubheadline: "Pocket only understands plain text articles. MindSpace understands the entire modern internet: tweets, reels, LinkedIn posts, Reddit threads, infographics, and clean reader mode.",
    summary: "Pocket pioneered the 'read-it-later' category, but today's knowledge isn't just text articles. We learn from tweet threads, LinkedIn carousels, and Instagram diagrams. Saving a social media post to Pocket either strips the media completely or breaks the link. Pocket has also cluttered its home screen with sponsored clickbait and ads.",
    storyTitle: "The Common Complaint on Reddit: 'Pocket feels neglected and filled with sponsored slop'",
    storyQuote: "\"Pocket used to be great when the web was just blog posts. Now whenever I open it, half my home screen is sponsored recommendations I didn't save, and when I save a tweet or Reddit thread, it's just broken plain text with missing images.\" — r/macapps user",
    comparisonPoints: [
      {
        feature: "Saving modern social media content",
        mindspace: "Preserves native social cards for X, Instagram, LinkedIn, and Reddit with full media and author context.",
        competitor: "Text-only focus. Social media posts often break, lose their carousels, or display as a blank link.",
        mindspaceAdvantage: true,
      },
      {
        feature: "What you see when you open the app",
        mindspace: "Zero ads, zero sponsors, zero algorithms. Only your personal bookmarks presented in a calm, aesthetic Sand Dune gallery.",
        competitor: "Aggressive sponsored content, clickbait article recommendations, and algorithmic clutter on your home screen.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Reading long articles comfortably",
        mindspace: "Integrated editorial Reader Mode that strips ads and paywalls, complete with estimated reading times and word counts.",
        competitor: "Basic reader view with rigid formatting and recurring sync issues reported across mobile devices.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Finding things without manual tagging",
        mindspace: "Autonomous AI concepts and topics generated instantly upon saving. Find anything by what you remember.",
        competitor: "Requires manual typing of tags for every single article. Miss a tag, and it sinks to the bottom of your queue.",
        mindspaceAdvantage: true,
      },
    ],
    verdict: "Pocket is fine if you only save plain text news articles. MindSpace is for people whose digital lives involve tweets, reels, Reddit threads, screenshots, and articles all in one unified visual vault.",
  },
  "mymind-alternative": {
    name: "mymind",
    slug: "mymind-alternative",
    tagline: "The Open, Powerful Alternative to mymind",
    metaTitle: "Best mymind Alternative in 2026 — MindSpace AI Bookmarks",
    metaDesc: "Tired of mymind holding your data hostage behind a $12/mo subscription? MindSpace gives you aesthetic visual organization, native social cards, and unlimited free saves.",
    heroHeadline: "Aesthetic Visual Bookmarking Without Holding Your Data Hostage",
    heroSubheadline: "mymind locks your library if you stop paying $12/month. MindSpace gives you an equally gorgeous Sand Dune gallery, authentic social media cards, and unlimited free bookmarking forever.",
    summary: "mymind proved that saving things should feel aesthetic, calm, and visual. But users constantly complain that if you cancel your $12/month subscription, you can't even browse your own past bookmarks. On top of that, its AI frequently hallucinates random tags, and social media posts get flattened into static images.",
    storyTitle: "The Common Complaint on Reddit: 'Cancel your subscription, lose your memory'",
    storyQuote: "\"I loved mymind's visual design, but after a year I had to cut expenses. The moment I paused my $12/month subscription, my account got locked to 100 cards. My own memories and notes were held hostage behind a paywall.\" — r/PKMS user",
    comparisonPoints: [
      {
        feature: "What happens if you use the free version",
        mindspace: "Unlimited bookmark saves, full search, reader mode, and permanent access to your vault are 100% free forever.",
        competitor: "Strict 100-card lifetime limit. Stop paying $12/month and you lose access to view your historical library.",
        mindspaceAdvantage: true,
      },
      {
        feature: "How social media posts are displayed",
        mindspace: "Interactive native cards: swipeable photo carousels, verified badges, author headlines, and reaction counts.",
        competitor: "Flattens social posts into static thumbnail images. You lose replies, carousels, and live context.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Search accuracy and finding what you need",
        mindspace: "Precise semantic search. Filter by platform (X, Reddit, Instagram), date, concepts, or exact text seen inside images.",
        competitor: "Search frequently misfires. Searching for broad concepts floods your feed with irrelevant noise you never asked for.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Reading long articles",
        mindspace: "Dedicated distraction-free Reader Mode with reading time calculations and clean typography.",
        competitor: "No dedicated editorial reader mode; articles are treated like simple cards.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Connecting to Claude or ChatGPT",
        mindspace: "Native Model Context Protocol (MCP) bridge allows frontier AI models to search your vault directly.",
        competitor: "Closed walled garden with zero external AI assistant integration.",
        mindspaceAdvantage: true,
      },
    ],
    verdict: "MindSpace gives you the aesthetic calm and visual joy of mymind, but with transparent free access, real social cards, and powerful AI search that never locks your knowledge behind a hostage paywall.",
  },
  "karakeep-alternative": {
    name: "Karakeep (Hoarder)",
    slug: "karakeep-alternative",
    tagline: "The Zero-DevOps AI Alternative to Karakeep",
    metaTitle: "Best Karakeep Alternative in 2026 — MindSpace AI Bookmarks",
    metaDesc: "Want AI bookmarking and auto-tagging without hosting your own Docker servers? MindSpace is the managed, high-performance Karakeep alternative with OCR and native social cards.",
    heroHeadline: "AI Bookmarking Without Becoming a Full-Time System Admin",
    heroSubheadline: "You shouldn't need a home server, Docker compose files, and terminal commands just to save links. MindSpace delivers instant multimodal AI and OCR on all your devices with zero setup.",
    summary: "Karakeep (formerly Hoarder) is a great open-source project for tech hobbyists who love self-hosting. But running your own server, managing database migrations, configuring Ollama AI models, and dealing with broken Docker containers on your weekend turns bookmarking into work. MindSpace gives you all the AI power with zero maintenance.",
    storyTitle: "The Common Complaint on Reddit: 'I just wanted to save links, not maintain a server'",
    storyQuote: "\"I spent a whole Saturday setting up Docker, Meilisearch, and a local AI model for Hoarder. Three weeks later an update broke my crawler, and my laptop fans were screaming during inference. I just want my bookmarks to work on my phone.\" — r/selfhosted user",
    comparisonPoints: [
      {
        feature: "Setup and everyday maintenance",
        mindspace: "Zero setup. Sign up in 10 seconds and save from your browser or phone instantly with 100% cloud reliability.",
        competitor: "Requires Docker, terminal commands, VPS or home server hosting, reverse proxies, and ongoing troubleshooting.",
        mindspaceAdvantage: true,
      },
      {
        feature: "AI performance & device battery impact",
        mindspace: "Lightning-fast cloud multimodal vision. Analyzes keyframes in milliseconds with zero battery drain or fan noise.",
        competitor: "Runs heavy local models (Ollama) that heat up your computer, drain laptop battery, and require dedicated RAM/GPU.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Saving links on mobile while on the go",
        mindspace: "Instant cloud sync. Save a reel on your phone in the subway, search it on your desktop at work.",
        competitor: "Requires configuring dynamic DNS, SSL certificates, or VPN tunnels (Tailscale) to connect to your home server on mobile.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Social media presentation quality",
        mindspace: "Deep native parsers with author avatars, verified badges, carousels, and accurate reaction counts.",
        competitor: "Relies on generic browser screenshots that often get blocked by social login walls and CAPTCHAs.",
        mindspaceAdvantage: true,
      },
    ],
    verdict: "If you love running your own home lab and tinkering with Linux containers, Karakeep is a fun project. But if you want a reliable second brain that works seamlessly on every device without maintenance, MindSpace is the obvious choice.",
  },
  "notion-alternative": {
    name: "Notion Web Clipper",
    slug: "notion-alternative",
    tagline: "The Lightning-Fast Alternative to Notion Web Clipper",
    metaTitle: "Best Notion Web Clipper Alternative in 2026 — MindSpace AI Bookmarks",
    metaDesc: "Frustrated with slow Notion databases and broken page clips? MindSpace saves and auto-tags links in sub-milliseconds with OCR search and zero manual database properties.",
    heroHeadline: "Stop Turning Your Bookmarks into Slow, Bloated Notion Databases",
    heroSubheadline: "Saving a link in Notion takes 6 clicks, freezes your mobile browser, and ruins page formatting. MindSpace saves links in 1 click, organizes them with AI, and loads in sub-milliseconds.",
    summary: "Notion is a wonderful project management and document tool, but it makes for an agonizingly clunky bookmark manager. Saving a link forces you to stop what you're doing, select a workspace, pick a database, choose 5 properties, and wait for Notion to sync. As your database grows to hundreds of links, it becomes painfully slow to search.",
    storyTitle: "The Common Complaint on Reddit: 'Notion is too slow and heavy just for saving links'",
    storyQuote: "\"I built this elaborate bookmarks database in Notion with relations and tags. Now whenever I want to save a link, the clipper takes 10 seconds to load, and searching on mobile is so laggy that I've stopped using it entirely.\" — r/Notion user",
    comparisonPoints: [
      {
        feature: "How long it takes to save a link",
        mindspace: "1 click and you're done. MindSpace extracts the title, author, images, and tags in the background in milliseconds.",
        competitor: "Takes 5 to 6 clicks: pick workspace, select database, fill out properties, choose tags, and wait for Notion to sync.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Speed when opening your library on mobile",
        mindspace: "Loads instantly in sub-milliseconds with smooth waterfall masonry and zero lag.",
        competitor: "Opening a 1,000-item Notion database on mobile freezes your phone for several seconds while tables render.",
        mindspaceAdvantage: true,
      },
      {
        feature: "What happens to the web page's layout",
        mindspace: "Preserves authentic social cards for tweets and reels, and formats web articles into clean, distraction-free reading mode.",
        competitor: "Turns web pages into a mess of broken Notion blocks, misaligned images, and missing embed widgets.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Finding text inside saved screenshots",
        mindspace: "Automated OCR reads text inside diagrams, infographics, and memes so you can search by words you saw.",
        competitor: "Blind to image text. Images are stored as static attachments with zero text indexing.",
        mindspaceAdvantage: true,
      },
    ],
    verdict: "Use Notion for documents, projects, and wikis. Use MindSpace for bookmarks, visual inspiration, and reading. You'll save hours of tedious database maintenance.",
  },
  "readwise-alternative": {
    name: "Readwise Reader",
    slug: "readwise-alternative",
    tagline: "The Visual Social Alternative to Readwise Reader",
    metaTitle: "Best Readwise Reader Alternative in 2026 — MindSpace AI Bookmarks",
    metaDesc: "Looking for a Readwise Reader alternative? MindSpace organizes not just articles, but social media posts, reels, video transcripts, and screenshots with AI OCR.",
    heroHeadline: "Readwise Reader Is Great for Ebooks. MindSpace Is Built for the Social Web.",
    heroSubheadline: "Readwise Reader treats the web like an academic PDF reader. MindSpace celebrates the visual, dynamic social web with authentic social cards, OCR screenshot search, and clean reader mode.",
    summary: "Readwise Reader is the gold standard if your daily routine involves highlighting academic research papers, EPUB ebooks, and newsletters. But modern digital learning also happens through X threads, Instagram carousels, Reddit insights, and visual memes. Readwise strips this visual context into monochromatic plain text. MindSpace preserves both.",
    storyTitle: "The Common Complaint on Reddit: 'Too academic and expensive if you're not an ebook power reader'",
    storyQuote: "\"Readwise Reader is amazing for highlighting books, but at $9.99/month, it's way too expensive if you just want to save tweets, articles, and visual ideas. Plus, it turns visual social media into plain boring text.\" — r/productivity user",
    comparisonPoints: [
      {
        feature: "Handling visual social media & carousels",
        mindspace: "Preserves the authentic visual beauty of social media—interactive photo carousels, reaction counts, and visual design.",
        competitor: "Converts social threads into plain monochromatic text, stripping away the visual layout and feel.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Searching text inside diagrams & screenshots",
        mindspace: "Automated OCR reads text inside memes, infographics, slides, and screenshots.",
        competitor: "Only searches text inside documents and PDFs. Regular web screenshots are unindexed.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Pricing and ongoing free access",
        mindspace: "Free Collector plan with unlimited saves, full search, reader mode, and weekly AI credits.",
        competitor: "Strict 30-day trial followed by a mandatory $8 to $10/month subscription with zero ongoing free tier.",
        mindspaceAdvantage: true,
      },
      {
        feature: "Direct AI connection (Claude / ChatGPT)",
        mindspace: "Native Model Context Protocol (MCP) bridge allows frontier AI models to query your bookmarks directly.",
        competitor: "Requires exporting highlights to secondary note apps (Notion, Obsidian) before AI can use them.",
        mindspaceAdvantage: true,
      },
    ],
    verdict: "If you read 30 academic PDFs a month and highlight EPUB textbooks, Readwise Reader is fantastic. If you want a visual second brain that preserves social media posts, reads text in images, and gives you a clean article reader for free, MindSpace is the modern choice.",
  },
};

export function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const data = (slug && COMPARISONS[slug]) || COMPARISONS["raindrop-alternative"];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0907] text-[#211D1A] dark:text-[#FAF8F5] font-sans selection:bg-amber-500/20 selection:text-amber-900 transition-colors duration-500 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF8F5]/85 dark:bg-[#0B0907]/80 border-b border-[#EBE5DC] dark:border-neutral-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <MindspaceLogo className="size-6 text-[#211D1A] dark:text-white transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-[#211D1A] dark:text-white lowercase">
              mindspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#5F5850] dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              Back to Home
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#B5814C] to-[#996533] hover:from-[#C08C56] hover:to-[#A4703D] text-white text-xs sm:text-sm font-medium shadow-[0_2px_12px_rgba(168,110,50,0.22)] transition-all cursor-pointer"
            >
              Try Mindspace Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#B5814C] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="size-3.5" />
          <span>{data.tagline}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#211D1A] dark:text-[#FAF8F5] leading-tight font-sans">
          {data.heroHeadline}
        </h1>

        <p className="text-base sm:text-lg text-[#5F5850] dark:text-[#B3ABA0] leading-relaxed max-w-2xl mx-auto">
          {data.heroSubheadline}
        </p>
      </section>

      {/* Relatable Story & Real Quote Section */}
      <section className="px-6 max-w-4xl mx-auto mb-16 space-y-6">
        <div className="p-8 sm:p-10 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-[#EBE5DC] dark:border-neutral-800 shadow-sm backdrop-blur-sm">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-[#211D1A] dark:text-white">
            {data.storyTitle}
          </h2>
          <blockquote className="text-sm sm:text-base italic text-[#5F5850] dark:text-[#D5CFC7] border-l-4 border-[#B5814C] pl-4 my-2 leading-relaxed">
            {data.storyQuote}
          </blockquote>
        </div>
      </section>

      {/* Human-First Comparison Matrix Table */}
      <section className="px-6 max-w-5xl mx-auto mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#211D1A] dark:text-white">
            Real Everyday Frustrations, Solved
          </h2>
          <p className="text-sm text-[#5F5850] dark:text-[#A89F91] mt-2 max-w-xl mx-auto">
            Why people get tired of {data.name} and what actually happens when you switch to Mindspace.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#EBE5DC] dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EBE5DC] dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500 w-1/4">
                  The Everyday Task
                </th>
                <th className="py-4 px-6 text-sm font-bold text-[#B5814C] w-5/12">
                  With Mindspace (The Relief)
                </th>
                <th className="py-4 px-6 text-sm font-semibold text-neutral-500 dark:text-neutral-400 w-1/3">
                  With {data.name} (The Frustration)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE5DC]/60 dark:divide-neutral-800/60 text-xs sm:text-sm">
              {data.comparisonPoints.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#211D1A] dark:text-neutral-200 align-top">
                    {item.feature}
                  </td>
                  <td className="py-4 px-6 text-emerald-950 dark:text-emerald-300 align-top">
                    <div className="flex items-start gap-2.5">
                      <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item.mindspace}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-neutral-600 dark:text-neutral-400 align-top leading-relaxed">
                    {item.competitor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Core Advantages Pillars */}
      <section className="px-6 max-w-5xl mx-auto mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10 text-[#211D1A] dark:text-white">
          Why Switching Feels Like Fresh Air
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/50 border border-[#EBE5DC] dark:border-neutral-800 shadow-sm space-y-3">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#B5814C]">
              <Eye className="size-5" />
            </div>
            <h3 className="text-base font-bold text-[#211D1A] dark:text-white">
              Visual Memory Search
            </h3>
            <p className="text-xs sm:text-sm text-[#5F5850] dark:text-[#A89F91] leading-relaxed">
              You remember seeing a chart, a quote in a meme, or a slide. Mindspace reads the text inside images so you find it by memory, not by a title you forgot.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/50 border border-[#EBE5DC] dark:border-neutral-800 shadow-sm space-y-3">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#B5814C]">
              <Layers className="size-5" />
            </div>
            <h3 className="text-base font-bold text-[#211D1A] dark:text-white">
              Zero Folder Fatigue
            </h3>
            <p className="text-xs sm:text-sm text-[#5F5850] dark:text-[#A89F91] leading-relaxed">
              No more stopping what you're doing to file links into 30 folders. Save the link and walk away. Mindspace understands what it is and organizes it for you.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/50 border border-[#EBE5DC] dark:border-neutral-800 shadow-sm space-y-3">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#B5814C]">
              <Shield className="size-5" />
            </div>
            <h3 className="text-base font-bold text-[#211D1A] dark:text-white">
              Your Memory, Never Hostage
            </h3>
            <p className="text-xs sm:text-sm text-[#5F5850] dark:text-[#A89F91] leading-relaxed">
              Saving links and browsing your library is 100% free forever. No 100-card limits, no locking your knowledge behind an expensive monthly subscription.
            </p>
          </div>
        </div>
      </section>

      {/* The Verdict Box */}
      <section className="px-6 max-w-4xl mx-auto mb-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-50/60 to-white dark:from-neutral-900 dark:to-neutral-950 border border-amber-500/20 shadow-sm text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#211D1A] dark:text-white">
            The Honest Verdict
          </h2>
          <p className="text-base sm:text-lg text-[#5F5850] dark:text-[#B3ABA0] max-w-2xl mx-auto leading-relaxed">
            {data.verdict}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B5814C] to-[#996533] hover:from-[#C08C56] hover:to-[#A4703D] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(168,110,50,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Try Mindspace Free — No Credit Card Needed</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Explore other alternatives */}
      <section className="px-6 max-w-4xl mx-auto pb-20 border-t border-[#EBE5DC] dark:border-neutral-800 pt-12">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 text-center mb-6">
          Compare Other Bookmark Managers
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {Object.entries(COMPARISONS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => navigate(`/compare/${key}`)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                key === slug
                  ? "bg-[#B5814C] text-white border-[#B5814C]"
                  : "bg-white/60 dark:bg-neutral-900/60 border-[#EBE5DC] dark:border-neutral-800 text-[#5F5850] dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Mindspace vs {item.name}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#EBE5DC] dark:border-neutral-800/80 py-10 px-6 bg-white/40 dark:bg-neutral-950/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <MindspaceLogo className="size-4 text-black dark:text-white" />
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white lowercase">
              mindspace
            </span>
          </div>
          <div>© {new Date().getFullYear()} Mindspace. The AI Bookmark Manager & Visual Memory Vault.</div>
        </div>
      </footer>
    </div>
  );
}
