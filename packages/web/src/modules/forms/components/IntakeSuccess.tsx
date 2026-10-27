import { IconCheck } from '@tabler/icons-react';

import { useTheme } from '../../../providers/theme/useTheme';

type IntakeSuccessProps = {
  /** The submission id, shortened the way the apply page shows receipts. */
  readonly reference: string;
};

// The submitted state: a big success check, reassurance copy, a reference —
// and deliberately none of the answers back.
export const IntakeSuccess = ({ reference }: IntakeSuccessProps) => {
  const { theme } = useTheme();
  return (
    <section aria-labelledby="intake-success-title" className="intake-success">
      <span aria-hidden="true" className="intake-success-badge">
        <IconCheck size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
      </span>
      <h1 className="intake-card-title" id="intake-success-title">
        You&rsquo;re all set
      </h1>
      <p className="intake-page-copy">
        Thanks — we have everything we need to set up your employment record. The Tethr team will
        take it from here and be in touch about your first day.
      </p>
      <p className="intake-success-reference">Reference {reference}</p>
    </section>
  );
};
