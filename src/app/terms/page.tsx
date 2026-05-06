import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for erictomchik.com — usage terms, policies, and conditions.',
};

export default function TermsPage() {
  return (
    <div className="py-16">
      <div className="section-container max-w-3xl">
        <h1 className="text-4xl font-extrabold text-white mb-8">Terms of Service</h1>
        <p className="text-surface-400 mb-8">Last updated: May 6, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-surface-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using erictomchik.com (&quot;the Website&quot;), you accept and agree to be
              bound by these Terms of Service. If you do not agree to these terms, please do not use the Website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Products and Services</h2>
            <p>We offer the following products and services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong className="text-white">Books</strong> — Physical and digital books published by ArcLight Press, available for purchase through the Website.</li>
              <li><strong className="text-white">Web Development Services</strong> — Custom website design and development services, subject to separate service agreements.</li>
              <li><strong className="text-white">Client Portal</strong> — A project management portal for active clients.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Purchases and Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All prices are listed in US Dollars (USD).</li>
              <li>Payments are processed securely through Stripe and/or PayPal.</li>
              <li>Digital products are delivered via time-limited download links after purchase.</li>
              <li>Physical products are shipped to the address provided at checkout.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Digital Products</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Digital books are licensed for personal, non-commercial use only.</li>
              <li>Download links expire after 72 hours and are limited to 5 downloads per purchase.</li>
              <li>Digital files are watermarked with purchaser information for piracy prevention.</li>
              <li>Redistribution, sharing, or resale of digital products is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Refund Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Digital products:</strong> Due to the nature of digital goods, refunds are generally not available once a download link has been accessed. If you experience technical issues, please contact us.</li>
              <li><strong className="text-white">Physical products:</strong> If you receive a damaged or defective book, contact us within 14 days for a replacement or refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Intellectual Property</h2>
            <p>
              All content on this Website — including text, images, code, books, and design — is the property
              of Eric Tomchik or its content suppliers and is protected by copyright and intellectual property laws.
              You may not reproduce, distribute, or create derivative works without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Client Portal</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access to the client portal requires an account created by the site administrator.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>Portal access may be revoked at any time upon project completion or termination.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>
              The Website and its content are provided &quot;as is&quot; without warranties of any kind.
              Eric Tomchik shall not be liable for any indirect, incidental, special, or consequential
              damages arising from your use of the Website or purchase of products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately
              upon posting to the Website. Continued use of the Website after changes constitutes acceptance
              of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
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
