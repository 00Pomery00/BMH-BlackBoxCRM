# Dashboard Builder - Team TODO Backlog

## 🎯 High Priority Issues (This Sprint)

### [P0-001] 🔴 Extract Demo Data to useWidgetRegistry
**Priority**: Critical
**Effort**: 2h
**Owner**: Frontend Lead
**Type**: Refactoring / Deduplication

**Description**:
Demo data (opportunitiesData, leadSourceData, salesFunnelData, salesAnalyticsData) is currently hardcoded in `DynamicDashboard.jsx`. This creates duplication and makes it hard to update demo data in one place.

**Solution**:
Add `getDemoData(widgetId)` function to `useWidgetRegistry.js` that returns demo data for each widget type.

**Acceptance Criteria**:
- [ ] All demo data moved to useWidgetRegistry
- [ ] DynamicDashboard imports and uses `getDemoData()`
- [ ] All tests pass: `npm run build && npm run test`
- [ ] No changes in visual output
- [ ] Single source of truth for demo data

**Files to Modify**:
- `web-frontend/src/hooks/useWidgetRegistry.js` – Add getDemoData export
- `web-frontend/src/components/DynamicDashboard.jsx` – Remove hardcoded data, use hook

---

### [P0-002] 🔴 Create Widget Renderer Factory
**Priority**: Critical
**Effort**: 4h
**Owner**: Frontend Lead
**Type**: Refactoring / Architecture

**Description**:
The `renderWidget()` function in `DynamicDashboard.jsx` is 140 lines with 14 case statements. This is hard to maintain and test. Convert to factory pattern with individual widget components.

**Solution**:
Create component structure:
```
components/widgets/
├── KpiWidget.jsx
├── ChartWidget.jsx
├── TableWidget.jsx
├── InboxWidget.jsx
├── GamificationWidget.jsx
├── ActivityFeedWidget.jsx
└── WidgetRenderer.jsx (factory)
```

**Acceptance Criteria**:
- [ ] All widget types in separate files
- [ ] WidgetRenderer factory routes correctly
- [ ] No functional changes to widgets
- [ ] Bundle size reduced or same
- [ ] Tests added for each widget component
- [ ] Code coverage >= 80%

**Files to Create/Modify**:
- Create: `web-frontend/src/components/widgets/*.jsx`
- Modify: `web-frontend/src/components/DynamicDashboard.jsx`

**Note**: Keep DynamicDashboard.jsx layout logic (KPI grid, 2-col grid) – only extract widget rendering.

---

### [P0-003] 🔴 Extract useLocalStorage Hook
**Priority**: High
**Effort**: 1h
**Owner**: Frontend Dev
**Type**: Refactoring / Quality

**Description**:
localStorage access is scattered without error handling. Create reusable hook for safe localStorage access.

**Solution**:
```jsx
// Usage:
const [config, setConfig] = useLocalStorage('bbx_ui_settings', defaultConfig);

// Features:
// - JSON serialization/deserialization
// - Error handling with fallback
// - Validation optional
// - SSR safe (check window exists)
```

**Acceptance Criteria**:
- [ ] Hook handles JSON parse errors
- [ ] Hook works in SSR context (no window errors)
- [ ] Setters validate data (optional)
- [ ] Tests pass: unit tests for edge cases
- [ ] Used in DynamicDashboard, Profile, DashboardBuilder

**Files to Create/Modify**:
- Create: `web-frontend/src/hooks/useLocalStorage.js`
- Modify: DynamicDashboard, Profile, DashboardBuilder

---

### [P0-004] 🟡 Add JSDoc Type Definitions
**Priority**: High
**Effort**: 2h
**Owner**: Tech Lead / Frontend Lead
**Type**: Documentation / Quality

**Description**:
No type hints or documentation. Add JSDoc comments to all functions, components, hooks for better IDE support.

