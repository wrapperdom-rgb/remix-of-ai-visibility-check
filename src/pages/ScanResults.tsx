import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getScoreLabel, getScoreBadgeClass } from '@/lib/scan-utils';
import { ArrowLeft, Check, X, Copy, Share2, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
};

export default function ScanResults() {
  const { scanId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);

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

  // Group suggestions by category
  const suggestionGroups: Record<string, typeof suggestions> = {};
  (suggestions || []).forEach(s => {
    if (!suggestionGroups[s.category]) suggestionGroups[s.category] = [];
    suggestionGroups[s.category]!.push(s);
  });

  const shareUrl = scan.share_token
    ? `${window.location.origin}/report/${scan.share_token}`
    : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied!', description: 'Share your report with anyone.' });
  };

  const shareOnX = () => {
    const text = `My startup ${startup?.name} scored ${score}/100 on AI visibility. Find out if AI search tools mention your startup → poolabs.com`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{startup?.name}</h1>
          <p className="text-sm text-muted-foreground">{startup?.website} · {new Date(scan.created_at).toLocaleDateString()}</p>
        </div>

        {/* Score */}
        <Card className="text-center">
          <CardContent className="py-8">
            <p className={`text-6xl font-extrabold ${scoreInfo.class}`}>{score}</p>
            <p className="text-sm text-muted-foreground mt-1">/ 100 Visibility Score</p>
            <p className="mt-3 text-sm font-medium">{scoreInfo.text}</p>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Queries', value: scan.total_queries || 0 },
            { label: 'Visible', value: scan.visible_count || 0 },
            { label: 'Not Visible', value: scan.not_visible_count || 0 },
            { label: 'Competitors', value: sortedCompetitors.length },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">Platform Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(platformStats).map(([platform, stats]) => {
                const pct = Math.round((stats.visible / stats.total) * 100);
                return (
                  <div key={platform} className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium">{PLATFORM_LABELS[platform]}</p>
                    <p className={`text-xl font-bold ${pct > 50 ? 'score-high' : pct > 25 ? 'score-medium' : 'score-low'}`}>
                      {pct}%
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Query Results */}
        <Card>
          <CardHeader><CardTitle className="text-base">Query Results</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {[...queryMap.entries()].map(([query, platformResults]) => (
              <div key={query} className="rounded-lg border">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedQuery(expandedQuery === query ? null : query)}
                >
                  <span className="flex-1 text-sm">{query}</span>
                  <div className="flex items-center gap-1">
                    {platformResults.map(r => (
                      <span key={r.platform} title={PLATFORM_LABELS[r.platform]}>
                        {r.is_visible ? (
                          <Check className="h-4 w-4 text-score-high" />
                        ) : (
                          <X className="h-4 w-4 text-score-low" />
                        )}
                      </span>
                    ))}
                  </div>
                  {expandedQuery === query ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedQuery === query && (
                  <div className="px-4 pb-3 space-y-2 border-t pt-3">
                    {platformResults.map(r => (
                      <div key={r.id} className="text-xs">
                        <span className="font-medium">{PLATFORM_LABELS[r.platform]}:</span>{' '}
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
          </CardContent>
        </Card>

        {/* Top Competitors */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Competitors</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedCompetitors.slice(0, isPro ? 5 : 2).map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2">
                  <span className="text-sm font-medium">#{i + 1} {name}</span>
                  <Badge variant="secondary">{count} mentions</Badge>
                </div>
              ))}
              {!isPro && sortedCompetitors.length > 2 && (
                <div className="relative">
                  {sortedCompetitors.slice(2, 5).map(([name], i) => (
                    <div key={name} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2 blur-sm">
                      <span className="text-sm font-medium">#{i + 3} {name}</span>
                      <Badge variant="secondary">--</Badge>
                    </div>
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Lock className="h-3 w-3" /> Upgrade to Pro
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader><CardTitle className="text-base">Improvement Suggestions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(suggestionGroups).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 capitalize">{category}</h4>
                <div className="space-y-2">
                  {items!.map(s => (
                    <div key={s.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{s.title}</span>
                        <Badge variant="secondary" className="text-xs">{s.priority}</Badge>
                      </div>
                      {s.is_pro_only && !isPro ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" /> Upgrade to unlock this suggestion
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Share */}
        <Card>
          <CardContent className="py-6">
            <h3 className="font-semibold mb-3">Share Your Results</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="gap-2" onClick={copyShareLink}>
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
              <Button variant="outline" className="gap-2" onClick={shareOnX}>
                <Share2 className="h-4 w-4" /> Share on X
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
