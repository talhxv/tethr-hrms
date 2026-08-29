import type { WorkspaceBrandColor } from '@hrms/shared';

import type { AuthUser } from '../../auth/states/authState';

export type WidgetId =
  | 'employeeCounts'
  | 'leaveOverview'
  | 'payrollSnapshot'
  | 'payrollTrend'
  | 'workspaceInfo'
  | 'hiringPipeline'
  | 'announcements'
  | 'feedbackInbox'
  | 'clientPortfolio';

export type WidgetDisplayMode = 'chart' | 'plain';

export type WidgetLayout = {
  readonly id: WidgetId;
  readonly colSpan: number;
  readonly rowSpan: number;
  readonly fieldIds: readonly string[];
  readonly displayMode: WidgetDisplayMode;
};

export type WidgetFieldDefinition = {
  readonly id: string;
  readonly label: string;
};

export type WidgetFieldValues = Readonly<Record<string, string | number>>;

export type ChartSegment = {
  readonly id: string;
  readonly label: string;
  readonly value: number;
};

export type ChartPoint = {
  readonly label: string;
  readonly value: number;
};

export type WidgetData = {
  readonly loading: boolean;
  readonly error: boolean;
  readonly values: WidgetFieldValues;
  readonly breakdown?: readonly ChartSegment[];
  readonly points?: readonly ChartPoint[];
  readonly formatPointValue?: (value: number) => string;
};

// Which chart, if any, DashboardWidgetCard renders above the numeric field
// row — 'share' for part-to-whole (StackedShareBar, reads `breakdown`),
// 'ordinal' for ordered stages (OrdinalStageBars, reads `breakdown`), 'trend'
// for a time series (BarTrendChart, reads `points`).
export type WidgetChartKind = 'share' | 'ordinal' | 'trend';

export type WidgetDefinition = {
  readonly id: WidgetId;
  readonly title: string;
  readonly defaultColSpan: number;
  readonly defaultRowSpan: number;
  readonly accentColor: WorkspaceBrandColor;
  readonly defaultEnabled: boolean;
  readonly isVisible: (user: AuthUser | null) => boolean;
  readonly fields: readonly WidgetFieldDefinition[];
  readonly defaultFieldIds: readonly string[];
  readonly chartKind?: WidgetChartKind;
  readonly useData: () => WidgetData;
};
