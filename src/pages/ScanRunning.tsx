import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { Progress } from '@/components/ui/progress';
import { generateSuggestions, generateShareToken, extractKeywords } from '@/lib/scan-utils';
import { Check, Loader2 } from 'lucide-react';
import { PLATFORMS } from '@/lib/scan-utils';

export default function ScanRunning() {
  const { scanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const [processedQueries, setProcessedQueries] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
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

        try {
          // Call AI to analyze visibility for this query across all platforms
          const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-visibility', {
            body: {
              startupName: startup.name,
              website: startup.website,
              description: startup.description,
              query,
              platforms: [...PLATFORMS],
            },
          });

          if (aiError || aiData?.error) {
            console.error('AI analysis error:', aiError || aiData?.error);
            // Fallback: mark all as not visible
            for (const platform of PLATFORMS) {
              await supabase
                .from('scan_results')
                .update({
                  is_visible: false,
                  mention_snippet: null,
                  competitors_found: ['Unable to analyze'],
                })
                .eq('scan_id', scanId!)
                .eq('query_text', query)
                .eq('platform', platform);
              notVisibleCount++;
            }
          } else {
            const aiResults = aiData.results || {};

            for (const platform of PLATFORMS) {
              const platformResult = aiResults[platform];
              const isVisible = platformResult?.is_visible || false;
              const mentionSnippet = platformResult?.mention_snippet || null;
              const competitorsFound = platformResult?.competitors_found || null;

              await supabase
                .from('scan_results')
                .update({
                  is_visible: isVisible,
                  mention_snippet: mentionSnippet,
                  competitors_found: competitorsFound,
                })
                .eq('scan_id', scanId!)
                .eq('query_text', query)
                .eq('platform', platform);

              if (isVisible) visibleCount++;
              else notVisibleCount++;
            }
          }
        } catch (err) {
          console.error('Error analyzing query:', query, err);
          for (const platform of PLATFORMS) {
            notVisibleCount++;
          }
        }

        setProcessedQueries(prev => [...prev, query]);
        // Small delay between queries to avoid rate limiting
        if (i < uniqueQueries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const totalResults = visibleCount + notVisibleCount;
      const visibilityScore = totalResults > 0 ? Math.round((visibleCount / totalResults) * 100) : 0;
      const shareToken = generateShareToken();

      await supabase.from('scans').update({
        status: 'completed',
        visibility_score: visibilityScore,
        visible_count: visibleCount,
        not_visible_count: notVisibleCount,
        total_queries: uniqueQueries.length,
        share_token: shareToken,
      }).eq('id', scanId!);

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
      setTimeout(() => navigate(`/scan/${scanId}/results`), 500);
    };

    runScan().catch(err => {
      console.error('Scan failed:', err);
      setErrorMsg(err.message || 'Scan failed');
    });
  }, [scan, results, profile, scanId, navigate]);

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <div className="paper-card p-8 text-center space-y-6">
          <div className="h-16 w-16 mx-auto flex items-center justify-center bg-primary text-primary-foreground border-2 border-foreground/90 rounded-sm animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-extrabold font-mono-display uppercase">Analyzing AI Platforms...</h2>
          <p className="text-xs text-muted-foreground">Using AI to check {PLATFORMS.length} platforms for each query</p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs font-mono-display text-muted-foreground uppercase tracking-wider">{progress}% complete</p>

          {currentQuery && (
            <p className="text-sm font-medium truncate px-4 font-mono-display">Checking: "{currentQuery}"</p>
          )}

          {errorMsg && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}

          <div className="max-h-48 overflow-y-auto space-y-1 text-left px-4">
            {processedQueries.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="truncate">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
