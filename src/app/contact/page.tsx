'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-surface-400">Loading...</div>}>
      <ContactContent />
    </Suspense>
  );
}

function ContactContent() {
  const searchParams = useSearchParams();
  const serviceInterest = searchParams.get('service') || '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    service_interest: serviceInterest,
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '', service_interest: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="py-16">
      <div className="section-container">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold">
                Get In <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-surface-400 leading-relaxed">
                Have a project in mind? Want to discuss a custom website? Or just
                want to say hi? Fill out the form and I&apos;ll get back to you
                within 24 hours.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'contact@erictomchik.com' },
                { icon: Clock, label: 'Response Time', value: 'Within 24 hours' },
                { icon: MapPin, label: 'Location', value: 'United States' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-600/20
                                  flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-sm text-surface-400">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-3">
            {status === 'sent' ? (
              <div className="card p-12 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Message Sent!</h2>
                <p className="text-surface-400">
                  Thanks for reaching out. I&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-secondary mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-surface-300 mb-2">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-700
                                 text-white placeholder-surface-500 focus:border-brand-500
                                 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-700
                                 text-white placeholder-surface-500 focus:border-brand-500
                                 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-surface-300 mb-2">
                    Interested In
                  </label>
                  <select
                    id="service"
                    value={form.service_interest}
                    onChange={(e) => setForm({ ...form, service_interest: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-700
                               text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500
                               outline-none transition-colors"
                  >
                    <option value="">Select a service (optional)</option>
                    <option value="starter">Starter Site</option>
                    <option value="business-pro">Business Pro</option>
                    <option value="custom-app">Custom Application</option>
                    <option value="other">Other / General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-surface-300 mb-2">
                    Subject *
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-700
                               text-white placeholder-surface-500 focus:border-brand-500
                               focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-surface-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-surface-700
                               text-white placeholder-surface-500 focus:border-brand-500
                               focus:ring-1 focus:ring-brand-500 outline-none transition-colors resize-none"
                    placeholder="Tell me about your project or question..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <p className="text-red-400 text-sm text-center">
                    Something went wrong. Please try again or email directly.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
