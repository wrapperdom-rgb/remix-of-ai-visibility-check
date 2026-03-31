import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getScoreLabel } from '@/lib/scan-utils';
import { Check, X } from 'lucide-react';

const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', claude: 'Claude', gemini: 'Gemini',
};

export default function PublicReport() {
  const { shareToken } = useParams();

  const { data: scan, isLoading, error } = useQuery({
    queryKey: ['public-scan', shareToken],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('*, startups(*)')
        .eq('share_token', shareToken!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!shareToken,
  });

  const { data: results } = useQuery({
    queryKey: ['public-results', scan?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('scan_id', scan!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!scan?.id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-4">This report doesn't exist or has been removed.</p>
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const startup = (scan as any).startups;
  const score = scan.visibility_score || 0;
  const scoreInfo = getScoreLabel(score);

  // Platform breakdown
  const platformStats: Record<string, { visible: number; total: number }> = {};
  (results || []).forEach(r => {
    if (!platformStats[r.platform]) platformStats[r.platform] = { visible: 0, total: 0 };
    platformStats[r.platform].total++;
    if (r.is_visible) platformStats[r.platform].visible++;
  });

  // Group results by query
  const queryMap = new Map<string, typeof results>();
  (results || []).forEach(r => {
    if (!queryMap.has(r.query_text)) queryMap.set(r.query_text, []);
    queryMap.get(r.query_text)!.push(r);
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gradient">Poolabs</Link>
          <Link to="/sign-up"><Button size="sm">Get Started</Button></Link>
        </div>
      </header>

      <div className="container py-8 max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{startup?.name}</h1>
          <p className="text-sm text-muted-foreground">{new Date(scan.created_at).toLocaleDateString()}</p>
        </div>

        <Card className="text-center">
          <CardContent className="py-8">
            <p className={`text-6xl font-extrabold ${scoreInfo.class}`}>{score}</p>
            <p className="text-sm text-muted-foreground mt-1">/ 100 Visibility Score</p>
            <p className="mt-3 text-sm font-medium">{scoreInfo.text}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Queries', value: scan.total_queries || 0 },
            { label: 'Visible', value: scan.visible_count || 0 },
            { label: 'Not Visible', value: scan.not_visible_count || 0 },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Platform Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(platformStats).map(([platform, stats]) => {
                const pct = Math.round((stats.visible / stats.total) * 100);
                return (
                  <div key={platform} className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium">{PLATFORM_LABELS[platform]}</p>
                    <p className={`text-xl font-bold ${pct > 50 ? 'score-high' : pct > 25 ? 'score-medium' : 'score-low'}`}>{pct}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Query Results</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {[...queryMap.entries()].map(([query, platformResults]) => (
              <div key={query} className="flex items-center gap-3 px-4 py-3 rounded-lg border">
                <span className="flex-1 text-sm">{query}</span>
                <div className="flex items-center gap-1">
                  {platformResults!.map(r => (
                    <span key={r.platform} title={PLATFORM_LABELS[r.platform]}>
                      {r.is_visible ? <Check className="h-4 w-4 text-score-high" /> : <X className="h-4 w-4 text-score-low" />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="gradient-hero text-center">
          <CardContent className="py-8">
            <h3 className="text-xl font-bold text-primary-foreground mb-2">Want to check your startup's AI visibility?</h3>
            <Link to="/sign-up">
              <Button variant="secondary" size="lg">Check Your Startup</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