**Solution**:
Document in JSDoc format:
```jsx
/**
 * @typedef {Object} WidgetConfig
 * @property {string} id - Widget identifier
 * @property {string} title - Display title
 * @property {number} [height] - Optional height in px
 */

/**
 * Renders a dashboard widget based on config
 * @param {WidgetConfig} config - Widget configuration
 * @returns {JSX.Element} Rendered widget
 * @throws {Error} If widget type not supported
 */
function WidgetRenderer({ config }) { ... }
```

**Acceptance Criteria**:
- [ ] All functions have @param, @returns docs
- [ ] All components have @component JSDoc block
- [ ] All hooks documented
- [ ] IDE autocomplete works (test in VS Code)
- [ ] No TypeScript errors shown in Pylance

**Files to Modify**:
- `useWidgetRegistry.js`
- `DashboardBuilder.jsx`
- `DynamicDashboard.jsx`
- All new widget components
- All new hooks (useLocalStorage, useDashboardConfig)

---

## 🟡 Medium Priority Issues (Next Sprint)

### [P1-001] Memoization & Performance Optimization
**Priority**: Medium
**Effort**: 2h
**Owner**: Frontend Lead
**Type**: Performance

**Details**:
- Use `useMemo` for KPI/non-KPI filtering in DynamicDashboard
- Use `memo()` wrapper for individual widget cards
- Use `useCallback` for event handlers in DashboardBuilder
- Profile performance with React DevTools
- Target: < 1ms rendering time per widget

**Files**: DynamicDashboard, DashboardBuilder, Widget components

---

### [P1-002] Add Unit Tests
**Priority**: Medium
**Effort**: 4h
**Owner**: Frontend QA / Dev
**Type**: Testing

**Tests Needed**:
```
✓ useWidgetRegistry.test.js
  - getWidgetById returns correct widget
  - getWidgetsByCategory filters correctly
  - getAllCategories returns 4 categories

✓ useLocalStorage.test.js
  - Stores and retrieves data
  - Handles JSON parse errors
  - Works without window (SSR)

✓ DashboardBuilder.test.jsx
  - Toggle widget on/off
  - Move widget up/down
  - Update widget config
  - Calls onChange callback

✓ Widget components.test.jsx
  - KpiWidget renders with config
  - ChartWidget renders with height
  - TableWidget renders with pageSize
```

**Files**: Create `web-frontend/__tests__/` directory with tests

---

### [P1-003] Create API Specification Document
**Priority**: Medium
**Effort**: 1.5h
**Owner**: Backend Lead
**Type**: Documentation

**Contents**:
- POST /api/ui/settings request schema
- Response schema
- Error codes (400, 401, 422, 500)
- Validation rules (widget ID must exist, pageSize > 0 && < 100)
- Example payloads
- Rate limiting info

**File**: `DASHBOARD_API_SPEC.md`

---

### [P1-004] Input Validation on DashboardBuilder
**Priority**: Medium
**Effort**: 2h
**Owner**: Frontend Dev
**Type**: Security

**Validation Rules**:
```
- Widget ID: must exist in registry
- Title: max 100 chars, no HTML/scripts
- Height: 200-600px range
- PageSize: 1-100 range
- ItemsLimit: 1-20 range
```

**Solution**: Use Zod or Yup schema validation library

**Files**: DashboardBuilder.jsx, utils/validation.js (new)

---

### [P1-005] Add E2E Tests for Dashboard
**Priority**: Medium
**Effort**: 3h
**Owner**: QA Engineer
**Type**: Testing

**Test Scenarios**:
```
✓ User can select widget in Profile → widget appears on Home dashboard
✓ User can change widget config → changes reflected in rendered widget
✓ User can reorder widgets → order persists after refresh
✓ User can toggle between Classic/Dynamic dashboards
✓ Dashboard shows warning when no widgets selected
✓ Multiple browsers don't interfere (separate localStorage)
```

**File**: Extend `web-frontend/e2e/tests/` with dashboard-specific tests

