import { config } from '../config/env'

// Mock API service - will be replaced with actual API calls later
class ApiService {
  constructor() {
    this.baseURL = config.apiBaseUrl
  }

  // Mock data storage
  mockRules = [
    {
      ruleId: 'PILOT_RULES',
      version: 47,
      modifiedBy: 'anubhav.saxena',
      tenantId: 'AJIOB2C',
      enabled: true,
      payload: [
        {
          type: 'exists',
          path: '$.orderNo',
          defaultResult: true,
          successResult: {
            fulfillment: true,
            custom: 'V0028'
          },
          failureResult: {
            fulfillment: false
          }
        },
        {
          type: 'or',
          successResult: {
            fulfillment: true
          },
          children: [
            {
              type: 'in',
              path: '$.email',
              values: ['akash.cholkar@ril.com', 'rama.kollamsetti@ril.com']
            },
            {
              type: 'contains_any',
              path: '$.lines[*].node',
              values: ['SL9T'],
              defaultResult: false
            }
          ]
        }
      ]
    },
    {
      ruleId: 'SHIPPING_RULES',
      version: 12,
      modifiedBy: 'user1',
      tenantId: 'AJIOB2C',
      enabled: false
    }
  ]

  mockTemplates = {
    PILOT_RULES: [
      { path: '$.orderNo', name: 'Order No' },
      { path: '$.lines[*].node', name: 'Lines Node' },
      { path: "$.lines[?(@.fulfillmentNodeType == 'JIT')].order.state", name: 'Lines Order State' }
    ]
  }

  mockDefaultPayload = {
    id: 'd932d562-6336-4017-87cb-65193bb2d51c',
    orderNum: 'FN7390702204',
    fulfillmentNum: 'FO1146564883',
    tenantId: 'AJIOB2C',
    createAt: '2026-02-03T16:22:28+05:30',
    shipmentService: false,
    orderType: 'forward',
    paymentType: 'COD',
    entryType: 'Android',
    customerName: 'abhay',
    customerEmail: 'tomarsabh715@gmail.com',
    customerPhone: '9412485871',
    customerZipCode: '206001',
    metaData: {
      panPresent: 'N',
      eventtype: 'createorder'
    },
    fulfillmentOrderLines: [
      {
        nodeId: 'TG1K',
        fulfillmentNodeType: 'FnL_SHIP',
        nodeType: 'DC'
      }
    ]
  }

