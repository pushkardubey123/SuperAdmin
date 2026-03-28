import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './Components/Login';
import CreatePlan from './Components/CreatePlan';
import ManagePlans from './Components/ManagePlans';
import ManageClients from './Components/ManageClients';
import ManageTrials from './Components/ManageTrials';
import AllEnquiry from './Components/AllEnquiry';
import Dashboard from './Components/Dashboard';

// 🔥 Naya: Protected Route Wrapper (Ye token har baar check karega)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("superAdminToken");
  if (!token) return <Navigate to="/" replace />;
  return children;
};

// 🔥 Naya: Public Route Wrapper (Agar logged in hai toh wapas login page nahi jane dega)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("superAdminToken");
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* PROTECTED ROUTES */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>     
              
              {/* MAIN CONTENT AREA */}
              <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', height: '100vh' }}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/manage-plans" element={<ManagePlans />} />
                  <Route path="/create-plan" element={<CreatePlan />} />
                  <Route path="/manage-clients" element={<ManageClients />} />
                  <Route path="/manage-trials" element={<ManageTrials />} />
                  <Route path="/enquiries" element={<AllEnquiry />} />
                  <Route path="/blogs" element={<h2 className="mt-4 text-secondary">📝 Manage Blogs</h2>} />
                  
                  {/* Wrong URL par Dashboard bhej dega */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;