import { IconChevronDown } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';

type DetailSectionProps = {
  readonly title: string;
  readonly badge?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
};

export const DetailSection = ({
  title,
  badge,
  defaultOpen = false,
  children,
}: DetailSectionProps) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="detail-section">
      <button
        aria-expanded={open}
        className="detail-section-toggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="detail-section-toggle-label">
          <IconChevronDown
            className={`detail-section-chevron${open ? ' is-open' : ''}`}
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
          />
          <h3 className="section-title">{title}</h3>
        </span>
        {badge}
      </button>
      {open ? <div className="detail-section-body">{children}</div> : null}
    </section>
  );
};
