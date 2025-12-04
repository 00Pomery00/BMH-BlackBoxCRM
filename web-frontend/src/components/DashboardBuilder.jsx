import React, { useState } from 'react';
import { useWidgetRegistry } from '../hooks/useWidgetRegistry';

/**
 * DashboardBuilder - komponenta pro výběr a konfiguraci widgetů
 * Uživatel zde může:
 * - Vybrat/odebrat widgety
 * - Změnit pořadí (drag-drop či up/down tlačítka)
 * - Nastavit konfiguraci jednotlivých widgetů
 */
export default function DashboardBuilder({ initialConfig = {}, onChange }) {
  const { WIDGET_REGISTRY, WIDGET_CATEGORIES, getWidgetsByCategory, getAllCategories } =
    useWidgetRegistry();

  // Inicializace - které widgety jsou vybrané
  const [enabledWidgets, setEnabledWidgets] = useState(() => {
    if (initialConfig.enabledWidgets && Array.isArray(initialConfig.enabledWidgets)) {
      return initialConfig.enabledWidgets;
    }
    // Default: vybrané KPI a jeden graf
    return ['kpi_customers', 'kpi_revenue', 'kpi_invoices', 'kpi_profit', 'chart_opportunities'];
  });

  // Konfiguracia jednotlivých widgetů
  const [widgetConfigs, setWidgetConfigs] = useState(() => {
    if (initialConfig.widgetConfigs) return initialConfig.widgetConfigs;
    const cfg = {};
    WIDGET_REGISTRY.forEach((w) => {
      cfg[w.id] = w.defaultConfig || {};
    });
    return cfg;
  });

  // Pořadí widgetů
  const [widgetOrder, setWidgetOrder] = useState(() => {
    return initialConfig.widgetOrder || enabledWidgets;
  });

  // Aktuální rozšiřující se kategorie v UI
  const [expandedCategory, setExpandedCategory] = useState(WIDGET_CATEGORIES.METRICS);

  // Callback: když se změní konfigurace
  const notifyChange = (newEnabled, newConfigs, newOrder) => {
    if (onChange) {
      onChange({
        enabledWidgets: newEnabled,
        widgetConfigs: newConfigs,
        widgetOrder: newOrder,
      });
    }
  };

  // Toggle widget
  const handleToggleWidget = (widgetId) => {
    let newEnabled;
    if (enabledWidgets.includes(widgetId)) {
      newEnabled = enabledWidgets.filter((id) => id !== widgetId);
      setWidgetOrder(widgetOrder.filter((id) => id !== widgetId));
    } else {
      newEnabled = [...enabledWidgets, widgetId];
      setWidgetOrder([...widgetOrder, widgetId]);
    }
    setEnabledWidgets(newEnabled);
    notifyChange(
      newEnabled,
      widgetConfigs,
      [...widgetOrder].filter((id) => newEnabled.includes(id))
    );
  };

  // Přesunout widget nahoru
  const moveWidgetUp = (widgetId) => {
    const idx = widgetOrder.indexOf(widgetId);
    if (idx > 0) {
      const newOrder = [...widgetOrder];
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
      setWidgetOrder(newOrder);
      notifyChange(enabledWidgets, widgetConfigs, newOrder);
    }
  };

  // Přesunout widget dolů
  const moveWidgetDown = (widgetId) => {
    const idx = widgetOrder.indexOf(widgetId);
    if (idx < widgetOrder.length - 1) {
      const newOrder = [...widgetOrder];
      [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
      setWidgetOrder(newOrder);
      notifyChange(enabledWidgets, widgetConfigs, newOrder);
    }
  };

  // Změnit konfiguraci widgetu
  const updateWidgetConfig = (widgetId, newConfig) => {
    const newConfigs = { ...widgetConfigs, [widgetId]: newConfig };
    setWidgetConfigs(newConfigs);
    notifyChange(enabledWidgets, newConfigs, widgetOrder);
  };

  return (
    <div className="space-y-6">
      {/* Sekce 1: Výběr widgetů podle kategorie */}
      <div>
        <h3 className="text-lg font-medium mb-4">Dostupné komponenty</h3>
        <div className="space-y-3">
          {getAllCategories().map((category) => {
            const widgetsInCategory = getWidgetsByCategory(category);
            const isExpanded = expandedCategory === category;

            return (
              <div key={category} className="border rounded-lg p-4 bg-gray-50">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className="w-full text-left flex justify-between items-center font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>
                    {category.charAt(0).toUpperCase() + category.slice(1)} (
                    {widgetsInCategory.length})
                  </span>
                  <span>{isExpanded ? '▼' : '▶'}</span>
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-300">
                    {widgetsInCategory.map((widget) => {
                      const isEnabled = enabledWidgets.includes(widget.id);
                      return (
                        <label
                          key={widget.id}
                          className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-white"
                        >
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleWidget(widget.id)}
                            className="mt-1 w-4 h-4 text-indigo-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {widget.icon} {widget.label}
                            </div>
                            <div className="text-sm text-gray-600">{widget.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sekce 2: Pořadí a konfigurace vybraných widgetů */}
      {enabledWidgets.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Pořadí a nastavení</h3>
          <div className="space-y-3">
            {widgetOrder
              .filter((id) => enabledWidgets.includes(id))
              .map((widgetId, idx) => {
                const widget = WIDGET_REGISTRY.find((w) => w.id === widgetId);
                if (!widget) return null;

                const config = widgetConfigs[widgetId] || widget.defaultConfig;

                return (
                  <div key={widgetId} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {widget.icon} {widget.label}
                        </div>
                        <div className="text-sm text-gray-600">Pořadí: {idx + 1}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveWidgetUp(widgetId)}
                          disabled={idx === 0}
                          className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Posunout výš"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveWidgetDown(widgetId)}
                          disabled={idx === widgetOrder.length - 1}
                          className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Posunout dolů"
                        >
                          ↓
                        </button>
                      </div>
                    </div>

                    {/* Konfigurace widgetu (jednoduché editory) */}
                    <div className="space-y-2 text-sm">
                      {config.title !== undefined && (
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Nadpis</label>
                          <input
                            type="text"
                            value={config.title}
                            onChange={(e) =>
                              updateWidgetConfig(widgetId, {
                                ...config,
                                title: e.target.value,
                              })
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </div>
                      )}
                      {config.pageSize !== undefined && (
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Počet řádků na stránku
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={config.pageSize}
                            onChange={(e) =>
                              updateWidgetConfig(widgetId, {
                                ...config,
                                pageSize: parseInt(e.target.value) || 5,
                              })
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </div>
                      )}
                      {config.height !== undefined && (
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Výška grafu (px)
                          </label>
                          <input
                            type="number"
                            min="200"
                            max="600"
                            step="50"
                            value={config.height}
                            onChange={(e) =>
                              updateWidgetConfig(widgetId, {
                                ...config,
                                height: parseInt(e.target.value) || 300,
                              })
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </div>
                      )}
                      {config.itemsLimit !== undefined && (
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">
                            Max. počet položek
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={config.itemsLimit}
                            onChange={(e) =>
                              updateWidgetConfig(widgetId, {
                                ...config,
                                itemsLimit: parseInt(e.target.value) || 5,
                              })
                            }
                            className="w-full border rounded px-2 py-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {enabledWidgets.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          ⚠️ Nevybrali jste žádné komponenty. Vyberte alespoň jednu pro zobrazení dashboardu.
        </div>
      )}
    </div>
  );
}
