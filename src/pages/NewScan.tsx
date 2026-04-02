import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';
import { PLATFORMS } from '@/lib/scan-utils';

export default function NewScan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) return data;

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user!.id,
          email: user!.email ?? null,
          full_name: user!.user_metadata?.full_name ?? null,
        })
        .select('*')
        .single();

      if (createError) throw createError;

      return createdProfile;
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!profile) {
      toast({ title: 'Account still loading', description: 'Please wait a moment and try again.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
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

      if (profile.plan !== 'pro' && scansThisMonth >= 2) {
        toast({ title: 'Scan limit reached', description: 'Upgrade to Pro for unlimited scans.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .insert({ user_id: user.id, name, website, description })
        .select()
        .single();
      if (startupError) throw startupError;

      const isPro = profile.plan === 'pro';

      // Use AI to generate relevant queries
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-queries', {
        body: { startupName: name, website, description, isPro },
      });
      if (aiError) throw new Error(aiError.message || 'Failed to generate queries');
      if (aiData?.error) throw new Error(aiData.error);
      const queries: string[] = aiData.queries || [];
      if (queries.length === 0) throw new Error('No queries generated');

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

      const results = queries.flatMap(query =>
        PLATFORMS.map(platform => ({
          scan_id: scan.id,
          query_text: query,
          platform,
        }))
      );

      const { error: resultsError } = await supabase.from('scan_results').insert(results);
      if (resultsError) throw resultsError;

      await supabase.from('profiles').update({
        scans_this_month: scansThisMonth + 1,
      }).eq('id', user.id);

      navigate(`/scan/${scan.id}/queries`);
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <div className="paper-card">
          <div className="p-5 border-b-2 border-foreground/10">
            <h2 className="font-mono-display font-bold text-lg uppercase tracking-wider">Start a New Scan</h2>
          </div>
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="font-mono-display text-xs uppercase tracking-wider font-semibold">Startup Name</label>
                <input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Poolabs"
                  className="paper-input w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="website" className="font-mono-display text-xs uppercase tracking-wider font-semibold">Website URL</label>
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  required
                  placeholder="https://poolabs.in"
                  className="paper-input w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="desc" className="font-mono-display text-xs uppercase tracking-wider font-semibold">What does your startup do?</label>
                <textarea
                  id="desc"
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, 200))}
                  required
                  placeholder="Describe your product in a sentence..."
                  className="paper-input w-full min-h-[100px] resize-none"
                />
                <p className="text-xs font-mono-display text-muted-foreground text-right">{description.length}/200</p>
              </div>
              <button type="submit" className="paper-btn-primary w-full text-xs py-3" disabled={loading || profileLoading || !user}>
                {profileLoading ? 'Loading account...' : loading ? 'Generating...' : 'Generate Queries →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
