import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { DEFAULT_DASHBOARD_WIDGETS } from '../widgets/registry';
import type { WidgetLayout } from '../widgets/types';

export const DASHBOARD_VIEWS_STORAGE_KEY = 'hrms.dashboard.views';

export type DashboardView = {
  readonly id: string;
  readonly name: string;
  readonly widgets: readonly WidgetLayout[];
};

export type DashboardViewsState = {
  readonly views: readonly DashboardView[];
  readonly activeViewId: string;
};

const DEFAULT_VIEW_ID = 'overview';

const DEFAULT_STATE: DashboardViewsState = {
  views: [{ id: DEFAULT_VIEW_ID, name: 'Overview', widgets: DEFAULT_DASHBOARD_WIDGETS }],
  activeViewId: DEFAULT_VIEW_ID,
};

// Every widget layout a user has built, keyed by view — persisted per browser
// so a refresh doesn't reset custom views.
export const dashboardViewsState = atomWithStorage<DashboardViewsState>(
  DASHBOARD_VIEWS_STORAGE_KEY,
  DEFAULT_STATE,
);

// The widget layout list of whichever view is currently active. Reading/writing
// through this keeps the widget grid's own logic (add/remove/reorder/resize)
// exactly as simple as it was before views existed — it just no longer has to
// know which view it's operating on.
export const activeViewWidgetsAtom = atom(
  (get) => {
    const state = get(dashboardViewsState);
    return state.views.find((view) => view.id === state.activeViewId)?.widgets ?? [];
  },
  (_get, set, updater: (current: readonly WidgetLayout[]) => readonly WidgetLayout[]) => {
    set(dashboardViewsState, (state) => ({
      ...state,
      views: state.views.map((view) =>
        view.id === state.activeViewId ? { ...view, widgets: updater(view.widgets) } : view,
      ),
    }));
  },
);
