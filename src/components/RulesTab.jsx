import React, { useState, useEffect } from 'react'
import ConditionEditor from './ConditionEditor'
import apiService from '../services/api'
import './RulesTab.css'

const OPERATORS = [
  'exists',
  'equals',
  'in',
  'contains_any',
  'contains_all',
  'not_equals',
  'greater_than',
  'less_than',
  'greater_than_or_equal',
  'less_than_or_equal'
]

function RulesTab({ rule, template, onSave }) {
  const [payload, setPayload] = useState(rule.payload || [])
  const [viewMode, setViewMode] = useState('ui') // 'ui' or 'json'
  const [expandedStates, setExpandedStates] = useState({})
  const [rawJson, setRawJson] = useState('')
  const [isEditingJson, setIsEditingJson] = useState(false)
  const [showTestPanel, setShowTestPanel] = useState(false)
  const [inputJson, setInputJson] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [loadingTest, setLoadingTest] = useState(false)
  const [testError, setTestError] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [matchedIndices, setMatchedIndices] = useState(new Set())

  const handleAddCondition = (type) => {
    // Find first existing condition's successResult to copy
    const defaultSuccessResult = payload.length > 0 && payload[0].successResult 
      ? JSON.parse(JSON.stringify(payload[0].successResult))
      : {}

    const newCondition = {
      type,
      path: '',
      defaultResult: false,
      successResult: defaultSuccessResult
    }

    if (type === 'or' || type === 'and') {
      newCondition.children = []
    } else if (type === 'exists') {
      newCondition.failureResult = {}
    } else if (type === 'in' || type === 'contains_any' || type === 'contains_all') {
      newCondition.values = []
    } else {
      newCondition.value = ''
    }

    setPayload([...payload, newCondition])
  }

  const handleUpdateCondition = (index, updatedCondition) => {
    const updated = [...payload]
    updated[index] = updatedCondition
    setPayload(updated)
  }

  const handleDeleteCondition = (index) => {
    const updated = payload.filter((_, i) => i !== index)
    setPayload(updated)
  }

  // Validate payload structure
  const validatePayload = (payloadToValidate) => {
    if (!Array.isArray(payloadToValidate)) {
      return 'Payload must be an array'
    }

    for (let i = 0; i < payloadToValidate.length; i++) {
      const condition = payloadToValidate[i]
      
      if (!condition || typeof condition !== 'object') {
        return `Condition at index ${i} must be an object`
      }

      if (!condition.type) {
        return `Condition at index ${i} is missing 'type' field`
      }

      // Validate based on type
      if (condition.type === 'or' || condition.type === 'and') {
        if (!Array.isArray(condition.children)) {
          return `${condition.type} condition at index ${i} must have 'children' array`
        }
        // Recursively validate children
        const childError = validatePayload(condition.children)
        if (childError) {
          return `Child condition error: ${childError}`
        }
      } else if (condition.type === 'exists') {
        if (!condition.path) {
          return `Exists condition at index ${i} must have 'path' field`
        }
      } else if (condition.type === 'in' || condition.type === 'contains_any' || condition.type === 'contains_all') {
        if (!condition.path) {
          return `${condition.type} condition at index ${i} must have 'path' field`
        }
        if (!Array.isArray(condition.values)) {
          return `${condition.type} condition at index ${i} must have 'values' array`
        }
      } else {
        if (!condition.path) {
          return `${condition.type} condition at index ${i} must have 'path' field`
        }
        if (condition.value === undefined && condition.type !== 'exists') {
          return `${condition.type} condition at index ${i} must have 'value' field`
        }
      }
    }

    return null
  }

  const handleSave = () => {
    // Validate payload
    const validationError = validatePayload(payload)
    if (validationError) {
      setValidationError(validationError)
      alert(`Validation Error: ${validationError}`)
      return
    }

    setValidationError(null)
    const updatedRule = {
      ...rule,
      payload
    }
    onSave(updatedRule)
  }

  const getConditionTypeLabel = (type) => {
    if (type === 'or') return 'OR Rule'
    if (type === 'and') return 'AND Rule'
    return 'Single Condition'
  }

  const handleToggleExpand = (index) => {
    setExpandedStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleExpandAll = () => {
    const allExpanded = {}
    payload.forEach((_, index) => {
      allExpanded[index] = true
    })
    setExpandedStates(allExpanded)
  }

  const handleCollapseAll = () => {
    const allCollapsed = {}
    payload.forEach((_, index) => {
      allCollapsed[index] = false
    })
    setExpandedStates(allCollapsed)
  }

  const handleEditJson = () => {
    setRawJson(JSON.stringify(payload, null, 2))
    setIsEditingJson(true)
  }

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(rawJson)
      setPayload(parsed)
      setIsEditingJson(false)
      // Reset expanded states for new payload
      const newStates = {}
      parsed.forEach((_, index) => {
        newStates[index] = true
      })
      setExpandedStates(newStates)
      alert('JSON saved successfully!')
    } catch (error) {
      alert('Invalid JSON. Please check your syntax.')
      console.error('JSON parse error:', error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingJson(false)
  }

  const loadDefaultPayload = async () => {
    try {
      const response = await apiService.getDefaultPayload(rule.ruleId)
      if (response.success) {
        setInputJson(JSON.stringify(response.data, null, 2))
      }
    } catch (err) {
      console.error('Error loading default payload:', err)
    }
  }

  useEffect(() => {
    if (showTestPanel && inputJson === '') {
      loadDefaultPayload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTestPanel])

  const handleTest = async () => {
    setLoadingTest(true)
    setTestError(null)
    setTestResult(null)

    try {
      let input
      try {
        input = JSON.parse(inputJson)
      } catch (e) {
        setTestError('Invalid JSON input')
        setLoadingTest(false)
        return
      }

      const response = await apiService.testRule(input, payload)
      if (response.success) {
        setTestResult(response.data)
      } else {
        setTestError('Test failed')
      }
    } catch (err) {
      setTestError(err.message || 'Error testing rule')
    } finally {
      setLoadingTest(false)
    }
  }

  // Initialize expanded states for new conditions
  useEffect(() => {
    if (payload.length > 0) {
      const newStates = { ...expandedStates }
      payload.forEach((_, index) => {
        if (newStates[index] === undefined) {
          newStates[index] = true // Default to expanded
        }
      })
      setExpandedStates(newStates)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.length])

  // Update raw JSON when payload changes (only if not editing)
  useEffect(() => {
    if (!isEditingJson) {
      setRawJson(JSON.stringify(payload, null, 2))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload])

  // Search functionality
  const searchInCondition = (condition, searchText) => {
    if (!searchText) return false
    
    const lowerSearch = searchText.toLowerCase()
    const conditionStr = JSON.stringify(condition).toLowerCase()
    
    // Search in all fields
    if (condition.type && condition.type.toLowerCase().includes(lowerSearch)) return true
    if (condition.path && condition.path.toLowerCase().includes(lowerSearch)) return true
    if (condition.value !== undefined && String(condition.value).toLowerCase().includes(lowerSearch)) return true
    if (condition.values && condition.values.some(v => String(v).toLowerCase().includes(lowerSearch))) return true
    if (conditionStr.includes(lowerSearch)) return true
    
    // Search in children recursively
    if (condition.children && condition.children.some(child => searchInCondition(child, searchText))) {
      return true
    }
    
    return false
  }

  useEffect(() => {
    if (searchTerm.trim()) {
      const matched = new Set()
      payload.forEach((condition, index) => {
        if (searchInCondition(condition, searchTerm)) {
          matched.add(index)
        }
      })
      setMatchedIndices(matched)
    } else {
      setMatchedIndices(new Set())
    }
  }, [searchTerm, payload])

  return (
    <div className="rules-tab">
      {showTestPanel && (
        <div className="test-panel-overlay" onClick={() => setShowTestPanel(false)}>
          <div className="test-panel" onClick={(e) => e.stopPropagation()}>
            <div className="test-panel-header">
              <h3>Test Rule: {rule.ruleId}</h3>
              <button 
                className="button button-secondary button-small"
                onClick={() => setShowTestPanel(false)}
              >
                ✕ Close
              </button>
            </div>
            <div className="test-panel-content">
              <div className="test-section">
                <h4>Input JSON</h4>
                <textarea
                  className="input textarea-large"
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  placeholder="Enter JSON input..."
                  rows={15}
                />
                <button
                  className="button button-primary"
                  onClick={handleTest}
                  disabled={loadingTest}
                >
                  {loadingTest ? 'Testing...' : 'Test Rule'}
                </button>
              </div>

              <div className="result-section">
                <h4>Test Result</h4>
                {testError && (
                  <div className="error-message">{testError}</div>
                )}
                {testResult && (
                  <div className="result-content">
                    <div className="result-item">
                      <strong>Result:</strong>{' '}
                      <span className={testResult.result ? 'result-success' : 'result-failure'}>
                        {testResult.result ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    {testResult.output && (
                      <div className="result-item">
                        <strong>Output:</strong>
                        <pre className="result-json">
                          {JSON.stringify(testResult.output, null, 2)}
                        </pre>
                      </div>
                    )}
                    {testResult.matchedRules && (
                      <div className="result-item">
                        <strong>Matched Rules:</strong>
                        <ul>
                          {testResult.matchedRules.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {!testResult && !testError && !loadingTest && (
                  <div className="empty-result">Click "Test Rule" to see results</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`card rules-content ${showTestPanel ? 'test-open' : ''}`}>
        {validationError && (
          <div className="validation-error">
            <strong>Validation Error:</strong> {validationError}
          </div>
        )}
        <div className="rules-header">
          <h2>Rules Configuration</h2>
          <div className="rules-header-right">
            <div className="search-box">
              <input
                type="text"
                className="input search-input"
                placeholder="Search in rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="button-clear-search"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="rules-header-actions">
            <div className="view-toggle">
              <button
                className={`button button-small ${viewMode === 'ui' ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setViewMode('ui')}
              >
                UI View
              </button>
              <button
                className={`button button-small ${viewMode === 'json' ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setViewMode('json')}
              >
                Raw JSON
              </button>
            </div>
            {viewMode === 'ui' && payload.length > 0 && (
              <div className="expand-controls">
                <button
                  className="button button-secondary button-small"
                  onClick={handleExpandAll}
                >
                  Expand All
                </button>
                <button
                  className="button button-secondary button-small"
                  onClick={handleCollapseAll}
                >
                  Collapse All
                </button>
              </div>
            )}
            <button className="button button-success" onClick={handleSave}>
              Save Rules
            </button>
            <button 
              className="button button-primary" 
              onClick={() => {
                setShowTestPanel(!showTestPanel)
                if (!showTestPanel && inputJson === '') {
                  loadDefaultPayload()
                }
              }}
            >
              {showTestPanel ? 'Hide' : 'Test'} Rule
            </button>
            </div>
          </div>
        </div>

        {viewMode === 'ui' ? (
          <>
            <div className="add-condition-section">
              <h3>Add New Condition</h3>
              <div className="operator-buttons">
                <button
                  className="button button-primary"
                  onClick={() => handleAddCondition('equals')}
                >
                  Single Condition
                </button>
                <button
                  className="button button-primary"
                  onClick={() => handleAddCondition('or')}
                >
                  OR Rule
                </button>
                <button
                  className="button button-primary"
                  onClick={() => handleAddCondition('and')}
                >
                  AND Rule
                </button>
              </div>
            </div>

            <div className="conditions-list">
              {payload.length === 0 ? (
                <div className="empty-state">No conditions defined. Add a condition to get started.</div>
              ) : searchTerm && matchedIndices.size === 0 ? (
                <div className="empty-state">No conditions found matching "{searchTerm}"</div>
              ) : (
                payload.map((condition, index) => {
                  const isMatched = matchedIndices.has(index)
                  const shouldShow = !searchTerm || isMatched
                  
                  if (!shouldShow) return null
                  
                  return (
                    <div 
                      key={index} 
                      className={`condition-item ${isMatched ? 'matched-condition' : ''}`}
                    >
                      <ConditionEditor
                        condition={condition}
                        index={index}
                        template={template}
                        operators={OPERATORS}
                        isExpanded={expandedStates[index] !== false}
                        onToggleExpand={() => handleToggleExpand(index)}
                        onUpdate={(updated) => handleUpdateCondition(index, updated)}
                        onDelete={() => handleDeleteCondition(index)}
                        searchTerm={searchTerm}
                      />
                    </div>
                  )
                })
              )}
            </div>
          </>
        ) : (
          <div className="json-view-section">
            <div className="json-actions">
              {!isEditingJson ? (
                <>
                  <button
                    className="button button-primary button-small"
                    onClick={handleEditJson}
                  >
                    Edit
                  </button>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => {
                      navigator.clipboard.writeText(rawJson)
                      alert('JSON copied to clipboard!')
                    }}
                    title="Copy JSON to clipboard"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px', verticalAlign: 'middle' }}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                  </button>
                </>
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
  )
}

export default RulesTab
