const PLATFORMS = [
  'chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'meta_ai',
  'mistral', 'grok', 'you_com', 'phind', 'poe', 'pi', 'deepseek',
  'qwen', 'llama', 'reka', 'command_r', 'duckduckgo_ai', 'brave_leo',
  'notion_ai', 'slack_ai', 'canva_ai', 'jasper', 'writesonic', 'microsoft_designer'
] as const;

export { PLATFORMS };

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
  const isVisible = rand < 0.3;

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

// ===== DIAGNOSIS LAYER =====

export interface DiagnosisItem {
  signal: string;
  status: 'missing' | 'weak' | 'present';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export function generateDiagnosis(
  visibilityScore: number,
  competitorNames: string[],
  category: string,
  startupName: string
): DiagnosisItem[] {
  const diagnosis: DiagnosisItem[] = [];

  // Content signals
  if (visibilityScore < 50) {
    diagnosis.push({
      signal: 'Comparison content',
      status: 'missing',
      description: `No comparison pages found between ${startupName} and top competitors like ${competitorNames[0] || 'others'}. AI models heavily reference comparison articles.`,
      impact: 'high',
    });
  }

  if (visibilityScore < 70) {
    diagnosis.push({
      signal: 'Long-form guides',
      status: visibilityScore < 30 ? 'missing' : 'weak',
      description: `AI models pull from authoritative in-depth guides. Your presence in ${category} educational content is ${visibilityScore < 30 ? 'not detected' : 'minimal'}.`,
      impact: 'high',
    });
  }

  // Authority signals
  diagnosis.push({
    signal: 'Directory listings',
    status: visibilityScore < 40 ? 'missing' : visibilityScore < 70 ? 'weak' : 'present',
    description: `Listings on G2, Product Hunt, AlternativeTo, and ${category}-specific directories. AI models weight aggregator sites heavily.`,
    impact: 'high',
  });

  diagnosis.push({
    signal: 'Third-party mentions',
    status: visibilityScore < 50 ? 'missing' : 'weak',
    description: 'Blog posts, newsletters, and reviews by independent writers mentioning your product. Critical for AI training data inclusion.',
    impact: 'high',
  });

  // Technical signals
  diagnosis.push({
    signal: 'Structured data (Schema.org)',
    status: visibilityScore < 60 ? 'missing' : 'weak',
    description: 'Organization, Product, and FAQ schemas help AI models understand and surface your product correctly.',
    impact: 'medium',
  });

  diagnosis.push({
    signal: 'FAQ content',
    status: visibilityScore < 50 ? 'missing' : 'weak',
    description: `FAQ pages answering "${category}" questions that match how users ask AI tools. AI models frequently cite FAQ content.`,
    impact: 'medium',
  });

  // Community signals
  diagnosis.push({
    signal: 'Community presence',
    status: visibilityScore < 40 ? 'missing' : 'weak',
    description: 'Active participation on Reddit, Hacker News, and industry forums with natural product mentions.',
    impact: 'medium',
  });

  diagnosis.push({
    signal: 'Public knowledge base',
    status: visibilityScore < 60 ? 'missing' : 'present',
    description: 'Publicly accessible documentation and guides that AI models can index and reference.',
    impact: 'low',
  });

  return diagnosis;
}

// ===== ACTION LAYER =====

export interface ActionItem {
  type: 'blog_idea' | 'keyword' | 'platform' | 'step';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  isProOnly: boolean;
}

export interface ActionStep {
  step: string;
  detail: string;
}

export interface ActionItemEnhanced extends ActionItem {
  steps?: ActionStep[];
  example?: string;
  expectedOutcome?: string;
  timeEstimate?: string;
}

export function generateActions(
  visibilityScore: number,
  competitorNames: string[],
  category: string,
  startupName: string,
  isPro: boolean
): ActionItemEnhanced[] {
  const topComp = competitorNames[0] || 'competitors';
  const secondComp = competitorNames[1] || 'alternatives';
  const actions: ActionItemEnhanced[] = [];
  actions.push({
    type: 'blog_idea',
    title: `${startupName} vs ${topComp}: An Honest Comparison`,
    description: `Write a 1500+ word comparison post with structured format AI models can parse.`,
    priority: 'high',
    isProOnly: false,
    steps: [
      { step: 'Create a comparison table', detail: `Features side-by-side: ${startupName} vs ${topComp}. Include pricing, key features, pros/cons.` },
      { step: 'Add "Who is it for?" section', detail: `Explain when to choose each. Honesty builds trust with AI models.` },
      { step: 'Publish on blog + Medium', detail: 'Cross-post for maximum reach. AI models index both.' },
    ],
    example: `"${startupName} vs ${topComp} in 2025: Which ${category} Tool Is Right for You?"`,
    expectedOutcome: '+5-10 visibility points within 2-4 weeks.',
    timeEstimate: '3-4 hours',
  });

  actions.push({
    type: 'blog_idea',
    title: `The Complete Guide to ${category} in 2025`,
    description: `Create 3000+ word definitive resource with your product included naturally.`,
    priority: 'high',
    isProOnly: false,
    steps: [
      { step: 'Outline 8-10 sections', detail: `What is ${category}, why it matters, top tools, how to evaluate, mistakes, trends.` },
      { step: `Include ${startupName} in "Top Tools"`, detail: 'Position honestly with 2-3 unique differentiators.' },
      { step: 'Add FAQ section', detail: `Answer "What is the best free ${category} tool?" — matches AI patterns.` },
    ],
    expectedOutcome: '+8-15 visibility points over 4-6 weeks.',
    timeEstimate: '5-6 hours',
  });

  actions.push({
    type: 'blog_idea',
    title: `Why We Built ${startupName}: The ${category} Problem`,
    description: 'Origin stories build brand-problem association in AI training data.',
    priority: 'medium',
    isProOnly: false,
    steps: [
      { step: 'Tell a specific problem story', detail: 'Describe the exact frustration. Be concrete.' },
      { step: 'Show before/after', detail: 'Demonstrate transformation with specific numbers.' },
    ],
    expectedOutcome: 'AI associates your brand with the problem space.',
    timeEstimate: '2-3 hours',
  });

  actions.push({
    type: 'blog_idea',
    title: `Top 10 ${category} Tools for Small Teams`,
    description: 'List posts are #1 format AI cites for recommendation queries.',
    priority: 'medium',
    isProOnly: true,
    steps: [
      { step: 'List 10 tools including yours', detail: `Position ${startupName} at #3-5. Include ${topComp}.` },
      { step: 'Add comparison table', detail: 'Feature matrix — AI extracts structured data from tables.' },
    ],
    expectedOutcome: 'Directly answers "best X tools?" queries.',
    timeEstimate: '3-4 hours',
  });

  actions.push({
    type: 'blog_idea',
    title: `How to Choose the Right ${category} Platform`,
    description: 'Decision-framework posts match AI query patterns perfectly.',
    priority: 'medium',
    isProOnly: true,
    steps: [
      { step: 'Create decision flowchart', detail: '"If you need X → choose Y."' },
      { step: 'Score tools on 5 criteria', detail: `Include ${startupName} with honest scores.` },
    ],
    expectedOutcome: 'Captures "which X should I use?" queries.',
    timeEstimate: '2-3 hours',
  });

  actions.push({
    type: 'keyword',
    title: `best ${category} tool`,
    description: 'High-volume query asked thousands of times daily across AI platforms.',
    priority: 'high',
    isProOnly: false,
    steps: [
      { step: 'Add to homepage H1/H2', detail: `"${startupName} — The best ${category} tool for [niche]"` },
      { step: 'Create dedicated landing page', detail: `yoursite.com/best-${category.replace(/\s+/g, '-').toLowerCase()}-tool` },
    ],
    expectedOutcome: 'Appears for "What\'s the best X tool?" queries.',
    timeEstimate: '1 hour',
  });

  actions.push({
    type: 'keyword',
    title: `${topComp} alternative`,
    description: `Capture high-intent users looking for ${topComp} alternatives.`,
    priority: 'high',
    isProOnly: false,
    steps: [
      { step: 'Write comparison page', detail: `"${startupName} vs ${topComp}: Why Teams Are Switching"` },
      { step: 'List 3 advantages', detail: '"50% cheaper", "Built-in X feature".' },
      { step: 'Include migration guide', detail: `"Switch from ${topComp} in 15 minutes"` },
    ],
    expectedOutcome: `Captures "${topComp} alternative" queries.`,
    timeEstimate: '2-3 hours',
  });

  actions.push({
    type: 'keyword',
    title: `free ${category} for startups`,
    description: 'Startup-focused queries are extremely common in AI tools.',
    priority: 'medium',
    isProOnly: true,
    steps: [
      { step: 'Highlight free tier prominently', detail: '"Free for startups" above the fold.' },
      { step: 'Create startup landing page', detail: `"${startupName} for Startups — Free ${category}"` },
    ],
    expectedOutcome: 'Appears in "free X for startups" queries.',
    timeEstimate: '1-2 hours',
  });

  actions.push({
    type: 'platform',
    title: 'Product Hunt',
    description: 'AI models heavily reference Product Hunt. Essential listing.',
    priority: 'high',
    isProOnly: false,
    steps: [
      { step: 'Create listing', detail: 'producthunt.com/posts/new — tagline, 3+ screenshots.' },
      { step: 'Plan launch', detail: 'Post 12:01 AM PT. Reply to every comment.' },
      { step: 'Get 5+ upvotes', detail: 'Ask colleagues for genuine upvotes.' },
    ],
    expectedOutcome: 'PH listed in 60%+ of "best tool" AI queries.',
    timeEstimate: '4-5 hours prep',
  });

  actions.push({
    type: 'platform',
    title: 'G2 & Capterra',
    description: 'Primary data sources for AI software recommendations.',
    priority: 'high',
    isProOnly: false,
    steps: [
      { step: 'Claim G2 profile', detail: 'sell.g2.com — complete every field.' },
      { step: 'Get 5 reviews', detail: 'Email happy customers for G2 reviews.' },
      { step: 'Claim Capterra', detail: 'capterra.com/vendors — same process.' },
    ],
    expectedOutcome: 'Referenced in 70%+ of AI "best software" queries.',
    timeEstimate: '2 hours + 1 week for reviews',
  });

  actions.push({
    type: 'platform',
    title: 'Dev.to / Medium / Hashnode',
    description: 'Cross-posting multiplies your AI data footprint.',
    priority: 'medium',
    isProOnly: true,
    steps: [
      { step: 'Create accounts on all 3', detail: 'Company name, logo, bio with site link.' },
      { step: 'Cross-post content', detail: 'Use canonical URL to avoid SEO penalties.' },
    ],
    expectedOutcome: 'Each platform = separate data source for AI.',
    timeEstimate: '1 hour setup + 30 min/week',
  });

  actions.push({
    type: 'platform',
    title: 'Reddit & Hacker News',
    description: 'AI models index Reddit/HN heavily.',
    priority: 'medium',
    isProOnly: true,
    steps: [
      { step: 'Find subreddits', detail: `Search "${category}" — join 3-5 relevant subs.` },
      { step: 'Answer helpfully', detail: `Mention ${startupName} only when relevant.` },
      { step: 'Post "Show HN"', detail: `"Show HN: ${startupName} — [pitch]"` },
    ],
    expectedOutcome: 'Reddit/HN mentions cited in 40%+ of AI recommendations.',
    timeEstimate: '30 min/day ongoing',
  });

  actions.push({
    type: 'step',
    title: 'Add Schema.org markup',
    description: 'Structured data helps AI understand and categorize your product.',
    priority: 'high',
    isProOnly: false,
    steps: [
      { step: 'Add Organization schema', detail: `JSON-LD: {"@type": "Organization", "name": "${startupName}"}` },
      { step: 'Add Product schema', detail: 'Include name, description, price, category.' },
      { step: 'Validate', detail: 'search.google.com/test/rich-results' },
    ],
    expectedOutcome: 'Effect in 2-4 weeks after indexing.',
    timeEstimate: '30-60 minutes',
  });

  actions.push({
    type: 'step',
    title: 'Create AI-optimized FAQ page',
    description: `Answer questions using exact phrasing people use in AI queries about ${category}.`,
    priority: 'high',
    isProOnly: false,
    steps: [
      { step: 'Write 10+ questions', detail: `"What is the best ${category} tool?", "Is ${startupName} free?"` },
      { step: 'Answer in 2-3 sentences', detail: 'Direct answer first, then detail.' },
      { step: 'Add FAQ schema', detail: 'FAQPage JSON-LD for direct AI parsing.' },
    ],
    example: `Q: "What is ${startupName}?" A: "${startupName} is a ${category} tool that helps [audience] [benefit]."`,
    expectedOutcome: 'FAQ cited in 30%+ of AI answers about your category.',
    timeEstimate: '1-2 hours',
  });

  actions.push({
    type: 'step',
    title: 'Build competitor comparison pages',
    description: 'Dedicated pages for each major competitor.',
    priority: 'medium',
    isProOnly: false,
    steps: [
      { step: 'Create comparison page', detail: `yoursite.com/${startupName.toLowerCase()}-vs-${topComp.toLowerCase().replace(/\s+/g, '-')}` },
      { step: 'Be genuinely fair', detail: 'Acknowledge competitor strengths.' },
      { step: 'Repeat for top 3', detail: `Pages for ${competitorNames.slice(0, 3).join(', ') || 'top competitors'}.` },
    ],
    expectedOutcome: 'Captures "[product] vs [competitor]" queries.',
    timeEstimate: '2 hours per page',
  });

  actions.push({
    type: 'step',
    title: 'Set up a public changelog',
    description: 'Active products get recommended more by AI.',
    priority: 'low',
    isProOnly: true,
    steps: [
      { step: 'Create /changelog page', detail: '"March 2025 — Added X, Improved Y."' },
      { step: 'Update weekly', detail: 'Consistency > size.' },
    ],
    expectedOutcome: 'AI factors recency into recommendations.',
    timeEstimate: '30 min setup + 15 min/week',
  });

  if (!isPro) {
    let proCount = actions.filter(a => a.isProOnly).length;
    if (proCount < 6) {
      let toMark = 6 - proCount;
      return actions.map(a => {
        if (!a.isProOnly && a.priority !== 'high' && toMark > 0) {
          toMark--;
          return { ...a, isProOnly: true };
        }
        return a;
      });
    }
  } else {
    return actions.map(a => ({ ...a, isProOnly: false }));
  }

  return actions;
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

  if (visibilityScore < 30) {
    selected = selected.sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1));
  }

  if (competitorNames.length > 3) {
    const compIdx = selected.findIndex(s => s.title.includes('comparison'));
    if (compIdx > 0) {
      const [comp] = selected.splice(compIdx, 1);
      selected.unshift(comp);
    }
  }

  if (!isPro) {
    let proCount = 0;
    selected = selected.map(s => {
      if (s.isProOnly) proCount++;
      return s;
    });
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

export function getImprovementPotential(score: number): number {
  if (score <= 20) return 60;
  if (score <= 40) return 45;
  if (score <= 60) return 30;
  if (score <= 80) return 15;
  return 5;
}
