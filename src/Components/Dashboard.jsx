import React, { useState, useEffect } from 'react';
import SuperAdminLayout from './SuperAdminLayout'; // Import your layout
import { useNavigate } from 'react-router-dom'; 
import { Users, ClipboardList, MailWarning, Clock, Settings, Save, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';

const graphData = [
  { name: 'Jan', clients: 40, revenue: 2400 },
  { name: 'Feb', clients: 30, revenue: 1398 },
  { name: 'Mar', clients: 90, revenue: 9800 },
  { name: 'Apr', clients: 50, revenue: 3908 },
  { name: 'May', clients: 85, revenue: 4800 },
  { name: 'Jun', clients: 120, revenue: 8800 },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    totalClients: 0,
    activePlans: 0,
    pendingEnquiries: 0,
    trialUsers: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Settings Logic
  const [alertDays, setAlertDays] = useState(3);
  const [savingSettings, setSavingSettings] = useState(false);

  const API_URL = "http://localhost:3003/api/superadmin";

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("superAdminToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [clientsRes, trialsRes, enquiriesRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/clients`, config),
          axios.get(`${API_URL}/trials/all`, config),
          axios.get(`${API_URL}/enquiries`, config),
          axios.get(`${API_URL}/settings`, config).catch(() => ({data: {data: {expiryAlertDays: 3}}})) // Fallback if API missing initially
        ]);

        const clients = clientsRes.data.data || [];
        const trials = trialsRes.data.data || [];
        const enquiries = enquiriesRes.data.data || [];

        setStatsData({
          totalClients: clients.length,
          activePlans: clients.filter(c => c.status === 'active').length,
          trialUsers: trials.length,
          pendingEnquiries: enquiries.filter(e => e.status === 'Pending').length
        });

        if (settingsRes.data?.data?.expiryAlertDays) {
          setAlertDays(settingsRes.data.data.expiryAlertDays);
        }

        setRecentActivity(enquiries.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleSaveSettings = async () => {
    if (alertDays < 1) {
       return Swal.fire("Error", "Days must be at least 1", "error");
    }
    setSavingSettings(true);
    try {
      const token = localStorage.getItem("superAdminToken");
      await axios.put(`${API_URL}/settings`, { expiryAlertDays: alertDays }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: 'success', title: 'Saved!', text: 'Notification settings updated.', timer: 2000 });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not update settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const stats = [
    { title: "Total Clients", count: statsData.totalClients, color: "#4f46e5", bg: "#e0e7ff", icon: <Users size={28} />, path: "/manage-clients" },
    { title: "Active Plans", count: statsData.activePlans, color: "#10b981", bg: "#d1fae5", icon: <ClipboardList size={28} />, path: "/manage-plans" },
    { title: "Pending Enquiries", count: statsData.pendingEnquiries, color: "#f59e0b", bg: "#fef3c7", icon: <MailWarning size={28} />, path: "/enquiries" },
    { title: "Trial Users", count: statsData.trialUsers, color: "#ec4899", bg: "#fce7f3", icon: <Clock size={28} />, path: "/manage-trials" },
  ];

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
          <Loader className="text-primary" size={48} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="container-fluid p-4" style={{ backgroundColor: "#f8fafc", minHeight: "100%" }}>
        
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Overview</h2>
          <p className="text-muted">Live dashboard statistics from your database.</p>
        </div>

        {/* Premium Stats Cards */}
        <div className="row g-4 mb-5">
          {stats.map((item, index) => (
            <div className="col-12 col-sm-6 col-xl-3" key={index}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => navigate(item.path)}
                className="card border-0 rounded-4 p-4 h-100 shadow-sm"
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted fw-semibold mb-1" style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
                      {item.title}
                    </p>
                    <h2 className="fw-bold mb-0" style={{ color: "#0f172a", fontSize: "2.5rem" }}>{item.count}</h2>
                  </div>
                  <div className="p-3 rounded-circle" style={{ backgroundColor: item.bg, color: item.color }}>
                    {item.icon}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Charts and Settings Section */}
        <div className="row g-4">
          
          {/* Main Chart */}
          <div className="col-12 col-xl-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="card border-0 rounded-4 p-4 h-100 shadow-sm"
            >
              <h5 className="fw-bold mb-4">Client Growth (Monthly)</h5>
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer>
                  <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="clients" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorClients)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="col-12 col-xl-4 d-flex flex-column gap-4">
            
            {/* 🔥 NEW: Subscription Settings Control 🔥 */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
               className="card border-0 rounded-4 p-4 shadow-sm bg-primary text-white"
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <Settings size={22} />
                <h5 className="fw-bold mb-0">System Settings</h5>
              </div>
              <p className="mb-3" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Set how many days before expiry the notification and emails should be sent to clients.
              </p>
              
              <div className="d-flex align-items-center gap-3">
                <input 
                  type="number" 
                  className="form-control form-control-lg text-center fw-bold text-primary" 
                  value={alertDays} 
                  onChange={(e) => setAlertDays(e.target.value)}
                  style={{ width: '80px', borderRadius: '12px' }}
                  min="1"
                />
                <span className="fw-semibold">Days Before Expiry</span>
              </div>
              
              <button 
                className="btn btn-light fw-bold w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
                style={{ borderRadius: '10px', color: '#4f46e5' }}
                onClick={handleSaveSettings}
                disabled={savingSettings}
              >
                {savingSettings ? <Loader size={18} className="spinner-border spinner-border-sm" /> : <Save size={18} />}
                {savingSettings ? "Saving..." : "Save Configuration"}
              </button>
            </motion.div>

            {/* Dynamic Recent Enquiries Timeline */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
               className="card border-0 rounded-4 p-4 shadow-sm flex-grow-1"
            >
              <h5 className="fw-bold mb-4">Recent Enquiries</h5>
              <div className="d-flex flex-column gap-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((enq, idx) => (
                    <div className="d-flex align-items-start gap-3 border-bottom pb-3" key={enq._id || idx}>
                      <div className="bg-warning bg-opacity-10 p-2 rounded-circle text-warning mt-1">
                        <MailWarning size={18} />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: "0.95rem" }}>{enq.name}</h6>
                        <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>{enq.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No recent enquiries found.</p>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Dashboard;