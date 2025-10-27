---
title: Observability
category: Archestra Platform
order: 5
---

# Platform Observability

The Archestra platform provides Prometheus-compatible metrics for monitoring and a health check endpoint.

## Health Check

The endpoint `http://localhost:9000/health` returns basic service status:

```json
{
  "status": "Archestra Platform API",
  "version": "0.0.1"
}
```

## Metrics

The endpoint `http://localhost:9000/metrics` exposes Prometheus-formatted metrics including:

### HTTP Metrics

- `http_request_duration_seconds_count` - Total HTTP requests by method, route, and status
- `http_request_duration_seconds_bucket` - Request duration histogram buckets
- `http_request_summary_seconds` - Request duration summary with quantiles

### Process Metrics

- `process_cpu_user_seconds_total` - CPU time in user mode
- `process_cpu_system_seconds_total` - CPU time in system mode
- `process_resident_memory_bytes` - Physical memory usage
- `process_start_time_seconds` - Process start timestamp

### Node.js Runtime Metrics

- `nodejs_eventloop_lag_seconds` - Event loop lag (latency indicator)
- `nodejs_heap_size_used_bytes` - V8 heap memory usage
- `nodejs_heap_size_total_bytes` - Total V8 heap size
- `nodejs_external_memory_bytes` - External memory usage
- `nodejs_active_requests_total` - Currently active async requests
- `nodejs_active_handles_total` - Active handles (file descriptors, timers)
- `nodejs_gc_duration_seconds` - Garbage collection timing by type
- `nodejs_version_info` - Node.js version information

## Setting Up Monitoring

_The following instructions assume you are familiar with Grafana and Prometheus and have them already set up._

Add the following to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'archestra-backend'
    static_configs:
      - targets: ['localhost:9000'] # Platform API base URL
    scrape_interval: 15s
    metrics_path: /metrics
```

If you are unsure what the Platform API base URL is, check the Platform UI's Settings.

## Chart Examples

Here are some Grafana charts to get you started:

- Request rate by route:
  ```promql
  rate(http_request_duration_seconds_count[5m])
  ```

- Error rate by route:
  ```promql
  sum(rate(http_request_duration_seconds_count{status_code=~"4..|5.."}[5m])) by (route, method) / sum(rate(http_request_duration_seconds_count[5m])) by (route, method) * 100
  ```
  
- Response time percentiles:
  ```promql
  histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
  ```
  
- Memory usage:
  ```promql
  process_resident_memory_bytes / 1024 / 1024
  ```

## Coming Soon

- LLM request count, duration, error rate and token usage per agent
- OpenTelemetry tracing (OTeL)
