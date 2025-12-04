# Dashboard Configuration System - Developer Guide

## 🚀 Quick Start

### Running the Application

```bash
# 1. Start backend (if not running)
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. Start frontend dev server (in another terminal)
cd web-frontend
npm run dev

# 3. Open browser
http://localhost:5174

# 4. Go to Profile → "Moje Komponenty" tab to configure dashboard
```

### Testing

```bash
# Frontend build
npm run build

# Backend unit tests
python -m pytest backend/tests/ -v

# Frontend E2E tests (requires servers running)
npm run e2e
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Home Page                          │
│                                                         │
│  [Klasický Dashboard] [Moje Komponenty] ← Toggle        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           DynamicDashboard                       │  │
│  │  (renders based on bbx_ui_settings.dashboardConfig)  │
│  │                                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐│  │
│  │  │  KPI Cards  │  │   Charts    │  │  Tables  ││  │
│  │  │  (4 cols)   │  │  (2 cols)   │  │ (2 cols) ││  │
│  │  └─────────────┘  └─────────────┘  └──────────┘│  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         ↑
         │ Reads config from localStorage
         │
┌─────────────────────────────────────────────────────────┐
│              Profile / Moje Komponenty                  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │      DashboardBuilder                            │  │
│  │                                                  │  │
│  │  Kategorie:                                      │  │
│  │  ✓ Metrics (4 widgets)                           │  │
│  │    ☐ Customers   ↑↓  [Config]                    │  │
│  │    ☑ Revenue     ↑↓  [Config]                    │  │
│  │                                                  │  │
│  │  ✓ Charts (4 widgets)                            │  │
│  │    ☑ Opportunities ↑↓  [Config]                  │  │
│  │    ☐ Lead Source  ↑↓  [Config]                   │  │
│  │                                                  │  │
│  │  ✓ Tables (3 widgets)                            │  │
│  │  ✓ Widgets (3 widgets)                           │  │
│  │                                                  │  │
│  │                 [Save]  [Cancel]                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  └─→ Saves to localStorage + /api/ui/settings         │
└─────────────────────────────────────────────────────────┘
```

## 📦 Component Structure

### `useWidgetRegistry` Hook
```javascript
// export
{
  WIDGET_REGISTRY,           // Array of 14 widgets with metadata
  WIDGET_CATEGORIES,         // Object with category constants
  getWidgetById,             // (id) => widget object
  getWidgetsByCategory,      // (category) => widget[]
  getAllCategories,          // () => category[]
}
```

### `DashboardBuilder` Component
```jsx
<DashboardBuilder
  initialConfig={uiSettings.dashboardConfig}  // Pass saved config
  onChange={handleDashboardConfigChange}      // Callback on change
/>
```

Props:
- `initialConfig`: `{ enabledWidgets, widgetConfigs, widgetOrder }`
- `onChange`: Called with new config on every change

### `DynamicDashboard` Component
```jsx
<DynamicDashboard
  companies={companies}        // For table_leads
  gamification={gamification}  // For widget_gamification
  activities={activities}      // For widget_activity_feed
/>
```

## 🔄 State Flow

### Profile.jsx
```javascript
const [uiSettings, setUiSettings] = useState({
  theme: 'light',
  accent: '#7b1fa2',
  dashboardConfig: {
    enabledWidgets: ['kpi_customers', 'kpi_revenue', ...],
    widgetConfigs: { ... },
    widgetOrder: [...]
  }
});

// On DashboardBuilder change:
const handleDashboardConfigChange = (newConfig) => {
  setUiSettings(u => ({
    ...u,
    dashboardConfig: newConfig
  }));
};

// On form submit:
const handleSubmit = (e) => {
  e.preventDefault();
  // Save to localStorage
  localStorage.setItem('bbx_ui_settings', JSON.stringify(uiSettings));

  // Sync to backend
  fetch('/api/ui/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings: uiSettings })
  });
};
```

### Home.jsx
```javascript
const [useDynamic, setUseDynamic] = useState(true);

return (
  <>
    <button onClick={() => setUseDynamic(false)}>Klasický Dashboard</button>
    <button onClick={() => setUseDynamic(true)}>Moje Komponenty</button>

    {useDynamic ? (
      <DynamicDashboard {...props} />
    ) : (
      <Dashboard {...props} />
    )}
  </>
);
```

