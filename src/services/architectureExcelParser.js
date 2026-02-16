/**
 * Parses Systems.xlsx (fetched as ArrayBuffer) into architecture domains.
 * Excel structure: column A = domain title or service name, B = description, C = tech.
 * Rows whose column A matches a known domain title start a new domain block.
 */

import * as XLSX from 'xlsx'

const DOMAIN_CONFIG = {
  'Platform Service': { id: 'platform', color: '#2563eb', subtitle: 'Supporting systems & cross-cutting capabilities' },
  'Order Lifecycle Mgmt': { id: 'order-lifecycle', color: '#059669', subtitle: 'Order management and fulfillment' },
  'Financial Services': { id: 'financial', color: '#b45309', subtitle: 'Invoicing, tax, and ledger management' },
  'Logistics Services': { id: 'logistics', color: '#0d9488', subtitle: 'Carrier, network, and transport management' },
  'WareHouse Mgmt': { id: 'warehouse', color: '#7c3aed', subtitle: 'WMS, darkstore, and automation' },
  'Omnichannel Mgmt': { id: 'omnichannel', color: '#be185d', subtitle: 'Storefront order management' },
  'Analytics System': { id: 'analytics', color: '#0369a1', subtitle: 'Reporting and data platforms' },
  'ESB (Enterprise Service Bus)': { id: 'esb', color: '#dc2626', subtitle: 'Integration, gateway, and identity' },
}

function trim(s) {
  return typeof s === 'string' ? s.trim() : ''
}

function normalizeTitle(s) {
  return trim(s).replace(/\s+/g, ' ')
}

/**
 * @param {ArrayBuffer} arrayBuffer - Response from fetch( Systems.xlsx )
 * @returns {Array<{ id: string, title: string, subtitle: string, color: string, services: Array<{ name: string, desc?: string, tech?: string }> }>}
 */
export function parseSystemsExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  const domains = []
  let currentDomain = null

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const a = trim(row[0] ?? '')
    const b = trim(row[1] ?? '')
    const c = trim(row[2] ?? '')

    if (!a) continue

    const normalizedA = normalizeTitle(a)
    const config =
      DOMAIN_CONFIG[normalizedA] ??
      Object.entries(DOMAIN_CONFIG).find(
        ([title]) => normalizeTitle(title).toLowerCase() === normalizedA.toLowerCase()
      )?.[1]
    if (config) {
      currentDomain = {
        id: config.id,
        title: a,
        subtitle: config.subtitle,
        color: config.color,
        services: [],
      }
      domains.push(currentDomain)
      continue
    }

    if (currentDomain) {
      const name = a
      const desc = b || undefined
      const tech = c || undefined
      currentDomain.services.push(desc || tech ? { name, ...(desc && { desc }), ...(tech && { tech }) } : { name })
    }
  }

  return domains
}
