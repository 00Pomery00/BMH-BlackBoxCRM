import React, { useState } from 'react';
import { useWidgetRegistry } from '../hooks/useWidgetRegistry';
import KpiCard from './ui/KpiCard';
import LineChart from './ui/LineChart';
import PieChart from './ui/PieChart';
import BarChart from './ui/BarChart';
import AreaChart from './ui/AreaChart';
import DataTable from './ui/DataTable';
import GamificationPanel from './GamificationPanel';
import ActivityFeed from './ActivityFeed';

/**
 * DynamicDashboard - renderuje widgety podle konfiguraci uživatele
 * Čte z bbx_ui_settings.dashboardConfig
 */
export default function DynamicDashboard({ companies = [], gamification = {}, activities = [] }) {
  const { getWidgetById } = useWidgetRegistry();
  const [config] = useState(() => {
    try {
      const s = localStorage.getItem('bbx_ui_settings');
      if (!s) return { enabledWidgets: [], widgetConfigs: {}, widgetOrder: [] };
      const settings = JSON.parse(s);
      return settings.dashboardConfig || { enabledWidgets: [], widgetConfigs: {}, widgetOrder: [] };
    } catch (e) {
      return { enabledWidgets: [], widgetConfigs: {}, widgetOrder: [] };
    }
  });

  // Demo data pro grafy a tabulky (v reálné aplikaci by přišla z API)
  const opportunitiesData = [
    { month: 'Feb', value: 67 },
    { month: 'Mar', value: 60 },
    { month: 'Apr', value: 54 },
    { month: 'May', value: 47 },
    { month: 'Jun', value: 40 },
    { month: 'Jul', value: 34 },
    { month: 'Aug', value: 27 },
    { month: 'Sep', value: 20 },
    { month: 'Oct', value: 13 },
  ];

  const leadSourceData = [
    { name: 'Call', value: 120 },
    { name: 'Email', value: 80 },
    { name: 'Website', value: 140 },
    { name: 'Partner', value: 100 },
  ];

  const salesFunnelData = [
    { name: 'Prospecting', Jan: 120, Feb: 100, Mar: 90 },
    { name: 'Qualification', Jan: 80, Feb: 75, Mar: 70 },
    { name: 'Negotiation', Jan: 50, Feb: 45, Mar: 40 },
  ];

  const salesAnalyticsData = [
    { id: 1, name: 'Easy Reservations', type: 'Incident', status: 'Active', priority: 'Normal' },
    { id: 2, name: 'Simmons', type: 'Question', status: 'New', priority: 'High' },
    { id: 3, name: 'Marvin', type: 'Question', status: 'New', priority: 'High' },
  ];

  // Renderuj widget podle typu
  const renderWidget = (widgetId, widgetConfig) => {
    const widget = getWidgetById(widgetId);
    if (!widget) return null;

    const cfg = { ...widget.defaultConfig, ...widgetConfig };

    switch (widgetId) {
      // KPI Cards
      case 'kpi_customers':
        return (
          <KpiCard
            key={widgetId}
            title={cfg.title || 'Customers'}
            value={cfg.value || 4562}
            trend={cfg.trend}
            trendUp={cfg.trendUp}
          />
        );
      case 'kpi_revenue':
        return (
          <KpiCard
            key={widgetId}
            title={cfg.title || 'Revenue'}
            value={cfg.value || '$5,125'}
            trend={cfg.trend}
            trendUp={cfg.trendUp}
          />
        );
      case 'kpi_invoices':
        return (
          <KpiCard
            key={widgetId}
            title={cfg.title || 'Invoices'}
            value={cfg.value || 2145}
            trend={cfg.trend}
            trendUp={cfg.trendUp}
          />
        );
      case 'kpi_profit':
        return (
          <KpiCard
            key={widgetId}
            title={cfg.title || 'Profit'}
            value={cfg.value || '70%'}
            trend={cfg.trend}
            trendUp={cfg.trendUp}
          />
        );

      // Charts
      case 'chart_opportunities':
        return (
          <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-medium mb-4">{cfg.title || 'Opportunities'}</h3>
            <LineChart
              data={opportunitiesData}
              height={cfg.height || 300}
              dataKey="value"
              xAxisKey="month"
            />
          </div>
        );

      case 'chart_lead_source':
        return (
          <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-medium mb-4">{cfg.title || 'Lead Source'}</h3>
            <PieChart data={leadSourceData} height={cfg.height || 300} />
          </div>
        );

      case 'chart_sales_funnel':
        return (
          <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-medium mb-4">{cfg.title || 'Sales Funnel'}</h3>
            <BarChart data={salesFunnelData} height={cfg.height || 300} />
          </div>
        );

      case 'chart_revenue_trend':
        return (
          <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-medium mb-4">{cfg.title || 'Revenue Trend'}</h3>
            <AreaChart data={opportunitiesData} height={cfg.height || 300} />
          </div>
        );

      // Tables
      case 'table_sales_analytics':
        return (
          <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-medium mb-4">{cfg.title || 'Sales Analytics'}</h3>
            <DataTable
              data={salesAnalyticsData}
              columns={['name', 'type', 'status', 'priority']}
              columnLabels={{
                name: 'Name',
                type: 'Type',
                status: 'Status',
                priority: 'Priority',
              }}
            />
          </div>
        );

      case 'table_leads':
        return (
          <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-medium mb-4">{cfg.title || 'Active Leads'}</h3>
            <DataTable
              data={companies.slice(0, cfg.pageSize || 10)}
              columns={['name', 'email', 'lead_score']}
              columnLabels={{
                name: 'Jméno',
                email: 'Email',
                lead_score: 'Skóre',
              }}
            />
          </div>
        );

      case 'table_opportunities':
        return (
          <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-medium mb-4">{cfg.title || 'Opportunities'}</h3>
            <div className="text-gray-500 text-sm p-4">(Demo data - připojit k API)</div>
          </div>
        );

      // Widgets
      case 'widget_inbox':
        return (
          <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-medium mb-4">{cfg.title || 'My Inbox'}</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">Selvia Devis - selviadevis@example.com</div>
              <div className="p-3 bg-gray-50 rounded">Simmons - simmons@example.com</div>
              <div className="p-3 bg-gray-50 rounded">Marvin - marvin@example.com</div>
            </div>
          </div>
        );

      case 'widget_gamification':
        return <GamificationPanel key={widgetId} stats={gamification} />;

      case 'widget_activity_feed':
        return <ActivityFeed key={widgetId} activities={activities} />;

      default:
        return null;
    }
  };

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
