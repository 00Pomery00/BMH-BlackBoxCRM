# Dashboard Builder Refactoring & Optimization Roadmap

## 🎯 Strategic Goals

1. **Eliminate Code Duplication** – Centralize widget logic
2. **Improve Performance** – Memoization, lazy loading
3. **Enhance Type Safety** – TypeScript/JSDoc
4. **Strengthen Security** – Input validation, error handling
5. **Enable Team Collaboration** – Specs, API contracts, Figma
6. **Ensure Testability** – Unit + E2E test coverage

---

## 📋 Refactoring Tasks (Priority Order)

### Phase 1: Code Deduplication & Architecture

#### 1.1 Extract Demo Data to useWidgetRegistry ⭐ HIGH PRIORITY
- **File**: `web-frontend/src/hooks/useWidgetRegistry.js`
- **Issue**: Demo data (opportunitiesData, leadSourceData, etc.) duplicated in DynamicDashboard
- **Solution**: Add `getDemoData(widgetId)` to registry
- **Impact**: Single source of truth, easier maintenance
- **Effort**: 1-2 hours
- **Owner**: Backend/Frontend Lead

#### 1.2 Create Widget Renderer Factory ⭐ HIGH PRIORITY
- **File**: New file `web-frontend/src/components/widgets/WidgetRenderer.jsx`
- **Issue**: renderWidget() switch statement in DynamicDashboard is 250+ lines
- **Solution**: Component factory pattern – each widget type in own file
- **Structure**:
  ```
  components/widgets/
  ├── KpiWidget.jsx
  ├── ChartWidget.jsx
  ├── TableWidget.jsx
  ├── InboxWidget.jsx
  ├── GamificationWidget.jsx
  ├── ActivityWidget.jsx
  └── WidgetRenderer.jsx (routes to correct component)
  ```
- **Impact**: Cleaner code, easier to extend
- **Effort**: 3-4 hours
- **Owner**: Frontend Lead

#### 1.3 Extract Storage Logic to useLocalStorage Hook ⭐ HIGH PRIORITY
- **File**: New file `web-frontend/src/hooks/useLocalStorage.js`
- **Issue**: localStorage error handling scattered, no fallback
- **Solution**: Custom hook with error handling, serialization, validation
- **Usage**:
  ```jsx
  const [config, setConfig] = useLocalStorage('bbx_ui_settings', defaultConfig);
  ```
- **Impact**: DRY principle, better error handling
- **Effort**: 1 hour
- **Owner**: Frontend Dev

#### 1.4 Create useDashboardConfig Hook
- **File**: New file `web-frontend/src/hooks/useDashboardConfig.js`
- **Issue**: Config initialization logic duplicated between Profile/DynamicDashboard
- **Solution**: Single hook for read/write dashboard config
- **Impact**: Consistency, easier testing
- **Effort**: 1 hour
- **Owner**: Frontend Dev

### Phase 2: Performance & Optimization

#### 2.1 Implement Memoization ⭐ MEDIUM PRIORITY
- **Files**: `DynamicDashboard.jsx`, `DashboardBuilder.jsx`
- **Issue**: Unnecessary re-renders on every parent state change
- **Solution**:
  - `useMemo` for KPI filter, widget order filter
  - `memo()` for widget cards
  - `useCallback` for event handlers
- **Impact**: Faster renders (especially with many widgets)
- **Effort**: 1-2 hours
- **Owner**: Frontend Lead

#### 2.2 Lazy Load Widget Components
- **File**: `components/DynamicDashboard.jsx`
- **Issue**: All widget imports loaded upfront, slow initial load
- **Solution**: Dynamic imports with React.lazy + Suspense
- **Impact**: Smaller initial JS bundle
- **Effort**: 1 hour
- **Owner**: Frontend Dev

#### 2.3 Optimize Demo Data Structure
- **Issue**: Arrays recreated on every render
- **Solution**: Extract to constant or move to `useWidgetRegistry`
- **Impact**: Less memory usage
- **Effort**: 30 minutes
- **Owner**: Frontend Dev

### Phase 3: Type Safety & Documentation

#### 3.1 Add JSDoc Type Definitions ⭐ MEDIUM PRIORITY
- **Files**: All new components
- **Issue**: No type hints, hard to understand prop contracts
- **Solution**: JSDoc comments for all functions, components, hooks
- **Example**:
  ```jsx
  /**
   * @typedef {Object} WidgetConfig
   * @property {string} id - Widget ID
   * @property {string} title - Display title
   * @property {number} [height] - Chart height in px
   * @property {number} [pageSize] - Table rows per page
   */

   /**
    * @param {WidgetConfig} config
    * @returns {JSX.Element}
    */
   function WidgetRenderer({ config }) { ... }
  ```
- **Impact**: Better IDE autocomplete, self-documenting code
- **Effort**: 2 hours
- **Owner**: Tech Lead / Documentation Owner

