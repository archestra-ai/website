---
title: Performance Benchmarks
category: Archestra Platform
order: 10
description: Performance metrics and benchmarks for Archestra Platform's security features
lastUpdated: 2025-10-15
---

## Overview

Archestra Platform is designed to provide enterprise-grade security for AI applications while maintaining high performance. This page documents the performance characteristics and overhead of various security features.

## Benchmark Methodology

All benchmarks are conducted using:

- **Hardware**: GCP n2-standard-4 (4-core CPU, 16GB RAM)
- **Database**: PostgreSQL (via Bitnami chart)
- **Load Testing Tool**: Apache Bench (ab)
- **Mode**: Mock mode (no real LLM API calls) to isolate platform overhead
- **Concurrency**: Configurable (default: 10 concurrent requests)
- **Test Scenarios**: Chat completions with tool definitions

## Performance Overview

Archestra Platform is designed as a high-performance security proxy for LLM applications, adding minimal overhead while providing enterprise-grade security features.

## Hardware Requirements

### Minimum Requirements (Development)
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB
- **Database**: PostgreSQL 14+ (can be shared)

### Recommended Requirements (Production)
- **CPU**: 4+ cores
- **RAM**: 8-16GB
- **Storage**: 50GB+ (depends on interaction logging volume)
- **Database**: Dedicated PostgreSQL 14+ instance with 4+ cores, 8GB+ RAM
- **Network**: Low-latency connection to LLM providers

### Deployment Tiers by Volume

| Tier | Requests/Day | Requests/Second | Platform Resources | Database Resources | Architecture |
|------|--------------|-----------------|-------------------|-------------------|--------------|
| **Small** | <100K | 1-100 | 1 instance: 2 vCPU, 4GB RAM | 2 vCPU, 4GB RAM | Single instance + shared DB |
| **Medium** | 100K-1M | 100-500 | 2-4 instances: 4 vCPU, 8GB RAM each | 4 vCPU, 8GB RAM, read replicas | Load balancer + DB replication |
| **Large** | 1M-10M | 500-2K | 4-8 instances: 4 vCPU, 16GB RAM each | 8 vCPU, 16GB RAM, connection pooling | Multi-region, dedicated DB cluster |
| **Enterprise** | >10M | 2K+ | 8+ instances: 8 vCPU, 16GB RAM each | 8+ vCPU, 32GB RAM, sharding | Multi-region, DB cluster + caching |

**Storage Requirements** (varies by interaction logging retention):
- Small: 20GB
- Medium: 50GB
- Large: 100-500GB
- Enterprise: 500GB-2TB+

## Throughput & Latency

### Benchmark Results

Measured on **GCP n2-standard-4** (4-core CPU, 16GB RAM) with mock mode enabled:

| Test Scenario | Throughput (req/s) | Mean Latency (ms) | P50 (ms) | P95 (ms) | P99 (ms) | Failed |
|---------------|-------------------|-------------------|----------|----------|----------|---------|
| Chat with Tools | 405.52 | 1233 | 1225 | 1290 | 1343 | 0 |

**Test Configuration**: 50,000 requests, 500 concurrent connections, Apache Bench

### Real-World Performance Expectations

**With Real LLM APIs** (OpenAI, Gemini, Anthropic):
- **Added Latency**: ~30-50ms platform overhead
- **Total Latency**: LLM API latency + 30-50ms
- **Throughput**: Limited by LLM API rate limits and latency, not by platform

**Platform Overhead Breakdown**:
- Request parsing and validation: <5ms
- Security policy evaluation: <5ms
- Database logging: ~10-15ms
- Response forwarding: <5ms
- **Total**: ~30-50ms per request

### Operation-Specific Performance

| Operation | Average Time | Notes |
|-----------|-------------|--------|
| Chat completion (no tools) | ~25ms | Request parsing + DB logging + forwarding |
| Chat completion (with tools) | ~30ms | + Tool metadata persistence |
| Tool invocation policy evaluation | <5ms | Per policy, per tool call |
| Trusted data policy evaluation | <3ms | Per policy, per message |
| Dual LLM quarantine (1 round) | ~2-3s | 2x LLM API calls (provider-dependent) |
| Dual LLM quarantine (3 rounds) | ~6-9s | 6x LLM API calls (provider-dependent) |
| Interaction logging (simple) | ~8ms | Small request/response (<5KB) |
| Interaction logging (complex) | ~15ms | Large request/response with tools (>20KB) |
| Policy lookup (cached) | <1ms | In-memory cache hit |
| Policy lookup (uncached) | ~5ms | Database query |

### Security Feature Impact

**Tool Invocation Policies**:
- Overhead: <5ms per policy evaluation
- Impact on throughput: Negligible (<2%)

**Trusted Data Policies**:
- Overhead: <5ms per data evaluation
- Impact on throughput: Negligible (<2%)

**Dual LLM Pattern** (when activated):
- Overhead: Depends on LLM provider latency × configured rounds
- Typical: 2-6 additional LLM calls per untrusted tool output
- Only triggered for untrusted tool results
- Configurable per-agent and per-tool

## Reliability & Availability

### Dependency Architecture

Archestra Platform has **minimal external dependencies**:

**Required Dependencies**:
- **PostgreSQL Database**: Required for interaction logging and policy storage
  - High availability: Use managed PostgreSQL (AWS RDS, GCP Cloud SQL, Azure Database)
  - Automatic failover recommended for production
