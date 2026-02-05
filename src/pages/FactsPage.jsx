import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FactsPage.css'

// Sample payload from requirements
const SAMPLE_PAYLOAD = {
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

function FactsPage() {
  const navigate = useNavigate()
  const [expandedPaths, setExpandedPaths] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const extractFacts = (obj, prefix = '$', facts = []) => {
    if (obj === null || obj === undefined) {
      facts.push({ path: prefix, value: null, type: 'null' })
      return facts
    }

    if (Array.isArray(obj)) {
      facts.push({ path: prefix, value: `[Array(${obj.length})]`, type: 'array' })
      obj.forEach((item, index) => {
        extractFacts(item, `${prefix}[${index}]`, facts)
      })
      return facts
    }

    if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const newPath = prefix === '$' ? `$.${key}` : `${prefix}.${key}`
        const value = obj[key]
        
        if (value === null || value === undefined) {
          facts.push({ path: newPath, value: value === null ? 'null' : 'undefined', type: typeof value })
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          facts.push({ path: newPath, value: '{Object}', type: 'object' })
          extractFacts(value, newPath, facts)
        } else if (Array.isArray(value)) {
          facts.push({ path: newPath, value: `[Array(${value.length})]`, type: 'array' })
          extractFacts(value, newPath, facts)
        } else {
          facts.push({ path: newPath, value: String(value), type: typeof value })
        }
      })
      return facts
    }

    facts.push({ path: prefix, value: String(obj), type: typeof obj })
    return facts
  }

  const facts = extractFacts(SAMPLE_PAYLOAD)
  const filteredFacts = facts.filter(fact =>
    fact.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fact.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const togglePath = (path) => {
    const newExpanded = new Set(expandedPaths)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedPaths(newExpanded)
  }

  const getPathDepth = (path) => {
    return (path.match(/\./g) || []).length + (path.match(/\[/g) || []).length
  }

  const isParentPath = (path) => {
    return filteredFacts.some(f => f.path.startsWith(path + '.') || f.path.startsWith(path + '['))
  }

  return (
    <div className="facts-page">
      <div className="container">
        <div className="page-header">
          <h1>Facts/Keys Available for Rules</h1>
          <button className="button button-secondary" onClick={() => navigate('/rules')}>
            Back to Rules
          </button>
        </div>

        <div className="card">
          <div className="search-section">
            <input
              type="text"
              className="input"
              placeholder="Search facts by path or value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="facts-info">
            <p>Total Facts: {filteredFacts.length}</p>
            <p>This page shows all available facts/keys that can be used in rule definitions.</p>
          </div>

          <div className="facts-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Path</th>
                  <th style={{ width: '30%' }}>Value</th>
                  <th style={{ width: '15%' }}>Type</th>
                  <th style={{ width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacts.map((fact, index) => {
                  const depth = getPathDepth(fact.path)
                  const indent = depth * 20
                  return (
                    <tr key={index} style={{ backgroundColor: depth % 2 === 0 ? 'white' : '#f8f9fa' }}>
                      <td style={{ paddingLeft: `${indent + 12}px` }}>
                        <code>{fact.path}</code>
                      </td>
                      <td>
                        <span className="fact-value">{fact.value}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${fact.type}`}>{fact.type}</span>
                      </td>
                      <td>
                        <button
                          className="button button-primary button-small"
                          onClick={() => {
                            navigator.clipboard.writeText(fact.path)
                            alert(`Copied: ${fact.path}`)
                          }}
                        >
                          Copy Path
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Sample Payload Structure</h2>
          <pre className="payload-preview">
            {JSON.stringify(SAMPLE_PAYLOAD, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default FactsPage
