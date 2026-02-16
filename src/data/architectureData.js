/**
 * System architecture data derived from Systems.xlsx.
 * Structure: functional domains and their services/components.
 */
export const architectureDomains = [
  {
    id: 'platform',
    title: 'Platform Service',
    subtitle: 'Supporting systems & cross-cutting capabilities',
    color: '#2563eb',
    services: [
      { name: 'Notification Engine', desc: 'EMail / SMS / WhatsApp / Push' },
      { name: 'Master Data Service', desc: 'Item / Node / Pincode / etc.', tech: 'Herald / Fynd' },
      { name: 'Document Service', desc: 'Document / PDF / Label generation and mgmt' },
      { name: 'WorkBench', desc: 'UI Mgmt' },
    ],
  },
  {
    id: 'supply-chain-control-tower',
    title: 'Supply Chain Control Tower',
    subtitle: 'SLA monitoring, Exception management, Analytics',
    color: '#2563eb',
    services: [
      { name: 'SLA monitoring', tech: 'RRA' },
      { name: 'Exception Management', desc: 'Over emails' },
      { name: 'What-if Simulation', desc: 'Excel' },
      { name: 'Digital Twin', desc: 'Supply chain systems', tech: 'RRA' },
      { name: 'Performance Analytics', desc: 'RRA' },
    ],
  },
  {
    id: 'order-lifecycle',
    title: 'Order Lifecycle Mgmt',
    subtitle: 'Order management and fulfillment',
    color: '#059669',
    services: [
      { name: 'Order Mgmt Service', desc: 'Order Lifecycle Mgmt', tech: 'Herald / Sterling / Fynd' },
      { name: 'Inventory Mgmt', desc: 'ATP / Inventory', tech: 'IMS / Hana / RUI' },
      { name: 'Reservation Service', desc: 'Inventory soft and hard reservation', tech: 'PE / Sandstorm / JCP' },
      { name: 'Order Routing', desc: 'Order scheduling / routing / allocation', tech: 'PE / Sandstorm / JCP' },
      { name: 'Order Fulfillment Service', desc: 'Fulfillment Order Mgmt', tech: 'Herald / ROMS' },
      { name: 'External Integration Adapter', desc: 'North bound integration with storefronts', tech: 'Herald / ROMS' },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Services',
    subtitle: 'Invoicing, tax, and ledger management',
    color: '#b45309',
    services: [
      { name: 'Invoicing', desc: 'Invoicing / Sales Posting / Credit Note / Debit Note', tech: 'Herald / Fynd' },
      { name: 'Refund Services', desc: 'Payment Ledger / Refund Ledger', tech: 'Herald / Fynd' },
      { name: 'Tax Service', desc: 'Tax Master / GST / e-invoicing' },
      { name: 'Account Payables', desc: 'Vendor Payment Reconciliation, Seller Payment Reconciliation' },
      { name: 'Account Receivables', desc: 'COD, PG Reconciliation, Customer Reconciliation' },
      { name: 'General Ledger Management', desc: 'Posting, GL Reconciliation' },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics Services',
    subtitle: 'Carrier, network, and transport management',
    color: '#0d9488',
    services: [
      { name: 'Carrier Mgmt & Integration', desc: 'Carrier Onboarding / Serviceability / AWB Mgmt / Booking / tracking', tech: 'Rover / Shipsy' },
      { name: 'Network & Servicability', desc: 'Servicability, Lane mgmt, TAT, Logistics Promise engine', tech: 'Rover / Shipsy' },
      { name: 'Logistics Documentation', desc: 'EwayBill, Manifestation, Trip data, Vahan Portal', tech: 'Rover / Shipsy' },
      { name: 'Transport Mgmt', desc: 'Trip Planning, Hub Mgmt, Vehicle planning', tech: 'Rover / Shipsy / SAP Ztrip' },
      { name: 'Last Mile / Hyperlocal', desc: 'Manpower planning, Trip Mgmt, VAS Services', tech: 'Grab' },
      { name: 'Costing', desc: 'Costing (Manpower / Vehicle / Carrier), Payment Reconciliation', tech: 'Qbill, SAP RP5' },
      { name: 'Track and Trace', desc: 'GPS tracking, Shipment tracking, Trip Tracking', tech: 'Jio Humsafar, Shipsy, Rover' },
    ],
  },
  {
    id: 'warehouse',
    title: 'WareHouse Mgmt',
    subtitle: 'WMS, darkstore Management, and automation',
    color: '#7c3aed',
    services: [
      { name: 'WMS', desc: 'Picking, Packing, QC, Returns, Receiving, Dispatch', tech: 'SAP WM, Shipsy WM, Addverb WM, Viculum WM, RWOS WM' },
      { name: 'Darkstore Management', desc: 'Darkstore management system', tech: 'ROMS' },
      { name: 'Warehouse Automation', desc: 'WCS / WES – PLC Sorter, PTL, Cubi-scan, DWS, RFID', tech: 'Addverb, Nido' },
    ],
  },
  {
    id: 'omnichannel',
    title: 'Omnichannel Mgmt',
    subtitle: 'Retail Store order management',
    color: '#be185d',
    services: [
      { name: 'Online Store Order Mgmt', desc: 'Herald, ROMS' },
      { name: 'Offline Store Order Mgmt', desc: 'RPOS' },
    ],
  },
  {
    id: 'analytics',
    title: 'Retail Analytics System',
    subtitle: 'Reporting and data platforms',
    color: '#0369a1',
    services: [
      { name: 'RRA' },
      { name: 'ClickHouse' },
      { name: 'Databricks' },
      { name: 'Tableau' },
    ],
  },
  {
    id: 'esb',
    title: 'ESB (Enterprise Service Bus)',
    subtitle: 'Integration, gateway, and identity',
    color: '#dc2626',
    services: [
      { name: 'RDIP', desc: 'SAP-RFC, IDOC / Kafka / API' },
      { name: 'Platform Gateway', desc: 'API / Kafka / SAP / gRPC / Temporal / TIBCO' },
      { name: 'SCM Kafka' },
      { name: 'API Gateway', desc: 'Traefik / RDIP' },
      { name: 'Login Service', desc: 'Role / Token Mgmt for Services, WH User, Business' },
    ],
  },
]