- **LLM Provider APIs**: OpenAI, Google Gemini, or Anthropic
  - Platform proxies requests but does not store API keys
  - Failures propagate to client with appropriate error codes

**Optional Dependencies**:
- None - Platform is self-contained

### Graceful Degradation

**Database Failures**:
- ⚠️ Platform requires database connectivity for operation
- **Recommendation**: Use managed PostgreSQL with automatic failover
- **Mitigation**: Deploy multiple platform instances across availability zones

**LLM Provider Failures**:
- ✅ Platform gracefully forwards provider errors to clients
- ✅ Includes provider error codes and messages
- ✅ No data loss - interaction logging happens after successful response

**Platform Instance Failures**:
- ✅ Stateless design enables instant failover
- ✅ Deploy behind load balancer for automatic routing
- ✅ No session state - any instance can handle any request

### High Availability Setup

**Recommended Production Architecture**:
```
┌─────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴────┬─────────┬─────────┐
   │        │         │         │
┌──▼──┐  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐
│App 1│  │App 2│  │App 3│  │App N│
└──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘
   └────────┴─────────┴─────────┘
              │
        ┌─────▼──────┐
        │ PostgreSQL │
        │  (Primary) │
        └─────┬──────┘
              │
        ┌─────▼──────┐
        │ PostgreSQL │
        │ (Replica)  │
        └────────────┘
```

**Uptime Expectations**:
- **Platform SLA**: 99.9%+ (with proper deployment)
- **Overall System**: Limited by LLM provider SLA
- **Database**: 99.95%+ (with managed PostgreSQL)

### Monitoring & Observability

**Built-in Monitoring**:
- Interaction logging for all requests/responses
- Policy evaluation tracking
- Error logging and tracking
- Performance metrics available via database queries

**Recommended External Tools**:
- Prometheus + Grafana for metrics
- PostgreSQL `pg_stat_statements` for query analysis
- Application Performance Monitoring (APM) tools supported

## Database Performance

### Interaction Logging

**Overhead**: ~8-12ms per request

**Storage**:
- Average interaction size: ~2-5KB
- With tool calls: ~5-15KB
- Large context: ~50-100KB

**Query Performance**:
- List interactions: <50ms for 1000 records
- Get by ID: <5ms with index
- Filter by agent: <30ms with index

### Policy Evaluation

**Overhead**: ~2-5ms per policy lookup

**Cache Hit Rate**: ~95% for frequently used policies

## Scaling Characteristics

### Horizontal Scaling

Archestra Platform is stateless and can be scaled horizontally:

- **Database**: Primary bottleneck at high scale
- **Connection Pooling**: Recommended max 100 connections per instance
- **Recommended Setup**:
  - 1-10 req/s: Single instance
  - 10-50 req/s: 2-4 instances with load balancer
  - 50+ req/s: 5+ instances with dedicated PostgreSQL cluster

### Memory Usage

**Per Instance**:
- Base memory: ~150MB
- Per request: ~1-2MB (depends on context size)
- Recommended: 2GB RAM per instance
- With high concurrency (50+ concurrent): 4GB RAM

### Database Scaling

**PostgreSQL Performance**:
- Recommended: Dedicated PostgreSQL instance for production
- Connection pooling: Use PgBouncer for high-traffic deployments
- Indexes: All critical queries use indexes (agent_id, created_at)
- Partitioning: Consider partitioning `interaction` table for >10M records

## Benchmarking Your Setup

Archestra Platform includes built-in benchmarking infrastructure for measuring platform overhead in isolation.

### Local Benchmarking

To run benchmarks against your local development environment:

1. **Enable mock mode** in `platform/.env`:
   ```bash
   BENCHMARK_MOCK_MODE=true
   ```

2. **Create benchmark configuration** at `platform/benchmarks/benchmark-config.env`:
   ```bash
   export ARCHESTRA_API_URL=http://127.0.0.1:9000
   ```

3. **Configure test parameters** in `platform/benchmarks/.env`:
   ```bash
   NUM_REQUESTS=1000    # Total requests per test
   CONCURRENCY=10       # Concurrent requests
   ```

4. **Run benchmarks**:
   ```bash
   cd platform/benchmarks
   bash ./run-benchmark.sh
   ```

**Note**: Mock mode returns immediate responses without real LLM API calls, isolating pure platform overhead.

### GCP Benchmarking

For production-like benchmarks on GCP infrastructure:

```bash
cd platform/benchmarks

# Setup GCP VMs
./setup-gcp-benchmark.sh

# Run benchmarks
./run-benchmark.sh

# Cleanup resources
./cleanup-gcp-benchmark.sh
```

See `platform/benchmarks/README.md` for detailed setup instructions.

### Test Scenarios

- **Chat with tools**: Chat completion with tool definitions and mock tool calls
- All scenarios use mock responses to isolate platform overhead from network latency

### Metrics Collected

- Throughput (requests/second)
- Latency percentiles (P50, P95, P99)
- Time per request statistics
- Failed requests count

### Custom Load Testing

For custom benchmarks:

```bash
# Basic load test with Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -p request.json \
  http://localhost:9000/v1/openai/chat/completions

# Monitor database performance
# Connect to PostgreSQL and run:
SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
```

## Getting Help

If you experience performance issues:

1. Check the [Tilt web UI](http://localhost:10350/) for errors and logs
2. Monitor database query performance with Drizzle Studio
3. [Join the Slack community](https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg) for assistance
4. Report issues on [GitHub](https://github.com/archestraai/archestra)
