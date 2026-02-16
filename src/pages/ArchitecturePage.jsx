import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { architectureDomains as fallbackDomains } from '../data/architectureData'
import { parseSystemsExcel } from '../services/architectureExcelParser'
import './ArchitecturePage.css'

const LAYOUT = {
  left: ['platform', 'supply-chain-control-tower'],
  center: [
    ['order-lifecycle'],
    ['financial'],
    ['logistics'],
    ['warehouse'],
    ['omnichannel'],
    ['analytics'],
  ],
  right: ['esb'],
}

function getDomainById(domains, id) {
  return domains.find((d) => d.id === id)
}

function ArchitecturePage() {
  const [domains, setDomains] = useState(fallbackDomains)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(null) // 'jpeg' | 'pdf' | null
  const [expanded, setExpanded] = useState(() =>
    fallbackDomains.reduce((acc, d) => ({ ...acc, [d.id]: true }), {})
  )
  const captureRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`${import.meta.env.BASE_URL}Systems.xlsx`)
      .then((res) => {
        if (!res.ok) throw new Error('File not found')
        return res.arrayBuffer()
      })
      .then((arrayBuffer) => {
        if (cancelled) return
        const parsed = parseSystemsExcel(arrayBuffer)
        if (parsed.length > 0) {
          setDomains(parsed)
          setExpanded((prev) => {
            const next = { ...prev }
            parsed.forEach((d) => {
              if (next[d.id] === undefined) next[d.id] = true
            })
            return next
          })
        }
      })
      .catch(() => {
        if (!cancelled) setDomains(fallbackDomains)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const captureAndExport = async (format) => {
    const el = captureRef.current
    if (!el) return
    setExporting(format)
    try {
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: '#f0f4f8',
        logging: false,
      })
      const filename = `Supply-Chain-Current-Landscape-${new Date().toISOString().slice(0, 10)}`
      if (format === 'jpeg') {
        const link = document.createElement('a')
        link.download = `${filename}.jpg`
        link.href = canvas.toDataURL('image/jpeg', 0.92)
        link.click()
      } else {
        const imgData = canvas.toDataURL('image/jpeg', 0.92)
        const isLandscape = canvas.width > canvas.height
        const pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        })
        const pageW = pdf.internal.pageSize.getWidth()
        const pageH = pdf.internal.pageSize.getHeight()
        const pxToMm = 25.4 / 96
        const wMm = canvas.width * pxToMm
        const hMm = canvas.height * pxToMm
        const scale = Math.min(pageW / wMm, pageH / hMm, 1)
        const w = wMm * scale
        const h = hMm * scale
        const x = (pageW - w) / 2
        const y = (pageH - h) / 2
        pdf.addImage(imgData, 'JPEG', x, y, w, h)
        pdf.save(`${filename}.pdf`)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(null)
    }
  }

  const DomainBlock = ({ domain }) => {
    if (!domain) return null
    const isOpen = expanded[domain.id]
    return (
      <section
        className={`architecture-domain ${isOpen ? 'is-expanded' : 'is-collapsed'}`}
        style={{ '--domain-color': domain.color }}
      >
        <button
          type="button"
          className="architecture-domain-header"
          onClick={() => toggle(domain.id)}
          aria-expanded={isOpen}
        >
          <h2>{domain.title}</h2>
          {domain.subtitle && (
            <span className="architecture-domain-subtitle">{domain.subtitle}</span>
          )}
          <span className="architecture-domain-chevron" aria-hidden>
            {isOpen ? '▼' : '▶'}
          </span>
        </button>
        {isOpen && (
          <div className="architecture-services">
            {domain.services.map((svc, idx) => (
              <div key={idx} className="architecture-service-box">
                <div className="architecture-service-name">{svc.name}</div>
                {svc.desc && (
                  <div className="architecture-service-desc">{svc.desc}</div>
                )}
                {svc.tech && (
                  <div className="architecture-service-tech">{svc.tech}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="architecture-page" ref={captureRef}>
      <header className="architecture-header">
        <div className="architecture-header-inner">
          <div className="architecture-header-left">
            <Link to="/rules" className="architecture-back">← Rules</Link>
            <h1>Supply Chain Current Landscape</h1>
            <p className="architecture-subtitle">
              {loading ? 'Loading Systems.xlsx…' : 'Functional domains and services (from Systems.xlsx — refresh to pick up changes)'}
            </p>
          </div>
          <div className="architecture-header-actions">
            <button
              type="button"
              className="architecture-export-btn"
              onClick={() => captureAndExport('jpeg')}
              disabled={loading || !!exporting}
              title="Export as JPEG"
            >
              {exporting === 'jpeg' ? 'Exporting…' : 'Export JPEG'}
            </button>
            <button
              type="button"
              className="architecture-export-btn"
              onClick={() => captureAndExport('pdf')}
              disabled={loading || !!exporting}
              title="Export as PDF"
            >
              {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="architecture-loading">Loading architecture from Systems.xlsx…</div>
      ) : (
      <div className="architecture-diagram">
        <div className="architecture-layout">
          <div className="architecture-col architecture-col-left">
{LAYOUT.left.map((id) => (
            <DomainBlock key={id} domain={getDomainById(domains, id)} />
          ))}
          </div>
          <div className="architecture-col architecture-col-center">
            {LAYOUT.center.map((row, rowIdx) => (
              <div key={rowIdx} className="architecture-center-row">
                {row.map((id) => (
                  <DomainBlock key={id} domain={getDomainById(domains, id)} />
                ))}
              </div>
            ))}
          </div>
          <div className="architecture-col architecture-col-right">
{LAYOUT.right.map((id) => (
            <DomainBlock key={id} domain={getDomainById(domains, id)} />
          ))}
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default ArchitecturePage
