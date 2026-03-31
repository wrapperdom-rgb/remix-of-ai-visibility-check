import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Zap, BarChart3, ArrowRight, Check } from 'lucide-react';

const socialProof = [
  'A developer tool just scored 23/100',
  'An AI writing assistant scored 67/100',
  'A project management app scored 41/100',
  'A design collaboration tool scored 12/100',
  'A marketing automation platform scored 55/100',
];

export default function Homepage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gradient">
            Poolabs
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/sign-up">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 md:py-32 text-center">
        <Badge variant="secondary" className="mb-6">AI Visibility Tracker for Startups</Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Is Your Startup{' '}
          <span className="text-gradient">Visible in AI Search?</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Find out if ChatGPT, Perplexity, Claude, and Gemini mention your startup when people ask about solutions you provide.
        </p>
        <Link to={user ? '/scan/new' : '/sign-up'}>
          <Button size="lg" className="gap-2 text-base px-8 py-6 gradient-hero border-0">
            Check Your Startup Now <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* How it Works */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Search, title: 'Enter Your Startup', desc: 'Tell us your startup name, website, and what you do.' },
            { icon: Zap, title: 'We Generate Queries', desc: 'We create the exact questions your potential users ask AI tools.' },
            { icon: BarChart3, title: 'Get Your Visibility Score', desc: "See where you appear, where you don't, and how to fix it." },
          ].map((step, i) => (
            <Card key={i} className="text-center border-0 bg-card shadow-sm">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-hero">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">Step {i + 1}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="container py-12">
        <div className="max-w-2xl mx-auto space-y-3">
          {socialProof.map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <p className="text-3xl font-bold">$0<span className="text-base font-normal text-muted-foreground">/month</span></p>
            </CardHeader>
            <CardContent className="space-y-3">
              {['2 scans/month', '10 queries per scan', 'Basic visibility score', 'Platform breakdown'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </div>
              ))}
              <Link to="/sign-up" className="block pt-4">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-2 border-primary bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 gradient-hero text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Pro</CardTitle>
              <p className="text-3xl font-bold">$29<span className="text-base font-normal text-muted-foreground">/month</span></p>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Unlimited scans', '25 queries per scan', 'Competitor analysis', 'Improvement suggestions', 'Shareable reports'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </div>
              ))}
              <Button className="w-full mt-4 gradient-hero border-0" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Poolabs. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
