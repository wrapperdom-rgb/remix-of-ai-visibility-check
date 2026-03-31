import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { Badge } from '@/components/ui/badge';
import { getScoreBadgeClass } from '@/lib/scan-utils';
import { PlusCircle, BarChart3, Eye, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: scans, isLoading } = useQuery({
    queryKey: ['scans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('*, startups(name, website)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const completedScans = scans?.filter(s => s.status === 'completed') || [];
  const avgScore = completedScans.length
    ? Math.round(completedScans.reduce((sum, s) => sum + (s.visibility_score || 0), 0) / completedScans.length)
    : 0;
  const scanLimit = profile?.plan === 'pro' ? Infinity : 2;
  const scansRemaining = Math.max(0, scanLimit - (profile?.scans_this_month || 0));
  const limitReached = scansRemaining <= 0 && profile?.plan !== 'pro';

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there';

  // Progress tracking: show score trend
  const scoreTrend = completedScans.length >= 2
    ? (completedScans[0].visibility_score || 0) - (completedScans[1].visibility_score || 0)
    : null;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold font-mono-display uppercase">Welcome, {displayName}</h1>
            <span className="paper-badge text-[10px] mt-2 inline-flex">{profile?.plan === 'pro' ? 'Pro' : 'Free'} Plan</span>
          </div>
          <Link to="/scan/new">
            <button className="paper-btn-primary text-xs py-3 px-6 flex items-center gap-2" disabled={limitReached}>
              <PlusCircle className="h-3.5 w-3.5" /> New Scan
            </button>
          </Link>
        </div>

        {limitReached && (
          <div className="paper-card border-score-low p-4 text-sm flex items-center gap-2">
            <span className="score-low font-semibold">Limit reached.</span>
            <Link to="/settings" className="text-primary hover:underline font-mono-display text-xs uppercase">Upgrade to Pro →</Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="paper-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground border-2 border-foreground/90 rounded-sm">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-mono-display">{completedScans.length}</p>
                <p className="text-xs font-mono-display text-muted-foreground uppercase tracking-wider">Total Scans</p>
              </div>
            </div>
          </div>
          <div className="paper-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground border-2 border-foreground/90 rounded-sm">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-extrabold font-mono-display">{avgScore}/100</p>
                  {scoreTrend !== null && (
                    <span className={`text-xs font-mono-display font-bold ${scoreTrend > 0 ? 'score-high' : scoreTrend < 0 ? 'score-low' : 'text-muted-foreground'}`}>
                      {scoreTrend > 0 ? `+${scoreTrend}` : scoreTrend}
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono-display text-muted-foreground uppercase tracking-wider">Avg Visibility</p>
              </div>
            </div>
          </div>
          <div className="paper-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground border-2 border-foreground/90 rounded-sm">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold font-mono-display">{profile?.plan === 'pro' ? '∞' : scansRemaining}</p>
                <p className="text-xs font-mono-display text-muted-foreground uppercase tracking-wider">Scans Left</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress CTA */}
        {completedScans.length > 0 && completedScans[0].visibility_score !== null && completedScans[0].visibility_score < 70 && (
          <div className="paper-card-blue p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-mono-display font-bold text-sm uppercase">Improve Your Score</p>
                <p className="text-xs opacity-80 mt-0.5">View your diagnosis and action plan to boost visibility.</p>
              </div>
            </div>
            <Link to={`/scan/${completedScans[0].id}/results`}>
              <button className="paper-btn text-xs py-2 px-4 bg-foreground text-background border-foreground flex items-center gap-1.5 whitespace-nowrap">
                View Actions <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
        )}

        {/* Scan History */}
        <div>
          <h2 className="font-mono-display font-bold text-sm uppercase tracking-wider mb-4">Scan History</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !scans?.length ? (
            <div className="paper-card p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-mono-display font-bold uppercase mb-2">No scans yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first scan to see how visible your startup is in AI search.
              </p>
              <Link to="/scan/new">
                <button className="paper-btn-primary text-xs py-3 px-6">Start First Scan</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {scans.map(scan => (
                <div key={scan.id} className="paper-card paper-card-hover">
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-display font-bold truncate">{(scan as any).startups?.name || 'Unnamed'}</p>
                      <p className="text-xs font-mono-display text-muted-foreground uppercase tracking-wider">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {scan.status === 'completed' ? (
                        <span className={`paper-badge text-[10px] py-0.5 px-2 ${getScoreBadgeClass(scan.visibility_score || 0)}`}>
                          {scan.visibility_score}/100
                        </span>
                      ) : (
                        <span className="paper-badge text-[10px] py-0.5 px-2">{scan.status}</span>
                      )}
                      <span className="text-xs font-mono-display text-muted-foreground">{scan.total_queries || 0}q</span>
                      {scan.status === 'completed' ? (
                        <Link to={`/scan/${scan.id}/results`}>
                          <button className="paper-btn-outline text-[10px] py-1.5 px-3">View</button>
                        </Link>
                      ) : scan.status === 'pending' ? (
                        <Link to={`/scan/${scan.id}/queries`}>
                          <button className="paper-btn-outline text-[10px] py-1.5 px-3">Continue</button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
