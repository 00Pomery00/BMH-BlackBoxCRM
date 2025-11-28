import { useState, useEffect } from "react";
import { widgetRegistry, WidgetDefinition } from "../widgets/index";

export function useWidgets() {
  const [widgets, setWidgets] = useState<Record<string, WidgetDefinition>>({});

  useEffect(() => {
    setWidgets({ ...widgetRegistry });
  }, []);

  function getWidget(id: string) {
    return widgetRegistry[id];
  }

  function listWidgets() {
    return Object.values(widgetRegistry);
  }

  return { widgets, getWidget, listWidgets };
}

export default useWidgets;