  // Get all rules for a tenant
  async getRules(tenantId, key) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      data: this.mockRules.filter(rule => rule.tenantId === tenantId),
      success: true
    }
  }

  // Get a specific rule
  async getRule(ruleId) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const rule = this.mockRules.find(r => r.ruleId === ruleId)
    return {
      data: rule,
      success: !!rule
    }
  }

  // Save/Update rule
  async saveRule(rule) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = this.mockRules.findIndex(r => r.ruleId === rule.ruleId)
    if (index >= 0) {
      this.mockRules[index] = rule
    } else {
      this.mockRules.push(rule)
    }
    return { data: rule, success: true }
  }

  // Enable/Disable rule
  async toggleRule(ruleId, enabled) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const rule = this.mockRules.find(r => r.ruleId === ruleId)
    if (rule) {
      rule.enabled = enabled
    }
    return { data: rule, success: true }
  }

  // Get template for a rule
  async getTemplate(ruleId) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      data: this.mockTemplates[ruleId] || [],
      success: true
    }
  }

  // Save template
  async saveTemplate(ruleId, template) {
    await new Promise(resolve => setTimeout(resolve, 500))
    this.mockTemplates[ruleId] = template
    return { data: template, success: true }
  }

  // Extract paths from rule JSON
  extractPathsFromRule(rulePayload) {
    const paths = new Set()
    
    const extractPaths = (obj) => {
      if (Array.isArray(obj)) {
        obj.forEach(item => extractPaths(item))
      } else if (obj && typeof obj === 'object') {
        if (obj.path) {
          paths.add(obj.path)
        }
        Object.values(obj).forEach(value => {
          if (value && typeof value === 'object') {
            extractPaths(value)
          }
        })
      }
    }
    
    extractPaths(rulePayload)
    return Array.from(paths).map(path => ({
      path,
      name: this.generateNameFromPath(path)
    }))
  }

  generateNameFromPath(path) {
    // Convert JSON path to readable name
    return path
      .replace(/\$\./, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim()
  }

  // Test rule
  async testRule(input, definition) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Mock test result
    return {
      data: {
        result: true,
        output: {
          fulfillment: true,
          custom: 'V0028'
        },
        matchedRules: ['exists', 'or']
      },
      success: true
    }
  }

  // Get default payload for testing
  async getDefaultPayload(ruleId) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      data: this.mockDefaultPayload,
      success: true
    }
  }

  // Get sample payload for a rule (for facts extraction)
  async getSamplePayload(ruleId) {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Return the full sample payload - in real implementation, this would be fetched per rule
    const fullPayload = {
      id: 'd932d562-6336-4017-87cb-65193bb2d51c',
      orderNum: 'FN7390702204',
      fulfillmentNum: 'FO1146564883',
      tenantId: 'AJIOB2C',
      createAt: '2026-02-03T16:22:28+05:30',
      shipmentService: false,
      orderType: 'forward',
      paymentType: 'COD',
      entryType: 'Android',
      customerName: 'abhay',
      customerEmail: 'tomarsabh715@gmail.com',
      customerPhone: '9412485871',
      customerZipCode: '206001',
      customerId: '0d090d51-cfeb-4db3-8580-dae3ff9196fa',
      priorityCode: 4,
      pickingType: 'DELIVERY',
      subTenant: 'FnL',
      nodeId: 'TG1K',
      holdTimeUnit: 'MINUTES',
      holdTimeDuration: 5,
      metaData: {
        totalAmount: 'null',
        source: null,
        panPresent: 'N',
        eventtype: 'createorder',
        originalFONum: 'FO1146564883',
        rvpROC: 'true',
        rtoROC: 'true',
        rocNotApplicableReason: 'ROC Rule result is empty'
      },
      logisticDetail: {
        carrier: 'SURFACE',
        deliveryMethod: 'SHP',
        scac: 'SHADOWFAX'
      },
      fulfillmentOrderLines: [
        {
          id: '4143e955-acf8-4759-b5e6-4e5aca40cbdc',
          lineNo: 7,
          shipmentQty: 1,
          orderedQty: 1,
          originalQty: 1,
          nodeId: 'TG1K',
          itemId: '442659509003',
          fulfillmentNodeType: 'FnL_SHIP',
          nodeType: 'DC',
          isPriorityDelivery: false
        }
      ],
      fulfillmentDates: [
        {
          dateType: 'expectedDeliveryDate',
          value: '2026-02-12T00:00:00+05:30',
          reason: 'Created'
        }
      ]
    }
    return {
      data: fullPayload,
      success: true
    }
  }

  // Extract facts from payload with [*] for arrays
  extractFactsFromPayload(payload) {
    const facts = []
    const seenPaths = new Set()
    
    const extractFacts = (obj, prefix = '$') => {
      if (obj === null || obj === undefined) {
        if (!seenPaths.has(prefix)) {
          facts.push({ path: prefix, value: null, type: 'null' })
          seenPaths.add(prefix)
        }
        return
      }

      if (Array.isArray(obj)) {
        // Use [*] for array paths
        const arrayPath = `${prefix}[*]`
        if (!seenPaths.has(arrayPath)) {
          facts.push({ path: arrayPath, value: obj.length > 0 ? `[Array(${obj.length})]` : '[Empty Array]', type: 'array' })
          seenPaths.add(arrayPath)
        }
        
        // Extract facts from first item to show structure
        if (obj.length > 0 && typeof obj[0] === 'object') {
          extractFacts(obj[0], arrayPath)
        }
        return
      }

      if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          const newPath = prefix === '$' ? `$.${key}` : `${prefix}.${key}`
          const value = obj[key]
          
          if (value === null || value === undefined) {
            if (!seenPaths.has(newPath)) {
              facts.push({ path: newPath, value: value === null ? 'null' : 'undefined', type: typeof value })
              seenPaths.add(newPath)
            }
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            if (!seenPaths.has(newPath)) {
              facts.push({ path: newPath, value: '{Object}', type: 'object' })
              seenPaths.add(newPath)
            }
            extractFacts(value, newPath)
          } else if (Array.isArray(value)) {
            // Use [*] for array paths
            const arrayPath = `${newPath}[*]`
            if (!seenPaths.has(arrayPath)) {
              facts.push({ path: arrayPath, value: value.length > 0 ? `[Array(${value.length})]` : '[Empty Array]', type: 'array' })
              seenPaths.add(arrayPath)
            }
            // Extract facts from first array item
            if (value.length > 0 && typeof value[0] === 'object') {
              extractFacts(value[0], arrayPath)
            }
          } else {
            if (!seenPaths.has(newPath)) {
              facts.push({ path: newPath, value: String(value), type: typeof value })
              seenPaths.add(newPath)
            }
          }
        })
        return
      }

      if (!seenPaths.has(prefix)) {
        facts.push({ path: prefix, value: String(obj), type: typeof obj })
        seenPaths.add(prefix)
      }
    }
    
    extractFacts(payload)
    return facts.sort((a, b) => a.path.localeCompare(b.path))
  }
}

export default new ApiService()
