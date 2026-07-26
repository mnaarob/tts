import { LegalPageLayout } from '../components/LegalPageLayout';

const UPDATED = 'July 26, 2026';

export function AccessibilityPage() {
  return (
    <LegalPageLayout title="Accessibility" updated={UPDATED}>
      <p>
        Tech to Store is committed to providing a website and digital services
        that are accessible to as many people as possible, including persons
        with disabilities. We are based in Winnipeg, Manitoba, and aim to align
        our practices with the Accessibility for Manitobans Act (AMA), related
        Manitoba accessibility standards, and widely recognized web
        accessibility guidance such as the Web Content Accessibility Guidelines
        (WCAG) 2.2 Level AA, where reasonably practicable.
      </p>

      <h2>1. Our commitment</h2>
      <p>
        We believe digital tools for Canadian retailers should be usable by
        customers, staff, and partners of all abilities. Accessibility is an
        ongoing effort: we design, build, and improve with inclusive use in
        mind, and we welcome feedback when something does not work as it should.
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
          Customer-facing and staff-facing interfaces we deliver as part of
          websites, inventory systems, and mobile applications, to the extent
          set out in the applicable project scope.
        </li>
      </ul>
      <p>
        Third-party platforms (for example, app stores, payment processors, or
        embedded widgets) are outside our sole control; we select and configure
        them with accessibility in mind where we can.
      </p>

      <h2>3. Measures we take</h2>
      <p>As part of our ordinary practice, we strive to:</p>
      <ul>
        <li>
          Use semantic HTML, meaningful labels, and keyboard-operable
          navigation for core flows (including forms and primary calls to
          action).
        </li>
        <li>
          Maintain sufficient colour contrast for text and interactive elements
          in our standard design system.
        </li>
        <li>
          Provide text alternatives for meaningful images where content is
          under our control.
        </li>
        <li>
          Support readable typography and responsive layouts across common
          desktop and mobile viewports.
        </li>
        <li>
          Avoid relying on colour alone to convey critical information where
          practicable.
        </li>
        <li>
          Test key journeys with keyboard navigation and, when resources allow,
          assistive technologies.
        </li>
      </ul>

      <h2>4. Known limitations</h2>
      <p>
        Despite our efforts, some content or features may not yet fully meet
        every accessibility preference or guideline, including:
      </p>
      <ul>
        <li>
          Older theme demos, third-party embeds, or client-supplied media that
          have not been fully remediated.
        </li>
        <li>
          Complex data tables or dashboards in inventory tools that may require
          additional labelling or alternative formats.
        </li>
        <li>
          PDF or image-based materials provided by clients without accessible
          alternatives.
        </li>
      </ul>
      <p>
        We prioritize fixing barriers that affect core tasks such as contacting
        us, signing in, and completing essential account actions.
      </p>

      <h2>5. Compatible technologies</h2>
      <p>
        The Site is intended to work with current versions of major browsers
        (Chrome, Firefox, Safari, and Edge) and common assistive technologies.
        For the best experience, keep your browser and assistive software
        updated. Some features may require JavaScript.
      </p>

      <h2>6. Feedback and requests for accommodation</h2>
      <p>
        If you experience a barrier on our Site or Services, or need
        information in an alternative format, please contact us. We will review
        your request in good faith and respond within a reasonable time.
      </p>
      <ul>
        <li>
          Email:{' '}
          <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>
        </li>
        <li>Location: Winnipeg, Manitoba, Canada</li>
      </ul>
      <p>
        Please include the page or feature involved, the assistive technology
        you use (if any), and a description of the barrier. Do not include
        sensitive passwords in your message.
      </p>

      <h2>7. Formal complaints</h2>
      <p>
        If you are not satisfied with our response regarding an accessibility
        matter, you may have rights under The Accessibility for Manitobans Act,
        The Manitoba Human Rights Code, or other applicable Canadian law. You
        may also contact the Manitoba Human Rights Commission or other
        competent authority for guidance on filing a complaint.
      </p>

      <h2>8. Continuous improvement</h2>
      <p>
        We review this statement when we make material changes to the Site or
        our accessibility practices. The &ldquo;Last updated&rdquo; date above
        reflects the latest revision.
      </p>

      <h2>9. Contact</h2>
      <p>
        Accessibility feedback:{' '}
        <a href="mailto:contact@techtostore.com">contact@techtostore.com</a>
        <br />
        Tech to Store — Winnipeg, Manitoba, Canada
      </p>
    </LegalPageLayout>
  );
}
