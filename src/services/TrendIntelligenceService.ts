import { Cpu, Flame, Zap, Play, Instagram, Globe, Video, Book, Utensils, Shirt, Gamepad2, Hammer, HeartPulse, Car } from 'lucide-react';
import React from 'react';

export interface TrendItem {
  id: string;
  title: string;
  description: string;
  platform: string;
  platformIcon: string;
  country: string;
  niche: string;
  score: number;
  growth: number;
  velocity: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'Emerging' | 'Breakout' | 'Peak' | 'Declining' | 'Breaking';
  hashtags: string[];
  suggestedAngle: string;
  forecast: number[]; // 7 days forecast
  platformMigration: string[]; // ['TikTok', 'Instagram', 'Twitter']
  author: string;
  timestamp: number;
  isBreaking?: boolean;
  viralOpportunityScore: number;
}

export const NICHES = [
  "AI & Tech", "Finance", "Fashion", "Fitness", "Food", "Gaming", 
  "Education", "Travel", "Beauty", "Startups", "Marketing", "Memes", 
  "News", "Entertainment", "Productivity", "Sports", "DIY", 
  "BookTok", "E-commerce", "Creator Economy", "Health", "Automotive",
  "Cooking", "Photography", "Art", "Science", "Music", "Spirituality",
  "Politics", "Economics", "Space", "Mental Health", "Sustainability",
  "Web3", "Crypto", "Outdoor", "Home Decor", "Parenting", "Pets",
  "Minimalism", "Vlog", "ASMR", "Reviews", "Tutorials", "Motivation",
  "Psychology", "History", "Philosophy", "Design", "Architecture",
  "Business", "Networking", "Career", "Freelance", "Investment",
  "Real Estate", "Luxury", "Thrifting", "Gardening", "Survival",
  "Tech News", "Gadgets", "Smart Home", "Robotics", "Biohacking",
  "Meditation", "Yoga", "Running", "Cycling", "Swimming", "Skincare",
  "Makeup", "Fragrance", "Haircare", "Sustainable Tech", "Renewable Energy",
  "Electric Vehicles", "Autonomous Driving", "Space Exploration", "Mars",
  "Astronomy", "Astrophysics", "Genomics", "Biotech", "Fintech", "Insurtech",
  "Proptech", "Adtech", "Edtech", "Healthtech", "Agtech", "Foodtech",
  "Civic Tech", "Govtech", "Legaltech", "Regtech", "Clean Tech", "Fashion Tech",
  "Retail Tech", "Travel Tech", "Hospitality Tech", "Prop Trading", "Forex",
  "Stocks", "Options", "Personal Finance", "Wealth Management", "Venture Capital",
  "Private Equity", "Angel Investing", "Crowdfunding", "Passive Income",
  "Budgeting", "Investing", "Trading", "Hedge Funds", "Banking", "DeFi",
  "NFTs", "Metaverse", "Blockchain", "Smart Contracts", "DAOs"
];

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", 
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", 
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", 
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", 
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", 
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", 
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", 
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", 
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
  "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", 
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", 
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", 
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Global"
];

export const PLATFORMS = [
  "TikTok", "Instagram", "YouTube", "Facebook", "Twitter", "LinkedIn", "Threads", "Reddit"
];

const PLATFORM_ICONS: Record<string, string> = {
  TikTok: 'Play',
  Instagram: 'Instagram',
  YouTube: 'Video',
  Facebook: 'Globe',
  Twitter: 'Zap',
  LinkedIn: 'Cpu',
  Threads: 'Flame',
  Reddit: 'Book'
};

const TREND_TEMPLATES: Record<string, string[]> = {
  "AI & Tech": [
    "AI agents replacing manual workflows in {location} businesses.",
    "The rise of local LLMs for privacy-conscious developers in {location}.",
    "Generative video tools changing the {location} content creator game.",
    "Quantum computing breakthroughs reaching {location} mainstream news.",
    "New {location} startup secures funding for autonomous robotics.",
    "Integration of AI in {location}'s public infrastructure peaking.",
    "Decentralized cloud networks gaining mass adoption in {location}.",
    "Next-gen AR interfaces debuting in {location} retail spaces."
  ],
  "Fashion": [
    "Digital wearables becoming status symbols in {location} social circles.",
    "Sustainable denim brands gaining traction among {location} Gen Z.",
    "The 'Quiet Luxury' trend evolving into 'Stealth Wealth' in {location}.",
    "Y2K revival peaking with {location} retro accessory mashups.",
    "Local {location} designers dominating seasonal street style.",
    "Eco-conscious apparel making waves in {location} major cities.",
    "Smart fabrics integrated into {location} athletic wear.",
    "Vintage upcycling workshops trending across {location} urban hubs."
  ],
  "Gaming": [
    "Cosy gaming setups focusing on mental health in {location}.",
    "Indie horror games going viral through {location} streamers.",
    "Mobile e-sports reaching record viewership in {location}.",
    "Retro console revivals driving hardware sales in {location}.",
    "New competitive {location} gaming league announced.",
    "VR gaming centers becoming the new social hubs of {location}.",
    "Cloud gaming latency improvements sparking interest in {location}.",
    "Nostalgia-driven IP reboots breaking sales records in {location}."
  ],
  "Food": [
    "Street food fusion taking over the {location} culinary scene.",
    "Plant-based protein alternatives scaling in {location} supermarkets.",
    "Traditional {location} recipes getting a modern TikTok makeover.",
    "Sustainable urban farming trending in {location} apartments.",
    "New {location} food delivery startups disrupting the market.",
    "The rise of 'Ghost Kitchens' in {location} metropolitan areas.",
    "Artisanal beverage craft peaking in {location} social spots.",
    "Zero-waste dining experiences trending in {location} capitals."
  ],
  "Travel": [
    "Undiscovered eco-resorts in {location} gaining viral attention.",
    "Solo travel guides for {location} becoming popular on YouTube.",
    "Remote work hubs in {location} attracting digital nomads.",
    "Vloggers highlighting the hidden gems of {location} culture.",
    "Aesthetic Airbnbs in {location} booked out months in advance.",
    "Sustainable tourism initiatives launched in {location}'s protected areas.",
    "Hyper-local 'Staycations' trending among {location} families.",
    "Train travel revival across {location} scenic routes."
  ],
  "Finance": [
    "Cryptocurrency adoption trends in {location}'s younger demographic.",
    "Micro-investing platforms making waves in {location}.",
    "Personal finance literacy challenges trending for {location} students.",
    "Real estate crowdfunding opening doors for {location} first-time buyers.",
    "The impact of global inflation on {location}'s retail sector.",
    "New {location} fintech unicorns emerging in the payment space.",
    "Green bonds and ESG investing gaining momentum in {location}.",
    "Fractional ownership of luxury assets trending in {location}."
  ],
  "Environment": [
    "Renewable energy milestones reached in {location} regional grids.",
    "Community-led reforestation projects going viral in {location}.",
    "Plastic-free initiatives transforming {location} local markets.",
    "Rising sea levels sparking new architectural designs in {location}.",
    "Solar-powered public transport rollout in {location} cities.",
    "Wildlife conservation breakthroughs reported in {location} reserves."
  ],
  "Entertainment": [
    "Regional cinema from {location} reaching global streaming charts.",
    "Immersive theater experiences trending in {location} arts districts.",
    "Podcast listenership for local {location} creators at all-time high.",
    "Virtual idol concerts selling out in {location} digital spaces.",
    "Revival of traditional {location} dance in modern music videos.",
    "Short-form documentary series on {location} life gaining traction."
  ]
};

