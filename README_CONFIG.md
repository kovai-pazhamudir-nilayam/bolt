# Configuration Management System

This document explains how to use the SQLite-based configuration management system implemented in your Electron app.

## Overview

The system stores configuration data by company and environment in a SQLite database. This is perfect for your use case where you need to store different configurations like:

- `ITEM_CONFIG`: Bucket configurations for different item types
- `GCP_CONFIG`: Google Cloud Platform configurations

## Database Schema

Normalized tables are used: `companies`, `environments`, `core_token_configs`, `gcp_project_configs`, and `github_configs`.

## Usage Examples

### 1. Using the Master Data Context

```jsx
import { useMasterDataContext } from '../context/masterDataContext'

function MyComponent() {
  const { companyCode, environmentCode, configs, setMasterData } = useMasterDataContext()

  // Set company and environment (automatically loads configs)
  const handleCompanyChange = async (newCompany) => {
    await setMasterData({ companyCode: newCompany, environmentCode: null })
  }

  const handleEnvironmentChange = async (newEnvironment) => {
    await setMasterData({ environmentCode: newEnvironment })
  }

  // Access configurations
  const coreToken = configs.CORE_TOKEN_CONFIG
  const gcpProject = configs.GCP_PROJECT_CONFIG

  return (
    <div>
      <p>Company: {companyCode}</p>
      <p>Environment: {environmentCode}</p>
      <p>GCP Project: {gcpProject?.gcp_project}</p>
    </div>
  )
}
```

### 2. Using ConfigManager Helper

```jsx
// Prefer normalized APIs via context or window.api.* for companies/environments
```

<!-- ConfigViewer component has been removed in favor of normalized settings tabs. -->

## API Reference

### Normalized Config APIs (via context and IPC)

- Companies: list/add/update/delete
- Environments: list/add/update/delete
- Core Token Configs: per company/environment
- GCP Project Configs: per company/environment
- GitHub Configs: per company

### configHelpers

- `getBucketName(configs, itemType)` - Get bucket name for item type
- `getGCPConfig(configs)` - Get GCP configuration
- `isConfigComplete(configs)` - Check if all required configs are present

### Master Data Context

- `companyCode` - Current selected company code
- `environmentCode` - Current selected environment code
- `configs` - All configurations for current company/env
- `companies` - Available companies
- `environments` - Available environments
- `setMasterData(data)` - Set company/environment (auto-loads configs)
- `loadConfigs(companyCode, environmentCode)` - Load configs manually
- `refreshCompanies()` - Refresh available companies
- `refreshEnvironments()` - Refresh environments

## Sample Data

Example normalized data for 'KPN' company:

**Staging Environment:**
```json
{
  "GCP_PROJECT_CONFIG": {
    "gcp_project": "kpn-staging-380605",
    "gcp_cluster": "kpn-staging-gke-cluster",
    "gcp_region": "asia-south1"
  },
  "CORE_TOKEN_CONFIG": {
    "domain": "https://kpn-staging-api.example.com",
    "token_api": "/api/auth/token",
    "auth_key": "..."
  }
}
```

**Production Environment:**
```json
{
  "GCP_PROJECT_CONFIG": {
    "gcp_project": "kpn-prod-380605",
    "gcp_cluster": "kpn-prod-gke-cluster",
    "gcp_region": "asia-south1"
  },
  "CORE_TOKEN_CONFIG": {
    "domain": "https://kpn-prod-api.example.com",
    "token_api": "/api/auth/token",
    "auth_key": "..."
  }
}
```

## Database Location

The SQLite database is stored in the user data directory:
- **macOS**: `~/Library/Application Support/bolt/config.db`
- **Windows**: `%APPDATA%/bolt/config.db`
- **Linux**: `~/.config/bolt/config.db`

## Benefits of This Approach

1. **Structured Data**: SQLite provides ACID transactions and structured queries
2. **Performance**: Fast lookups and efficient storage
3. **Scalability**: Can handle many companies and environments
4. **Reliability**: Data is persisted safely on disk
5. **Flexibility**: Easy to add new configuration types
6. **Cross-platform**: Works consistently across all operating systems
