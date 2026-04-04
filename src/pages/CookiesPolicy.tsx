import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FadeInUp } from '@/components/ScrollAnimations';

export default function CookiesPolicy() {
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Cookies Policy</h1>
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p className="text-xs text-muted-foreground">Last updated: April 4, 2026</p>

            <h2 className="text-lg font-bold text-foreground">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.</p>

            <h2 className="text-lg font-bold text-foreground">How We Use Cookies</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Essential Cookies:</strong> Required for authentication and core functionality. These cannot be disabled.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences like theme settings.</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground">Cookies We Don't Use</h2>
            <p>We do <strong>not</strong> use:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Third-party advertising cookies</li>
              <li>Cross-site tracking cookies</li>
              <li>Social media tracking cookies</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground">Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from using the service.</p>

            <h2 className="text-lg font-bold text-foreground">Contact</h2>
            <p>Questions about our cookie usage: <a href="mailto:wrapperdom@gmail.com" className="text-primary hover:underline">wrapperdom@gmail.com</a></p>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
