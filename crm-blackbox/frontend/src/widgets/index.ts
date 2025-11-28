export interface WidgetDefinition<Props = any> {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  component: React.ComponentType<Props>;
  configSchema?: any; // prefer Zod or JSON Schema
}

// Registry map
export const widgetRegistry: Record<string, WidgetDefinition> = {};

export function registerWidget(w: WidgetDefinition) {
  if (widgetRegistry[w.id]) {
    console.warn(`Widget ${w.id} is already registered`);
  }
  widgetRegistry[w.id] = w;
}

export function getWidget(id: string) {
  return widgetRegistry[id];
}
