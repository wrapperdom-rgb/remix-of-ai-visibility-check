import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap } from 'lucide-react';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      toast({ title: 'Account created!', description: 'Welcome to Poolabs.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md paper-card">
        <div className="p-6 border-b-2 border-foreground/10 text-center">
          <Link to="/" className="paper-badge bg-foreground text-background border-foreground text-xs inline-flex mb-4">
            <Zap className="h-3.5 w-3.5" /> Poolabs
          </Link>
          <h1 className="font-mono-display font-bold text-xl uppercase">Create Account</h1>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="font-mono-display text-xs uppercase tracking-wider font-semibold">Full Name</label>
              <input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className="paper-input w-full" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="font-mono-display text-xs uppercase tracking-wider font-semibold">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="paper-input w-full" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="font-mono-display text-xs uppercase tracking-wider font-semibold">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="paper-input w-full" />
            </div>
            <button type="submit" className="paper-btn-primary w-full text-xs py-3" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
