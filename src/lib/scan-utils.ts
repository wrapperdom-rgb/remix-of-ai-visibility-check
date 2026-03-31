const PLATFORMS = ['chatgpt', 'perplexity', 'claude', 'gemini'] as const;

// Simple hash function for deterministic pseudo-random
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: string): number {
  return (hashCode(seed) % 1000) / 1000;
}

export function extractKeywords(description: string) {
  const words = description.toLowerCase().split(/\s+/);
  const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because', 'about', 'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your', 'he', 'she', 'his', 'her', 'who', 'which', 'what', 'when', 'where', 'how', 'why']);
  
  const keywords = words.filter(w => w.length > 3 && !stopWords.has(w));
  
  const categoryMap: Record<string, string[]> = {
    'project management': ['project', 'task', 'manage', 'management', 'workflow', 'kanban', 'agile', 'sprint'],
    'AI writing': ['writing', 'content', 'copywriting', 'blog', 'article', 'text', 'copy'],
    'analytics': ['analytics', 'tracking', 'metrics', 'data', 'dashboard', 'reporting', 'insights'],
    'design': ['design', 'ui', 'ux', 'interface', 'graphic', 'prototype', 'figma'],
    'marketing': ['marketing', 'seo', 'ads', 'campaign', 'social', 'email', 'growth'],
    'developer tools': ['developer', 'code', 'coding', 'api', 'deploy', 'devops', 'testing', 'debug'],
    'communication': ['chat', 'messaging', 'communication', 'team', 'collaboration', 'slack'],
    'sales': ['sales', 'crm', 'leads', 'pipeline', 'revenue', 'deals'],
    'finance': ['finance', 'payment', 'billing', 'invoice', 'accounting', 'budget'],
    'productivity': ['productivity', 'automation', 'efficiency', 'organize', 'schedule', 'time'],
  };

  let category = 'SaaS';
  let useCase = keywords.slice(0, 3).join(' ');
  let targetAudience = 'teams';

  for (const [cat, catKeywords] of Object.entries(categoryMap)) {
    if (keywords.some(k => catKeywords.some(ck => k.includes(ck)))) {
      category = cat;
      break;
    }
  }

  if (keywords.some(k => ['startup', 'founder', 'entrepreneur'].some(t => k.includes(t)))) targetAudience = 'startup founders';
  else if (keywords.some(k => ['developer', 'engineer', 'code'].some(t => k.includes(t)))) targetAudience = 'developers';
  else if (keywords.some(k => ['marketer', 'marketing'].some(t => k.includes(t)))) targetAudience = 'marketers';
  else if (keywords.some(k => ['designer', 'design'].some(t => k.includes(t)))) targetAudience = 'designers';

  return { category, useCase, targetAudience, keywords };
}

export function generateQueries(description: string, isPro: boolean): string[] {
  const { category, useCase, targetAudience } = extractKeywords(description);
  const limit = isPro ? 25 : 10;

  const templates = [
    `What is the best ${category} tool?`,
    `Top ${category} tools in 2025`,
    `Best alternatives for ${category}`,
    `${category} tool for ${useCase}`,
    `What tools do ${targetAudience} use for ${category}?`,
    `Compare ${category} tools`,
    `Free ${category} tools for startups`,
    `Which ${category} tool should I use?`,
    `Best ${category} for small teams`,
    `AI-powered ${category} tools`,
    `${category} software recommendations`,
    `How to choose a ${category} platform`,
    `${category} tools with best integrations`,
    `Most popular ${category} solutions 2025`,
    `${category} for remote teams`,
    `Enterprise ${category} platforms`,
    `Open source ${category} alternatives`,
    `${category} tools for agencies`,
    `Affordable ${category} for small business`,
    `${category} with AI features`,
    `Best ${category} for ${targetAudience}`,
    `${category} tool comparison 2025`,
    `Fastest growing ${category} startups`,
    `${category} platforms with free plans`,
    `Top rated ${category} on Product Hunt`,
  ];

  return templates.slice(0, limit);
}

const competitorPools: Record<string, string[]> = {
  'project management': ['Notion', 'Linear', 'Asana', 'Monday.com', 'ClickUp', 'Trello', 'Jira'],
  'AI writing': ['Jasper', 'Copy.ai', 'Writesonic', 'Grammarly', 'Rytr', 'Anyword'],
  'analytics': ['Mixpanel', 'Amplitude', 'Posthog', 'Google Analytics', 'Heap', 'Plausible'],
  'design': ['Figma', 'Canva', 'Adobe XD', 'Sketch', 'Framer', 'Webflow'],
  'marketing': ['HubSpot', 'Mailchimp', 'Semrush', 'Ahrefs', 'Buffer', 'Hootsuite'],
  'developer tools': ['GitHub', 'GitLab', 'Vercel', 'Netlify', 'Railway', 'Render'],
  'communication': ['Slack', 'Discord', 'Microsoft Teams', 'Zoom', 'Loom'],
  'sales': ['Salesforce', 'HubSpot CRM', 'Pipedrive', 'Close', 'Apollo'],
  'finance': ['Stripe', 'QuickBooks', 'Xero', 'FreshBooks', 'Wave'],
  'productivity': ['Notion', 'Todoist', 'ClickUp', 'Coda', 'Airtable'],
  'SaaS': ['ToolX', 'BuilderApp', 'LaunchKit', 'ScaleUp', 'GrowthOS'],
};

