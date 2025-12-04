# BlackBox CRM - API Specification

**Version:** 1.0.0  
**Last Updated:** December 4, 2025  
**Base URL:** `http://localhost:8000/api/v1`

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard Endpoints](#dashboard-endpoints)
3. [Widget Endpoints](#widget-endpoints)
4. [Configuration Endpoints](#configuration-endpoints)
5. [Error Codes](#error-codes)
6. [Data Models](#data-models)

---

## Authentication

All API endpoints require authentication using JWT tokens.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Authentication Flow

1. **Login:** `POST /auth/login` → Returns JWT token
2. **Include token** in `Authorization` header for all subsequent requests
3. **Token expiry:** 24 hours (configurable)

---

## Dashboard Endpoints

### 1. List All Dashboards

Get all dashboards for the authenticated user.

**Endpoint:** `GET /dashboards`

**Request:**
```http
GET /api/v1/dashboards HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "dashboards": [
    {
      "id": "dash_001",
      "name": "Sales Dashboard",
      "description": "Overview of sales metrics",
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-04T15:30:00Z",
      "is_default": true,
      "widget_count": 8
    },
    {
      "id": "dash_002",
      "name": "Marketing Dashboard",
      "description": "Lead generation and conversion tracking",
      "created_at": "2025-12-02T14:20:00Z",
      "updated_at": "2025-12-03T09:15:00Z",
      "is_default": false,
      "widget_count": 6
    }
  ],
  "total": 2
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 2. Get Dashboard by ID

Retrieve detailed information about a specific dashboard.

**Endpoint:** `GET /dashboards/:id`

**Request:**
```http
GET /api/v1/dashboards/dash_001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "id": "dash_001",
  "name": "Sales Dashboard",
  "description": "Overview of sales metrics",
  "created_at": "2025-12-01T10:00:00Z",
  "updated_at": "2025-12-04T15:30:00Z",
  "is_default": true,
  "config": {
    "enabledWidgets": [
      "kpi_customers",
      "kpi_revenue",
      "chart_opportunities",
      "table_sales_analytics"
    ],
    "widgetOrder": [
      "kpi_customers",
      "kpi_revenue",
      "chart_opportunities",
      "table_sales_analytics"
    ],
    "widgetConfigs": {
      "chart_opportunities": {
        "dateRange": "last_30_days",
        "groupBy": "status"
      },
      "table_sales_analytics": {
        "pageSize": 10,
        "sortBy": "revenue",
        "sortOrder": "desc"
      }
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Dashboard not found
- `403 Forbidden` - User doesn't have access to this dashboard

---

### 3. Create Dashboard

Create a new dashboard.

**Endpoint:** `POST /dashboards`

**Request:**
```http
POST /api/v1/dashboards HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Executive Dashboard",
  "description": "High-level business metrics for executives",
  "is_default": false,
  "config": {
    "enabledWidgets": ["kpi_revenue", "kpi_profit", "chart_revenue_trend"],
    "widgetOrder": ["kpi_revenue", "kpi_profit", "chart_revenue_trend"],
    "widgetConfigs": {
      "chart_revenue_trend": {
        "dateRange": "last_90_days"
      }
    }
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "dash_003",
  "name": "Executive Dashboard",
  "description": "High-level business metrics for executives",
  "created_at": "2025-12-04T16:00:00Z",
  "updated_at": "2025-12-04T16:00:00Z",
  "is_default": false,
  "config": {
    "enabledWidgets": ["kpi_revenue", "kpi_profit", "chart_revenue_trend"],
    "widgetOrder": ["kpi_revenue", "kpi_profit", "chart_revenue_trend"],
    "widgetConfigs": {
      "chart_revenue_trend": {
        "dateRange": "last_90_days"
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body (missing required fields, invalid widget IDs)
- `401 Unauthorized` - Invalid token
- `409 Conflict` - Dashboard with this name already exists

---

### 4. Update Dashboard

Update an existing dashboard's configuration.

**Endpoint:** `PUT /dashboards/:id`

**Request:**
```http
PUT /api/v1/dashboards/dash_001 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Sales Dashboard (Updated)",
  "description": "Comprehensive sales analytics",
  "config": {
    "enabledWidgets": [
      "kpi_customers",
      "kpi_revenue",
      "kpi_invoices",
      "chart_opportunities"
    ],
    "widgetOrder": [
      "kpi_customers",
      "kpi_revenue",
      "kpi_invoices",
      "chart_opportunities"
    ],
    "widgetConfigs": {
      "chart_opportunities": {
        "dateRange": "last_60_days",
        "groupBy": "stage"
      }
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "dash_001",
  "name": "Sales Dashboard (Updated)",
  "description": "Comprehensive sales analytics",
  "created_at": "2025-12-01T10:00:00Z",
  "updated_at": "2025-12-04T16:15:00Z",
  "is_default": true,
  "config": {
    "enabledWidgets": [
      "kpi_customers",
      "kpi_revenue",
      "kpi_invoices",
      "chart_opportunities"
    ],
    "widgetOrder": [
      "kpi_customers",
      "kpi_revenue",
      "kpi_invoices",
      "chart_opportunities"
    ],
    "widgetConfigs": {
      "chart_opportunities": {
        "dateRange": "last_60_days",
        "groupBy": "stage"
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - User doesn't have permission to update this dashboard
- `404 Not Found` - Dashboard not found

---

### 5. Delete Dashboard

Delete a dashboard.

**Endpoint:** `DELETE /dashboards/:id`

**Request:**
```http
DELETE /api/v1/dashboards/dash_002 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Cannot delete default dashboard or user lacks permission
- `404 Not Found` - Dashboard not found

---

## Widget Endpoints

### 1. List Available Widgets

Get all available widget types.

**Endpoint:** `GET /widgets`

**Request:**
```http
GET /api/v1/widgets HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "widgets": [
    {
      "id": "kpi_customers",
      "name": "Total Customers",
      "category": "kpi",
      "description": "Displays total customer count with trend indicator",
      "config_schema": {
        "dateRange": {
          "type": "string",
          "enum": ["last_7_days", "last_30_days", "last_90_days"],
          "default": "last_30_days"
        }
      }
    },
    {
      "id": "chart_opportunities",
      "name": "Opportunities Chart",
      "category": "chart",
      "description": "Bar chart showing opportunities by status",
      "config_schema": {
        "dateRange": {
          "type": "string",
          "enum": ["last_30_days", "last_60_days", "last_90_days"],
          "default": "last_30_days"
        },
        "groupBy": {
          "type": "string",
          "enum": ["status", "stage", "source"],
          "default": "status"
        }
      }
    }
  ],
  "total": 14,
  "categories": ["kpi", "chart", "table", "feed", "gamification"]
}
```

---

### 2. Get Widget by ID

Get detailed information about a specific widget.

**Endpoint:** `GET /widgets/:id`

**Request:**
```http
GET /api/v1/widgets/kpi_revenue HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "id": "kpi_revenue",
  "name": "Total Revenue",
  "category": "kpi",
  "description": "Displays total revenue with percentage change vs previous period",
  "config_schema": {
    "dateRange": {
      "type": "string",
      "enum": ["last_7_days", "last_30_days", "last_90_days", "ytd"],
      "default": "last_30_days",
      "description": "Time period for revenue calculation"
    },
    "currency": {
      "type": "string",
      "enum": ["CZK", "EUR", "USD"],
      "default": "CZK"
    }
  },
  "supports_realtime": true,
  "refresh_interval": 300
}
```

**Error Responses:**
- `404 Not Found` - Widget ID not found

---

### 3. Get Widget Demo Data

Retrieve demo/sample data for a widget (for testing/preview).

**Endpoint:** `GET /widgets/:id/demo-data`

**Request:**
```http
GET /api/v1/widgets/chart_opportunities/demo-data HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "widget_id": "chart_opportunities",
  "demo_data": [
    { "name": "New", "value": 45, "color": "#3b82f6" },
    { "name": "Qualified", "value": 32, "color": "#8b5cf6" },
    { "name": "Proposal", "value": 18, "color": "#ec4899" },
    { "name": "Won", "value": 28, "color": "#10b981" },
    { "name": "Lost", "value": 12, "color": "#ef4444" }
  ],
  "metadata": {
    "total_opportunities": 135,
    "generated_at": "2025-12-04T16:30:00Z"
  }
}
```

---

### 4. Get Widget Live Data

Retrieve real-time data for a widget.

**Endpoint:** `GET /widgets/:id/data`

**Query Parameters:**
- `dateRange` (optional): `last_7_days`, `last_30_days`, `last_90_days`, `ytd`
- `groupBy` (optional): Grouping parameter (widget-specific)
- `filters` (optional): JSON-encoded filter object

**Request:**
```http
GET /api/v1/widgets/kpi_revenue/data?dateRange=last_30_days HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "widget_id": "kpi_revenue",
  "data": {
    "current_value": 1245680,
    "previous_value": 1098450,
    "change_percent": 13.4,
    "trend": "up",
    "currency": "CZK"
  },
  "metadata": {
    "date_range": "last_30_days",
    "calculation_date": "2025-12-04T16:35:00Z",
    "data_points": 30
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid query parameters
- `404 Not Found` - Widget not found

---

## Configuration Endpoints

### 1. Get User Dashboard Configuration

Retrieve the current user's dashboard configuration (stored in localStorage on client, synced to server).

**Endpoint:** `GET /config/dashboard`

**Request:**
```http
GET /api/v1/config/dashboard HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "user_id": "user_123",
  "dashboard_config": {
    "enabledWidgets": [
      "kpi_customers",
      "kpi_revenue",
      "chart_opportunities",
      "table_sales_analytics"
    ],
    "widgetOrder": [
      "kpi_customers",
      "kpi_revenue",
      "chart_opportunities",
      "table_sales_analytics"
    ],
    "widgetConfigs": {
      "chart_opportunities": {
        "dateRange": "last_30_days",
        "groupBy": "status"
      },
      "table_sales_analytics": {
        "pageSize": 10,
        "sortBy": "revenue",
        "sortOrder": "desc"
      }
    }
  },
  "last_updated": "2025-12-04T15:00:00Z"
}
```

---

### 2. Update User Dashboard Configuration

Save the user's dashboard configuration.

**Endpoint:** `PUT /config/dashboard`

**Request:**
```http
PUT /api/v1/config/dashboard HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "enabledWidgets": [
    "kpi_customers",
    "kpi_revenue",
    "kpi_invoices",
    "kpi_profit",
    "chart_opportunities"
  ],
  "widgetOrder": [
    "kpi_customers",
    "kpi_revenue",
    "kpi_invoices",
    "kpi_profit",
    "chart_opportunities"
  ],
  "widgetConfigs": {
    "chart_opportunities": {
      "dateRange": "last_60_days",
      "groupBy": "stage"
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "user_id": "user_123",
  "dashboard_config": {
    "enabledWidgets": [
      "kpi_customers",
      "kpi_revenue",
      "kpi_invoices",
      "kpi_profit",
      "chart_opportunities"
    ],
    "widgetOrder": [
      "kpi_customers",
      "kpi_revenue",
      "kpi_invoices",
      "kpi_profit",
      "chart_opportunities"
    ],
    "widgetConfigs": {
      "chart_opportunities": {
        "dateRange": "last_60_days",
        "groupBy": "stage"
      }
    }
  },
  "last_updated": "2025-12-04T16:45:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid configuration (unknown widget IDs, invalid config values)
- `401 Unauthorized` - Invalid token

---

### 3. Reset Dashboard Configuration

Reset to default dashboard configuration.

**Endpoint:** `POST /config/dashboard/reset`

**Request:**
```http
POST /api/v1/config/dashboard/reset HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "user_id": "user_123",
  "dashboard_config": {
    "enabledWidgets": [
      "kpi_customers",
      "kpi_revenue",
      "kpi_invoices",
      "kpi_profit"
    ],
    "widgetOrder": [
      "kpi_customers",
      "kpi_revenue",
      "kpi_invoices",
      "kpi_profit"
    ],
    "widgetConfigs": {}
  },
  "last_updated": "2025-12-04T16:50:00Z",
  "reset_to_defaults": true
}
```

---

## Error Codes

### Standard HTTP Status Codes

| Code | Description | Example Use Case |
|------|-------------|------------------|
| `200 OK` | Request successful | GET, PUT requests |
| `201 Created` | Resource created successfully | POST dashboard |
| `204 No Content` | Request successful, no response body | DELETE dashboard |
| `400 Bad Request` | Invalid request parameters or body | Malformed JSON, invalid widget ID |
| `401 Unauthorized` | Missing or invalid authentication token | Expired JWT, no Authorization header |
| `403 Forbidden` | Valid token but insufficient permissions | Delete default dashboard, access other user's data |
| `404 Not Found` | Resource not found | Dashboard ID doesn't exist |
| `409 Conflict` | Resource conflict | Dashboard name already exists |
| `422 Unprocessable Entity` | Validation error | Widget config doesn't match schema |
| `500 Internal Server Error` | Server error | Database connection failure |

### Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": {
    "code": "WIDGET_NOT_FOUND",
    "message": "Widget with ID 'invalid_widget' does not exist",
    "status": 404,
    "timestamp": "2025-12-04T17:00:00Z",
    "details": {
      "requested_widget_id": "invalid_widget",
      "available_widgets": ["kpi_customers", "kpi_revenue", "..."]
    }
  }
}
```

### Application-Specific Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `MISSING_AUTH_HEADER` | 401 | Authorization header not provided |
| `DASHBOARD_NOT_FOUND` | 404 | Dashboard ID doesn't exist |
| `WIDGET_NOT_FOUND` | 404 | Widget ID doesn't exist |
| `INVALID_WIDGET_CONFIG` | 422 | Widget configuration doesn't match schema |
| `DUPLICATE_DASHBOARD_NAME` | 409 | Dashboard name already exists for this user |
| `CANNOT_DELETE_DEFAULT` | 403 | Cannot delete the default dashboard |
| `INVALID_DATE_RANGE` | 400 | Date range parameter is invalid |
| `DATABASE_ERROR` | 500 | Database operation failed |

---

## Data Models

### Dashboard Model

```typescript
interface Dashboard {
  id: string;                    // Unique identifier (e.g., "dash_001")
  name: string;                  // Dashboard name
  description: string;           // Dashboard description
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
  is_default: boolean;           // Whether this is the default dashboard
  user_id: string;               // Owner user ID
  config: DashboardConfig;       // Widget configuration
}
```

### DashboardConfig Model

```typescript
interface DashboardConfig {
  enabledWidgets: string[];      // Array of enabled widget IDs
  widgetOrder: string[];         // Order of widgets (same IDs as enabledWidgets)
  widgetConfigs: {               // Widget-specific configurations
    [widgetId: string]: WidgetConfig;
  };
}
```

### WidgetConfig Model

```typescript
interface WidgetConfig {
  dateRange?: string;            // "last_7_days" | "last_30_days" | "last_90_days" | "ytd"
  groupBy?: string;              // Chart grouping (widget-specific)
  pageSize?: number;             // Table pagination size
  sortBy?: string;               // Table sort column
  sortOrder?: "asc" | "desc";    // Table sort direction
  currency?: string;             // "CZK" | "EUR" | "USD"
  [key: string]: any;            // Additional widget-specific config
}
```

### Widget Model

```typescript
interface Widget {
  id: string;                    // Unique widget identifier
  name: string;                  // Display name
  category: WidgetCategory;      // Widget category
  description: string;           // Widget description
  config_schema: object;         // JSON Schema for widget config
  supports_realtime: boolean;    // Whether widget supports real-time updates
  refresh_interval?: number;     // Auto-refresh interval in seconds
}

type WidgetCategory = "kpi" | "chart" | "table" | "feed" | "gamification";
```

---

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Authenticated requests:** 1000 requests per hour per user
- **Widget data endpoints:** 100 requests per minute per user
- **Configuration updates:** 60 requests per hour per user

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1701705600
```

When rate limit is exceeded, API returns `429 Too Many Requests`:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45 seconds.",
    "status": 429,
    "retry_after": 45
  }
}
```

---

## Versioning

API version is specified in the URL path: `/api/v1/...`

- **Current version:** v1
- **Deprecation policy:** Minimum 6 months notice before version sunset
- **Breaking changes:** Only introduced in major version updates

---

## CORS Policy

CORS is enabled for the following origins:

- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://app.blackboxcrm.com` (production)

Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`  
Allowed headers: `Authorization`, `Content-Type`

---

## Changelog

### v1.0.0 (2025-12-04)
- Initial API specification
- Dashboard CRUD endpoints
- Widget listing and data endpoints
- Configuration management endpoints
- Error handling and rate limiting

---

## Support

For API support, contact: `api-support@blackboxcrm.com`  
Documentation updates: [GitHub Repository](https://github.com/00Pomery00/BMH-BlackBoxCRM)
