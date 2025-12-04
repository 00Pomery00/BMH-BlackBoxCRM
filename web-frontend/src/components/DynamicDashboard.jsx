import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import KpiCustomersWidget from './widgets/KpiCustomersWidget';
import KpiRevenueWidget from './widgets/KpiRevenueWidget';
import KpiInvoicesWidget from './widgets/KpiInvoicesWidget';
import KpiProfitWidget from './widgets/KpiProfitWidget';
import ChartOpportunitiesWidget from './widgets/ChartOpportunitiesWidget';
import ChartLeadSourceWidget from './widgets/ChartLeadSourceWidget';
import ChartSalesFunnelWidget from './widgets/ChartSalesFunnelWidget';
import ChartRevenueTrendWidget from './widgets/ChartRevenueTrendWidget';
import TableSalesAnalyticsWidget from './widgets/TableSalesAnalyticsWidget';
import TableLeadsWidget from './widgets/TableLeadsWidget';
import TableOpportunitiesWidget from './widgets/TableOpportunitiesWidget';
import WidgetInbox from './widgets/WidgetInbox';
import WidgetGamification from './widgets/WidgetGamification';
import WidgetActivityFeed from './widgets/WidgetActivityFeed';

/**
 * DynamicDashboard - renderuje widgety podle konfiguraci uživatele
 * Čte z bbx_ui_settings.dashboardConfig
 */
export default function DynamicDashboard({ companies = [], gamification = {}, activities = [] }) {
  // Read settings with error handling using useLocalStorage hook
  const [settings] = useLocalStorage(
    'bbx_ui_settings',
    {},
    {
      validate: (v) => v && typeof v === 'object',
      suppressErrors: true,
    }
  );

  const config = settings?.dashboardConfig || {
    enabledWidgets: [],
    widgetConfigs: {},
    widgetOrder: [],
  };

  const widgetFactory = {
    kpi_customers: KpiCustomersWidget,
    kpi_revenue: KpiRevenueWidget,
    kpi_invoices: KpiInvoicesWidget,
    kpi_profit: KpiProfitWidget,
    chart_opportunities: ChartOpportunitiesWidget,
    chart_lead_source: ChartLeadSourceWidget,
    chart_sales_funnel: ChartSalesFunnelWidget,
    chart_revenue_trend: ChartRevenueTrendWidget,
    table_sales_analytics: TableSalesAnalyticsWidget,
    table_leads: TableLeadsWidget,
    table_opportunities: TableOpportunitiesWidget,
    widget_inbox: WidgetInbox,
    widget_gamification: WidgetGamification,
    widget_activity_feed: WidgetActivityFeed,
  };

  // Renderuj widget podle typu
  function renderWidget(widgetId, widgetConfig) {
    const WidgetComponent = widgetFactory[widgetId];
    if (!WidgetComponent) return null;
    // Speciální props pro některé widgety
    if (widgetId === 'table_leads') {
      return <WidgetComponent config={widgetConfig} companies={companies} />;
    }
    if (widgetId === 'widget_gamification') {
      return <WidgetComponent gamification={gamification} />;
    }
    if (widgetId === 'widget_activity_feed') {
      return <WidgetComponent activities={activities} />;
    }
    return <WidgetComponent config={widgetConfig} />;
  }

  if (!config.enabledWidgets || config.enabledWidgets.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
        <h2 className="text-xl font-semibold mb-2">⚠️ Žádné komponenty vybrány</h2>
        <p>
          Jděte do <strong>Profil → Moje Komponenty</strong> a vyberte si komponenty, které chcete
          vidět na svém dashboardu.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Render KPI cards v horní řadě (grid 4 kolonami) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {config.widgetOrder
          .filter((id) =>
            ['kpi_customers', 'kpi_revenue', 'kpi_invoices', 'kpi_profit'].includes(id)
          )
          .map((widgetId) => renderWidget(widgetId, config.widgetConfigs[widgetId]))}
      </div>

      {/* Render zbytku widgetů v normálním fluidu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {config.widgetOrder
          .filter(
            (id) => !['kpi_customers', 'kpi_revenue', 'kpi_invoices', 'kpi_profit'].includes(id)
          )
          .map((widgetId) => renderWidget(widgetId, config.widgetConfigs[widgetId]))}
      </div>
    </div>
  );
}
