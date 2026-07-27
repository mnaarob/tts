import { LegalPageLayout } from '../components/LegalPageLayout';

const UPDATED = 'July 27, 2026';

export function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated={UPDATED}>
      <p>
        Tech to Store (&ldquo;Tech to Store,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is an initiative exploring
        digital tools for retailers. This Privacy Policy explains how we handle
        personal information when you visit{' '}
        <a href="https://techtostore.com">techtostore.com</a> (the
        &ldquo;Site&rdquo;), try related product previews or accounts (the
        &ldquo;Services&rdquo;), or contact us. It is written for transparency
        and is not legal advice.
      </p>
      <p>
        By using the Site or Services, you acknowledge this Policy. If you do
        not agree, please do not use the Site or Services or send us personal
        information.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Tech to Store is an initiative operated under that name. Privacy
        questions:{' '}
        <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>.
      </p>

      <h2>2. Personal information we may collect</h2>
      <p>Depending on how you interact with us, we may collect:</p>
      <ul>
        <li>
          <strong className="text-ink font-semibold">Identity and contact data</strong>{' '}
          — name, email address, phone number, business or store name, and
          message content when you use our contact form or email us.
        </li>
        <li>
          <strong className="text-ink font-semibold">Account data</strong> —
          email address, authentication credentials (stored by our identity
          provider), display name, and role information if you create or are
          invited to a preview or inventory-related account.
        </li>
        <li>
          <strong className="text-ink font-semibold">Operational data you enter</strong>{' '}
          — product, stock, or related information you choose to enter. If that
          includes personal information about your customers or staff, you are
          responsible for having a lawful basis to provide it.
        </li>
        <li>
          <strong className="text-ink font-semibold">Technical data</strong> —
          IP address, browser type, device information, approximate location
          derived from IP, pages viewed, and similar logs used to operate and
          secure the Site and Services.
        </li>
        <li>
          <strong className="text-ink font-semibold">Security verification data</strong>{' '}
          — tokens or signals from bot-protection tools (such as CAPTCHA /
          Turnstile) to reduce abuse.
        </li>
      </ul>
      <p>
        We do not knowingly collect personal information from children under 13.
        If you believe we have, contact us and we will delete it where
        reasonably practicable.
      </p>

      <h2>3. How we collect information</h2>
      <ul>
        <li>Directly from you (forms, email, account signup).</li>
        <li>
          Automatically through the Site and Services (cookies, local storage,
          and similar technologies used for session, security, or essential
          functionality).
        </li>
        <li>
          From service providers that process data on our behalf (for example,
          hosting, authentication, and email delivery).
        </li>
      </ul>

      <h2>4. Purposes of use</h2>
      <p>
        We use personal information for limited, stated purposes, including to:
      </p>
      <ul>
        <li>Respond to inquiries and discuss possible project work.</li>
        <li>Create and manage accounts and operate the Services you request.</li>
        <li>Operate, maintain, secure, and improve the Site and Services.</li>
        <li>Send transactional messages (password resets, invitations, notices).</li>
        <li>Comply with law and enforce our Terms of Use.</li>
        <li>
          With your consent or as otherwise permitted by applicable law, send
          occasional updates (you may ask us to stop).
        </li>
      </ul>

      <h2>5. Consent and privacy expectations</h2>
      <p>
        Where privacy law applies to our activities, we seek to obtain
        meaningful consent and to collect, use, and disclose personal
        information only for purposes a reasonable person would consider
        appropriate. Consent may be express (for example, submitting a form) or
        implied where the purpose is obvious and you voluntarily provide
        information. You may withdraw consent subject to legal or contractual
        limits and reasonable notice; withdrawal may affect our ability to
        respond or provide certain Services.
      </p>

      <h2>6. Disclosure and service providers</h2>
      <p>
        We do not sell personal information. We may share personal information
        with:
      </p>
      <ul>
        <li>
          Service providers who help with hosting, authentication, databases,
          email delivery, security, and related infrastructure (including
          providers that may process data in more than one country).
        </li>
        <li>
          Professional advisors under confidentiality expectations, if engaged.
        </li>
        <li>
          Authorities when required by law or to protect rights, safety, or
          property.
        </li>
        <li>
          A successor operator if this initiative is later reorganized or
          transferred, with privacy safeguards appropriate to the project.
        </li>
      </ul>

      <h2>7. Cross-border transfers</h2>
      <p>
        Some providers may store or process information outside your home
        country. While abroad, information may be subject to the laws of that
        place, including lawful access by authorities. We choose providers with
        care relative to the sensitivity of the information and the stage of
        this initiative.
      </p>

      <h2>8. Retention</h2>
      <p>
        We keep personal information only as long as needed for the purposes
        above, or as required by law. Contact messages and account data are
        retained while useful for correspondence or operating the Services, then
        deleted or anonymized when reasonably practicable.
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable safeguards for an initiative of this kind, including
        encrypted transport (HTTPS) and access controls via reputable providers.
        No method of transmission or storage is completely secure; we cannot
        promise absolute security.
      </p>

      <h2>10. Your choices and requests</h2>
      <p>
        Subject to applicable law, you may ask about access to or correction of
        your personal information by emailing{' '}
        <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>.
        We will respond in good faith within a reasonable time. You may also
        contact a privacy regulator that applies to you for guidance.
      </p>

      <h2>11. Cookies and similar technologies</h2>
      <p>
        We may use essential cookies or local storage for authentication,
        security, and core Site functionality. We do not intend to use
        non-essential advertising cookies on the marketing Site without updating
        this Policy. You can control cookies in your browser; disabling some may
        affect functionality.
      </p>

      <h2>12. Third-party links</h2>
      <p>
        The Site may link to third-party websites (including example projects).
        We are not responsible for their privacy practices. Review their
        policies before providing personal information.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update this Policy as the initiative evolves. The &ldquo;Last
        updated&rdquo; date will change when we do. Continued use after posting
        changes means you acknowledge the revised Policy, except where
        additional consent is required by law.
      </p>

      <h2>14. Contact</h2>
      <p>
        Privacy questions:{' '}
        <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>
        <br />
        Tech to Store — an initiative exploring tools for retailers
      </p>
    </LegalPageLayout>
  );
}
