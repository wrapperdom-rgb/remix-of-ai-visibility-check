import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FadeInUp } from '@/components/ScrollAnimations';

export default function TermsAndConditions() {
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Terms & Conditions</h1>
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p className="text-xs text-muted-foreground">Last updated: April 4, 2026</p>

            <h2 className="text-lg font-bold text-foreground">1. Service Description</h2>
            <p>Poolabs provides AI visibility analysis for startups. We scan multiple AI platforms to determine if and how your startup is mentioned in AI-generated responses.</p>

            <h2 className="text-lg font-bold text-foreground">2. Account Terms</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>One person or legal entity may not maintain more than one free account.</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground">3. Payment Terms</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pro plan is billed at $10/month through Dodo Payments.</li>
              <li>You can cancel your subscription at any time.</li>
              <li>Refunds are available within 7 days of purchase if no scans have been used.</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground">4. Acceptable Use</h2>
            <p>You agree not to misuse our service, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Running automated scans without authorization.</li>
              <li>Attempting to manipulate or game visibility scores.</li>
              <li>Using the service for any illegal purpose.</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground">5. Limitation of Liability</h2>
            <p>Poolabs provides visibility data on a best-effort basis. AI platform responses change frequently and we cannot guarantee specific outcomes from following our recommendations.</p>

            <h2 className="text-lg font-bold text-foreground">6. Changes to Terms</h2>
            <p>We may update these terms. Continued use of the service constitutes acceptance of updated terms.</p>

            <h2 className="text-lg font-bold text-foreground">7. Contact</h2>
            <p>Questions about these terms: <a href="mailto:wrapperdom@gmail.com" className="text-primary hover:underline">wrapperdom@gmail.com</a></p>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
