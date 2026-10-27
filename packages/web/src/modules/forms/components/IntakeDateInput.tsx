import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

type IntakeDateInputProps = {
  readonly id: string;
  readonly name: string;
  readonly value: string;
  readonly required: boolean;
  readonly invalidAttributes: Record<string, unknown>;
  readonly onChange: (isoValue: string) => void;
  readonly onBlur: () => void;
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const pad2 = (n: number): string => String(n).padStart(2, '0');

const isoToDate = (iso: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
};

const toDisplay = (iso: string): string => {
  const d = isoToDate(iso);
  if (!d) return '';
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const formatAsYouType = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const parseDisplay = (text: string): string => {
  const digits = text.replace(/\D/g, '');
  if (digits.length < 8) return '';
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
};

const getMonthGrid = (year: number, month: number): (number | null)[][] => {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

const thisYear = new Date().getFullYear();

type View = 'days' | 'months' | 'years';

export const IntakeDateInput = ({
  id,
  name,
  value,
  required,
  invalidAttributes,
  onChange,
  onBlur,
}: IntakeDateInputProps) => {
  const selected = isoToDate(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('days');
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? thisYear);
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? new Date().getMonth());
  const [yearPageStart, setYearPageStart] = useState(Math.floor((selected?.getFullYear() ?? thisYear) / 12) * 12);
  const [inputText, setInputText] = useState(toDisplay(value));
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputText(toDisplay(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: globalThis.MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setView('days');
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const handleInputChange = (raw: string): void => {
    const formatted = formatAsYouType(raw);
    setInputText(formatted);
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 8) {
      const iso = parseDisplay(formatted);
      if (isoToDate(iso)) onChange(iso);
    } else if (digits.length === 0) {
      onChange('');
    }
  };

  const openCalendar = (): void => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
    setView('days');
    setOpen(true);
  };

  const pickDay = (day: number, e: ReactMouseEvent): void => {
    e.preventDefault();
    onChange(`${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`);
    setOpen(false);
    setView('days');
    inputRef.current?.focus();
  };

  const pickMonth = (m: number, e: ReactMouseEvent): void => {
    e.preventDefault();
    setViewMonth(m);
    setView('days');
  };

  const pickYear = (y: number, e: ReactMouseEvent): void => {
    e.preventDefault();
    setViewYear(y);
    setView('months');
  };

  const prevMonth = (e: ReactMouseEvent): void => {
    e.preventDefault();
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = (e: ReactMouseEvent): void => {
    e.preventDefault();
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleHeaderClick = (e: ReactMouseEvent): void => {
    e.preventDefault();
    if (view === 'days') {
      setView('months');
    } else if (view === 'months') {
      setYearPageStart(Math.floor(viewYear / 12) * 12);
      setView('years');
    }
  };

  const handlePrev = (e: ReactMouseEvent): void => {
    e.preventDefault();
    if (view === 'days') prevMonth(e);
    else if (view === 'months') setViewYear((y) => y - 1);
    else setYearPageStart((s) => s - 12);
  };

  const handleNext = (e: ReactMouseEvent): void => {
    e.preventDefault();
    if (view === 'days') nextMonth(e);
    else if (view === 'months') setViewYear((y) => y + 1);
    else setYearPageStart((s) => s + 12);
  };

  const today = new Date();
  const weeks = getMonthGrid(viewYear, viewMonth);

  const headerLabel =
    view === 'days'
      ? `${MONTHS_FULL[viewMonth]} ${viewYear}`
      : view === 'months'
        ? `${viewYear}`
        : `${yearPageStart} – ${yearPageStart + 11}`;

  return (
    <div className="intake-date-wrapper" ref={containerRef}>
      <input type="hidden" name={name} value={value} />
      <div className="intake-date-field">
        <input
          ref={inputRef}
          className="intake-date-input"
          id={id}
          inputMode="numeric"
          placeholder="DD / MM / YYYY"
          required={required}
          type="text"
          value={inputText}
          {...invalidAttributes}
          onBlur={onBlur}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <button
          aria-label="Open calendar"
          className="intake-date-toggle"
          tabIndex={-1}
          type="button"
          onClick={openCalendar}
        >
          <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="18">
            <rect height="18" rx="2" width="18" x="3" y="4" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="cal-dropdown">
          <div className="cal-nav">
            <button className="cal-arrow" type="button" onClick={handlePrev}>
              <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="14"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              className="cal-header-label"
              type="button"
              onClick={handleHeaderClick}
            >
              {headerLabel}
              {view !== 'years' ? (
                <svg className="cal-header-chevron" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="12"><path d="m6 9 6 6 6-6" /></svg>
              ) : null}
            </button>
            <button className="cal-arrow" type="button" onClick={handleNext}>
              <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="14"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          {view === 'days' ? (
            <table className="cal-grid">
              <thead>
                <tr>
                  {DAYS.map((d) => <th className="cal-weekday" key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((day, di) => (
                      <td key={di}>
                        {day !== null ? (
                          <button
                            className={[
                              'cal-day',
                              selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day ? 'is-selected' : '',
                              day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear() ? 'is-today' : '',
                            ].join(' ')}
                            type="button"
                            onClick={(e) => pickDay(day, e)}
                          >
                            {day}
                          </button>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : view === 'months' ? (
            <div className="cal-month-grid">
              {MONTHS.map((m, i) => (
                <button
                  className={`cal-cell${i === viewMonth ? ' is-selected' : ''}${i === today.getMonth() && viewYear === today.getFullYear() ? ' is-today' : ''}`}
                  key={m}
                  type="button"
                  onClick={(e) => pickMonth(i, e)}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : (
            <div className="cal-year-grid">
              {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((y) => (
                <button
                  className={`cal-cell${y === viewYear ? ' is-selected' : ''}${y === today.getFullYear() ? ' is-today' : ''}`}
                  key={y}
                  type="button"
                  onClick={(e) => pickYear(y, e)}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
