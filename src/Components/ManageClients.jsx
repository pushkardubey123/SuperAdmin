import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import SuperAdminLayout from "./SuperAdminLayout";

const ManageClients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filters, setFilters] = useState({
    quickFilter: "",
    fromDate: "",
    toDate: "",
    status: "All"
  });

  // 1. Fetch All Data on Page Load
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/superadmin/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setClients(res.data.data);
        setFilteredClients(res.data.data); // Shuru mein saare clients dikhayenge
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load clients data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // 2. Handle Filter Inputs
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // 3. Apply Filters Logic
  const applyFilters = () => {
    let result = clients;

    // A. Quick Filter (Search by Name or Email)
    if (filters.quickFilter.trim() !== "") {
      const searchTerm = filters.quickFilter.toLowerCase();
      result = result.filter(client => 
        client.companyId?.name.toLowerCase().includes(searchTerm) || 
        client.companyId?.email.toLowerCase().includes(searchTerm)
      );
    }

    // B. Status Filter
    if (filters.status !== "All") {
      result = result.filter(client => client.status.toLowerCase() === filters.status.toLowerCase());
    }

    // C. Date Range Filter (Created At)
    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      result = result.filter(client => new Date(client.createdAt) >= from);
    }
    if (filters.toDate) {
      const to = new Date(filters.toDate);
      to.setHours(23, 59, 59); // End of the day
      result = result.filter(client => new Date(client.createdAt) <= to);
    }

    setFilteredClients(result);
  };

  // 4. Reset Filters
  const resetFilters = () => {
    setFilters({ quickFilter: "", fromDate: "", toDate: "", status: "All" });
    setFilteredClients(clients);
  };

  // 5. View Admin Details (SweetAlert Modal)
  const handleViewDetails = (client) => {
    const usedStorage = client.usage?.storageUsedMB || 0;
    const maxStorage = client.planId?.limits?.maxStorageMB || 0;
    const isUnlimited = maxStorage === -1;

    Swal.fire({
      title: `<h4 class="text-primary fw-bold">${client.companyId?.name}</h4>`,
      html: `
        <div class="text-start mt-3" style="font-size: 0.95rem;">
          <p><strong>Email:</strong> ${client.companyId?.email}</p>
          <p><strong>Phone:</strong> ${client.companyId?.phone || "N/A"}</p>
          <p><strong>Plan Active:</strong> <span class="badge bg-info text-dark">${client.planId?.name || "None"}</span></p>
          <p><strong>Valid Upto:</strong> ${new Date(client.validUpto).toLocaleDateString("en-GB")}</p>
          <p><strong>Status:</strong> <span class="badge ${client.status === 'active' ? 'bg-success' : 'bg-danger'}">${client.status.toUpperCase()}</span></p>
          <p><strong>Joined On:</strong> ${new Date(client.createdAt).toLocaleString("en-GB")}</p>
          <hr/>
          <p><strong>Storage Used:</strong> <span class="text-primary fw-bold">${usedStorage.toFixed(2)} MB</span> / ${isUnlimited ? 'Unlimited' : `${maxStorage} MB`}</p>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: { popup: 'rounded-4' }
    });
  };

  return (
    <SuperAdminLayout>
    <div className="container mt-4">
      <h4 className="fw-bold mb-4" style={{ color: "#1e293b" }}>Manage Superadmins</h4>

      {/* --- FILTER SECTION --- */}
      <div className="card shadow-sm border-0 mb-4 rounded-3">
        <div className="card-body p-4 bg-light bg-opacity-50">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">Quick Filter (Name/Email)</label>
              <input type="text" className="form-control" name="quickFilter" value={filters.quickFilter} onChange={handleFilterChange} placeholder="Search..." />
            </div>
            
            <div className="col-md-2">
              <label className="form-label small fw-bold text-muted">From Date</label>
              <input type="date" className="form-control" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold text-muted">To Date</label>
              <input type="date" className="form-control" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold text-muted">Status</label>
              <select className="form-select" name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="col-md-3">
              <div className="d-flex gap-2">
                <button className="btn btn-primary fw-bold w-100" onClick={applyFilters} style={{ backgroundColor: "#2e3b5e", border: "none" }}>
                  Apply Filter
                </button>
                <button className="btn btn-outline-warning fw-bold" onClick={resetFilters}>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted" style={{ fontSize: "0.85rem" }}>
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    {/* 🔥 NEW STORAGE COLUMN INSTEAD OF USELESS COLUMNS */}
                    <th style={{ minWidth: "150px" }}>Storage Usage</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th className="text-center px-4">Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.95rem" }}>
                  {filteredClients.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No records found matching your filters.</td></tr>
                  ) : (
                    filteredClients.map((client, index) => {
                      // 🔥 Storage Calculation Logic 🔥
                      const maxStorage = client.planId?.limits?.maxStorageMB || 0;
                      const usedStorage = client.usage?.storageUsedMB || 0;
                      const isUnlimited = maxStorage === -1;
                      
                      // Progress Percentage
                      let progressPercent = 0;
                      if (!isUnlimited && maxStorage > 0) {
                         progressPercent = Math.min((usedStorage / maxStorage) * 100, 100);
                      }
                      
                      // Progress Bar Color Logic
                      let barColor = "bg-success";
                      if (progressPercent > 85) barColor = "bg-danger";
                      else if (progressPercent > 60) barColor = "bg-warning";

                      return (
                      <tr key={client._id}>
                        <td className="px-4 text-muted">{filteredClients.length - index}</td>
                        <td className="fw-bold text-dark">{client.companyId?.name || "N/A"}</td>
                        <td>{client.companyId?.email || "N/A"}</td>
                        
                        {/* 🔥 STORAGE PROGRESS BAR 🔥 */}
                        <td>
                          <div className="d-flex flex-column w-100 pe-3">
                            <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.75rem" }}>
                              <span className="text-muted fw-semibold">{usedStorage.toFixed(2)} MB</span>
                              <span className="fw-bold text-dark">{isUnlimited ? '∞ Unlmt' : `${maxStorage} MB`}</span>
                            </div>
                            <div className="progress" style={{ height: "6px" }}>
                              <div 
                                className={`progress-bar ${isUnlimited ? 'bg-primary' : barColor}`} 
                                role="progressbar" 
                                style={{ width: `${isUnlimited ? 100 : progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="text-muted small">
                          {new Date(client.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        
                        <td>
                          <span className={`badge px-3 py-1 ${client.status === 'active' ? 'bg-success' : client.status === 'expired' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {client.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="text-center px-4">
                          <button 
                            className="btn btn-primary btn-sm fw-bold px-3 shadow-sm rounded-pill"
                            style={{ backgroundColor: "#2e3b5e", border: "none" }}
                            onClick={() => handleViewDetails(client)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </SuperAdminLayout>

  );
};

export default ManageClients;