#### 3.2 Create API Contract Documentation
- **File**: New file `DASHBOARD_API_SPEC.md`
- **Issue**: No formal spec for POST /api/ui/settings
- **Solution**: OpenAPI/Swagger format spec
- **Contents**:
  - Request/response schemas
  - Error codes
  - Validation rules
  - Example payloads
- **Impact**: Clear backend contract, easier API testing
- **Effort**: 1.5 hours
- **Owner**: Backend Lead

#### 3.3 Create TypeScript Types File (future)
- **File**: `web-frontend/src/types/dashboard.ts`
- **Issue**: No type safety with TypeScript
- **Solution**: Convert to TS later, export types from .ts file
- **Priority**: Future/P2
- **Owner**: Frontend Lead

### Phase 4: Testing & Quality

#### 4.1 Add Unit Tests ⭐ MEDIUM PRIORITY
- **Files**: Create `web-frontend/__tests__/`
- **Tests Needed**:
  - `useWidgetRegistry.test.js` – getWidgetById, getWidgetsByCategory
  - `useLocalStorage.test.js` – persistence, error handling
  - `DashboardBuilder.test.jsx` – toggle, reorder, config update
  - Widget components – render with various configs
- **Impact**: Prevent regressions, easy refactoring
- **Effort**: 3-4 hours
- **Owner**: Frontend QA / Dev

#### 4.2 Add E2E Tests
- **File**: Extend `web-frontend/e2e/tests/`
- **Tests Needed**:
  - User selects widget → appears on dashboard
  - User changes widget config → updates rendered widget
  - User refreshes → config persists
  - Multiple users don't interfere
- **Impact**: Confidence in user workflows
- **Effort**: 2-3 hours
- **Owner**: QA Engineer

#### 4.3 Add Error Boundary
- **File**: `web-frontend/src/components/DashboardErrorBoundary.jsx`
- **Issue**: Widget crash breaks entire dashboard
- **Solution**: Error boundary wrapper
- **Impact**: Better UX on widget errors
- **Effort**: 30 minutes
- **Owner**: Frontend Dev

### Phase 5: Developer Experience & Documentation

#### 5.1 Create Storybook Stories ⭐ LOW PRIORITY (Nice-to-have)
- **Files**: `web-frontend/src/components/*.stories.jsx`
- **Issue**: No UI component catalogue
- **Solution**: Add Storybook stories for DashboardBuilder, DynamicDashboard
- **Impact**: Easy to test components in isolation
- **Effort**: 2 hours
- **Owner**: Frontend Dev

#### 5.2 Enhance Developer Guide
- **File**: Update `DASHBOARD_DEVELOPER_GUIDE.md`
- **Additions**:
  - Architecture diagram (ASCII art or Mermaid)
  - Data flow diagram
  - Decision rationale (why not drag-drop, why registry pattern)
  - Common pitfalls & debugging
  - Performance tips
- **Impact**: Onboarding time reduced
- **Effort**: 1.5 hours
- **Owner**: Tech Lead

#### 5.3 Create Contribution Guide
- **File**: New file `CONTRIBUTING_DASHBOARD.md`
- **Contents**:
  - How to add new widget (step-by-step)
  - Code style & conventions
  - Testing requirements
  - PR checklist
- **Impact**: Consistent contributions
- **Effort**: 1 hour
- **Owner**: Tech Lead

#### 5.4 Setup ESLint/Prettier Rules
- **File**: Update `.eslintrc`, `.prettierrc`
- **Issue**: No linting rules specific to widgets
- **Solution**: Add rules to prevent large files, enforce naming conventions
- **Impact**: Code consistency
- **Effort**: 30 minutes
- **Owner**: Frontend Lead

### Phase 6: Security & Validation

#### 6.1 Input Validation on DashboardBuilder ⭐ MEDIUM PRIORITY
- **Files**: `DashboardBuilder.jsx`, `Profile.jsx`
- **Issue**: No validation on widget config inputs (height > 600px?, pageSize > 50?)
- **Solution**: Schema validation (Zod or Yup)
- **Impact**: Prevent malformed configs
- **Effort**: 1-2 hours
- **Owner**: Frontend Dev

#### 6.2 Add CSRF Protection
- **File**: `Profile.jsx` handleSubmit
- **Issue**: POST /api/ui/settings may be vulnerable
- **Solution**: Ensure CSRF token included in request
- **Impact**: Security hardening
- **Effort**: 30 minutes
- **Owner**: Backend/Security Lead

#### 6.3 XSS Prevention Review
- **Issue**: Widget titles/configs stored & rendered
- **Solution**: Audit React escaping, add sanitization if needed
- **Impact**: Prevent injection attacks
- **Effort**: 1 hour
- **Owner**: Security/Backend Lead

### Phase 7: Team & Process Setup

