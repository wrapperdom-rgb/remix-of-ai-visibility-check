import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { simulateVisibility, generateSuggestions, generateShareToken, extractKeywords } from '@/lib/scan-utils';
import { Check, Loader2 } from 'lucide-react';

const PLATFORMS = ['chatgpt', 'perplexity', 'claude', 'gemini'];

export default function ScanRunning() {
  const { scanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const [processedQueries, setProcessedQueries] = useState<string[]>([]);
  const started = useRef(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: scan } = useQuery({
    queryKey: ['scan', scanId],
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
    queryKey: ['scan-results-running', scanId],
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

  useEffect(() => {
    if (!scan || !results || !profile || started.current) return;
    if (scan.status === 'completed') {
      navigate(`/scan/${scanId}/results`);
      return;
    }
    started.current = true;

    const startup = (scan as any).startups;
    if (!startup) return;

    const uniqueQueries = [...new Set(results.map(r => r.query_text))];
    const totalSteps = uniqueQueries.length;

    const runScan = async () => {
      await supabase.from('scans').update({ status: 'running' }).eq('id', scanId!);

      let visibleCount = 0;
      let notVisibleCount = 0;

      for (let i = 0; i < uniqueQueries.length; i++) {
        const query = uniqueQueries[i];
        setCurrentQuery(query);
        setProgress(Math.round(((i + 1) / totalSteps) * 100));

        // Process all platforms for this query
        for (const platform of PLATFORMS) {
          const sim = simulateVisibility(startup.name, query, platform, startup.description);

          await supabase
            .from('scan_results')
            .update({
              is_visible: sim.isVisible,
              mention_snippet: sim.mentionSnippet,
              competitors_found: sim.competitorsFound,
            })
            .eq('scan_id', scanId!)
            .eq('query_text', query)
            .eq('platform', platform);

          if (sim.isVisible) visibleCount++;
          else notVisibleCount++;
        }

        setProcessedQueries(prev => [...prev, query]);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      }

      const totalResults = visibleCount + notVisibleCount;
      const visibilityScore = totalResults > 0 ? Math.round((visibleCount / totalResults) * 100) : 0;
      const shareToken = generateShareToken();

      // Update scan
      await supabase.from('scans').update({
        status: 'completed',
        visibility_score: visibilityScore,
        visible_count: visibleCount,
        not_visible_count: notVisibleCount,
        total_queries: uniqueQueries.length,
        share_token: shareToken,
      }).eq('id', scanId!);

      // Generate suggestions
      // Get all competitors
      const { data: allResults } = await supabase
        .from('scan_results')
        .select('competitors_found')
        .eq('scan_id', scanId!)
        .not('competitors_found', 'is', null);

      const allCompetitors = (allResults || []).flatMap(r => r.competitors_found || []);
      const { category } = extractKeywords(startup.description);
      const isPro = profile.plan === 'pro';
      const suggestions = generateSuggestions(visibilityScore, allCompetitors, category, isPro);

      const suggestionRows = suggestions.map(s => ({
        scan_id: scanId!,
        category: s.category,
        title: s.title,
        description: s.description,
        priority: s.priority,
        is_pro_only: s.isProOnly,
      }));

      await supabase.from('suggestions').insert(suggestionRows);

      // Navigate to results
      setTimeout(() => navigate(`/scan/${scanId}/results`), 500);
    };

    runScan();
  }, [scan, results, profile, scanId, navigate]);

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-6">
            <div className="h-16 w-16 mx-auto rounded-full gradient-hero flex items-center justify-center animate-pulse-scan">
              <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
            </div>
            <h2 className="text-xl font-bold">Scanning AI Platforms...</h2>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>

            {currentQuery && (
              <p className="text-sm font-medium truncate px-4">Checking: "{currentQuery}"</p>
            )}

            <div className="max-h-48 overflow-y-auto space-y-1 text-left px-4">
              {processedQueries.map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="truncate">{q}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
