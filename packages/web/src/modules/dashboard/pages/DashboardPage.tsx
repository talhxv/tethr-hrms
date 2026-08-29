import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAtom } from 'jotai';
import { useRef } from 'react';

import { useAuth } from '../../auth/hooks/useAuth';
import { CustomizeDashboardMenu } from '../components/CustomizeDashboardMenu';
import { DashboardViewTabs } from '../components/DashboardViewTabs';
import { activeViewWidgetsAtom } from '../states/dashboardViewsState';
import { DashboardWidgetCard } from '../widgets/DashboardWidgetCard';
import { WIDGET_REGISTRY } from '../widgets/registry';
import type { WidgetId } from '../widgets/types';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [layout, setLayout] = useAtom(activeViewWidgetsAtom);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const gridRef = useRef<HTMLDivElement | null>(null);

  const visibleWidgets = layout
    .map((entry) => {
      const definition = WIDGET_REGISTRY.find((widget) => widget.id === entry.id);
      return definition ? { ...entry, definition } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .filter((entry) => entry.definition.isVisible(user));

  const removeWidget = (id: WidgetId): void => {
    setLayout((current) => current.filter((widget) => widget.id !== id));
  };

  const resizeWidget = (id: WidgetId, colSpan: number, rowSpan: number): void => {
    setLayout((current) =>
      current.map((widget) => (widget.id === id ? { ...widget, colSpan, rowSpan } : widget)),
    );
  };

  const toggleWidgetField = (id: WidgetId, fieldId: string, enabled: boolean): void => {
    setLayout((current) =>
      current.map((widget) =>
        widget.id === id
          ? {
              ...widget,
              fieldIds: enabled
                ? [...widget.fieldIds, fieldId]
                : widget.fieldIds.filter((existingFieldId) => existingFieldId !== fieldId),
            }
          : widget,
      ),
    );
  };

  const toggleDisplayMode = (id: WidgetId): void => {
    setLayout((current) =>
      current.map((widget) =>
        widget.id === id
          ? { ...widget, displayMode: widget.displayMode === 'chart' ? 'plain' : 'chart' }
          : widget,
      ),
    );
  };

  const onDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLayout((current) => {
      const oldIndex = current.findIndex((widget) => widget.id === active.id);
      const newIndex = current.findIndex((widget) => widget.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove([...current], oldIndex, newIndex);
    });
  };

  return (
    <main className="employees-content" style={{ display: 'block' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your workspace at a glance.</p>
        </div>
        <div className="page-actions">
          <CustomizeDashboardMenu />
        </div>
      </header>

      <DashboardViewTabs />

      {visibleWidgets.length === 0 ? (
        <div className="dashboard-widget-empty">
          <p className="panel-title">No widgets on this view</p>
          <p>Open Customize to add employee, leave, payroll, or workspace widgets.</p>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={visibleWidgets.map((widget) => widget.id)} strategy={rectSortingStrategy}>
            <div className="dashboard-widget-grid" ref={gridRef}>
              {visibleWidgets.map((widget) => (
                <DashboardWidgetCard
                  accentColor={widget.definition.accentColor}
                  chartKind={widget.definition.chartKind}
                  colSpan={widget.colSpan}
                  displayMode={widget.displayMode}
                  fields={widget.definition.fields}
                  gridRef={gridRef}
                  id={widget.id}
                  key={widget.id}
                  onRemove={() => removeWidget(widget.id)}
                  onResize={(colSpan, rowSpan) => resizeWidget(widget.id, colSpan, rowSpan)}
                  onToggleDisplayMode={() => toggleDisplayMode(widget.id)}
                  onToggleField={(fieldId, enabled) => toggleWidgetField(widget.id, fieldId, enabled)}
                  rowSpan={widget.rowSpan}
                  selectedFieldIds={widget.fieldIds}
                  title={widget.definition.title}
                  useData={widget.definition.useData}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </main>
  );
};
