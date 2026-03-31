import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown } from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      if (error) throw error;
      if (data.full_name) setFullName(data.full_name);
      return data;
    },
    enabled: !!user,
  });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved!', description: 'Profile updated.' });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-extrabold font-mono-display uppercase">Settings</h1>

        {/* Account Info */}
        <div className="paper-card">
          <div className="p-5 border-b-2 border-foreground/10">
            <h3 className="font-mono-display font-bold text-sm uppercase tracking-wider">Account Info</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="font-mono-display text-xs uppercase tracking-wider font-semibold">Email</label>
              <input value={user?.email || ''} disabled className="paper-input w-full opacity-50" />
            </div>
            <div className="space-y-2">
              <label htmlFor="fullName" className="font-mono-display text-xs uppercase tracking-wider font-semibold">Full Name</label>
              <input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="paper-input w-full" />
            </div>
            <button onClick={handleSave} disabled={saving} className="paper-btn-primary text-xs py-2.5 px-5">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Plan */}
        <div className="paper-card">
          <div className="p-5 border-b-2 border-foreground/10 flex items-center justify-between">
            <h3 className="font-mono-display font-bold text-sm uppercase tracking-wider">Plan</h3>
            <span className="paper-badge text-[10px] py-0.5 px-2">{profile?.plan === 'pro' ? 'Pro' : 'Free'}</span>
          </div>
          <div className="p-5">
            {profile?.plan !== 'pro' && (
              <div className="border-2 border-primary rounded-sm p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="font-mono-display font-bold uppercase text-sm">Upgrade to Pro — $29/mo</span>
                </div>
                {['Unlimited scans', '25 queries per scan', 'Full diagnosis & actions', 'Progress tracking', 'Shareable reports'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" /> {f}
                  </div>
                ))}
                <button
                  className="paper-btn-primary w-full text-xs py-3"
                  onClick={() => toast({ title: 'Coming Soon', description: 'Payment integration is coming soon.' })}
                >
                  Upgrade
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <div className="paper-card p-5">
          <button onClick={handleSignOut} className="paper-btn-outline text-xs py-2.5 px-5">Sign Out</button>
        </div>
      </div>
    </AppLayout>
  );
}
