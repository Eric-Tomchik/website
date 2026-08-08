import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for erictomchik.com — how we collect, use, and protect your information.',
  alternates: {
    canonical: 'https://erictomchik.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="section-container max-w-3xl">
        <h1 className="text-4xl font-extrabold text-white mb-8">Privacy Policy</h1>
        <p className="text-surface-400 mb-8">Last updated: May 6, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-surface-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong className="text-white">Contact information</strong> — name, email address, and message content when you use our contact form.</li>
              <li><strong className="text-white">Purchase information</strong> — name, email, shipping address, and payment details when you buy books. Payment processing is handled securely by Stripe and PayPal; we do not store your full credit card number.</li>
              <li><strong className="text-white">Account information</strong> — email and password when you create a client portal account.</li>
              <li><strong className="text-white">Merchant services information</strong> — business name, contact details, estimated card volume, and, if you choose to provide one, a credit card processing statement you upload when requesting a free processing analysis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review an uploaded processing statement solely to prepare the free processing analysis you requested. Uploaded statements are stored privately, are never publicly accessible, are not sold or shared for marketing, and are deleted on request &mdash; email info@erictomchik.com and we will remove the file.</li>
              <li>Process and fulfill orders for books and digital products.</li>
              <li>Provide access to the client portal and project management services.</li>
              <li>Respond to your inquiries and contact form submissions.</li>
              <li>Send transactional emails (order confirmations, download links).</li>
              <li>Improve our website and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong className="text-white">Stripe & PayPal</strong> — for secure payment processing.</li>
              <li><strong className="text-white">Convex</strong> — for data storage and real-time features.</li>
              <li><strong className="text-white">Google Analytics</strong> — for anonymous website usage analytics.</li>
              <li><strong className="text-white">Resend</strong> — for transactional email delivery.</li>
              <li><strong className="text-white">Cloudflare</strong> — for website hosting and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
            <p>
              We use essential cookies to maintain your session when logged into the admin or client portal.
              Google Analytics uses cookies to collect anonymous usage data. You can disable cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information, including
              encrypted connections (HTTPS), secure password hashing, and httpOnly session cookies.
              However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or deletion of your personal data.</li>
              <li>Opt out of marketing communications.</li>
              <li>Request a copy of your data in a portable format.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 13. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:info@erictomchik.com" className="text-brand-400 hover:text-brand-300">
                info@erictomchik.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
