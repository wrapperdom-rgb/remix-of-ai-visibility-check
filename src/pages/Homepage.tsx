import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ArrowRight, Check, Search, BarChart3, FileText } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem, ParallaxSection, ScaleIn } from '@/components/ScrollAnimations';
import { motion } from 'framer-motion';

export default function Homepage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b-2 border-foreground/15 bg-background/95 backdrop-blur"
      >
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-primary tracking-tight">
            Poolabs
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <button className="paper-btn-primary text-xs py-2 px-5">Dashboard</button>
              </Link>
            ) : (
              <>
                <Link to="/sign-in" className="text-sm font-medium text-foreground hover:text-primary transition">
                  Sign In
                </Link>
                <Link to="/sign-up">
                  <button className="paper-btn text-xs py-2 px-5">Get Started</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="container py-24 md:py-36 text-center max-w-4xl mx-auto">
        <FadeInUp>
          <p className="text-sm font-medium text-muted-foreground mb-6 tracking-wide">
            AI Visibility Tracker for Startups
          </p>
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
            Is Your Startup{' '}
            <span className="text-primary">Visible in AI Search?</span>
          </h1>
        </FadeInUp>
        <FadeInUp delay={0.2}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Find out if ChatGPT, Perplexity, Claude, and Gemini mention your startup when people ask about solutions you provide.
          </p>
        </FadeInUp>
        <FadeInUp delay={0.3}>
          <Link to={user ? '/scan/new' : '/sign-up'}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="paper-btn-primary text-sm py-4 px-8 inline-flex items-center gap-2"
            >
              Check Your Startup Now <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </FadeInUp>
      </section>

      {/* How it Works */}
      <section className="container py-20 max-w-5xl mx-auto">
        <FadeInUp>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 tracking-tight">How It Works</h2>
        </FadeInUp>
        <ParallaxSection speed={0.1}>
          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: 'Enter Your Startup', desc: 'Tell us your startup name, website, and what you do.', step: '01' },
              { icon: BarChart3, title: 'AI Scans & Diagnoses', desc: "We check 4 AI platforms and identify why you're missing.", step: '02' },
              { icon: FileText, title: 'Get Action Plan', desc: 'Receive blog ideas, keywords, and specific steps to improve.', step: '03' },
            ].map((step) => (
              <StaggerItem key={step.step}>
                <motion.div whileHover={{ y: -4 }} className="paper-card paper-card-hover p-6">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Step {step.step}</span>
                  <div className="flex items-center gap-3 mt-4 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground border-2 border-foreground/20">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </ParallaxSection>
      </section>

      {/* What You Get */}
      <section className="container py-20 max-w-5xl mx-auto">
        <FadeInUp>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 tracking-tight">What You Get</h2>
        </FadeInUp>
        <StaggerContainer className="grid md:grid-cols-2 gap-5">
          {[
            { title: 'Visibility Score', desc: 'A clear 0-100 score showing how visible your startup is across AI platforms.' },
            { title: 'Diagnosis Report', desc: "Understand WHY you're not appearing — missing signals, weak content, low authority." },
            { title: 'Blog Post Ideas', desc: 'AI-generated blog topics designed to boost your visibility in AI answers.', pro: true },
            { title: 'Keyword Targets', desc: 'Specific keywords and phrases to optimize for AI search results.', pro: true },
            { title: 'Platform Strategy', desc: 'Recommendations on where to publish and how to build authority.', pro: true },
            { title: 'Progress Tracking', desc: 'Track your improvement over time with re-scans and score history.' },
          ].map((item, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ x: 4 }} className="paper-card paper-card-hover flex items-start gap-4 p-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground shrink-0 mt-0.5">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    {item.pro && (
                      <span className="paper-badge text-[10px] py-0.5 px-2 bg-primary/10 text-primary border-primary/30">Pro</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Pricing */}
      <section className="container py-20 max-w-4xl mx-auto">
        <FadeInUp>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 tracking-tight">Pricing</h2>
        </FadeInUp>
        <div className="grid md:grid-cols-2 gap-6">
          <ScaleIn>
            <div className="paper-card p-8">
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
                <button className="paper-btn-outline w-full text-xs py-3">Get Started Free</button>
              </Link>
            </div>
          </ScaleIn>

          <ScaleIn delay={0.15}>
            <div className="paper-card-blue paper-card-stacked p-8 relative">
              <div className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-semibold px-3 py-1 uppercase tracking-wider">
                Popular
              </div>
              <h3 className="font-bold text-lg mb-1">Pro</h3>
              <p className="text-4xl font-extrabold mb-6">$10<span className="text-sm font-normal opacity-70">/month</span></p>
              <div className="space-y-3 mb-8">
                {['Unlimited scans', '25 queries per scan', 'Full diagnosis', 'AI action plans', 'Blog ideas & keywords', 'Progress tracking'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4" /> {f}
                  </div>
                ))}
              </div>
              <Link to={user ? '/settings' : '/sign-up'}>
                <button className="paper-btn w-full text-xs py-3 bg-foreground text-background border-foreground hover:opacity-90 transition">
                  Upgrade to Pro
                </button>
              </Link>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* Contact */}
      <section className="container py-20 max-w-2xl mx-auto text-center">
        <FadeInUp>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Need Help?</h2>
          <p className="text-muted-foreground mb-6">Have questions or need support? Reach out to us.</p>
          <a href="mailto:wrapperdom@gmail.com" className="paper-btn-primary text-xs py-3 px-8 inline-flex items-center gap-2">
            Contact Support
          </a>
          <p className="text-xs text-muted-foreground mt-4">wrapperdom@gmail.com</p>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground/15 py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-sm mb-3">Product</h4>
              <div className="space-y-2">
                <Link to={user ? '/scan/new' : '/sign-up'} className="block text-xs text-muted-foreground hover:text-foreground transition">Start Scan</Link>
                <Link to={user ? '/settings' : '/sign-up'} className="block text-xs text-muted-foreground hover:text-foreground transition">Pricing</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Company</h4>
              <div className="space-y-2">
                <Link to="/about" className="block text-xs text-muted-foreground hover:text-foreground transition">About Us</Link>
                <Link to="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition">Privacy Policy</Link>
                <Link to="/terms" className="block text-xs text-muted-foreground hover:text-foreground transition">Terms & Conditions</Link>
                <Link to="/cookies" className="block text-xs text-muted-foreground hover:text-foreground transition">Cookies</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Support</h4>
              <div className="space-y-2">
                <a href="mailto:wrapperdom@gmail.com" className="block text-xs text-muted-foreground hover:text-foreground transition">wrapperdom@gmail.com</a>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-foreground/10 pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Poolabs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
