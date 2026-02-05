import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RuleListPage from './pages/RuleListPage'
import RuleEditorPage from './pages/RuleEditorPage'
import FactsPage from './pages/FactsPage'
import './App.css'

function App() {
  // Get base path from Vite's BASE_URL (set in vite.config.js)
  // BASE_URL will be '/rule-editor/' for production, '/' for dev
  const basePath = import.meta.env.BASE_URL || '/'
  
  return (
    <Router basename={basePath}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/rules" replace />} />
          <Route path="/rules" element={<RuleListPage />} />
          <Route path="/rules/:ruleId" element={<RuleEditorPage />} />
          <Route path="/facts" element={<FactsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