export function simulateVisibility(
  startupName: string,
  query: string,
  platform: string,
  description: string
) {
  const seed = `${startupName}-${query}-${platform}`;
  const rand = seededRandom(seed);
  const isVisible = rand < 0.3; // ~30% visibility rate

  const { category } = extractKeywords(description);

  if (isVisible) {
    const snippet = `${startupName} is a ${category} solution that helps ${description.substring(0, 80).toLowerCase().trim()}.`;
    return { isVisible: true, mentionSnippet: snippet, competitorsFound: null };
  } else {
    const pool = competitorPools[category] || competitorPools['SaaS'];
    const count = 1 + (hashCode(seed) % 3);
    const competitors: string[] = [];
    for (let i = 0; i < count && i < pool.length; i++) {
      const idx = (hashCode(seed + i.toString()) % pool.length);
      const comp = pool[idx];
      if (!competitors.includes(comp)) competitors.push(comp);
    }
    return { isVisible: false, mentionSnippet: null, competitorsFound: competitors };
  }
}

export function generateSuggestions(
  visibilityScore: number,
  competitorNames: string[],
  category: string,
  isPro: boolean
) {
  const topCompetitor = competitorNames[0] || 'competitors';

  const allSuggestions = [
    {
      category: 'content',
      title: 'Create comparison content',
      description: `Publish detailed comparison pages between your product and ${topCompetitor}. AI models frequently reference comparison content when answering tool-related queries.`,
      priority: 'high',
      isProOnly: false,
    },
    {
      category: 'content',
      title: 'Write a comprehensive product guide',
      description: `Create an in-depth guide about ${category} that naturally references your product. AI models pull from authoritative long-form content.`,
      priority: 'high',
      isProOnly: false,
    },
    {
      category: 'authority',
      title: 'Get listed on aggregator sites',
      description: 'Submit your product to directories like G2, Product Hunt, AlternativeTo, and industry-specific directories. AI models weight these sources heavily.',
      priority: 'high',
      isProOnly: false,
    },
    {
      category: 'authority',
      title: 'Earn mentions in third-party content',
      description: 'Reach out to bloggers and newsletter writers in your space. Third-party mentions significantly increase AI model awareness.',
      priority: 'high',
      isProOnly: true,
    },
    {
      category: 'technical',
      title: 'Add structured data to your website',
      description: 'Implement Schema.org markup including Organization, Product, and FAQ schemas on your website.',
      priority: 'medium',
      isProOnly: true,
    },
    {
      category: 'technical',
      title: 'Create a comprehensive FAQ page',
      description: "Build a detailed FAQ page addressing the exact queries where you're not visible. AI models frequently reference FAQ content.",
      priority: 'medium',
      isProOnly: false,
    },
    {
      category: 'community',
      title: 'Engage in relevant online communities',
      description: 'Actively participate in Reddit, Hacker News, and industry forums. Mention your product naturally in helpful responses.',
      priority: 'medium',
      isProOnly: true,
    },
    {
      category: 'community',
      title: 'Build a public knowledge base',
      description: 'Create publicly accessible documentation and guides. AI models index and reference comprehensive knowledge bases.',
      priority: 'medium',
      isProOnly: false,
    },
  ];

  let selected = [...allSuggestions];

  // Prioritize based on results
  if (visibilityScore < 30) {
    selected = selected.sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1));
  }

  if (competitorNames.length > 3) {
    // Move comparison suggestion to top
    const compIdx = selected.findIndex(s => s.title.includes('comparison'));
    if (compIdx > 0) {
      const [comp] = selected.splice(compIdx, 1);
      selected.unshift(comp);
    }
  }

  // For free users, mark some as pro-only
  if (!isPro) {
    let proCount = 0;
    selected = selected.map(s => {
      if (s.isProOnly) proCount++;
      return s;
    });
    // Ensure at least 3 are pro-only for free users
    if (proCount < 3) {
      let toMark = 3 - proCount;
      selected = selected.map(s => {
        if (!s.isProOnly && toMark > 0 && s.priority !== 'high') {
          toMark--;
          return { ...s, isProOnly: true };
        }
        return s;
      });
    }
  } else {
    selected = selected.map(s => ({ ...s, isProOnly: false }));
  }

  return selected;
}

export function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getScoreLabel(score: number): { text: string; class: string } {
  if (score <= 20) return { text: 'Very Low — Your startup is mostly invisible to AI', class: 'score-low' };
  if (score <= 40) return { text: 'Low — Significant room for improvement', class: 'score-low' };
  if (score <= 60) return { text: 'Moderate — You\'re appearing but inconsistently', class: 'score-medium' };
  if (score <= 80) return { text: 'Good — Solid visibility with some gaps', class: 'score-high' };
  return { text: 'Excellent — Strong AI presence', class: 'score-high' };
}

export function getScoreBadgeClass(score: number): string {
  if (score <= 33) return 'bg-score-low';
  if (score <= 66) return 'bg-score-medium';
  return 'bg-score-high';
}