## 📊 Adding a New Widget

### Step 1: Add to Widget Registry
```javascript
// In useWidgetRegistry.js, add to WIDGET_REGISTRY:
{
  id: 'my_new_widget',
  label: 'My New Widget',
  category: WIDGET_CATEGORIES.CHARTS,  // or METRICS, TABLES, WIDGETS
  icon: '📈',
  description: 'Brief description...',
  defaultConfig: {
    title: 'Default Title',
    height: 300,  // if chart
    pageSize: 10  // if table
  }
}
```

### Step 2: Add Rendering Logic
```javascript
// In DynamicDashboard.jsx, add case in renderWidget():
case 'my_new_widget':
  return (
    <div key={widgetId} className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{cfg.title}</h3>
      <MyNewWidgetComponent
        data={myData}
        height={cfg.height}
      />
    </div>
  );
```

### Step 3: User can now select it!
That's it! The widget automatically appears in DashboardBuilder.

## 🧪 Testing Your Changes

```bash
# 1. Verify imports don't break
npm run build

# 2. Test in dev mode
npm run dev
# Visit Profile → Moje Komponenty, see your widget

# 3. Test persistence
# Select widget, save, refresh page → should still be selected

# 4. Test rendering
# Toggle to "Moje Komponenty", should see widget on dashboard
```

## 🔐 Security Considerations

1. **Widget Config Validation**: `/api/ui/settings` should validate incoming config
2. **XSS Prevention**: Widget titles/configs are escaped via React (safe by default)
3. **Rate Limiting**: Consider rate-limit on `/api/ui/settings` POST
4. **Authentication**: Only authenticated users should save UI settings

## 🐛 Debugging

### Dashboard shows no widgets?
1. Check browser console for errors
2. Verify `localStorage.getItem('bbx_ui_settings')` has data
3. Check `enabledWidgets` array is not empty
4. Check Home.jsx `useDynamic` toggle is ON ("Moje Komponenty")

### Widget doesn't appear in selector?
1. Check widget is in `WIDGET_REGISTRY`
2. Check category is in `WIDGET_CATEGORIES`
3. Verify `getWidgetsByCategory()` returns it
4. Check DashboardBuilder UI is expanding that category

### Config not persisting?
1. Check browser allows localStorage
2. Check `/api/ui/settings` POST returns success
3. Check backend saves to database
4. Verify token is being sent (Authorization header)

### Build fails?
```bash
npm run build 2>&1 | grep -i error
npm run lint  # Check for lint errors
```

## 📚 File Locations

```
web-frontend/
├── src/
│   ├── hooks/
│   │   └── useWidgetRegistry.js        ← Widget definitions
│   ├── components/
│   │   ├── DashboardBuilder.jsx        ← Widget selector UI
│   │   ├── DynamicDashboard.jsx        ← Dashboard renderer
│   │   ├── ui/
│   │   │   ├── KpiCard.jsx
│   │   │   ├── LineChart.jsx
│   │   │   ├── PieChart.jsx
│   │   │   ├── BarChart.jsx
│   │   │   ├── AreaChart.jsx
│   │   │   └── DataTable.jsx
│   │   ├── GamificationPanel.jsx
│   │   └── ActivityFeed.jsx
│   └── pages/
│       ├── Home.jsx                    ← Toggle + DynamicDashboard
│       └── Profile.jsx                 ← Config UI
└── dist/                               ← Production build
```

## 🚢 Deployment

1. **Frontend**: `npm run build` generates `/web-frontend/dist/`
2. **Backend**: No changes needed (uses existing `/api/ui/settings`)
3. **Database**: No migrations needed (uses existing user.settings column)
4. **Environment**: No new env vars needed

## 💡 Tips for Contributors

- **Keep widgets pure**: Fetch data inside component, don't pass huge objects
- **Use icons consistently**: 👥 for people, 💰 for money, 📊 for analytics, etc.
- **Config should be flat**: Avoid nested config objects for simplicity
- **Test in dev mode first**: `npm run dev` before building
- **Commit message format**: `feat: <description>` or `fix: <description>`

---

**Last Updated**: 4. prosince 2025
**Created By**: AI Assistant
**Status**: Production Ready ✅
