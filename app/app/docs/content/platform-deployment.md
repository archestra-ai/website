---
title: Deployment
category: Archestra Platform
order: 3
---

The Archestra Platform can be deployed using Docker for development and testing, or Helm for production environments. Both deployment methods provide access to the Admin UI on port 3000 and the API on port 9000.

## Environment Variables

The following environment variables can be used to configure Archestra Platform:

- **`ARCHESTRA_API_BASE_URL`** - Base URL for the Archestra API proxy. This is where your agents should connect to instead of the LLM provider directly.
  - Default: `http://localhost:9000`
  - Example: `http://localhost:9001` or `https://api.example.com`
  - Note: This configures both the port where the backend API server listens (parsed from the URL) and the base URL that the frontend uses to connect to the backend

- **`DATABASE_URL`** - PostgreSQL connection string for the database.
  - Format: `postgresql://user:password@host:5432/database`
  - Default: Internal PostgreSQL (Docker) or managed instance (Helm)
  - Required for production deployments with external database

- **`ALLOWED_FRONTEND_ORIGINS`** - Comma-separated list of frontend origins allowed to access the API (CORS configuration).
  - Default: `*` in development (`NODE_ENV=development`), localhost-only in production
  - If you need to run backend and frontend on different domains (e.g., `https://app.example.com` accessing `https://api.example.com`), configure this variable to allow cross-origin requests
  - Examples:
    - Single domain: `https://app.example.com`
    - Multiple domains: `https://app.example.com,https://dashboard.example.com`
    - All origins: `*` (not recommended for production)

- **`ARCHESTRA_ANALYTICS`** - Controls PostHog analytics for product improvements.
  - Default: `enabled`
  - Set to `disabled` to opt-out of analytics

## Docker Deployment

Docker deployment provides the fastest way to get started with Archestra Platform, ideal for development and testing purposes.

### Docker Prerequisites

- **Docker** - Container runtime ([Install Docker](https://docs.docker.com/get-docker/))

### Basic Deployment

Run the platform with a single command:

```bash
docker run -p 9000:9000 -p 3000:3000 archestra/platform
```

This will start the platform with:

- **Admin UI** available at <http://localhost:3000>
- **API** available at <http://localhost:9000>

### Using External PostgreSQL

To use an external PostgreSQL database, pass the `DATABASE_URL` environment variable:

```bash
docker run -p 9000:9000 -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/database \
  archestra/platform
```

⚠️ **Important**: If you don't specify `DATABASE_URL`, PostgreSQL will run inside the container for you. This approach is meant for **development and tinkering purposes only** and is **not intended for production**, as the data is not persisted when the container stops.

## Helm Deployment (Recommended for Production)

Helm deployment is our recommended approach for deploying Archestra Platform to production environments.

### Helm Prerequisites

- **Kubernetes cluster** - A running Kubernetes cluster
- **Helm 3+** - Package manager for Kubernetes ([Install Helm](https://helm.sh/docs/intro/install/))
- **kubectl** - Kubernetes CLI ([Install kubectl](https://kubernetes.io/docs/tasks/tools/))

### Installation

Install Archestra Platform using the Helm chart from our OCI registry:

```bash
helm upgrade archestra-platform \
  oci://europe-west1-docker.pkg.dev/friendly-path-465518-r6/archestra-public/helm-charts/archestra-platform \
  --install \
  --namespace archestra \
  --create-namespace \
  --wait
```

This command will:

- Install or upgrade the release named `archestra-platform`
- Create the namespace `archestra` if it doesn't exist
- Wait for all resources to be ready

### Database Configuration

#### External PostgreSQL (Recommended for Production)

To use an external PostgreSQL database, configure the `postgresql.external_database_url` value:

```bash
helm upgrade archestra-platform \
  oci://europe-west1-docker.pkg.dev/friendly-path-465518-r6/archestra-public/helm-charts/archestra-platform \
  --install \
  --namespace archestra \
  --create-namespace \
  --set postgresql.external_database_url=postgresql://user:password@host:5432/database \
  --wait
```

#### Managed PostgreSQL (Default)

If you don't specify `postgresql.external_database_url`, the Helm chart will automatically create and manage a PostgreSQL instance for you within your Kubernetes cluster.

### Custom Environment Variables

You can pass custom environment variables to the platform container using the `archestra.env` values:

```bash
helm upgrade archestra-platform \
  oci://europe-west1-docker.pkg.dev/friendly-path-465518-r6/archestra-public/helm-charts/archestra-platform \
  --install \
  --namespace archestra \
  --create-namespace \
  --set archestra.env.ARCHESTRA_API_BASE_URL=https://api.example.com \
  --wait
```

### Accessing the Platform

After installation, access the platform using port forwarding (both commands must be running):

```bash
# Forward the API (port 9000)
kubectl --namespace archestra port-forward svc/archestra-platform 9000:9000

# In a separate terminal, forward the Admin UI (port 3000)
kubectl --namespace archestra port-forward svc/archestra-platform 3000:3000
```

Then visit:

- **Admin UI**: <http://localhost:3000>
- **API**: <http://localhost:9000>
