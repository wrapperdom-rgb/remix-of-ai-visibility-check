import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScoreLabel, getScoreBadgeClass, generateDiagnosis, generateActions, getImprovementPotential, extractKeywords } from '@/lib/scan-utils';
import { ArrowLeft, Check, X, Copy, Share2, Lock, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, FileText, Target, Zap, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini',
  copilot: 'Copilot', meta_ai: 'Meta AI', mistral: 'Mistral', grok: 'Grok',
  you_com: 'You.com', phind: 'Phind', poe: 'Poe', pi: 'Pi', deepseek: 'DeepSeek',
  qwen: 'Qwen', llama: 'Llama', reka: 'Reka', command_r: 'Command R',
  duckduckgo_ai: 'DuckDuckGo AI', brave_leo: 'Brave Leo', notion_ai: 'Notion AI',
  slack_ai: 'Slack AI', canva_ai: 'Canva AI', jasper: 'Jasper',
  writesonic: 'Writesonic', microsoft_designer: 'Microsoft Designer',
};

const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  missing: { icon: '✕', color: 'text-score-low bg-score-low/10' },
  weak: { icon: '~', color: 'text-score-medium bg-score-medium/10' },
  present: { icon: '✓', color: 'text-score-high bg-score-high/10' },
};

const ACTION_TYPE_LABELS: Record<string, { label: string; icon: typeof FileText }> = {
  blog_idea: { label: 'Blog Ideas', icon: FileText },
  keyword: { label: 'Keywords to Target', icon: Target },
  platform: { label: 'Platforms to Publish', icon: ExternalLink },
  step: { label: 'Action Steps', icon: Zap },
};

