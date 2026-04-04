import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ScrollAnimations';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ContactUs() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:wrapperdom@gmail.com?subject=Poolabs Support - ${form.name}&body=${encodeURIComponent(form.message)}%0A%0AFrom: ${form.email}`;
    toast({ title: 'Opening email client...', description: 'Your message will be sent via email.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b-2 border-foreground/15 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </header>
      <div className="container max-w-2xl py-16">
        <FadeInUp>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Contact Us</h1>
          <p className="text-muted-foreground mb-10">Have a question, feedback, or need support? We'd love to hear from you.</p>
        </FadeInUp>

        <StaggerContainer className="grid md:grid-cols-2 gap-6 mb-10">
          <StaggerItem>
            <div className="paper-card p-6 text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Email Support</h3>
              <a href="mailto:wrapperdom@gmail.com" className="text-xs text-primary hover:underline">wrapperdom@gmail.com</a>
              <p className="text-xs text-muted-foreground mt-2">We respond within 24 hours</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="paper-card p-6 text-center">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-sm mb-1">Quick Question?</h3>
              <p className="text-xs text-muted-foreground mt-2">Use the form below and we'll get back to you ASAP</p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <FadeInUp delay={0.2}>
          <form onSubmit={handleSubmit} className="paper-card p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="paper-input w-full mt-1"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="paper-input w-full mt-1"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="paper-input w-full mt-1 resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button type="submit" className="paper-btn-primary text-xs py-3 px-6 w-full">
              Send Message
            </button>
          </form>
        </FadeInUp>
      </div>
    </div>
  );
}
