import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import SuperAdminLayout from "./SuperAdminLayout";
import { FaCheckCircle, FaEdit, FaTrashAlt, FaPlus, FaCrown, FaUsers, FaSearch, FaFilter, FaStar } from "react-icons/fa";
import "./ManagePlans.css";
import { GiUpgrade } from "react-icons/gi";

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ quickFilter: "", status: "All" });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("superAdminToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [planRes, clientRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/superadmin/plans`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/superadmin/clients`, { headers })
      ]);

      if (planRes.data.success) setPlans(planRes.data.data);
      if (clientRes.data.success) {
        setClients(clientRes.data.data);
        setFilteredClients(clientRes.data.data);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load dashboard data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = clients;
    if (filters.quickFilter.trim() !== "") {
      const term = filters.quickFilter.toLowerCase();
      result = result.filter(c => 
        c.companyId?.name.toLowerCase().includes(term) || 
        c.companyId?.email.toLowerCase().includes(term)
      );
    }
    if (filters.status !== "All") {
      result = result.filter(c => c.status.toLowerCase() === filters.status.toLowerCase());
    }
    setFilteredClients(result);
  }, [filters, clients]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const calculateDaysLeft = (validUpto) => {
    if (!validUpto) return 0;
    const diff = new Date(validUpto).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleDeletePlan = async (planId, planName) => {
    const result = await Swal.fire({
      title: `Delete '${planName}'?`,
      text: "Ensure no active client is using it.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: 'rounded-4' }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("superAdminToken");
        const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/superadmin/plans/${planId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          Swal.fire({ title: "Deleted!", icon: "success", customClass: { popup: 'rounded-4' }});
          setPlans(plans.filter(p => p._id !== planId));
        }
      } catch (error) {
        Swal.fire("Error", error.response?.data?.message || "Failed to delete plan.", "error");
      }
    }
  };

  const handleEditNavigation = (plan) => {
    navigate("/create-plan", { state: { planData: plan } });
  };

// 🔥 NAYA: PREMIUM ASSIGN PLAN FUNCTIONALITY
  const handleAssignPlan = async (client) => {
    const availablePlans = plans.filter(p => p._id !== client.planId?._id);

    if (availablePlans.length === 0) {
      Swal.fire("Info", "No other premium plans available to assign.", "info");
      return;
    }

    // 🌟 Generate Beautiful HTML for Options (Radio Cards) 🌟
    let planHtml = `<div class="premium-plan-selector">`;
    availablePlans.forEach((p, index) => {
      planHtml += `
        <label class="plan-radio-card mt-1" for="plan-${p._id}">
          <input type="radio" name="selectedPlan" id="plan-${p._id}" value="${p._id}" class="plan-radio-input" ${index === 0 ? 'checked' : ''}>
          <div class="plan-card-content">
            <div class="plan-info">
              <span class="plan-name">${p.name}</span>
              <span class="plan-duration">${p.durationDays === -1 ? 'Lifetime Access' : p.durationDays + ' Days'}</span>
            </div>
            <div class="plan-price">₹${p.price}</div>
            <div class="check-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
        </label>
      `;
    });
    planHtml += `</div>`;

    // 🌟 Open SweetAlert with Custom UI 🌟
    const { isConfirmed, value: selectedPlanId } = await Swal.fire({
      title: 'Upgrade Workspace',
      html: `
        <p class="text-muted mb-3" style="font-size:0.95rem; text-align:left;">
          Select a new plan to assign to <strong class="text-dark">${client.companyId?.name}</strong>.
        </p>
        ${planHtml}
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Upgrade',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f1f5f9',
      customClass: {
        confirmButton: 'premium-swal-confirm',
        cancelButton: 'premium-swal-cancel',
        popup: 'premium-swal-popup border-0',
      },
      // Ye function check karega kaunsa card select hua hai
      preConfirm: () => {
        const selected = document.querySelector('input[name="selectedPlan"]:checked');
        if (!selected) {
          Swal.showValidationMessage('Please select a plan to upgrade!');
          return false;
        }
        return selected.value;
      }
    });

    // 🌟 API Call agar Confirm dabaya 🌟
    if (isConfirmed && selectedPlanId) {
      try {
        const token = localStorage.getItem("superAdminToken");
        const res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/superadmin/clients/assign-plan`,
          { subscriptionId: client._id, newPlanId: selectedPlanId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Plan Upgraded!',
            text: res.data.message,
            confirmButtonColor: '#10b981',
            customClass: { popup: 'premium-swal-popup' }
          });
          fetchAllData(); // Refresh Client Table
        }
      } catch (error) {
        Swal.fire("Error", error.response?.data?.message || "Failed to assign plan", "error");  
      }
    }
  };

  return (
    <SuperAdminLayout>
      <div className="mp-wrapper container-fluid py-3 px-xl-4">
        
        <div className="mp-page-header glass-panel d-flex justify-content-between align-items-center flex-wrap gap-3 fade-in-up">
          <div>
            <h3 className="fw-bolder mb-1 text-dark d-flex align-items-center gap-2">
              <FaCrown className="text-warning" /> Subscription Plans
            </h3>
            <p className="text-muted small mb-0 fw-medium">Design & manage pricing tiers.</p>
          </div>
          <Link to="/create-plan" className="mp-btn-create">
            <FaPlus className="me-2" /> Create Plan
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <>
            <div className="row g-4 mb-5">
              {plans.map((plan, idx) => {
                const color1 = plan.themeColor1 || "#4f46e5";
                const color2 = plan.themeColor2 || "#7c3aed";
                
                return (
                  <div className="col-xxl-3 col-lg-4 col-md-6 fade-in-up" style={{animationDelay: `${idx * 0.1}s`}} key={plan._id}>
                    <div className="mp-plan-card glass-panel d-flex flex-column h-100" style={plan.badgeText ? { border: `2px solid ${color1}` } : {}}>
                      
                      {plan.badgeText && (
                        <div className="position-absolute top-0 end-0 text-white px-3 py-1 rounded-bottom-start fw-bold z-3 shadow-sm" style={{ fontSize: '11px', background: color1 }}>
                          <FaStar className="me-1 mb-1 inline" /> {plan.badgeText}
                        </div>
                      )}

                      <div className="mp-card-actions z-3">
                        <button className="mp-action-btn edit shadow-sm" onClick={() => handleEditNavigation(plan)}><FaEdit /></button>
                        <button className="mp-action-btn delete shadow-sm" onClick={() => handleDeletePlan(plan._id, plan.name)}><FaTrashAlt /></button>
                      </div>

                      <div className="text-center p-4 text-white position-relative" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, borderTopLeftRadius: "18px", borderTopRightRadius: "18px" }}>
                        {plan.isTrial && <span className="badge bg-white text-dark mb-2 shadow-sm">Free Trial</span>}
                        <h4 className="fw-bold mb-0">{plan.name}</h4>
                      </div>

                      <div className="text-center p-4 border-bottom bg-white" style={{borderColor: 'rgba(0,0,0,0.05)'}}>
                        <div className="d-flex justify-content-center align-items-baseline gap-2 mb-1">
                          <h2 className="mp-plan-price m-0" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            ₹{plan.price}
                          </h2>
                          {plan.originalPrice > plan.price && (
                            <span className="text-muted text-decoration-line-through fw-bold">₹{plan.originalPrice}</span>
                          )}
                        </div>
                        <span className="text-muted small fw-bold">/ {plan.durationDays === -1 ? 'Lifetime' : `${plan.durationDays} Days`}</span>
                        <p className="text-muted small mt-2 mb-0 fw-medium" style={{ minHeight: "40px" }}>{plan.targetAudience || plan.description}</p>
                      </div>
                      
                      <div className="d-flex justify-content-around text-center py-3 border-bottom bg-light" style={{borderColor: 'rgba(0,0,0,0.05)'}}>
                        <div>
                          <small className="d-block text-muted" style={{fontSize:'10px', fontWeight: 700}}>EMPS</small>
                          <span className="fw-bold">{plan.limits?.maxEmployees === -1 ? '∞' : plan.limits?.maxEmployees}</span>
                        </div>
                        <div className="border-start border-end px-3">
                          <small className="d-block text-muted" style={{fontSize:'10px', fontWeight: 700}}>STORAGE</small>
                          <span className="fw-bold text-primary">{plan.limits?.maxStorageMB === -1 ? '∞' : `${plan.limits?.maxStorageMB}MB`}</span>
                        </div>
                        <div>
                          <small className="d-block text-muted" style={{fontSize:'10px', fontWeight: 700}}>BRNCH</small>
                          <span className="fw-bold">{plan.limits?.maxBranches === -1 ? '∞' : plan.limits?.maxBranches}</span>
                        </div>
                      </div>

                      <div className="p-3 flex-grow-1 bg-white" style={{ borderBottomLeftRadius: "18px", borderBottomRightRadius: "18px" }}>
                        <small className="d-block text-muted fw-bold mb-2">FEATURES INCLUDED</small>
                        <div className="d-flex flex-wrap gap-1">
                          {plan.allowedModules?.slice(0, 5).map((mod, i) => (
                            <span key={i} className="badge bg-light text-dark border"><FaCheckCircle className="me-1" style={{ color: color1 }}/>{mod}</span>
                          ))}
                          {plan.allowedModules?.length > 5 && <span className="badge text-white" style={{ background: color1 }}>+{plan.allowedModules.length - 5} more</span>}
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Clients Table with Assignment Functionality */}
            <div className="glass-panel p-4 mb-5 fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h4 className="fw-bold m-0 d-flex align-items-center"><FaUsers className="text-primary me-2"/> Subscribed Clients Overview</h4>
                <div className="d-flex gap-2">
                  <div className="input-group input-group-sm shadow-sm" style={{width: '200px'}}>
                    <span className="input-group-text bg-white border-end-0"><FaSearch className="text-muted"/></span>
                    <input type="text" className="form-control border-start-0" placeholder="Search client..." name="quickFilter" value={filters.quickFilter} onChange={handleFilterChange}/>
                  </div>
                  <div className="input-group input-group-sm shadow-sm" style={{width: '140px'}}>
                    <span className="input-group-text bg-white border-end-0"><FaFilter className="text-muted"/></span>
                    <select className="form-select border-start-0 text-muted fw-bold" name="status" value={filters.status} onChange={handleFilterChange}>
                      <option value="All">Status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-glass align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Plan Enrolled</th>
                      <th style={{minWidth: '150px'}}>Storage Health</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th> {/* 🔥 NAYA COLUMN */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-4 text-muted">No clients found.</td></tr>
                    ) : (
                      filteredClients.map((client) => {
                        const daysLeft = calculateDaysLeft(client.validUpto);
                        const maxStorage = client.planId?.limits?.maxStorageMB || 0;
                        const usedStorage = client.usage?.storageUsedMB || 0;
                        const isUnlimited = maxStorage === -1;
                        let progress = isUnlimited ? 100 : Math.min((usedStorage / maxStorage) * 100, 100);
                        let barColor = progress > 85 ? "bg-danger" : progress > 60 ? "bg-warning" : "bg-success";

                        return (
                          <tr key={client._id}>
                            <td>
                              <div className="fw-bold text-dark">{client.companyId?.name}</div>
                              <div className="small text-muted">{client.companyId?.email}</div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border shadow-sm">{client.planId?.name}</span>
                            </td>
                            <td>
                              <div className="d-flex justify-content-between mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                                <span className="text-muted">{usedStorage.toFixed(2)} MB</span>
                                <span className="text-dark">{isUnlimited ? '∞' : `${maxStorage} MB`}</span>
                              </div>
                              <div className="progress rounded-pill shadow-sm" style={{ height: "5px", backgroundColor: 'rgba(0,0,0,0.05)' }}>
                                <div className={`progress-bar ${isUnlimited ? 'bg-primary' : barColor}`} style={{ width: `${progress}%` }}></div>
                              </div>
                            </td>
                            <td>
                              <div className="fw-bold text-dark" style={{fontSize: '13px'}}>{new Date(client.validUpto).toLocaleDateString("en-GB")}</div>
                              <small className={daysLeft === 0 ? "text-danger fw-bold" : "text-primary fw-bold"}>
                                {daysLeft === 0 ? 'Expired' : `${daysLeft} days left`}
                              </small>
                            </td>
                            <td>
                              <span className={`badge px-2 py-1 rounded-pill ${client.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                {client.status.toUpperCase()}
                              </span>
                            </td>
                            {/* 🔥 NAYA BUTTON */}
                            <td>
                              <button 
                                className="btn btn-sm btn-primary rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center gap-1"
                                onClick={() => handleAssignPlan(client)}
                                style={{ fontSize: '0.75rem', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', border: 'none' }}
                              >
                                <FaCrown /> Upgrade
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default ManagePlans;