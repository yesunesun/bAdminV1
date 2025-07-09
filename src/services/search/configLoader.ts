// src/services/search/configLoader.ts
// Version: 1.0.0
// Last Modified: 09-07-2025 12:15 IST
// Purpose: Configuration loader for NLP settings

import { NLPConfig } from './nlpService';

/**
 * Configuration loader for NLP settings
 * Loads configuration from YAML file and provides fallback defaults
 */
export class ConfigLoader {
  private static cachedConfig: NLPConfig | null = null;
  private static configLoadPromise: Promise<NLPConfig> | null = null;

  /**
   * Load NLP configuration from YAML file
   */
  static async loadNLPConfig(): Promise<NLPConfig> {
    // Return cached config if available
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    // If already loading, wait for the existing promise
    if (this.configLoadPromise) {
      return this.configLoadPromise;
    }

    // Create new loading promise
    this.configLoadPromise = this.loadConfigFromFile();
    
    try {
      this.cachedConfig = await this.configLoadPromise;
      return this.cachedConfig;
    } catch (error) {
      console.error('Failed to load NLP config:', error);
      // Return default config on error
      this.cachedConfig = this.getDefaultConfig();
      return this.cachedConfig;
    } finally {
      this.configLoadPromise = null;
    }
  }

  /**
   * Load configuration from YAML file
   */
  private static async loadConfigFromFile(): Promise<NLPConfig> {
    try {
      // In a real implementation, you would use a YAML parser
      // For now, we'll return the default config
      // TODO: Implement YAML parsing when needed
      
      return this.getDefaultConfig();
    } catch (error) {
      console.error('Error loading config file:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  private static getDefaultConfig(): NLPConfig {
    return {
      enabled: true,
      confidence_threshold: 0.6,
      fallback_timeout: 100,
      debug_mode: process.env.NODE_ENV === 'development',
      
      intent_patterns: {
        search_intents: [
          "find", "looking for", "search", "show me", "I want", "need", 
          "get me", "help me find", "search for", "want to find"
        ],
        location_indicators: [
          "in", "at", "near", "around", "close to", "nearby", "within"
        ],
        price_indicators: [
          "under", "above", "between", "costing", "priced", "budget", 
          "around", "up to", "starting from", "below", "over"
        ]
      },
      
      property_patterns: {
        residential: {
          primary_keywords: [
            "apartment", "flat", "house", "villa", "home", "residence",
            "duplex", "triplex", "bungalow", "farmhouse"
          ],
          subtypes: [
            "independent house", "penthouse", "studio", "studio apartment",
            "service apartment", "duplex", "triplex", "farmhouse"
          ],
          bhk_patterns: [
            "1bhk", "2bhk", "3bhk", "4bhk", "4plus", "5bhk",
            "1 bhk", "2 bhk", "3 bhk", "4 bhk", "5 bhk", "4+ bhk",
            "one bedroom", "two bedroom", "three bedroom", "four bedroom", "five bedroom",
            "1 bedroom", "2 bedroom", "3 bedroom", "4 bedroom", "5 bedroom",
            "single bedroom", "double bedroom"
          ]
        },
        commercial: {
          primary_keywords: [
            "office", "shop", "showroom", "commercial", "business", "retail",
            "warehouse", "godown", "industrial", "workspace"
          ],
          subtypes: [
            "office space", "godown", "warehouse", "industrial shed",
            "industrial building", "commercial space", "retail space",
            "business premises", "coworking space"
          ]
        },
        land: {
          primary_keywords: [
            "land", "plot", "site", "ground", "acres", "square feet",
            "square meters", "sq ft", "sq mt"
          ],
          subtypes: [
            "agricultural", "residential plot", "commercial land",
            "industrial land", "mixed use", "farm land", "agricultural land",
            "residential site", "commercial plot", "industrial plot"
          ]
        },
        pghostel: {
          primary_keywords: [
            "pg", "hostel", "paying guest", "accommodation", "stay",
            "shared accommodation", "student accommodation"
          ]
        },
        flatmates: {
          primary_keywords: [
            "flatmate", "roommate", "sharing", "shared", "room sharing",
            "shared room", "shared flat", "shared apartment"
          ]
        },
        coworking: {
          primary_keywords: [
            "coworking", "co-working", "shared office", "workspace",
            "desk space", "office sharing", "business center"
          ]
        }
      },
      
      location_mapping: {
        hyderabad: [
          "hyderabad", "hyd", "secunderabad", "sec bad", "secbad", "cyberabad"
        ],
        mudfort: [
          "mudfort", "mud fort", "mudford", "mudfort area"
        ],
        hitech_city: [
          "hitech", "hitec", "hi-tech", "hi tech", "hitech city", "hitec city",
          "hitech city area", "hitec city area"
        ],
        gachibowli: [
          "gachibowli", "gachi bowli", "gachi", "gachibowli area"
        ],
        kondapur: [
          "kondapur", "konda pur", "kondapur area"
        ],
        madhapur: [
          "madhapur", "madha pur", "madhapur area"
        ],
        jubilee_hills: [
          "jubilee hills", "jubilee", "jh", "jubilee hill"
        ],
        banjara_hills: [
          "banjara hills", "banjara", "bh", "banjara hill"
        ],
        kukatpally: [
          "kukatpally", "kphb", "kukat pally"
        ],
        miyapur: [
          "miyapur", "miya pur", "miyapur area"
        ],
        warangal: [
          "warangal", "warangal city"
        ],
        karimnagar: [
          "karimnagar", "kareem nagar"
        ],
        nizamabad: [
          "nizamabad", "nizam abad"
        ],
        khammam: [
          "khammam", "kham mam"
        ]
      },
      
      price_patterns: {
        units: {
          lakhs: [
            "l", "lakh", "lakhs", "lac", "lacs", "L", "Lakh", "Lakhs",
            "lacs", "lac", "lakhs only", "lakh only"
          ],
          crores: [
            "cr", "crore", "crores", "CR", "Crore", "Crores",
            "crore only", "crores only"
          ]
        },
        range_indicators: {
          under: [
            "under", "below", "less than", "upto", "up to", "maximum",
            "max", "not more than", "within"
          ],
          above: [
            "above", "over", "more than", "starting from", "minimum",
            "min", "at least", "from"
          ],
          between: [
            "between", "from", "to", "-", "and", "range", "ranging from"
          ]
        },
        standard_ranges: {
          "under-10l": { min: 0, max: 10, unit: "lakh", display: "under-10l" },
          "10l-25l": { min: 10, max: 25, unit: "lakh", display: "10l-25l" },
          "25l-50l": { min: 25, max: 50, unit: "lakh", display: "25l-50l" },
          "50l-75l": { min: 50, max: 75, unit: "lakh", display: "50l-75l" },
          "75l-1cr": { min: 75, max: 100, unit: "lakh", display: "75l-1cr" },
          "1cr-2cr": { min: 1, max: 2, unit: "crore", display: "1cr-2cr" },
          "2cr-5cr": { min: 2, max: 5, unit: "crore", display: "2cr-5cr" },
          "5cr-10cr": { min: 5, max: 10, unit: "crore", display: "5cr-10cr" },
          "above-10cr": { min: 10, max: null, unit: "crore", display: "above-10cr" }
        }
      },
      
      action_patterns: {
        buy: [
          "buy", "purchase", "sale", "for sale", "buying", "own", "invest",
          "investment", "purchase property", "buy property"
        ],
        rent: [
          "rent", "rental", "lease", "for rent", "renting", "hire", "tenant",
          "rent property", "rental property", "lease property"
        ]
      },
      
      typo_corrections: {
        common_typos: {
          "appartment": "apartment",
          "appartments": "apartment",
          "aprtment": "apartment",
          "lond": "land",
          "plat": "plot",
          "plott": "plot",
          "comercial": "commercial",
          "commecial": "commercial",
          "residental": "residential",
          "residencial": "residential",
          "secunderabad": "secunderabad",
          "secundrabad": "secunderabad",
          "gachbowli": "gachibowli",
          "gachibowly": "gachibowli",
          "mudfor": "mudfort",
          "madehapur": "madhapur",
          "kondpur": "kondapur",
          "kukatpaly": "kukatpally",
          "miyapor": "miyapur",
          "banjarahills": "banjara hills",
          "jubileehills": "jubilee hills",
          "hitechcity": "hitech city"
        }
      },
      
      processing: {
        case_sensitive: false,
        fuzzy_matching: true,
        fuzzy_threshold: 0.8,
        max_processing_time: 200,
        enable_caching: true,
        cache_size: 1000,
        min_query_length: 3,
        max_query_length: 200,
        log_parsing_attempts: process.env.NODE_ENV === 'development',
        log_confidence_scores: process.env.NODE_ENV === 'development',
        log_entity_extraction: process.env.NODE_ENV === 'development'
      },
      
      features: {
        enable_typo_correction: true,
        enable_fuzzy_location_matching: true,
        enable_price_range_inference: true,
        enable_context_awareness: false,
        enable_learning_from_usage: false,
        enable_synonym_expansion: true,
        enable_multi_language: false
      }
    };
  }

  /**
   * Get cached configuration
   */
  static getCachedConfig(): NLPConfig | null {
    return this.cachedConfig;
  }

  /**
   * Clear cached configuration
   */
  static clearCache(): void {
    this.cachedConfig = null;
    this.configLoadPromise = null;
  }

  /**
   * Reload configuration from file
   */
  static async reloadConfig(): Promise<NLPConfig> {
    this.clearCache();
    return this.loadNLPConfig();
  }
}

export default ConfigLoader;