---

## 🟢 Low Priority Issues (Later)

### [P2-001] Create Storybook Component Library
**Priority**: Low
**Effort**: 2h
**Owner**: Frontend Dev
**Type**: Developer Experience

**Stories**:
- DashboardBuilder with different widget counts
- DynamicDashboard in different states (no widgets, many widgets, dark mode)
- Individual widget components with various configs

---

### [P2-002] Create Figma Design Specification
**Priority**: Low
**Effort**: 5h
**Owner**: Design Lead
**Type**: Design

**Includes**:
- Component library (DashboardBuilder, widget cards)
- Color palette & dark mode
- Typography & spacing
- Interactive prototypes

---

### [P2-003] Setup GitHub Actions for Dashboard CI/CD
**Priority**: Low
**Effort**: 2h
**Owner**: DevOps Lead
**Type**: DevOps

**Workflow**:
```yaml
on: [pull_request]
jobs:
  - lint: npm run lint
  - test: npm run test
  - build: npm run build
  - bundle-size-check: compare to baseline
```

---

## 📊 Backlog Summary

| Priority | Count | Est. Hours | Owner Type |
|----------|-------|-----------|-----------|
| Critical (P0) | 4 | 9 | Frontend Lead, Dev |
| High (P1) | 5 | 12.5 | Multi-disciplinary |
| Low (P2) | 3 | 9 | Special interest |
| **TOTAL** | **12** | **30.5** | |

---

## 🚀 Recommended Sprint Planning

### Sprint 1 (This Week)
- P0-001: Extract demo data (2h)
- P0-003: useLocalStorage hook (1h)
- P0-004: JSDoc docs (2h)
- **Subtotal**: 5h

### Sprint 2 (Next Week)
- P0-002: Widget factory (4h)
- P1-001: Memoization (2h)
- P1-002: Unit tests (4h)
- **Subtotal**: 10h

### Sprint 3 (Week After)
- P1-003: API spec (1.5h)
- P1-004: Input validation (2h)
- P1-005: E2E tests (3h)
- **Subtotal**: 6.5h

### Sprint 4 (Later)
- P2-001, P2-002, P2-003 (9h)

---

## 👤 Team Assignments Template

```
P0-001: Extract Demo Data
  Assignee: [Frontend Lead]
  Reviewer: [Tech Lead]
  Status: Not Started
  Deadline: [Date]

P0-002: Widget Factory
  Assignee: [Frontend Lead]
  Reviewer: [Tech Lead]
  Status: Not Started
  Deadline: [Date]

...
```

---

## 💬 Issue Template for GitHub

```markdown
### [Ticket-ID] Issue Title

**Priority**: P0/P1/P2
**Effort**: 1-5h
**Type**: feat/fix/refactor/docs/test
**Owner**: [Team member]
**Status**: Not Started / In Progress / Review / Done

**Description**:
[What needs to be done]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests added
- [ ] Documentation updated

**Files to Modify**:
- file1.jsx
- file2.js

**Related Issues**: [Links to other tickets]
```

---

## 📞 Questions & Clarifications

### Architecture Decision: Widget Factory Pattern?
- **Why**: Easier to test, extend, maintain. Each widget is self-contained.
- **Alternative**: Keep renderWidget() as-is (simpler initially, harder long-term)
- **Decision**: GO with factory (scalability > simplicity)

### TypeScript Migration Timeline?
- **Current**: JSDoc + JavaScript
- **Future**: Consider TypeScript in next major version
- **Why**: JSDoc covers 80% of TS benefits with less build complexity

### Demo Data Refresh Strategy?
- **Current**: Static in code
- **Future**: Option to fetch real data from API
- **Now**: useWidgetRegistry getDemoData() function

---

**Created**: 4. prosince 2025
**Last Updated**: [To be updated as work progresses]
**Owner**: Tech Lead + Product Manager
**Status**: 🟢 Ready for Sprint Planning
