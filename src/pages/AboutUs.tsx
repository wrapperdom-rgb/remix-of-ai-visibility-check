import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Target, Users } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem, ParallaxSection } from '@/components/ScrollAnimations';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b-2 border-foreground/15 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </header>
      <div className="container max-w-3xl py-16">
        <FadeInUp>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">About Poolabs</h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            We help startups understand and improve their presence in AI-powered search — the new frontier of discovery.
          </p>
        </FadeInUp>

        <ParallaxSection speed={0.15}>
          <StaggerContainer className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Target, title: 'Our Mission', desc: 'Make AI visibility accessible to every startup founder, not just SEO experts.' },
              { icon: Zap, title: 'Why Now', desc: "AI search is replacing traditional search. If AI doesn't mention you, you don't exist." },
              { icon: Users, title: 'Who We Serve', desc: 'Startup founders, indie hackers, and small teams building the future.' },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="paper-card paper-card-hover p-6 text-center">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </ParallaxSection>

        <FadeInUp>
          <div className="paper-card p-8 space-y-4">
            <h2 className="text-xl font-extrabold">The Problem</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every day, millions of people ask AI tools like ChatGPT, Perplexity, and Claude for product recommendations. If your startup isn't in those answers, you're invisible to a rapidly growing audience.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Traditional SEO won't save you. AI models don't just look at search rankings — they synthesize information from blogs, directories, reviews, community discussions, and structured data. Poolabs helps you understand exactly what signals you're missing and gives you a concrete plan to fix it.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">Questions? Reach out anytime.</p>
            <a href="mailto:wrapperdom@gmail.com" className="paper-btn-primary text-xs py-3 px-8 inline-flex items-center gap-2">
              Contact Us
            </a>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
