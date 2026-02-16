import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiService from '../services/api'
import './RuleListPage.css'

function RuleListPage() {
  const [tenantId, setTenantId] = useState('AJIOB2C')
  const [key, setKey] = useState('')
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadRules()
  }, [tenantId, key])

  const loadRules = async () => {
    setLoading(true)
    try {
      const response = await apiService.getRules(tenantId, key)
      if (response.success) {
        setRules(response.data)
      }
    } catch (error) {
      console.error('Error loading rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ruleId) => {
    navigate(`/rules/${ruleId}`)
  }

  const handleToggle = async (ruleId, currentStatus) => {
    try {
      await apiService.toggleRule(ruleId, !currentStatus)
      loadRules()
    } catch (error) {
      console.error('Error toggling rule:', error)
    }
  }

  return (
    <div className="rule-list-page">
      <div className="container">
        <div className="page-header-row">
          <h1>Rule Engine Editor</h1>
          <Link to="/architecture" className="nav-link-architecture">Supply Chain Current Landscape</Link>
        </div>

        <div className="card filter-section">
          <h2>Filter Rules</h2>
          <div className="filter-controls">
            <div className="filter-group">
              <label>Tenant ID:</label>
              <select
                className="select"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              >
                <option value="AJIOB2C">AJIOB2C</option>
                <option value="TENANT2">TENANT2</option>
                <option value="TENANT3">TENANT3</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Key:</label>
              <input
                type="text"
                className="input"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter key (optional)"
              />
            </div>
            <button className="button button-primary" onClick={loadRules}>
              Refresh
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Rules List</h2>
          {loading ? (
            <div className="loading">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="empty-state">No rules found</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Version</th>
                  <th>Modified By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.ruleId}>
                    <td>{rule.ruleId}</td>
                    <td>{rule.version || 'N/A'}</td>
                    <td>{rule.modifiedBy || 'N/A'}</td>
                    <td>
                      <span className={`badge ${rule.enabled ? 'badge-success' : 'badge-danger'}`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="button button-primary"
                          onClick={() => handleEdit(rule.ruleId)}
                        >
                          Edit
                        </button>
                        <button
                          className={`button ${rule.enabled ? 'button-danger' : 'button-success'}`}
                          onClick={() => handleToggle(rule.ruleId, rule.enabled)}
                        >
                          {rule.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default RuleListPage
