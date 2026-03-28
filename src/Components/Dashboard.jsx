import React from 'react';
import SuperAdminLayout from './SuperAdminLayout';

const Dashboard = () => {
  // Dummy data (Baad mein aap isse API se connect kar sakte hain)
  const stats = [
    { title: "Total Clients", count: "120", color: "primary", icon: "👥" },
    { title: "Active Plans", count: "15", color: "success", icon: "📋" },
    { title: "Pending Enquiries", count: "45", color: "warning", icon: "📩" },
    { title: "Trial Users", count: "28", color: "info", icon: "⏳" },
  ];

  return (
    <SuperAdminLayout>
    <div className="container-fluid mt-4">
      <h2 className="mb-4 text-secondary">📊 Master Dashboard</h2>
      
      <div className="row">
        {stats.map((item, index) => (
          <div className="col-md-3 mb-4" key={index}>
            <div className={`card border-0 shadow-sm bg-${item.color} text-white`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>{item.title}</h6>
                    <h2 className="mb-0">{item.count}</h2>
                  </div>
                  <div style={{ fontSize: '2rem', opacity: '0.5' }}>
                    {item.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-md-8">
          <div className="card shadow-sm border-0 p-4" style={{ minHeight: '300px' }}>
            <h5>Recent Activity</h5>
            <p className="text-muted">Yahan aap graph ya recent clients ki list dikha sakte hain.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4" style={{ minHeight: '300px' }}>
            <h5>System Notifications</h5>
            <ul className="list-unstyled mt-3">
              <li className="mb-2">✅ New client 'ABC Corp' added.</li>
              <li className="mb-2">⚠️ Plan 'Gold' updated by admin.</li>
              <li className="mb-2">📩 5 New enquiries received today.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </SuperAdminLayout>

  );
};

export default Dashboard;