export default function ScanResults() {
  const { scanId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnosis' | 'actions'>('overview');

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: scan } = useQuery({
    queryKey: ['scan-detail', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('*, startups(*)')
        .eq('id', scanId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!scanId,
  });

  const { data: results } = useQuery({
    queryKey: ['scan-results-detail', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('scan_id', scanId!);
      if (error) throw error;
      return data;
    },
    enabled: !!scanId,
  });

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('scan_id', scanId!);
      if (error) throw error;
      return data;
    },
    enabled: !!scanId,
  });

  if (!scan || !results) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const startup = (scan as any).startups;
  const score = scan.visibility_score || 0;
  const scoreInfo = getScoreLabel(score);
  const isPro = profile?.plan === 'pro';
  const improvementPotential = getImprovementPotential(score);

  // Group results by query
  const queryMap = new Map<string, typeof results>();
  results.forEach(r => {
    if (!queryMap.has(r.query_text)) queryMap.set(r.query_text, []);
    queryMap.get(r.query_text)!.push(r);
  });

  // Platform breakdown
  const platformStats: Record<string, { visible: number; total: number }> = {};
  results.forEach(r => {
    if (!platformStats[r.platform]) platformStats[r.platform] = { visible: 0, total: 0 };
    platformStats[r.platform].total++;
    if (r.is_visible) platformStats[r.platform].visible++;
  });

  // Competitor ranking
  const competitorCount: Record<string, number> = {};
  results.forEach(r => {
    (r.competitors_found || []).forEach(c => {
      competitorCount[c] = (competitorCount[c] || 0) + 1;
    });
  });
  const sortedCompetitors = Object.entries(competitorCount).sort((a, b) => b[1] - a[1]);

  // Generate diagnosis and actions
  const { category } = extractKeywords(startup?.description || '');
  const diagnosis = generateDiagnosis(score, sortedCompetitors.map(c => c[0]), category, startup?.name || '');
  const actions = generateActions(score, sortedCompetitors.map(c => c[0]), category, startup?.name || '', isPro);

  // Group actions by type
  const actionGroups: Record<string, typeof actions> = {};
  actions.forEach(a => {
    if (!actionGroups[a.type]) actionGroups[a.type] = [];
    actionGroups[a.type].push(a);
  });

  const shareUrl = scan.share_token
    ? `${window.location.origin}/report/${scan.share_token}`
    : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!', description: 'Share your report with anyone.' });
  };

  const shareOnX = () => {
    const text = `My startup ${startup?.name} scored ${score}/100 on AI visibility. Find out if AI search tools mention your startup → poolabs.in`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'diagnosis' as const, label: 'Diagnosis' },
    { id: 'actions' as const, label: 'Action Plan' },
  ];

  const missingSignals = diagnosis.filter(d => d.status === 'missing').length;
  const weakSignals = diagnosis.filter(d => d.status === 'weak').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-mono-display uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold font-mono-display uppercase">{startup?.name}</h1>
            <p className="text-xs font-mono-display text-muted-foreground uppercase tracking-wider mt-1">{startup?.website} · {new Date(scan.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyShareLink} className="paper-btn-outline text-xs py-2 px-3 flex items-center gap-1.5">
              <Copy className="h-3 w-3" /> Copy Link
            </button>
            <button onClick={shareOnX} className="paper-btn-outline text-xs py-2 px-3 flex items-center gap-1.5">
              <Share2 className="h-3 w-3" /> Share
            </button>
          </div>
        </div>

        {/* Score Card */}
        <div className="paper-card p-6 text-center">
          <p className={`text-6xl font-extrabold font-mono-display ${scoreInfo.class}`}>{score}</p>
          <p className="text-xs font-mono-display text-muted-foreground uppercase tracking-wider mt-1">/ 100 Visibility Score</p>
          <p className="mt-3 text-sm font-medium">{scoreInfo.text}</p>
          <div className="mt-4 inline-flex items-center gap-2 paper-badge-primary text-xs">
            <TrendingUp className="h-3 w-3" /> +{improvementPotential} pts improvement potential
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Queries', value: scan.total_queries || 0 },
            { label: 'Visible', value: scan.visible_count || 0 },
            { label: 'Not Visible', value: scan.not_visible_count || 0 },
            { label: 'Competitors', value: sortedCompetitors.length },
          ].map(stat => (
            <div key={stat.label} className="paper-card p-4 text-center">
              <p className="text-2xl font-extrabold font-mono-display">{stat.value}</p>
              <p className="text-xs font-mono-display text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b-2 border-foreground/15">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-mono-display uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.id === 'diagnosis' && missingSignals > 0 && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-score-low/20 text-[10px] font-bold text-score-low">{missingSignals}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Platform Breakdown */}
            <div className="paper-card">
              <div className="p-4 border-b-2 border-foreground/10">
                <h3 className="font-mono-display font-bold text-sm uppercase tracking-wider">Platform Breakdown</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.entries(platformStats).map(([platform, stats]) => {
                    const pct = Math.round((stats.visible / stats.total) * 100);
                    return (
                      <div key={platform} className="text-center p-3 border-2 border-foreground/10 rounded-sm">
                        <p className="text-xs font-mono-display uppercase tracking-wider text-muted-foreground">{PLATFORM_LABELS[platform]}</p>
                        <p className={`text-2xl font-extrabold font-mono-display ${pct > 50 ? 'score-high' : pct > 25 ? 'score-medium' : 'score-low'}`}>
                          {pct}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Query Results */}
            <div className="paper-card">
              <div className="p-4 border-b-2 border-foreground/10">
                <h3 className="font-mono-display font-bold text-sm uppercase tracking-wider">Query Results</h3>
              </div>
              <div className="divide-y-2 divide-foreground/5">
                {[...queryMap.entries()].map(([query, platformResults]) => (
                  <div key={query}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                      onClick={() => setExpandedQuery(expandedQuery === query ? null : query)}
                    >
                      <span className="flex-1 text-sm">{query}</span>
                      <div className="flex items-center gap-1">
                        {platformResults.map(r => (
                          <span key={r.platform} title={PLATFORM_LABELS[r.platform]}>
                            {r.is_visible ? (
                              <Check className="h-4 w-4 score-high" />
                            ) : (
                              <X className="h-4 w-4 score-low" />
                            )}
                          </span>
                        ))}
                      </div>
                      {expandedQuery === query ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedQuery === query && (
                      <div className="px-4 pb-3 space-y-2 border-t-2 border-foreground/5 pt-3 bg-secondary/20">
                        {platformResults.map(r => (
                          <div key={r.id} className="text-xs">
                            <span className="font-mono-display font-semibold uppercase">{PLATFORM_LABELS[r.platform]}:</span>{' '}
                            {r.is_visible ? (
                              <span className="text-muted-foreground">{r.mention_snippet}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                Not mentioned. Competitors found: {(r.competitors_found || []).join(', ')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Competitors */}
            <div className="paper-card">
              <div className="p-4 border-b-2 border-foreground/10">
                <h3 className="font-mono-display font-bold text-sm uppercase tracking-wider">Top Competitors</h3>
              </div>
              <div className="p-4 space-y-2">
                {sortedCompetitors.slice(0, isPro ? 5 : 2).map(([name, count], i) => (
                  <div key={name} className="flex items-center justify-between border-2 border-foreground/10 rounded-sm px-4 py-2">
                    <span className="text-sm font-mono-display font-semibold">#{i + 1} {name}</span>
                    <span className="paper-badge text-[10px] py-0.5 px-2">{count} mentions</span>
                  </div>
                ))}
                {!isPro && sortedCompetitors.length > 2 && (
                  <div className="relative">
                    {sortedCompetitors.slice(2, 5).map(([name], i) => (
                      <div key={name} className="flex items-center justify-between border-2 border-foreground/10 rounded-sm px-4 py-2 blur-sm">
                        <span className="text-sm font-mono-display">#{i + 3} {name}</span>
                        <span className="text-xs">--</span>
                      </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="paper-btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                        <Lock className="h-3 w-3" /> Upgrade to Pro
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnosis' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="paper-card p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-score-medium shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">
                  {missingSignals} missing signal{missingSignals !== 1 ? 's' : ''}, {weakSignals} weak signal{weakSignals !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  These are the signals AI models use to decide whether to mention your startup. Fix the missing ones first for the biggest impact.
                </p>
              </div>
            </div>

            {/* Diagnosis Items */}
            <div className="space-y-3">
              {diagnosis.map((item, i) => {
                const statusStyle = STATUS_ICONS[item.status];
                return (
                  <div key={i} className="paper-card p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-sm text-xs font-mono-display font-bold shrink-0 ${statusStyle.color}`}>
                        {statusStyle.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono-display font-bold text-sm uppercase">{item.signal}</span>
                          <span className={`text-[10px] font-mono-display uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                            item.impact === 'high' ? 'bg-score-low/10 text-score-low' :
                            item.impact === 'medium' ? 'bg-score-medium/10 text-score-medium' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {item.impact} impact
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            {!isPro ? (
              <div className="paper-card p-8 text-center space-y-4">
                <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
                <h3 className="font-mono-display font-bold text-lg uppercase">Pro Feature</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Upgrade to Pro to unlock your full Action Plan — blog ideas, keyword targets, platform recommendations, and step-by-step actions to improve your AI visibility.
                </p>
                <button className="paper-btn-primary text-xs py-3 px-6 flex items-center gap-2 mx-auto">
                  <Zap className="h-3.5 w-3.5" /> Upgrade to Pro — $29/mo
                </button>
              </div>
            ) : (
            Object.entries(actionGroups).map(([type, items]) => {
              const typeInfo = ACTION_TYPE_LABELS[type];
              const TypeIcon = typeInfo?.icon || Zap;
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <TypeIcon className="h-4 w-4 text-primary" />
                    <h3 className="font-mono-display font-bold text-sm uppercase tracking-wider">{typeInfo?.label || type}</h3>
                  </div>
                  <div className="space-y-2">
                    {items.map((action, i) => (
                      <div key={i} className="paper-card p-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-sm shrink-0 mt-0.5 ${
                            action.priority === 'high' ? 'bg-primary text-primary-foreground' :
                            action.priority === 'medium' ? 'bg-secondary text-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            <span className="text-[10px] font-mono-display font-bold">
                              {action.priority === 'high' ? '!' : action.priority === 'medium' ? '·' : '-'}
                            </span>
                          </div>
                          <div className="flex-1">
                            {action.isProOnly && !isPro ? (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-muted-foreground">{action.title}</span>
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground/60">Upgrade to Pro to unlock this action</p>
                              </>
                            ) : (
                              <>
                                <p className="font-semibold text-sm mb-1">{action.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
