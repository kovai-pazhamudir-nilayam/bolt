# Configuration Management System

This document explains how to use the SQLite-based configuration management system implemented in your Electron app.

## Overview

The system stores configuration data that varies by brand and environment in a SQLite database. This is perfect for your use case where you need to store different configurations like:

- `ITEM_CONFIG`: Bucket configurations for different item types
- `GCP_CONFIG`: Google Cloud Platform configurations

## Database Schema

```sql
CREATE TABLE brand_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  environment TEXT NOT NULL,
  config_type TEXT NOT NULL,
  config_data TEXT NOT NULL,  -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(brand, environment, config_type)
);
```

## Usage Examples

### 1. Using the Master Data Context

```jsx
import { useMasterDataContext } from '../context/masterDataContext'

function MyComponent() {
  const { brand, environment, configs, setMasterData } = useMasterDataContext()

  // Set brand and environment (automatically loads configs)
  const handleBrandChange = async (newBrand) => {
    await setMasterData({ brand: newBrand, environment: null })
  }

  const handleEnvironmentChange = async (newEnvironment) => {
    await setMasterData({ environment: newEnvironment })
  }

  // Access configurations
  const itemConfig = configs.ITEM_CONFIG
  const gcpConfig = configs.GCP_CONFIG

  return (
    <div>
      <p>Brand: {brand}</p>
      <p>Environment: {environment}</p>
      <p>GCP Project: {gcpConfig?.project}</p>
    </div>
  )
}
```

### 2. Using ConfigManager Helper

```jsx
import { ConfigManager, configHelpers } from '../helpers/configManager.helper'

// Get specific configuration
const itemConfig = await ConfigManager.getConfig('kpn', 'staging', 'ITEM_CONFIG')

// Save configuration
await ConfigManager.saveConfig('kpn', 'staging', 'ITEM_CONFIG', {
  brand: { bucket_name: "kpn-brand-upload-bucket-staging/images" },
  category: { bucket_name: "kpn-category-upload-bucket-staging/images" },
  product: { bucket_name: "kpn-product-upload-bucket-staging/images" }
})

// Get all brands
const brands = await ConfigManager.getBrands()

// Get environments for a brand
const environments = await ConfigManager.getEnvironments('kpn')

// Helper functions
const bucketName = configHelpers.getBucketName(configs, 'brand')
const isComplete = configHelpers.isConfigComplete(configs)
```

### 3. Using the ConfigViewer Component

```jsx
import ConfigViewer from '../components/ConfigViewer'

function SettingsPage() {
  return (
    <div>
      <ConfigViewer />
    </div>
  )
}
```

## API Reference

### ConfigManager Static Methods

- `getConfig(brand, environment, configType)` - Get specific config
- `saveConfig(brand, environment, configType, configData)` - Save config
- `getAllConfigs(brand, environment)` - Get all configs for brand/env
- `getBrands()` - Get all available brands
- `getEnvironments(brand)` - Get environments for a brand
- `getConfigValue(config, path)` - Get value using dot notation
- `setConfigValue(config, path, value)` - Set value using dot notation
- `validateConfig(config, configType)` - Validate config structure
- `createConfigTemplate(configType)` - Create template for config type

### configHelpers

- `getBucketName(configs, itemType)` - Get bucket name for item type
- `getGCPConfig(configs)` - Get GCP configuration
- `isConfigComplete(configs)` - Check if all required configs are present

### Master Data Context

- `brand` - Current selected brand
- `environment` - Current selected environment
- `configs` - All configurations for current brand/env
- `brands` - Available brands
- `environments` - Available environments for current brand
- `setMasterData(data)` - Set brand/environment (auto-loads configs)
- `loadConfigs(brand, environment)` - Load configs manually
- `refreshBrands()` - Refresh available brands
- `refreshEnvironments(brand)` - Refresh environments for brand

## Sample Data

The system comes with sample data for the 'kpn' brand:

**Staging Environment:**
```json
{
  "ITEM_CONFIG": {
    "brand": { "bucket_name": "kpn-brand-upload-bucket-staging/images" },
    "category": { "bucket_name": "kpn-category-upload-bucket-staging/images" },
    "product": { "bucket_name": "kpn-product-upload-bucket-staging/images" }
  },
  "GCP_CONFIG": {
    "project": "kpn-staging-380605",
    "cluster": "kpn-staging-gke-cluster",
    "region": "asia-south1"
  }
}
```

**Production Environment:**
```json
{
  "ITEM_CONFIG": {
    "brand": { "bucket_name": "kpn-brand-upload-bucket-prod/images" },
    "category": { "bucket_name": "kpn-category-upload-bucket-prod/images" },
    "product": { "bucket_name": "kpn-product-upload-bucket-prod/images" }
  },
  "GCP_CONFIG": {
    "project": "kpn-prod-380605",
    "cluster": "kpn-prod-gke-cluster",
    "region": "asia-south1"
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
3. **Scalability**: Can handle many brands and environments
4. **Reliability**: Data is persisted safely on disk
5. **Flexibility**: Easy to add new configuration types
6. **Cross-platform**: Works consistently across all operating systems
