import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Zap, Search, BarChart3, Target, TrendingUp, FileText } from 'lucide-react';

export default function Homepage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b-2 border-foreground/90 bg-card">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="paper-badge bg-foreground text-background border-foreground">
            <Zap className="h-3.5 w-3.5" /> Poolabs
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <button className="paper-btn text-xs py-2 px-4">Dashboard</button>
              </Link>
            ) : (
              <>
                <Link to="/sign-in">
                  <button className="paper-btn-outline text-xs py-2 px-4">Sign In</button>
                </Link>
                <Link to="/sign-up">
                  <button className="paper-btn text-xs py-2 px-4">Get Started</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left side - headline */}
          <div>
            <span className="paper-badge-primary mb-6 inline-flex">
              <Zap className="h-3 w-3" /> AI-Powered
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 font-mono-display uppercase">
              Make Your Startup{' '}
              <span className="text-primary">Visible in AI</span>
            </h1>
            <div className="paper-card p-4 mb-8 max-w-lg">
              <p className="font-mono-display text-sm leading-relaxed">
                Find out if ChatGPT, Perplexity, Claude, and Gemini mention your startup. Get actionable steps to improve your AI visibility.
              </p>
            </div>
            <Link to={user ? '/scan/new' : '/sign-up'}>
              <button className="paper-btn-primary text-sm py-4 px-8 flex items-center gap-2">
                Start Now <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Right side - stats card */}
          <div className="paper-card-blue paper-card-stacked p-6 md:p-8">
            <div className="space-y-6">
              <div className="border-b border-primary-foreground/20 pb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="h-5 w-5" />
                  <span className="text-3xl md:text-4xl font-extrabold font-mono-display">0-100</span>
                </div>
                <p className="font-mono-display text-xs uppercase tracking-widest opacity-80">Visibility Score</p>
              </div>
              <div className="border-b border-primary-foreground/20 pb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-5 w-5" />
                  <span className="text-3xl md:text-4xl font-extrabold font-mono-display">AI</span>
                </div>
                <p className="font-mono-display text-xs uppercase tracking-widest opacity-80">Diagnosis & Actions</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-3xl md:text-4xl font-extrabold font-mono-display">100%</span>
                </div>
                <p className="font-mono-display text-xs uppercase tracking-widest opacity-80">Actionable</p>
              </div>
            </div>
            <Link to={user ? '/scan/new' : '/sign-up'} className="block mt-6">
              <button className="paper-btn text-xs py-3 px-6 w-full text-center bg-foreground text-background border-foreground">
                Start Free <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold font-mono-display uppercase text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Search, title: 'Enter Your Startup', desc: 'Tell us your startup name, website, and what you do.', step: '01' },
            { icon: BarChart3, title: 'AI Scans & Diagnoses', desc: 'We check 4 AI platforms and identify why you\'re missing.', step: '02' },
            { icon: FileText, title: 'Get Action Plan', desc: 'Receive blog ideas, keywords, and specific steps to improve.', step: '03' },
          ].map((step) => (
            <div key={step.step} className="paper-card paper-card-hover p-6">
              <span className="font-mono-display text-xs text-muted-foreground uppercase tracking-widest">Step {step.step}</span>
              <div className="flex items-center gap-3 mt-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground border-2 border-foreground/90 rounded-sm">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold font-mono-display uppercase text-center mb-12">What You Get</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { title: 'Visibility Score', desc: 'A clear 0-100 score showing how visible your startup is across AI platforms.' },
            { title: 'Diagnosis Report', desc: 'Understand WHY you\'re not appearing — missing signals, weak content, low authority.' },
            { title: 'Blog Post Ideas', desc: 'AI-generated blog topics designed to boost your visibility in AI answers.' },
            { title: 'Keyword Targets', desc: 'Specific keywords and phrases to optimize for AI search results.' },
            { title: 'Platform Strategy', desc: 'Recommendations on where to publish and how to build authority.' },
            { title: 'Progress Tracking', desc: 'Track your improvement over time with re-scans and score history.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 paper-card p-4">
              <div className="flex h-6 w-6 items-center justify-center bg-primary text-primary-foreground rounded-sm shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold font-mono-display uppercase text-center mb-12">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="paper-card p-6">
            <h3 className="font-mono-display font-bold text-lg uppercase mb-1">Free</h3>
            <p className="text-3xl font-extrabold font-mono-display mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <div className="space-y-2 mb-6">
              {['2 scans/month', '10 queries per scan', 'Visibility score', 'Basic diagnosis', 'Top actions'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </div>
              ))}
            </div>
            <Link to="/sign-up" className="block">
              <button className="paper-btn-outline w-full text-xs py-3">Get Started Free</button>
            </Link>
          </div>

          {/* Pro */}
          <div className="paper-card-blue p-6 relative">
            <div className="absolute top-0 right-0 bg-foreground text-background text-xs font-mono-display font-semibold px-3 py-1 uppercase tracking-wider">
              Popular
            </div>
            <h3 className="font-mono-display font-bold text-lg uppercase mb-1">Pro</h3>
            <p className="text-3xl font-extrabold font-mono-display mb-4">$29<span className="text-sm font-normal opacity-70">/month</span></p>
            <div className="space-y-2 mb-6">
              {['Unlimited scans', '25 queries per scan', 'Full diagnosis', 'AI action plans', 'Blog ideas & keywords', 'Progress tracking'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4" /> {f}
                </div>
              ))}
            </div>
            <button className="paper-btn w-full text-xs py-3 bg-foreground text-background border-foreground opacity-70 cursor-not-allowed" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground/90 py-8">
        <div className="container text-center font-mono-display text-xs text-muted-foreground uppercase tracking-wider">
          © {new Date().getFullYear()} Poolabs. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
