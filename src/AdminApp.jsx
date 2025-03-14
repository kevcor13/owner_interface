import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import OwnerInterface from './components/OwnerInterface';

function AdminApp() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<OwnerInterface />} />
        </Routes>
      </div>
    </Router>
  );
}

export default AdminApp;