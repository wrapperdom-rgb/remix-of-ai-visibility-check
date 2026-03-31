import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateQueries } from '@/lib/scan-utils';

const PLATFORMS = ['chatgpt', 'perplexity', 'claude', 'gemini'];

export default function NewScan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);

    try {
      // Check/reset monthly period
      const periodStart = new Date(profile.current_period_start);
      const now = new Date();
      const daysDiff = (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
      let scansThisMonth = profile.scans_this_month;

      if (daysDiff > 30) {
        scansThisMonth = 0;
        await supabase.from('profiles').update({
          scans_this_month: 0,
          current_period_start: now.toISOString(),
        }).eq('id', user.id);
      }

      // Check limits
      if (profile.plan !== 'pro' && scansThisMonth >= 2) {
        toast({ title: 'Scan limit reached', description: 'Upgrade to Pro for unlimited scans.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Create startup
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .insert({ user_id: user.id, name, website, description })
        .select()
        .single();
      if (startupError) throw startupError;

      // Create scan
      const isPro = profile.plan === 'pro';
      const queries = generateQueries(description, isPro);
      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .insert({
          startup_id: startup.id,
          user_id: user.id,
          status: 'pending',
          total_queries: queries.length,
        })
        .select()
        .single();
      if (scanError) throw scanError;

      // Create scan_results for each query × platform
      const results = queries.flatMap(query =>
        PLATFORMS.map(platform => ({
          scan_id: scan.id,
          query_text: query,
          platform,
        }))
      );

      const { error: resultsError } = await supabase.from('scan_results').insert(results);
      if (resultsError) throw resultsError;

      // Increment scans_this_month
      await supabase.from('profiles').update({
        scans_this_month: scansThisMonth + 1,
      }).eq('id', user.id);

      navigate(`/scan/${scan.id}/queries`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Start a New Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Startup Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Poolabs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" type="url" value={website} onChange={e => setWebsite(e.target.value)} required placeholder="https://poolabs.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">What does your startup do?</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 200))}
                  required
                  placeholder="Describe your product in a sentence..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground text-right">{description.length}/200</p>
              </div>
              <Button type="submit" className="w-full gradient-hero border-0" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Queries'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
