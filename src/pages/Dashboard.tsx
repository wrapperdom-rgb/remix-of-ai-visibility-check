import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getScoreBadgeClass } from '@/lib/scan-utils';
import { PlusCircle, BarChart3, Eye, Calendar } from 'lucide-react';

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

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
            <Badge variant="secondary" className="mt-1">{profile?.plan === 'pro' ? 'Pro' : 'Free'} Plan</Badge>
          </div>
          <Link to="/scan/new">
            <Button className="gap-2 gradient-hero border-0" disabled={limitReached}>
              <PlusCircle className="h-4 w-4" /> New Scan
            </Button>
          </Link>
        </div>

        {limitReached && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-4 text-sm">
              You've reached your monthly scan limit. <Link to="/settings" className="text-primary hover:underline font-medium">Upgrade to Pro</Link> for unlimited scans.
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedScans.length}</p>
                  <p className="text-xs text-muted-foreground">Total Scans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgScore}/100</p>
                  <p className="text-xs text-muted-foreground">Avg Visibility</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile?.plan === 'pro' ? '∞' : scansRemaining}</p>
                  <p className="text-xs text-muted-foreground">Scans Left This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan History */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Scan History</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !scans?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-semibold mb-2">No scans yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your first scan to see how visible your startup is in AI search.
                </p>
                <Link to="/scan/new">
                  <Button className="gradient-hero border-0">Start First Scan</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {scans.map(scan => (
                <Card key={scan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{(scan as any).startups?.name || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {scan.status === 'completed' ? (
                          <Badge className={getScoreBadgeClass(scan.visibility_score || 0)}>
                            {scan.visibility_score}/100
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{scan.status}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{scan.total_queries || 0} queries</span>
                        {scan.status === 'completed' ? (
                          <Link to={`/scan/${scan.id}/results`}>
                            <Button variant="outline" size="sm">View Results</Button>
                          </Link>
                        ) : scan.status === 'pending' ? (
                          <Link to={`/scan/${scan.id}/queries`}>
                            <Button variant="outline" size="sm">Continue</Button>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
