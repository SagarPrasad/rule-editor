import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RuleListPage from './pages/RuleListPage'
import RuleEditorPage from './pages/RuleEditorPage'
import FactsPage from './pages/FactsPage'
import './App.css'

function App() {
  // Get base path from Vite's BASE_URL (set in vite.config.js)
  // For local dev, we'll detect if we're in dev mode and use empty basename
  const basePath = import.meta.env.BASE_URL || '/'
  // Remove trailing slash for React Router basename
  const basename = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  // For local development (dev server), use empty basename
  const isDev = import.meta.env.DEV
  const routerBasename = isDev ? '' : basename
  
  return (
    <Router basename={routerBasename}>
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
