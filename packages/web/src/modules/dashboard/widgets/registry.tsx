import { ANNOUNCEMENTS_FIELDS, useAnnouncementsData } from './AnnouncementsWidget';
import { CLIENT_PORTFOLIO_FIELDS, useClientPortfolioData } from './ClientPortfolioWidget';
import { EMPLOYEE_COUNTS_FIELDS, useEmployeeCountsData } from './EmployeeCountsWidget';
import { FEEDBACK_INBOX_FIELDS, useFeedbackInboxData } from './FeedbackInboxWidget';
import { HIRING_PIPELINE_FIELDS, useHiringPipelineData } from './HiringPipelineWidget';
import { LEAVE_OVERVIEW_FIELDS, useLeaveOverviewData } from './LeaveOverviewWidget';
import { PAYROLL_SNAPSHOT_FIELDS, usePayrollSnapshotData } from './PayrollSnapshotWidget';
import { PAYROLL_TREND_FIELDS, usePayrollTrendData } from './PayrollTrendWidget';
import type { WidgetDefinition, WidgetId, WidgetLayout } from './types';
import { WORKSPACE_INFO_FIELDS, useWorkspaceInfoData } from './WorkspaceInfoWidget';

const canManagePayroll = (roleKeys: readonly string[]): boolean =>
  roleKeys.includes('tethrAdmin') || roleKeys.includes('tethrFinance');

const canManageTethrHr = (roleKeys: readonly string[]): boolean =>
  roleKeys.includes('tethrAdmin') || roleKeys.includes('tethrHr');

const canManageClients = (roleKeys: readonly string[]): boolean => roleKeys.includes('tethrAdmin');

const DEFAULT_ROW_SPAN = 3;
const CHART_ROW_SPAN = 6;
const SHARE_CHART_ROW_SPAN = 5;

export const WIDGET_REGISTRY: readonly WidgetDefinition[] = [
  {
    id: 'employeeCounts',
    title: 'Employee counts',
    defaultColSpan: 1,
    defaultRowSpan: SHARE_CHART_ROW_SPAN,
    accentColor: 'blue',
    defaultEnabled: true,
    isVisible: () => true,
    fields: EMPLOYEE_COUNTS_FIELDS,
    defaultFieldIds: ['total', 'active', 'onLeave'],
    chartKind: 'share',
    useData: useEmployeeCountsData,
  },
  {
    id: 'leaveOverview',
    title: 'Leave overview',
    defaultColSpan: 1,
    defaultRowSpan: SHARE_CHART_ROW_SPAN,
    accentColor: 'green',
    defaultEnabled: false,
    isVisible: () => true,
    fields: LEAVE_OVERVIEW_FIELDS,
    defaultFieldIds: ['leaveTypes', 'pending'],
    chartKind: 'share',
    useData: useLeaveOverviewData,
  },
  {
    id: 'payrollSnapshot',
    title: 'Payroll snapshot',
    defaultColSpan: 2,
    defaultRowSpan: DEFAULT_ROW_SPAN,
    accentColor: 'violet',
    defaultEnabled: false,
    isVisible: (user) => canManagePayroll(user?.roleKeys ?? []),
    fields: PAYROLL_SNAPSHOT_FIELDS,
    defaultFieldIds: ['totalRuns', 'finalizedRuns', 'latestNetPay'],
    useData: usePayrollSnapshotData,
  },
  {
    id: 'payrollTrend',
    title: 'Payroll trend',
    defaultColSpan: 2,
    defaultRowSpan: CHART_ROW_SPAN,
    accentColor: 'violet',
    defaultEnabled: false,
    isVisible: (user) => canManagePayroll(user?.roleKeys ?? []),
    fields: PAYROLL_TREND_FIELDS,
    defaultFieldIds: ['latestNetPay'],
    chartKind: 'trend',
    useData: usePayrollTrendData,
  },
  {
    id: 'workspaceInfo',
    title: 'Workspace info',
    defaultColSpan: 1,
    defaultRowSpan: DEFAULT_ROW_SPAN,
    accentColor: 'gray',
    defaultEnabled: false,
    isVisible: () => true,
    fields: WORKSPACE_INFO_FIELDS,
    defaultFieldIds: ['workspaceName', 'legalName'],
    useData: useWorkspaceInfoData,
  },
  {
    id: 'hiringPipeline',
    title: 'Hiring pipeline',
    defaultColSpan: 2,
    defaultRowSpan: CHART_ROW_SPAN,
    accentColor: 'cyan',
    defaultEnabled: false,
    isVisible: (user) => canManageTethrHr(user?.roleKeys ?? []),
    fields: HIRING_PIPELINE_FIELDS,
    defaultFieldIds: ['total', 'active'],
    chartKind: 'ordinal',
    useData: useHiringPipelineData,
  },
  {
    id: 'announcements',
    title: 'Announcements',
    defaultColSpan: 1,
    defaultRowSpan: SHARE_CHART_ROW_SPAN,
    accentColor: 'pink',
    defaultEnabled: false,
    isVisible: (user) => canManageTethrHr(user?.roleKeys ?? []),
    fields: ANNOUNCEMENTS_FIELDS,
    defaultFieldIds: ['total', 'pinned'],
    chartKind: 'share',
    useData: useAnnouncementsData,
  },
  {
    id: 'feedbackInbox',
    title: 'Feedback inbox',
    defaultColSpan: 1,
    defaultRowSpan: SHARE_CHART_ROW_SPAN,
    accentColor: 'amber',
    defaultEnabled: false,
    isVisible: (user) => canManageTethrHr(user?.roleKeys ?? []),
    fields: FEEDBACK_INBOX_FIELDS,
    defaultFieldIds: ['total', 'open'],
    chartKind: 'share',
    useData: useFeedbackInboxData,
  },
  {
    id: 'clientPortfolio',
    title: 'Client portfolio',
    defaultColSpan: 1,
    defaultRowSpan: DEFAULT_ROW_SPAN,
    accentColor: 'iris',
    defaultEnabled: false,
    isVisible: (user) => canManageClients(user?.roleKeys ?? []),
    fields: CLIENT_PORTFOLIO_FIELDS,
    defaultFieldIds: ['total'],
    useData: useClientPortfolioData,
  },
];

export const defaultLayoutFor = (id: WidgetId): WidgetLayout => {
  const widget = WIDGET_REGISTRY.find((entry) => entry.id === id);
  return {
    id,
    colSpan: widget?.defaultColSpan ?? 1,
    rowSpan: widget?.defaultRowSpan ?? DEFAULT_ROW_SPAN,
    fieldIds: widget?.defaultFieldIds ?? [],
    displayMode: 'chart',
  };
};

export const DEFAULT_DASHBOARD_WIDGETS: readonly WidgetLayout[] = WIDGET_REGISTRY.filter(
  (widget) => widget.defaultEnabled,
).map((widget) => defaultLayoutFor(widget.id));
