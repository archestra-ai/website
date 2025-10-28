---
title: Observability
category: Archestra Platform
order: 5
---

# Platform Observability

The Archestra platform exposes Prometheus metrics and OpenTelemetry traces for monitoring system health, tracking HTTP requests, and analyzing LLM API performance.

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

### LLM Metrics

- `llm_request_duration_seconds` - LLM API request duration by provider, agent, and status code
- `llm_tokens_total` - Token consumption by provider, agent, and type (input/output)

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

## Distributed Tracing

The platform exports OpenTelemetry traces to help you understand request flows and identify performance bottlenecks. Traces can be consumed by any OTLP-compatible backend (Jaeger, Tempo, Honeycomb, Grafana Cloud, etc.).

### Configuration

Configure the OpenTelemetry Collector endpoint via environment variable:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-collector:4318/v1/traces
```

If not specified, the platform defaults to `http://localhost:4318/v1/traces`.

### What's Traced

The platform automatically traces:

- **HTTP requests** - All API requests with method, route, and status code
- **LLM API calls** - External calls to OpenAI, Anthropic, and Gemini with dedicated spans showing exact response time

### LLM Request Spans

Each LLM API call includes detailed attributes for filtering and analysis:

**Span Attributes:**

- `route.category=llm-proxy` - All LLM proxy requests
- `llm.provider` - Provider name (`openai`, `anthropic`, `gemini`)
- `llm.model` - Model name (e.g., `gpt-4`, `claude-3-5-sonnet-20241022`)
- `llm.stream` - Whether the request was streaming (`true`/`false`)

**Span Names:**

- `openai.chat.completions` - OpenAI chat completion calls
- `anthropic.messages` - Anthropic message calls
- `gemini.generateContent` - Gemini content generation calls

These dedicated spans show the exact duration of external LLM API calls, separate from your application's processing time.

## Setting Up Prometheus

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

Here are some PromQL queries for Grafana charts to get you started:

### HTTP Metrics

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

### LLM Metrics

- LLM requests per second by agent and provider:

  ```promql
  sum(rate(llm_request_duration_seconds_count[5m])) by (agent, provider)
  ```

- LLM token usage rate (tokens/sec):

  ```promql
  sum(rate(llm_tokens_total[5m])) by (provider, agent, type)
  ```

- LLM error rate by provider:

  ```promql
  sum(rate(llm_request_duration_seconds_count{status_code!="200"}[5m])) by (provider) / sum(rate(llm_request_duration_seconds_count[5m])) by (provider) * 100
  ```
