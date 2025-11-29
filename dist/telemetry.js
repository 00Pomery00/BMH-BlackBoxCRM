// Simple telemetry client snippet for BlackBox CRM
;(function () {
  const API = (window._BBX && window._BBX.telemetryUrl) || '/telemetry/event'
  function sendEvent(type, path, payload) {
    try {
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: type, path: path || location.pathname, payload }),
        keepalive: true,
      })
    } catch (e) {
      // fail silently
    }
  }

  // Heartbeat every 30s
  setInterval(function () {
    try {
      fetch('/telemetry/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_seen_at: new Date().toISOString() }),
        keepalive: true,
      })
    } catch (e) {}
  }, 30000)

  // Wire a few useful events
  window.addEventListener('load', function () {
    sendEvent('page.load', location.pathname, { title: document.title })
  })
  window.addEventListener('visibilitychange', function () {
    sendEvent('page.visibility', location.pathname, { visible: document.visibilityState })
  })

  // expose helper
  window.BBXTelemetry = { sendEvent }
})()