#### 7.1 Create Figma Design Spec
- **File**: Figma project link in CONTRIBUTING_DASHBOARD.md
- **Issue**: No UI spec for future widget design
- **Solution**: Figma prototype with DashboardBuilder, sample widgets
- **Contents**:
  - Component library
  - Color palette
  - Typography
  - Spacing rules
  - Dark mode
- **Impact**: Designers can contribute, consistent UI
- **Effort**: 4-5 hours
- **Owner**: Design Lead / Frontend Lead

#### 7.2 Setup PR Template
- **File**: `.github/pull_request_template.md`
- **Contents**:
  - Widget checklist: added to registry? tested? documented?
  - Type of change (feat/fix/refactor)
  - Testing done
  - Screenshots/GIF
- **Impact**: Consistent PR quality
- **Effort**: 30 minutes
- **Owner**: DevOps/Tech Lead

#### 7.3 Create Jira/GitHub Issue Templates
- **Files**: `.github/ISSUE_TEMPLATE/`
- **Templates**:
  - New Widget Request
  - Bug Report (widget not rendering?)
  - Performance Issue
  - Documentation Gap
- **Impact**: Better issue tracking
- **Effort**: 1 hour
- **Owner**: Product Manager / Tech Lead

#### 7.4 Setup CI/CD for Dashboard Tests
- **File**: Update `.github/workflows/`
- **Solution**: GitHub Actions to run:
  - Widget lint & build
  - Unit tests
  - E2E tests (optional, may be slow)
  - Bundle size check
- **Impact**: Prevent regressions in PRs
- **Effort**: 2 hours
- **Owner**: DevOps Lead

---

## 👥 Team Role Assignments

### Frontend Team Lead
- Oversee refactoring phases 1-2
- Code reviews
- Architecture decisions

### Backend Lead
- API contract spec (3.2)
- CSRF/XSS review (6.2, 6.3)
- `/api/ui/settings` improvements

### Frontend Developer(s)
- Implement phases 1-4
- Unit tests
- Bug fixes

### QA Engineer
- E2E tests (4.2)
- Testing strategy
- Regression testing

### Design Lead
- Figma specs (7.1)
- Widget design guidelines
- Dark mode considerations

### Tech Lead / Architect
- Overall roadmap planning
- Architecture reviews
- Documentation & standards

### DevOps / CI/CD
- GitHub Actions setup (7.4)
- Performance monitoring
- Release management

---

## 📊 Implementation Timeline

### Week 1 (Now)
- [ ] 1.1: Extract demo data
- [ ] 1.3: useLocalStorage hook
- [ ] 1.4: useDashboardConfig hook
- [ ] 3.1: JSDoc type definitions
- **Owner**: 1 Frontend Dev

### Week 2
- [ ] 1.2: Widget Renderer Factory
- [ ] 2.1: Memoization
- [ ] 4.1: Unit tests (50%)
- **Owner**: Frontend Lead + 1 Dev

### Week 3
- [ ] 3.2: API Spec documentation
- [ ] 4.1: Unit tests (finish)
- [ ] 4.2: E2E tests
- [ ] 6.1: Input validation
- **Owner**: Frontend Dev + QA + Backend Lead

### Week 4
- [ ] 7.1: Figma design spec
- [ ] 5.2: Enhance developer guide
- [ ] 5.3: Contribution guide
- [ ] 7.2-7.4: Process setup
- **Owner**: Tech Lead + Design Lead

---

## 🎯 Success Metrics

✅ **Code Quality**:
- Reduce DynamicDashboard.jsx from 249 → ~100 lines (40% reduction)
- 0 ESLint errors/warnings
- 80%+ test coverage

✅ **Performance**:
- Bundle size: < 350 KB (gzipped)
- Time-to-interactive: < 3s on 4G
- Widget render: < 16ms (60fps)

✅ **Developer Experience**:
- Onboarding time: < 2 hours
- Time to add new widget: < 1 hour
- All team roles can contribute

✅ **Security**:
- 0 XSS vulnerabilities
- 0 CSRF vulnerabilities
- 100% input validation coverage

✅ **Documentation**:
- API spec 100% complete
- Developer guide: 5/5 stars in feedback
- All widgets documented

---

## 📚 Appendix: Refactoring Checklist

### Before Starting Phase
- [ ] Create feature branch: `feat/dashboard-refactor`
- [ ] Update JIRA board
- [ ] Assign team members
- [ ] Schedule sync meetings

### During Each Task
- [ ] Write tests FIRST (TDD)
- [ ] Run linter: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run E2E: `npm run e2e` (if applicable)
- [ ] Code review from peer
- [ ] Update documentation

### Before Merging
- [ ] All tests pass
- [ ] No regressions in E2E
- [ ] Performance benchmarks OK
- [ ] Security review done
- [ ] Documentation updated
- [ ] 2 approvals from maintainers

---

**Created**: 4. prosince 2025
**Updated**: [to be updated as work progresses]
**Status**: 🟢 Ready for Planning
**Owner**: Tech Lead + Frontend Team
