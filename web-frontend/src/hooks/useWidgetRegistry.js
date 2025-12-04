/**
 * Widget Registry - centrální seznam všech dostupných widgetů pro dashboard
 * Každý widget má: id, label, kategori, icon, komponentu, default config
 */

export const WIDGET_CATEGORIES = {
  METRICS: 'metrics',
  CHARTS: 'charts',
  TABLES: 'tables',
  WIDGETS: 'widgets',
};

export const WIDGET_REGISTRY = [
  // ===== METRICS / KPI =====
  {
    id: 'kpi_customers',
    label: 'Customers KPI',
    category: WIDGET_CATEGORIES.METRICS,
    icon: '👥',
    description: 'Metrika počtu zákazníků s trendem',
    defaultConfig: {
      title: 'Customers',
      value: 4562,
      trend: '+8.5%',
      trendUp: true,
    },
  },
  {
    id: 'kpi_revenue',
    label: 'Revenue KPI',
    category: WIDGET_CATEGORIES.METRICS,
    icon: '💰',
    description: 'Metrika tržeb s trendem',
    defaultConfig: {
      title: 'Revenue',
      value: '$5,125',
      trend: '-0.10%',
      trendUp: false,
    },
  },
  {
    id: 'kpi_invoices',
    label: 'Invoices KPI',
    category: WIDGET_CATEGORIES.METRICS,
    icon: '📄',
    description: 'Metrika počtu faktur s trendem',
    defaultConfig: {
      title: 'Invoices',
      value: 2145,
      trend: '+10.5%',
      trendUp: true,
    },
  },
  {
    id: 'kpi_profit',
    label: 'Profit KPI',
    category: WIDGET_CATEGORIES.METRICS,
    icon: '📊',
    description: 'Metrika zisku v procentech',
    defaultConfig: {
      title: 'Profit',
      value: '70%',
      trend: '-0.5%',
      trendUp: false,
    },
  },

  // ===== CHARTS =====
  {
    id: 'chart_opportunities',
    label: 'Opportunities Trend (Line)',
    category: WIDGET_CATEGORIES.CHARTS,
    icon: '📈',
    description: 'Vývojový graf příležitostí v čase',
    defaultConfig: {
      title: 'Opportunities by user',
      period: 'Monthly',
      height: 300,
    },
  },
  {
    id: 'chart_lead_source',
    label: 'Lead Source Distribution (Pie)',
    category: WIDGET_CATEGORIES.CHARTS,
    icon: '🥧',
    description: 'Rozložení zdrojů leadů (pie/donut)',
    defaultConfig: {
      title: 'Lead Source',
      height: 300,
    },
  },
  {
    id: 'chart_sales_funnel',
    label: 'Sales Funnel (Bar)',
    category: WIDGET_CATEGORIES.CHARTS,
    icon: '📉',
    description: 'Prodejní trychtýř s fázemi',
    defaultConfig: {
      title: 'Sales Funnel',
      height: 300,
    },
  },
  {
    id: 'chart_revenue_trend',
    label: 'Revenue Trend (Area)',
    category: WIDGET_CATEGORIES.CHARTS,
    icon: '📊',
    description: 'Trend tržeb v čase (area chart)',
    defaultConfig: {
      title: 'Revenue Trend',
      period: 'Monthly',
      height: 300,
    },
  },

  // ===== TABLES =====
  {
    id: 'table_sales_analytics',
    label: 'Sales Analytics Table',
    category: WIDGET_CATEGORIES.TABLES,
    icon: '📋',
    description: 'Tabulka s analytickými daty o prodejích',
    defaultConfig: {
      title: 'Sales Analytics',
      pageSize: 5,
    },
  },
  {
    id: 'table_leads',
    label: 'Leads Table',
    category: WIDGET_CATEGORIES.TABLES,
    icon: '📑',
    description: 'Tabulka se seznamem leadů',
    defaultConfig: {
      title: 'Active Leads',
      pageSize: 10,
    },
  },
  {
    id: 'table_opportunities',
    label: 'Opportunities Table',
    category: WIDGET_CATEGORIES.TABLES,
    icon: '🎯',
    description: 'Tabulka s příležitostmi',
    defaultConfig: {
      title: 'Opportunities',
      pageSize: 10,
    },
  },

  // ===== WIDGETS / PANELS =====
  {
    id: 'widget_inbox',
    label: 'My Inbox',
    category: WIDGET_CATEGORIES.WIDGETS,
    icon: '📧',
    description: 'Widget s nejnovějšími zprávami a kontakty',
    defaultConfig: {
      title: 'My Inbox',
      itemsLimit: 5,
    },
  },
  {
    id: 'widget_gamification',
    label: 'Gamification Panel',
    category: WIDGET_CATEGORIES.WIDGETS,
    icon: '🏆',
    description: 'Panel s XP, coiny a úrovní',
    defaultConfig: {
      title: 'Gamification',
    },
  },
  {
    id: 'widget_activity_feed',
    label: 'Activity Feed',
    category: WIDGET_CATEGORIES.WIDGETS,
    icon: '⚡',
    description: 'Feed s poslední aktivitou',
    defaultConfig: {
      title: 'Recent Activity',
      itemsLimit: 8,
    },
  },
];

/**
 * Hook pro práci s widget registrem
 */
export function useWidgetRegistry() {
  const getWidgetById = (id) => WIDGET_REGISTRY.find((w) => w.id === id);

  const getWidgetsByCategory = (category) => WIDGET_REGISTRY.filter((w) => w.category === category);

  const getAllCategories = () => Object.values(WIDGET_CATEGORIES);

  return {
    WIDGET_REGISTRY,
    WIDGET_CATEGORIES,
    getWidgetById,
    getWidgetsByCategory,
    getAllCategories,
  };
}
