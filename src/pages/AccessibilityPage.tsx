import { LegalPageLayout } from '../components/LegalPageLayout';

const UPDATED = 'July 27, 2026';

export function AccessibilityPage() {
  return (
    <LegalPageLayout title="Accessibility" updated={UPDATED}>
      <p>
        Tech to Store is an initiative exploring digital tools for retailers.
        We want the Site and related interfaces to be usable by as many people
        as reasonably possible, including persons with disabilities. We work
        toward inclusive design with reference to widely used guidance such as
        the Web Content Accessibility Guidelines (WCAG), within the limits of
        this initiative. This statement describes our intent; it is not a
        certification of full compliance with any statute or guideline level.
      </p>

      <h2>1. Our approach</h2>
      <p>
        Accessibility is ongoing. We design and improve with inclusive use in
        mind and welcome feedback when something does not work as expected.
      </p>

      <h2>2. Scope</h2>
      <p>This statement applies to:</p>
      <ul>
        <li>
          Our public marketing website at{' '}
          <a href="https://techtostore.com">techtostore.com</a>, including
          contact and account-related pages.
        </li>
        <li>
          Interfaces we deliver as part of websites, inventory previews, or
          mobile work, to the extent described in a given project scope.
        </li>
      </ul>
      <p>
        Third-party platforms (for example, app stores, payment processors, or
        embeds) are outside our sole control; we configure them thoughtfully
        where we can.
      </p>

      <h2>3. Practices we strive for</h2>
      <p>Where practicable, we aim to:</p>
      <ul>
        <li>
          Use semantic HTML, meaningful labels, and keyboard-operable
          navigation for core flows.
        </li>
        <li>
          Maintain readable contrast for text and interactive elements in our
          standard layouts.
        </li>
        <li>
          Provide text alternatives for meaningful images under our control.
        </li>
        <li>
          Support responsive layouts across common desktop and mobile viewports.
        </li>
        <li>
          Avoid relying on colour alone for critical information where we can.
        </li>
        <li>
          Spot-check key journeys with keyboard navigation and, when resources
          allow, assistive technologies.
        </li>
      </ul>

      <h2>4. Known limitations</h2>
      <p>
        Some content or features may not yet meet every preference or guideline,
        including:
      </p>
      <ul>
        <li>
          Theme demos, third-party embeds, or client-supplied media that have
          not been fully reviewed.
        </li>
        <li>
          Complex tables or dashboards that may need extra labelling or
          alternative formats.
        </li>
        <li>
          PDF or image materials provided without accessible alternatives.
        </li>
      </ul>
      <p>
        We prioritize barriers that affect contacting us, signing in, and other
        essential actions.
      </p>

      <h2>5. Compatible technologies</h2>
      <p>
        The Site is intended to work with current major browsers (Chrome,
        Firefox, Safari, and Edge) and common assistive technologies. Keep your
        software updated. Some features may require JavaScript.
      </p>

      <h2>6. Feedback</h2>
      <p>
        If you meet a barrier or need information in another format, email us.
        We will review requests in good faith and respond within a reasonable
        time.
      </p>
      <ul>
        <li>
          Email:{' '}
          <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>
        </li>
      </ul>
      <p>
        Please include the page or feature, any assistive technology you use,
        and a short description of the barrier. Do not include passwords.
      </p>

      <h2>7. Other rights</h2>
      <p>
        Depending on where you live, you may have accessibility or human-rights
        protections under local law. This page does not limit those rights. You
        may contact the relevant public authority for guidance if needed.
      </p>

      <h2>8. Updates</h2>
      <p>
        We may revise this statement as the initiative grows. The &ldquo;Last
        updated&rdquo; date reflects the latest revision.
      </p>

      <h2>9. Contact</h2>
      <p>
        Accessibility feedback:{' '}
        <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>
        <br />
        Tech to Store — an initiative exploring tools for retailers
      </p>
    </LegalPageLayout>
  );
}
