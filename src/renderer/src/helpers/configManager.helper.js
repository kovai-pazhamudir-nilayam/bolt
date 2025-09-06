/**
 * Configuration Manager Helper
 * Provides utilities for managing brand/environment configurations
 */

export class ConfigManager {
  /**
   * Get configuration for a specific brand, environment, and config type
   * @param {string} brand - The brand name
   * @param {string} environment - The environment name
   * @param {string} configType - The configuration type (e.g., 'ITEM_CONFIG', 'GCP_CONFIG')
   * @returns {Promise<Object|null>} The configuration object or null if not found
   */
  static async getConfig(brand, environment, configType) {
    try {
      return await window.api.config.get(brand, environment, configType)
    } catch (error) {
      console.error(`Failed to get config for ${brand}/${environment}/${configType}:`, error)
      return null
    }
  }

  /**
   * Save configuration for a specific brand, environment, and config type
   * @param {string} brand - The brand name
   * @param {string} environment - The environment name
   * @param {string} configType - The configuration type
   * @param {Object} configData - The configuration data to save
   * @returns {Promise<boolean>} True if saved successfully, false otherwise
   */
  static async saveConfig(brand, environment, configType, configData) {
    try {
      await window.api.config.save(brand, environment, configType, configData)
      return true
    } catch (error) {
      console.error(`Failed to save config for ${brand}/${environment}/${configType}:`, error)
      return false
    }
  }

  /**
   * Get all configurations for a brand and environment
   * @param {string} brand - The brand name
   * @param {string} environment - The environment name
   * @returns {Promise<Object>} Object containing all configurations
   */
  static async getAllConfigs(brand, environment) {
    try {
      return await window.api.config.getAll(brand, environment)
    } catch (error) {
      console.error(`Failed to get all configs for ${brand}/${environment}:`, error)
      return {}
    }
  }

  /**
   * Get available brands
   * @returns {Promise<Array<string>>} Array of brand names
   */
  static async getBrands() {
    try {
      return await window.api.config.getBrands()
    } catch (error) {
      console.error('Failed to get brands:', error)
      return []
    }
  }

  /**
   * Get available environments for a brand
   * @param {string} brand - The brand name
   * @returns {Promise<Array<string>>} Array of environment names
   */
  static async getEnvironments(brand) {
    try {
      return await window.api.config.getEnvironments(brand)
    } catch (error) {
      console.error(`Failed to get environments for ${brand}:`, error)
      return []
    }
  }

  /**
   * Get a specific configuration value using dot notation
   * @param {Object} config - The configuration object
   * @param {string} path - Dot notation path (e.g., 'ITEM_CONFIG.brand.bucket_name')
   * @returns {any} The value at the specified path
   */
  static getConfigValue(config, path) {
    return path.split('.').reduce((obj, key) => obj?.[key], config)
  }

  /**
   * Set a specific configuration value using dot notation
   * @param {Object} config - The configuration object
   * @param {string} path - Dot notation path
   * @param {any} value - The value to set
   * @returns {Object} Updated configuration object
   */
  static setConfigValue(config, path, value) {
    const keys = path.split('.')
    const result = { ...config }
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }

    current[keys[keys.length - 1]] = value
    return result
  }

  /**
   * Validate configuration structure
   * @param {Object} config - The configuration object
   * @param {string} configType - The configuration type
   * @returns {Object} Validation result with isValid and errors
   */
  static validateConfig(config, configType) {
    const errors = []

    switch (configType) {
      case 'ITEM_CONFIG':
        if (!config.brand?.bucket_name) {
          errors.push('Brand bucket_name is required')
        }
        if (!config.category?.bucket_name) {
          errors.push('Category bucket_name is required')
        }
        if (!config.product?.bucket_name) {
          errors.push('Product bucket_name is required')
        }
        break

      case 'GCP_CONFIG':
        if (!config.project) {
          errors.push('GCP project is required')
        }
        if (!config.cluster) {
          errors.push('GCP cluster is required')
        }
        if (!config.region) {
          errors.push('GCP region is required')
        }
        break

      default:
        errors.push(`Unknown configuration type: ${configType}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Create a template configuration for a given type
   * @param {string} configType - The configuration type
   * @returns {Object} Template configuration object
   */
  static createConfigTemplate(configType) {
    switch (configType) {
      case 'ITEM_CONFIG':
        return {
          brand: {
            bucket_name: ''
          },
          category: {
            bucket_name: ''
          },
          product: {
            bucket_name: ''
          }
        }

      case 'GCP_CONFIG':
        return {
          project: '',
          cluster: '',
          region: ''
        }

      default:
        return {}
    }
  }
}

// Convenience functions for common operations
export const configHelpers = {
  /**
   * Get bucket name for a specific item type
   * @param {Object} configs - All configurations
   * @param {string} itemType - The item type (brand, category, product)
   * @returns {string|null} The bucket name or null if not found
   */
  getBucketName: (configs, itemType) => {
    return ConfigManager.getConfigValue(configs, `ITEM_CONFIG.${itemType}.bucket_name`)
  },

  /**
   * Get GCP project information
   * @param {Object} configs - All configurations
   * @returns {Object|null} GCP configuration or null if not found
   */
  getGCPConfig: (configs) => {
    return ConfigManager.getConfigValue(configs, 'GCP_CONFIG')
  },

  /**
   * Check if configurations are complete for a brand/environment
   * @param {Object} configs - All configurations
   * @returns {boolean} True if all required configs are present
   */
  isConfigComplete: (configs) => {
    const hasItemConfig = configs.ITEM_CONFIG && 
      configs.ITEM_CONFIG.brand?.bucket_name &&
      configs.ITEM_CONFIG.category?.bucket_name &&
      configs.ITEM_CONFIG.product?.bucket_name

    const hasGCPConfig = configs.GCP_CONFIG &&
      configs.GCP_CONFIG.project &&
      configs.GCP_CONFIG.cluster &&
      configs.GCP_CONFIG.region

    return hasItemConfig && hasGCPConfig
  }
}
