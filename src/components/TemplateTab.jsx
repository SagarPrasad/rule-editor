import React, { useState, useEffect } from 'react'
import apiService from '../services/api'
import './TemplateTab.css'

function TemplateTab({ ruleId, template, rule, onSave, onExtractPaths }) {
  const [editableIndex, setEditableIndex] = useState(null)
  const [localTemplate, setLocalTemplate] = useState(template)
  const [newPath, setNewPath] = useState('')
  const [newName, setNewName] = useState('')
  const [showFacts, setShowFacts] = useState(false)
  const [facts, setFacts] = useState([])
  const [loadingFacts, setLoadingFacts] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [factsTab, setFactsTab] = useState('facts') // 'facts' or 'json'
  const [rawJson, setRawJson] = useState('')
  const [isEditingJson, setIsEditingJson] = useState(false)
  const [originalJson, setOriginalJson] = useState('')

  React.useEffect(() => {
    setLocalTemplate(template)
  }, [template])

  const loadFacts = async () => {
    setLoadingFacts(true)
    try {
      const response = await apiService.getSamplePayload(ruleId)
      if (response.success) {
        const extractedFacts = apiService.extractFactsFromPayload(response.data)
        setFacts(extractedFacts)
        const jsonString = JSON.stringify(response.data, null, 2)
        setRawJson(jsonString)
        setOriginalJson(jsonString)
      }
    } catch (error) {
      console.error('Error loading facts:', error)
    } finally {
      setLoadingFacts(false)
    }
  }

  const handleEditJson = () => {
    setIsEditingJson(true)
  }

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(rawJson)
      // Re-extract facts from the updated JSON
      const extractedFacts = apiService.extractFactsFromPayload(parsed)
      setFacts(extractedFacts)
      setOriginalJson(rawJson)
      setIsEditingJson(false)
      alert('JSON saved successfully! Facts have been updated.')
    } catch (error) {
      alert('Invalid JSON. Please check your syntax.')
      console.error('JSON parse error:', error)
    }
  }

  const handleCancelEdit = () => {
    setRawJson(originalJson)
    setIsEditingJson(false)
  }

  useEffect(() => {
    if (showFacts && facts.length === 0) {
      loadFacts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFacts])

  const handleFactClick = (path) => {
    setNewPath(path)
    // Try to generate a name from the path
    const generatedName = apiService.generateNameFromPath(path)
    setNewName(generatedName)
  }

  const filteredFacts = facts.filter(fact =>
    fact.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fact.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (index) => {
    setEditableIndex(index)
  }

  const handleSaveItem = (index, path, name) => {
    const updated = [...localTemplate]
    updated[index] = { path, name }
    setLocalTemplate(updated)
    setEditableIndex(null)
  }

  const handleDelete = (index) => {
    const updated = localTemplate.filter((_, i) => i !== index)
    setLocalTemplate(updated)
  }

  const handleAddNew = () => {
    if (newPath && newName) {
      // Check if path already exists
      const pathExists = localTemplate.some(item => item.path === newPath)
      if (pathExists) {
        alert(`Path "${newPath}" already exists in the template. Please use a different path.`)
        return
      }
      setLocalTemplate([...localTemplate, { path: newPath, name: newName }])
      setNewPath('')
      setNewName('')
    }
  }

  const handleSaveAll = () => {
    onSave(localTemplate)
  }

  return (
    <div className="template-tab">
      {showFacts && (
        <div className="facts-panel-overlay" onClick={() => setShowFacts(false)}>
          <div className="facts-panel" onClick={(e) => e.stopPropagation()}>
            <div className="facts-panel-header">
              <h3>Rule: {ruleId}</h3>
              <button 
                className="button button-secondary button-small"
                onClick={() => setShowFacts(false)}
              >
                ✕ Close
              </button>
            </div>
            <div className="facts-tabs">
              <button
                className={`facts-tab ${factsTab === 'facts' ? 'active' : ''}`}
                onClick={() => setFactsTab('facts')}
              >
                Facts/Keys
              </button>
              <button
                className={`facts-tab ${factsTab === 'json' ? 'active' : ''}`}
                onClick={() => setFactsTab('json')}
              >
                Raw JSON
              </button>
            </div>
            {factsTab === 'facts' ? (
              <>
                <div className="facts-search">
                  <input
                    type="text"
                    className="input"
                    placeholder="Search facts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {loadingFacts ? (
                  <div className="loading">Loading facts...</div>
                ) : (
                  <div className="facts-list">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}></th>
                          <th>Path</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFacts.map((fact, index) => {
                          const depth = (fact.path.match(/\./g) || []).length + (fact.path.match(/\[/g) || []).length
                          const indent = depth * 15
                          return (
                            <tr 
                              key={index} 
                              className="fact-row"
                              style={{ backgroundColor: depth % 2 === 0 ? 'white' : '#f8f9fa' }}
                            >
                              <td className="fact-action-cell">
                                <div className="eye-icon-wrapper">
                                  <button
                                    className="eye-icon-button"
                                    onClick={() => {
                                      handleFactClick(fact.path)
                                      setShowFacts(false)
                                    }}
                                    title={`Value: ${fact.value}\nType: ${fact.type}\nClick to use this path`}
                                  >
                                    <svg 
                                      width="18" 
                                      height="18" 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="2" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round"
                                    >
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                  </button>
                                  <div className="eye-tooltip">
                                    <div className="tooltip-content">
                                      <div className="tooltip-row">
                                        <strong>Value:</strong> <span className="fact-value">{fact.value}</span>
                                      </div>
                                      <div className="tooltip-row">
                                        <strong>Type:</strong> <span className={`badge badge-${fact.type}`}>{fact.type}</span>
                                      </div>
                                      <div className="tooltip-hint">Click to use this path</div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ paddingLeft: `${indent + 12}px` }}>
                                <code className="fact-path">{fact.path}</code>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {filteredFacts.length === 0 && (
                      <div className="empty-state">No facts found matching your search.</div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="json-tab-content">
                <div className="json-actions">
                  {!isEditingJson ? (
                    <button
                      className="button button-primary button-small"
                      onClick={handleEditJson}
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        className="button button-success button-small"
                        onClick={handleSaveJson}
                      >
                        Save
                      </button>
                      <button
                        className="button button-secondary button-small"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                {isEditingJson ? (
                  <textarea
                    className="json-editor"
                    value={rawJson}
                    onChange={(e) => setRawJson(e.target.value)}
                    spellCheck={false}
                  />
                ) : (
                  <pre className="json-viewer">{rawJson}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={`card template-content ${showFacts ? 'facts-open' : ''}`}>
        <div className="template-header">
          <h2>Template Configuration</h2>
          <div className="template-actions">
            {template.length === 0 && rule && rule.payload && (
              <button className="button button-primary" onClick={onExtractPaths}>
                Extract Paths from Rule
              </button>
            )}
            <button 
              className="button button-secondary" 
              onClick={() => {
                setShowFacts(!showFacts)
                if (!showFacts && facts.length === 0) {
                  loadFacts()
                }
              }}
            >
              {showFacts ? 'Hide' : 'View'} Facts/Keys
            </button>
            <button className="button button-success" onClick={handleSaveAll}>
              Save Template
            </button>
          </div>
        </div>

        <div className="template-list">
          {localTemplate.length === 0 ? (
            <div className="empty-state">
              No template found. Click "Extract Paths from Rule" to generate one.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Path</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localTemplate.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {editableIndex === index ? (
                        <input
                          type="text"
                          className="input"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...localTemplate]
                            updated[index].name = e.target.value
                            setLocalTemplate(updated)
                          }}
                          onBlur={() => handleSaveItem(index, item.path, item.name)}
                          autoFocus
                        />
                      ) : (
                        <span>{item.name}</span>
                      )}
                    </td>
                    <td>
                      {editableIndex === index ? (
                        <input
                          type="text"
                          className="input"
                          value={item.path}
                          onChange={(e) => {
                            const updated = [...localTemplate]
                            updated[index].path = e.target.value
                            setLocalTemplate(updated)
                          }}
                          onBlur={() => handleSaveItem(index, item.path, item.name)}
                        />
                      ) : (
                        <code className="path-display">{item.path}</code>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editableIndex !== index ? (
                          <button
                            className="button button-primary"
                            onClick={() => handleEdit(index)}
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            className="button button-success"
                            onClick={() => handleSaveItem(index, item.path, item.name)}
                          >
                            Save
                          </button>
                        )}
                        <button
                          className="button button-danger"
                          onClick={() => handleDelete(index)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="add-new-section">
          <h3>Add New Path</h3>
          <div className="add-new-controls">
            <input
              type="text"
              className="input"
              placeholder="Display Name (e.g., Order No)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="text"
              className="input"
              placeholder="JSON Path (e.g., $.orderNo)"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
            />
            <button className="button button-primary" onClick={handleAddNew}>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateTab
