type IntakeUnavailableProps = {
  readonly title: string;
  readonly description: string;
};

// The branded dead-end states — an expired or invalid link, or a link that
// opens some other kind of form — with the help contact as the way out.
export const IntakeUnavailable = ({ title, description }: IntakeUnavailableProps) => (
  <section aria-labelledby="intake-unavailable-title" className="intake-unavailable">
    <h1 className="intake-card-title" id="intake-unavailable-title">
      {title}
    </h1>
    <p className="intake-page-copy">{description}</p>
    <p className="intake-page-copy">
      Need help? Email{' '}
      <a className="intake-help-email" href="mailto:hr@tethrhq.com">
        hr@tethrhq.com
      </a>{' '}
      and we will sort it out.
    </p>
  </section>
);
