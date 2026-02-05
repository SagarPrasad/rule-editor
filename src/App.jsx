import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RuleListPage from './pages/RuleListPage'
import RuleEditorPage from './pages/RuleEditorPage'
import FactsPage from './pages/FactsPage'
import './App.css'

function App() {
  return (
    <Router>
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
