import React, { useState, useEffect } from 'react'
import apiService from '../services/api'
import './TestRulePanel.css'

function TestRulePanel({ rule, template, onClose }) {
  const [inputJson, setInputJson] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDefaultPayload()
  }, [rule])

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

  const handleTest = async () => {
    setLoading(true)
    setError(null)
    setTestResult(null)

    try {
      let input
      try {
        input = JSON.parse(inputJson)
      } catch (e) {
        setError('Invalid JSON input')
        setLoading(false)
        return
      }

      const response = await apiService.testRule(input, rule.payload)
      if (response.success) {
        setTestResult(response.data)
      } else {
        setError('Test failed')
      }
    } catch (err) {
      setError(err.message || 'Error testing rule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="test-panel-overlay" onClick={onClose}>
      <div className="test-panel" onClick={(e) => e.stopPropagation()}>
        <div className="test-panel-header">
          <h2>Test Rule: {rule.ruleId}</h2>
          <button className="button button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="test-panel-content">
          <div className="test-section">
            <h3>Input JSON</h3>
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
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Rule'}
            </button>
          </div>

          <div className="result-section">
            <h3>Test Result</h3>
            {error && (
              <div className="error-message">{error}</div>
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
            {!testResult && !error && !loading && (
              <div className="empty-result">Click "Test Rule" to see results</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestRulePanel
