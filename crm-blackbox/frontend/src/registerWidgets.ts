import { registerWidget } from "./widgets";
import { KpiWidget } from "./widgets/KpiWidget";

// Register default widgets for the CRM scaffold
registerWidget({
  id: "kpi",
  label: "KPI",
  icon: "ChartBar",
  component: KpiWidget,
});

export default function registerAll() {
  // side-effect import to ensure registration
}
