import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FadeInUp } from '@/components/ScrollAnimations';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Privacy Policy</h1>
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p className="text-xs text-muted-foreground">Last updated: April 4, 2026</p>

            <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
            <p>When you use Poolabs, we collect the following information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Email address, name, and password when you create an account.</li>
              <li><strong>Startup Data:</strong> Startup name, website URL, and description you provide for scans.</li>
              <li><strong>Usage Data:</strong> Scan history, visibility scores, and interaction data.</li>
              <li><strong>Payment Data:</strong> Processed securely through Dodo Payments. We do not store card details.</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve our AI visibility scanning service.</li>
              <li>To generate personalized action plans and recommendations.</li>
              <li>To process payments and manage your subscription.</li>
              <li>To send important service updates (no marketing spam).</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground">3. Data Sharing</h2>
            <p>We do not sell your data. We share information only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>AI model providers (anonymized queries only) for visibility analysis.</li>
              <li>Payment processor (Dodo Payments) for subscription management.</li>
            </ul>

            <h2 className="text-lg font-bold text-foreground">4. Data Security</h2>
            <p>We use industry-standard encryption and security measures. All data is stored securely with row-level access controls ensuring you can only access your own data.</p>

            <h2 className="text-lg font-bold text-foreground">5. Your Rights</h2>
            <p>You can request data export or deletion at any time by contacting us at <a href="mailto:wrapperdom@gmail.com" className="text-primary hover:underline">wrapperdom@gmail.com</a>.</p>

            <h2 className="text-lg font-bold text-foreground">6. Contact</h2>
            <p>For privacy-related inquiries: <a href="mailto:wrapperdom@gmail.com" className="text-primary hover:underline">wrapperdom@gmail.com</a></p>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
