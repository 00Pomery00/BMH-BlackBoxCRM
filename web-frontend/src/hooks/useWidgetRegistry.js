/**
 * Widget Registry - centrální seznam všech dostupných widgetů pro dashboard
 * Každý widget má: id, label, kategori, icon, komponentu, default config
 */

import { useMemo, useCallback } from 'react';

/**
 * @typedef {Object} WidgetConfig
 * @property {string} [title]
 * @property {number|string} [value]
 * @property {string} [trend]
 * @property {boolean} [trendUp]
 * @property {number} [height]
 * @property {number} [pageSize]
 * @property {number} [itemsLimit]
 */

/**
 * @typedef {Object} Widget
 * @property {string} id
 * @property {string} label
 * @property {string} category
 * @property {string} icon
 * @property {string} description
 * @property {WidgetConfig} defaultConfig
 */

/**
 * @typedef {Object} DashboardConfig
 * @property {string[]} enabledWidgets
 * @property {Object.<string, WidgetConfig>} widgetConfigs
 * @property {string[]} widgetOrder
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
  /**
   * Demo data pro různé widget typy
   * V reálné aplikaci by data přicházela z API
   * Memoizované aby se nerekonstruovalo při každém rendu
   * @type {Object.<string, any[]>}
   */
  const DEMO_DATA = useMemo(() => ({
    opportunitiesData: [
      { month: 'Feb', value: 67 },
      { month: 'Mar', value: 60 },
      { month: 'Apr', value: 54 },
      { month: 'May', value: 47 },
      { month: 'Jun', value: 40 },
      { month: 'Jul', value: 34 },
      { month: 'Aug', value: 27 },
      { month: 'Sep', value: 20 },
      { month: 'Oct', value: 13 },
    ],
    leadSourceData: [
      { name: 'Call', value: 120 },
      { name: 'Email', value: 80 },
      { name: 'Website', value: 140 },
      { name: 'Partner', value: 100 },
    ],
    salesFunnelData: [
      { name: 'Prospecting', Jan: 120, Feb: 100, Mar: 90 },
      { name: 'Qualification', Jan: 80, Feb: 75, Mar: 70 },
      { name: 'Negotiation', Jan: 50, Feb: 45, Mar: 40 },
    ],
    salesAnalyticsData: [
      { id: 1, name: 'Easy Reservations', type: 'Incident', status: 'Active', priority: 'Normal' },
      { id: 2, name: 'Simmons', type: 'Question', status: 'New', priority: 'High' },
      { id: 3, name: 'Marvin', type: 'Question', status: 'New', priority: 'High' },
    ],
  }), []);

  // Memoizované funkce pro práci s registry
  const getWidgetById = useCallback((id) => WIDGET_REGISTRY.find((w) => w.id === id), []);

  const getWidgetsByCategory = useCallback(
    (category) => WIDGET_REGISTRY.filter((w) => w.category === category),
    []
  );

  const getAllCategories = useCallback(() => Object.values(WIDGET_CATEGORIES), []);

  /**
   * Vrátí demo data pro daný widget
   * Memoizované aby se nevytvářela nová funkce při každém rendu
   * @param {string} widgetId - ID widgetu (např. 'chart_opportunities')
   * @returns {any[]|Object} Demo data pro widget, nebo prázdné pole
   */
  const getDemoData = useCallback((widgetId) => {
    switch (widgetId) {
      case 'chart_opportunities':
      case 'chart_revenue_trend':
        return DEMO_DATA.opportunitiesData;
      case 'chart_lead_source':
        return DEMO_DATA.leadSourceData;
      case 'chart_sales_funnel':
        return DEMO_DATA.salesFunnelData;
      case 'table_sales_analytics':
        return DEMO_DATA.salesAnalyticsData;
      default:
        return [];
    }
  }, [DEMO_DATA]);

  return {
    WIDGET_REGISTRY,
    WIDGET_CATEGORIES,
    getWidgetById,
    getWidgetsByCategory,
    getAllCategories,
    getDemoData,
    DEMO_DATA,
  };
}
