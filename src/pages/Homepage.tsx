import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ArrowRight, Check, Zap, Search, BarChart3, Target, TrendingUp, FileText } from 'lucide-react';

export default function Homepage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-primary tracking-tight">
            Poolabs
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <button className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link to="/sign-in" className="text-sm font-medium text-foreground hover:text-primary transition">
                  Sign In
                </Link>
                <Link to="/sign-up">
                  <button className="px-5 py-2 text-sm font-semibold rounded-lg border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-36 text-center max-w-4xl mx-auto">
        <p className="text-sm font-medium text-muted-foreground mb-6 tracking-wide">
          AI Visibility Tracker for Startups
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
          Is Your Startup{' '}
          <span className="text-primary">Visible in AI Search?</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Find out if ChatGPT, Perplexity, Claude, and Gemini mention your startup when people ask about solutions you provide.
        </p>
        <Link to={user ? '/scan/new' : '/sign-up'}>
          <button className="px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-[hsl(190,80%,50%)] text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            Check Your Startup Now <ArrowRight className="h-5 w-5 inline ml-2" />
          </button>
        </Link>
      </section>

      {/* How it Works */}
      <section className="container py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 tracking-tight">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: 'Enter Your Startup', desc: 'Tell us your startup name, website, and what you do.', step: '01' },
            { icon: BarChart3, title: 'AI Scans & Diagnoses', desc: "We check 4 AI platforms and identify why you're missing.", step: '02' },
            { icon: FileText, title: 'Get Action Plan', desc: 'Receive blog ideas, keywords, and specific steps to improve.', step: '03' },
          ].map((step) => (
            <div key={step.step} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Step {step.step}</span>
              <div className="flex items-center gap-3 mt-4 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className="container py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 tracking-tight">What You Get</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: 'Visibility Score', desc: 'A clear 0-100 score showing how visible your startup is across AI platforms.' },
            { title: 'Diagnosis Report', desc: "Understand WHY you're not appearing — missing signals, weak content, low authority." },
            { title: 'Blog Post Ideas', desc: 'AI-generated blog topics designed to boost your visibility in AI answers.', pro: true },
            { title: 'Keyword Targets', desc: 'Specific keywords and phrases to optimize for AI search results.', pro: true },
            { title: 'Platform Strategy', desc: 'Recommendations on where to publish and how to build authority.', pro: true },
            { title: 'Progress Tracking', desc: 'Track your improvement over time with re-scans and score history.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  {item.pro && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">Pro</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 tracking-tight">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <h3 className="font-bold text-lg mb-1">Free</h3>
            <p className="text-4xl font-extrabold mb-6">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <div className="space-y-3 mb-8">
              {['2 scans/month', '10 queries per scan', 'Visibility score', 'Basic diagnosis', 'Top actions'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </div>
              ))}
            </div>
            <Link to="/sign-up" className="block">
              <button className="w-full py-3 text-sm font-semibold rounded-xl border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-primary rounded-2xl p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-background/20 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
              Popular
            </div>
            <h3 className="font-bold text-lg mb-1">Pro</h3>
            <p className="text-4xl font-extrabold mb-6">$29<span className="text-sm font-normal opacity-70">/month</span></p>
            <div className="space-y-3 mb-8">
              {['Unlimited scans', '25 queries per scan', 'Full diagnosis', 'AI action plans', 'Blog ideas & keywords', 'Progress tracking'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4" /> {f}
                </div>
              ))}
            </div>
            <button className="w-full py-3 text-sm font-semibold rounded-xl bg-background/20 text-primary-foreground opacity-70 cursor-not-allowed backdrop-blur-sm" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Poolabs. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
