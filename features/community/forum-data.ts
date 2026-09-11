import { ForumPost } from "./forum-types";

export const FORUM_CATEGORIES = [
  { id: "ALL", label: "All Discussions", icon: "LayoutGrid" },
  { id: "ROUTE_ADVICE", label: "Route & Itinerary Advice", icon: "Route" },
  { id: "RECOMMENDATIONS", label: "Hidden Gems & Food", icon: "Sparkles" },
  { id: "PACKING_GEAR", label: "Gear & Packing", icon: "Package" },
  { id: "LIVE_REPORTS", label: "Live Trip Reports", icon: "Radio" },
  { id: "TEMPLATES", label: "Curated Itineraries", icon: "BookmarkCheck" },
] as const;

export const SEED_FORUM_POSTS: ForumPost[] = [
  {
    id: "forum-post-1",
    title: "Kyoto 7-Day Route: Is it too packed with Arashiyama and Fushimi Inari on same days?",
    content: `Planning a 7-day cultural immersion across Kyoto and Tokyo. In my current draft itinerary, I've budgeted 3 full days in Kyoto. 
    
On Day 2, I'm attempting to hit Fushimi Inari at 06:30 AM, then take the train over to Arashiyama for the bamboo grove and Tenryu-ji around 11:00 AM, finishing with Gion in the evening.

For anyone who's traveled during peak autumn foliage:
1. Is transit between Fushimi Inari and Arashiyama too exhausting for one day?
2. Are early morning crowd levels at Arashiyama still calm around 7-8 AM?

I've attached my full workspace itinerary below for review — feel free to check the timing!`,
    category: "ROUTE_ADVICE",
    categoryLabel: "Route Advice",
    tags: ["Japan", "Kyoto", "ItineraryFeedback", "AutumnFoliage"],
    destination: "Kyoto, Japan",
    coverImageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
    authorName: "Elena Rostova",
    authorUsername: "elena_travels",
    authorAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    isCreatorPublic: true,
    authorBio: "Travel writer & slow travel enthusiast based in Tokyo & Berlin.",
    createdAt: "2 hours ago",
    upvotes: 42,
    views: 384,
    repliesCount: 6,
    isPinned: true,
    linkedTrip: {
      id: "seed-japan-golden-route",
      title: "Japan Golden Route: Tokyo, Kyoto & Osaka Expedition",
      destination: "Japan (Tokyo, Kyoto, Osaka)",
      durationDays: 10,
      activityCount: 16,
      accommodationCount: 3,
      estimatedBudget: "$2,800 USD",
      category: "Culture & Highlights",
      coverImageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
    },
    replies: [
      {
        id: "rep-1",
        authorName: "Kenji Sato",
        authorUsername: "kenji_kyoto",
        authorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        isCreatorPublic: true,
        content: "Local here! Fushimi Inari and Arashiyama are on opposite diagonal corners of Kyoto. Doing both in one day eats ~70 mins on the train. I recommend pairing Fushimi Inari with Higashiyama/Gion, and giving Arashiyama its own dedicated morning with Sagano Scenic Railway.",
        createdAt: "1 hour ago",
        upvotes: 28,
        isHelpful: true,
      },
      {
        id: "rep-2",
        authorName: "Marcus Vance",
        authorUsername: "marcus_v",
        authorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
        isCreatorPublic: true,
        content: "Seconding Kenji's point. Arashiyama bamboo path is magical at 07:15 AM before tour buses arrive. By 10:30 AM it gets extremely crowded.",
        createdAt: "45 mins ago",
        upvotes: 14,
      },
    ],
  },
  {
    id: "forum-post-2",
    title: "Best cliffside restaurants & quiet lemon groves along Amalfi Coast without tour crowds?",
    content: `Heading to Amalfi Coast & Rome for 8 days. We want to avoid the Instagram-hyped tourist traps in central Positano and find authentic family-run trattorias with cliffside views or lemon garden terraces in Ravello, Minori, and Praiano.

Any recommendations for:
- Fresh seafood dinner spots with sunset views?
- Path of the Gods (Sentiero degli Dei) morning starting points?`,
    category: "RECOMMENDATIONS",
    categoryLabel: "Hidden Gems",
    tags: ["Italy", "AmalfiCoast", "FoodGuide", "Hiking"],
    destination: "Amalfi Coast, Italy",
    coverImageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop",
    authorName: "Matteo Bianchi",
    authorUsername: "matteob",
    authorAvatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    isCreatorPublic: true,
    authorBio: "Italian culinary photographer and Mediterranean trip architect.",
    createdAt: "5 hours ago",
    upvotes: 35,
    views: 290,
    repliesCount: 4,
    linkedTrip: {
      id: "seed-amalfi-rome-escape",
      title: "Amalfi Coast & Roman Holiday: Coastal Romance",
      destination: "Italy (Rome, Positano, Capri)",
      durationDays: 8,
      activityCount: 12,
      accommodationCount: 2,
      estimatedBudget: "$3,400 USD",
      category: "Coastal Romance",
      coverImageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop",
    },
    replies: [
      {
        id: "rep-3",
        authorName: "Sarah Jenkins",
        authorUsername: "sarah_j",
        authorAvatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
        isCreatorPublic: true,
        content: "Check out Trattoria Da Cumpa' Cosimo in Ravello. Run by Mama Netta, homemade pasta with locally picked herbs and zero pretense. Book 2 days ahead.",
        createdAt: "3 hours ago",
        upvotes: 19,
        isHelpful: true,
      },
    ],
  },
  {
    id: "forum-post-3",
    title: "One-bag packing strategy for 10 days in Swiss Alps with varying mountain elevations?",
    content: `Taking the Glacier Express and hiking around Zermatt and Lauterbrunnen in late September. Temperatures can swing from 22°C in the valleys to -2°C at Gornergrat and Jungfraujoch summits.
    
What are your essential layering pieces for a 35L carry-on backpack without checking luggage?`,
    category: "PACKING_GEAR",
    categoryLabel: "Gear & Packing",
    tags: ["Switzerland", "Alps", "OneBag", "PackingTips"],
    destination: "Swiss Alps, Switzerland",
    coverImageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop",
    authorName: "David Lindqvist",
    authorUsername: "nordic_david",
    authorAvatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop",
    isCreatorPublic: true,
    authorBio: "Alpine hiker and minimalist backpacker.",
    createdAt: "1 day ago",
    upvotes: 56,
    views: 610,
    repliesCount: 8,
    linkedTrip: {
      id: "seed-swiss-alps-express",
      title: "Swiss Alpine Wonderland: Zermatt & Glacier Express",
      destination: "Switzerland (Zurich, Zermatt, Lauterbrunnen)",
      durationDays: 7,
      activityCount: 11,
      accommodationCount: 2,
      estimatedBudget: "$3,900 USD",
      category: "Nature & Adventure",
      coverImageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop",
    },
    replies: [
      {
        id: "rep-4",
        authorName: "Elena Rostova",
        authorUsername: "elena_travels",
        content: "Merino wool 200gsm base layer + lightweight grid fleece + packable ultralight down jacket + wind/waterproof shell. You can wear all 4 together at Gornergrat and strip down to the merino t-shirt in the valley!",
        createdAt: "20 hours ago",
        upvotes: 31,
        isHelpful: true,
      },
    ],
  },
  {
    id: "forum-post-4",
    title: "Live Report: Bali rainy season transition & Nusa Penida ferry conditions right now",
    content: `Currently in Ubud and heading over to Sanur for the Nusa Penida fast boat. 
    
Sea swell is moderate today (1.2m). Morning was completely clear blue skies with a quick 30-minute tropical shower at 4 PM. Roads around Tegalalang are in good shape. 

If anyone is planning day trips to Kelingking Beach, hike down takes ~45 mins each way — make sure to bring sturdy sneakers, flip flops are dangerous on the steep bamboo ladders!`,
    category: "LIVE_REPORTS",
    categoryLabel: "Live Reports",
    tags: ["Bali", "LiveUpdate", "NusaPenida", "Weather"],
    destination: "Bali, Indonesia",
    coverImageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
    authorName: "Chloe Dupont",
    authorUsername: "chloe_paris",
    authorAvatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
    isCreatorPublic: true,
    authorBio: "Travel photographer & tropical destination explorer.",
    createdAt: "Just now",
    upvotes: 21,
    views: 145,
    repliesCount: 2,
    linkedTrip: {
      id: "seed-bali-spiritual-retreat",
      title: "Bali Tropical Sanctuary: Ubud, Uluwatu & Waterfalls",
      destination: "Indonesia (Ubud, Seminyak, Nusa Penida)",
      durationDays: 9,
      activityCount: 14,
      accommodationCount: 3,
      estimatedBudget: "$1,600 USD",
      category: "Wellness & Nature",
      coverImageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
    },
    replies: [
      {
        id: "rep-5",
        authorName: "Liam O'Connor",
        content: "Thanks for the live update Chloe! Crossing tomorrow morning from Sanur, really appreciate the sneaker tip.",
        createdAt: "10 mins ago",
        upvotes: 5,
      },
    ],
  },
];