const COUNTRY_CONTEXT: Record<string, string> = {
  "United States": "American",
  "United Kingdom": "British",
  "India": "Indian",
  "Japan": "Japanese",
  "China": "Chinese",
  "France": "French",
  "Germany": "German",
  "Brazil": "Brazilian",
  "Canada": "Canadian",
  "Australia": "Australian",
  "Italy": "Italian",
  "Spain": "Spanish",
  "Mexico": "Mexican",
  "Russia": "Russian",
  "South Korea": "Korean",
  "Global": "World"
};


// ... more data can be added

export function generateMockTrend(override: Partial<TrendItem> = {}): TrendItem {
  const niche = override.niche || NICHES[Math.floor(Math.random() * NICHES.length)];
  const platform = override.platform || PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
  const country = override.country || COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  
  const location = COUNTRY_CONTEXT[country] || country;
  const templates = TREND_TEMPLATES[niche] || [
    `New breakthroughs in {location} ${niche} attracting global interest.`,
    `The ${niche} community in {location} sees a sudden surge in engagement.`,
    `How {location} creators are redefining ${niche} for the next generation.`,
    `A radical shift in the ${niche} landscape across {location} regions.`
  ];
  
  const descriptionTemplate = templates[Math.floor(Math.random() * templates.length)];
  const description = descriptionTemplate.replace(/{location}/g, location);

  const score = Math.floor(Math.random() * 40) + 60; // 60-100
  const growth = Math.floor(Math.random() * 500) + 50;
  
  return {
    id: Math.random().toString(36).substring(7),
    title: `${country} ${niche} Update: ${Math.random() > 0.8 ? 'BREAKING' : (Math.random() > 0.5 ? 'New Trending' : 'Latest Signal')}`,
    description,
    platform,
    platformIcon: PLATFORM_ICONS[platform],
    country,
    niche,
    score,
    growth,
    velocity: Math.floor(Math.random() * 90) + 10,
    sentiment: Math.random() > 0.7 ? 'positive' : (Math.random() > 0.4 ? 'neutral' : 'negative'),
    status: Math.random() > 0.9 ? 'Breaking' : (Math.random() > 0.6 ? 'Breakout' : (Math.random() > 0.3 ? 'Emerging' : 'Peak')),
    hashtags: [niche.toLowerCase().replace(/ /g, ''), country.toLowerCase().replace(/ /g, ''), 'viral'],
    suggestedAngle: `Highlight how ${location} consumers are interacting with ${niche} uniquely.`,
    forecast: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
    platformMigration: [platform, PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)]],
    author: "BeforeItTrends AI",
    timestamp: Date.now(),
    isBreaking: Math.random() > 0.9,
    viralOpportunityScore: Math.floor(Math.random() * 50) + 50,
    ...override
  };
}

export class TrendIntelligenceService {
  private static trends: TrendItem[] = [];

  static getInitialTrends(): TrendItem[] {
    if (this.trends.length === 0) {
      const generatedTrends: TrendItem[] = [];
      
      // EXHAUSTIVE GENERATION: Every niche for every country
      // 187 countries * ~100 niches = ~18,700 items
      COUNTRIES.forEach(country => {
        NICHES.forEach(niche => {
          generatedTrends.push(generateMockTrend({ country, niche }));
        });
      });

      this.trends = generatedTrends;
    }
    return this.trends;
  }

  static getLiveUpdates(): TrendItem[] {
    // Randomly update 2-5 trends
    const count = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * this.trends.length);
      const trend = this.trends[idx];
      trend.score = Math.min(100, Math.max(60, trend.score + (Math.random() > 0.5 ? 1 : -1)));
      trend.growth += Math.floor(Math.random() * 10) - 2;
      trend.velocity = Math.min(100, Math.max(10, trend.velocity + (Math.random() > 0.5 ? 2 : -2)));
      trend.timestamp = Date.now();
    }
    return [...this.trends];
  }
}
