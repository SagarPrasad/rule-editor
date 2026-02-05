import React, { useState } from 'react'
import './ConditionEditor.css'

function ConditionEditor({ condition, index, template, operators, onUpdate, onDelete, isExpanded: controlledExpanded, onToggleExpand, searchTerm }) {
  const [internalExpanded, setInternalExpanded] = useState(true)
  const [localCondition, setLocalCondition] = useState(condition)
  const [isEditingSuccessResult, setIsEditingSuccessResult] = useState(false)
  const [isEditingFailureResult, setIsEditingFailureResult] = useState(false)
  const [successResultText, setSuccessResultText] = useState('')
  const [failureResultText, setFailureResultText] = useState('')
  
  // Use controlled expanded state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded
  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  React.useEffect(() => {
    setLocalCondition(condition)
    // Reset editing states when condition changes
    if (!isEditingSuccessResult) {
      setSuccessResultText(JSON.stringify(condition.successResult || {}, null, 2))
    }
    if (!isEditingFailureResult) {
      setFailureResultText(JSON.stringify(condition.failureResult || {}, null, 2))
    }
  }, [condition])

  const handleFieldChange = (field, value) => {
    const updated = { ...localCondition, [field]: value }
    setLocalCondition(updated)
    onUpdate(updated)
  }

  const handleNestedFieldChange = (field, value) => {
    const updated = {
      ...localCondition,
      [field]: value
    }
    setLocalCondition(updated)
    onUpdate(updated)
  }

  const handleAddChild = () => {
    const newChild = {
      type: 'equals',
      path: '',
      value: '',
      defaultResult: false
    }
    const updated = {
      ...localCondition,
      children: [...(localCondition.children || []), newChild]
    }
    setLocalCondition(updated)
    onUpdate(updated)
  }

  const handleUpdateChild = (childIndex, updatedChild) => {
    const updated = {
      ...localCondition,
      children: localCondition.children.map((child, idx) =>
        idx === childIndex ? updatedChild : child
      )
    }
    setLocalCondition(updated)
    onUpdate(updated)
  }

  const handleDeleteChild = (childIndex) => {
    const updated = {
      ...localCondition,
      children: localCondition.children.filter((_, idx) => idx !== childIndex)
    }
    setLocalCondition(updated)
    onUpdate(updated)
  }

  const handleAddValue = () => {
    const updated = {
      ...localCondition,
      values: [...(localCondition.values || []), '']
    }
    setLocalCondition(updated)
    onUpdate(updated)
  }

  const handleUpdateValue = (valueIndex, value) => {
    const updated = {
      ...localCondition,
      values: localCondition.values.map((v, idx) => (idx === valueIndex ? value : v))
    }
    setLocalCondition(updated)
    onUpdate(updated)
  }

  const handleDeleteValue = (valueIndex) => {
    const updated = {
      ...localCondition,
      values: localCondition.values.filter((_, idx) => idx !== valueIndex)
    }
    setLocalCondition(updated)
    onUpdate(updated)
  }

  const getConditionType = () => {
    if (localCondition.type === 'or') return 'OR Rule'
    if (localCondition.type === 'and') return 'AND Rule'
    return 'Single Condition'
  }

  const getPathName = (path) => {
    const templateItem = template.find(t => t.path === path)
    return templateItem ? templateItem.name : path
  }

  const getConditionPreview = (condition) => {
    if (!condition) return ''
    
    if (condition.type === 'or' || condition.type === 'and') {
      // For OR/AND, show first child condition
      if (condition.children && condition.children.length > 0) {
        return getConditionPreview(condition.children[0])
      }
      return ''
    }
    
    // For single conditions, build preview
    const pathName = condition.path ? getPathName(condition.path) : ''
    
    if (condition.type === 'in' || condition.type === 'contains_any' || condition.type === 'contains_all') {
      if (condition.values && condition.values.length > 0) {
        const valuesStr = condition.values.slice(0, 3).join(', ') + (condition.values.length > 3 ? '...' : '')
        return `${pathName} ${condition.type === 'in' ? 'in' : condition.type === 'contains_any' ? 'in' : 'contains'} ${valuesStr}`
      }
      return pathName
    } else if (condition.type === 'exists') {
      return `${pathName} exists`
    } else if (condition.value !== undefined && condition.value !== '') {
      return `${pathName} = ${condition.value}`
    }
    
    return pathName || ''
  }

  const getResultText = () => {
    if (localCondition.successResult) {
      const resultStr = JSON.stringify(localCondition.successResult)
      if (resultStr.length > 50) {
        return resultStr.substring(0, 50) + '...'
      }
      return resultStr
    }
    return 'No result'
  }

  const getConditionDescription = () => {
    const resultText = getResultText()
    const preview = getConditionPreview(localCondition)
    
    if (preview) {
      return `Result: ${resultText} (Condition: ${preview})`
    }
    return `Result: ${resultText}`
  }

  return (
    <div className="condition-editor">
      <div className="collapsible-header" onClick={handleToggle}>
        <div className="condition-header-info">
          <div className="condition-title">
            <strong>{getConditionType()}</strong>
            <span className="condition-description"> - {getConditionDescription()}</span>
          </div>
        </div>
        <div className="header-actions">
          <span className={`collapsible-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
          <button
            className="button button-danger button-small"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="collapsible-content">
          <div className="condition-form">
            {localCondition.type !== 'or' && localCondition.type !== 'and' && (
              <>
                <div className="form-group form-group-inline">
                  <div className="form-field">
                    <label>Operator Type:</label>
                    <select
                      className="select"
                      value={localCondition.type || 'equals'}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                    >
                      {operators.map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Path:</label>
                    <select
                      className="select"
                      value={localCondition.path || ''}
                      onChange={(e) => handleFieldChange('path', e.target.value)}
                    >
                      <option value="">Select Path</option>
                      {template.map(t => (
                        <option key={t.path} value={t.path}>{t.name} ({t.path})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field form-field-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={localCondition.defaultResult || false}
                        onChange={(e) => handleFieldChange('defaultResult', e.target.checked)}
                      />
                      Default Result
                    </label>
                  </div>
                </div>

                {(localCondition.type === 'in' ||
                  localCondition.type === 'contains_any' ||
                  localCondition.type === 'contains_all') && (
                  <div className="form-group">
                    <label>Values:</label>
                    <div className="values-list">
                      {localCondition.values?.map((value, idx) => (
                        <div key={idx} className="value-item">
                          <input
                            type="text"
                            className="input"
                            value={value}
                            onChange={(e) => handleUpdateValue(idx, e.target.value)}
                            placeholder="Enter value"
                          />
                          <button
                            className="button button-danger button-small"
                            onClick={() => handleDeleteValue(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button className="button button-primary button-small" onClick={handleAddValue}>
                        Add Value
                      </button>
                    </div>
                  </div>
                )}

                {localCondition.type !== 'in' &&
                  localCondition.type !== 'contains_any' &&
                  localCondition.type !== 'contains_all' &&
                  localCondition.type !== 'exists' && (
                    <div className="form-group">
                      <label>Value:</label>
                      <input
                        type="text"
                        className="input"
                        value={localCondition.value || ''}
                        onChange={(e) => handleFieldChange('value', e.target.value)}
                        placeholder="Enter value"
                      />
                    </div>
                  )}
              </>
            )}

            {(localCondition.type === 'or' || localCondition.type === 'and') && (
              <div className="children-section">
                <div className="section-header">
                  <h4>Children Conditions</h4>
                  <button className="button button-primary button-small" onClick={handleAddChild}>
                    Add Child
                  </button>
                </div>
                {localCondition.children?.map((child, idx) => (
                  <div key={idx} className="child-condition">
                    <ConditionEditor
                      condition={child}
                      index={idx}
                      template={template}
                      operators={operators}
                      onUpdate={(updated) => handleUpdateChild(idx, updated)}
                      onDelete={() => handleDeleteChild(idx)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="form-group">
              <div className="form-group-header">
                <label>Success Result:</label>
                {!isEditingSuccessResult && (
                  <button
                    className="edit-icon-button"
                    onClick={() => {
                      setSuccessResultText(JSON.stringify(localCondition.successResult || {}, null, 2))
                      setIsEditingSuccessResult(true)
                    }}
                    title="Edit Success Result"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                )}
              </div>
              {isEditingSuccessResult ? (
                <div>
                  <textarea
                    className="input textarea"
                    value={successResultText}
                    onChange={(e) => setSuccessResultText(e.target.value)}
                    placeholder='{"fulfillment": true}'
                    rows={4}
                    autoFocus
                  />
                  <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                    <button
                      className="button button-success button-small"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(successResultText)
                          handleNestedFieldChange('successResult', parsed)
                          setIsEditingSuccessResult(false)
                        } catch (err) {
                          alert('Invalid JSON format. Please check your syntax.')
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="button button-secondary button-small"
                      onClick={() => {
                        setIsEditingSuccessResult(false)
                        setSuccessResultText(JSON.stringify(localCondition.successResult || {}, null, 2))
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="json-preview">{JSON.stringify(localCondition.successResult || {}, null, 2)}</pre>
              )}
            </div>

            {localCondition.type === 'exists' && (
              <div className="form-group">
                <div className="form-group-header">
                  <label>Failure Result:</label>
                  {!isEditingFailureResult && (
                    <button
                      className="edit-icon-button"
                      onClick={() => {
                        setFailureResultText(JSON.stringify(localCondition.failureResult || {}, null, 2))
                        setIsEditingFailureResult(true)
                      }}
                      title="Edit Failure Result"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  )}
                </div>
                {isEditingFailureResult ? (
                  <div>
                    <textarea
                      className="input textarea"
                      value={failureResultText}
                      onChange={(e) => setFailureResultText(e.target.value)}
                      placeholder='{"fulfillment": false}'
                      rows={4}
                      autoFocus
                    />
                    <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                      <button
                        className="button button-success button-small"
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(failureResultText)
                            handleNestedFieldChange('failureResult', parsed)
                            setIsEditingFailureResult(false)
                          } catch (err) {
                            alert('Invalid JSON format. Please check your syntax.')
                          }
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="button button-secondary button-small"
                        onClick={() => {
                          setIsEditingFailureResult(false)
                          setFailureResultText(JSON.stringify(localCondition.failureResult || {}, null, 2))
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="json-preview">{JSON.stringify(localCondition.failureResult || {}, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ConditionEditor
