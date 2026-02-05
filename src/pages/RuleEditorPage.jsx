import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiService from '../services/api'
import TemplateTab from '../components/TemplateTab'
import RulesTab from '../components/RulesTab'
import './RuleEditorPage.css'

function RuleEditorPage() {
  const { ruleId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('template')
  const [rule, setRule] = useState(null)
  const [template, setTemplate] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRule()
    loadTemplate()
  }, [ruleId])

  const loadRule = async () => {
    setLoading(true)
    try {
      const response = await apiService.getRule(ruleId)
      if (response.success) {
        setRule(response.data)
      }
    } catch (error) {
      console.error('Error loading rule:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = async () => {
    try {
      const response = await apiService.getTemplate(ruleId)
      if (response.success && response.data.length > 0) {
        setTemplate(response.data)
      } else if (rule && rule.payload) {
        // Extract paths from rule if no template exists
        const extractedPaths = apiService.extractPathsFromRule(rule.payload)
        setTemplate(extractedPaths)
      }
    } catch (error) {
      console.error('Error loading template:', error)
    }
  }

  const handleSaveTemplate = async (updatedTemplate) => {
    try {
      const response = await apiService.saveTemplate(ruleId, updatedTemplate)
      if (response.success) {
        setTemplate(updatedTemplate)
        alert('Template saved successfully!')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error saving template')
    }
  }

  const handleSaveRule = async (updatedRule) => {
    try {
      const response = await apiService.saveRule(updatedRule)
      if (response.success) {
        setRule(updatedRule)
        alert('Rule saved successfully!')
      }
    } catch (error) {
      console.error('Error saving rule:', error)
      alert('Error saving rule')
    }
  }

  if (loading) {
    return (
      <div className="rule-editor-page">
        <div className="container">
          <div className="loading">Loading rule...</div>
        </div>
      </div>
    )
  }

  if (!rule) {
    return (
      <div className="rule-editor-page">
        <div className="container">
          <div className="error">Rule not found</div>
          <button className="button button-primary" onClick={() => navigate('/rules')}>
            Back to Rules List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rule-editor-page">
      <div className="container">
        <div className="page-header">
          <h1>Edit Rule: {rule.ruleId}</h1>
          <button className="button button-secondary" onClick={() => navigate('/rules')}>
            Back to List
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'template' ? 'active' : ''}`}
            onClick={() => setActiveTab('template')}
          >
            Template
          </button>
          <button
            className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Rules
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'template' && (
            <TemplateTab
              ruleId={ruleId}
              template={template}
              rule={rule}
              onSave={handleSaveTemplate}
              onExtractPaths={() => {
                if (rule.payload) {
                  const extractedPaths = apiService.extractPathsFromRule(rule.payload)
                  setTemplate(extractedPaths)
                }
              }}
            />
          )}
          {activeTab === 'rules' && (
            <RulesTab
              rule={rule}
              template={template}
              onSave={handleSaveRule}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default RuleEditorPage
