import { LegalPageLayout } from '../components/LegalPageLayout';

const UPDATED = 'July 26, 2026';

export function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated={UPDATED}>
      <p>
        Tech to Store (&ldquo;Tech to Store,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy and is
        committed to protecting personal information in accordance with the
        Personal Information Protection and Electronic Documents Act (PIPEDA)
        and applicable provincial privacy laws of Canada, including those of
        Manitoba. This Privacy Policy explains how we collect, use, disclose,
        and safeguard personal information when you visit{' '}
        <a href="https://techtostore.com">techtostore.com</a> (the
        &ldquo;Site&rdquo;), use our inventory or related digital products (the
        &ldquo;Services&rdquo;), or communicate with us.
      </p>
      <p>
        By using the Site or Services, you consent to the practices described
        in this Policy. If you do not agree, please do not use the Site or
        Services.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Tech to Store is a Winnipeg, Manitoba–based business providing websites,
        local SEO, inventory systems, and cross-platform mobile applications for
        Canadian retailers and brands. Our privacy contact is:{' '}
        <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>.
        Mailing location: Winnipeg, Manitoba, Canada.
      </p>

      <h2>2. Personal information we collect</h2>
      <p>Depending on how you interact with us, we may collect:</p>
      <ul>
        <li>
          <strong className="text-ink font-semibold">Identity and contact data</strong>{' '}
          — name, email address, phone number, business name, and message
          content when you submit our contact form or email us.
        </li>
        <li>
          <strong className="text-ink font-semibold">Account data</strong> —
          email address, authentication credentials (stored via our identity
          provider), display name, and role information when you create or are
          invited to an account for our inventory or related Services.
        </li>
        <li>
          <strong className="text-ink font-semibold">Business and inventory data</strong>{' '}
          — product, stock, and operational information you or your team enter
          into the Services. Where this includes personal information about your
          customers or staff, you are responsible for having a lawful basis to
          provide it to us.
        </li>
        <li>
          <strong className="text-ink font-semibold">Technical data</strong> —
          IP address, browser type, device information, approximate location
          derived from IP, pages viewed, and similar diagnostic logs necessary
          to operate and secure the Site and Services.
        </li>
        <li>
          <strong className="text-ink font-semibold">Security verification data</strong>{' '}
          — tokens or signals from bot-protection tools (such as CAPTCHA /
          Turnstile) to reduce abuse of forms and accounts.
        </li>
      </ul>
      <p>
        We do not knowingly collect personal information from children under 13.
        If you believe we have done so, contact us and we will delete it
        promptly.
      </p>

      <h2>3. How we collect information</h2>
      <ul>
        <li>Directly from you (forms, email, account signup, support).</li>
        <li>
          Automatically through the Site and Services (cookies, local storage,
          and similar technologies where used for session, security, or
          essential functionality).
        </li>
        <li>
          From service providers that process data on our behalf (for example,
          hosting, authentication, email delivery, and form processing).
        </li>
      </ul>

      <h2>4. Purposes of use</h2>
      <p>We use personal information only for purposes a reasonable person
        would consider appropriate in the circumstances, including to:</p>
      <ul>
        <li>Respond to inquiries and provide quotes or customer support.</li>
        <li>Create and manage accounts and deliver the Services you request.</li>
        <li>Operate, maintain, secure, and improve the Site and Services.</li>
        <li>Send transactional messages (password resets, invitations, service notices).</li>
        <li>Comply with legal obligations and enforce our Terms of Service.</li>
        <li>
          With your consent or as otherwise permitted by law, send limited
          marketing communications (you may unsubscribe at any time).
        </li>
      </ul>

      <h2>5. Consent</h2>
      <p>
        We obtain consent where required by PIPEDA. Consent may be express
        (for example, submitting a form) or implied where the purpose is
        obvious and you voluntarily provide information. You may withdraw
        consent subject to legal or contractual restrictions and reasonable
        notice. Withdrawal may affect our ability to provide certain Services.
      </p>

      <h2>6. Disclosure and service providers</h2>
      <p>
        We do not sell personal information. We may disclose personal
        information to:
      </p>
      <ul>
        <li>
          Service providers who assist with hosting, authentication, databases,
          email/SMTP delivery, security, and related infrastructure (including
          providers that may process data in Canada or other jurisdictions with
          contractual privacy and security obligations).
        </li>
        <li>
          Professional advisors (legal, accounting) under confidentiality
          obligations.
        </li>
        <li>
          Authorities when required by law, court order, or to protect rights,
          safety, or property.
        </li>
        <li>
          A successor entity in connection with a merger, acquisition, or sale
          of assets, subject to appropriate privacy safeguards.
        </li>
      </ul>

      <h2>7. Cross-border transfers</h2>
      <p>
        Some service providers may store or process information outside Canada
        (including in the United States). While in another jurisdiction,
        information may be subject to the laws of that jurisdiction, including
        lawful access by foreign authorities. We take contractual and practical
        steps appropriate to the sensitivity of the information.
      </p>

      <h2>8. Retention</h2>
      <p>
        We retain personal information only as long as necessary for the
        purposes described above, or as required by law (for example, tax or
        dispute records). Contact-form submissions and account data are retained
        while needed for correspondence, service delivery, and legitimate
        business records, then securely deleted or anonymized.
      </p>

      <h2>9. Security</h2>
      <p>
        We use administrative, technical, and physical safeguards appropriate
        to the sensitivity of the information, including encrypted transport
        (HTTPS), access controls, and reputable infrastructure providers. No
        method of transmission or storage is completely secure; we cannot
        guarantee absolute security.
      </p>

      <h2>10. Your rights</h2>
      <p>
        Subject to exceptions under applicable law, you may request access to,
        correction of, or information about our use of your personal
        information. To exercise these rights, email{' '}
        <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>.
        We will respond within the timelines required by PIPEDA (generally
        within 30 days, subject to permitted extensions). You may also file a
        complaint with the Office of the Privacy Commissioner of Canada.
      </p>

      <h2>11. Cookies and similar technologies</h2>
      <p>
        We may use essential cookies or local storage for authentication,
        security, and core Site functionality. We do not use non-essential
        advertising cookies on the marketing Site without updating this Policy
        and obtaining any consent required by law. You can control cookies
        through your browser settings; disabling some cookies may affect
        functionality.
      </p>

      <h2>12. Third-party links</h2>
      <p>
        The Site may link to third-party websites (including client sites we
        have built). We are not responsible for their privacy practices. Review
        their policies before providing personal information.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update this Policy from time to time. The &ldquo;Last
        updated&rdquo; date at the top will change when we do. Continued use of
        the Site or Services after changes constitutes acceptance of the
        revised Policy, except where consent is required by law for a new
        purpose.
      </p>

      <h2>14. Contact</h2>
      <p>
        Privacy inquiries and access requests:{' '}
        <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>
        <br />
        Tech to Store — Winnipeg, Manitoba, Canada
      </p>
    </LegalPageLayout>
  );
}
