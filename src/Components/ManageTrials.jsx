import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import SuperAdminLayout from "./SuperAdminLayout";

const ManageTrials = () => {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Trials (Active & Expired)
  const fetchAllTrials = async () => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/superadmin/trials/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res)
      if (res.data.success) {
        setTrials(res.data.data);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load trials." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTrials();
  }, []);

  // 2. Remove Single Trial Access
  const handleRemoveAccess = async (subscriptionId) => {
    const result = await Swal.fire({
      title: "Remove Access?",
      text: "This will permanently remove their trial subscription.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Remove it!"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("superAdminToken");
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/superadmin/trials/remove`,
          { subscriptionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          Swal.fire({ icon: "success", title: "Removed!", text: res.data.message, timer: 1500, showConfirmButton: false });
          setTrials(trials.filter(trial => trial._id !== subscriptionId));
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: "Failed to remove access." });
      }
    }
  };

  return (
    <SuperAdminLayout>
    <div className="container mt-4">
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center bg-white p-4 rounded shadow-sm mb-4 border-0">
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 text-primary fs-4">
             ⏱️
          </div>
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Manage All Trials</h4>
            <p className="text-muted small mb-0">View active trials and safely remove expired ones.</p>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover">
                <thead className="table-light text-muted" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>
                  <tr>
                    <th className="py-3 px-4">USER</th>
                    <th>PLAN NAME</th>
                    <th>VALID UPTO</th>
                    <th>STATUS</th>
                    <th className="text-end px-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.95rem" }}>
                  {trials.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No trial users found!</td></tr>
                  ) : (
                    trials.map((trial) => {
                      // Status Logic Check
                      const isExpired = new Date(trial.validUpto) < new Date();

                      return (
                      <tr key={trial._id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex justify-content-center align-items-center me-3" style={{ width: "40px", height: "40px" }}>
                              {trial.companyId?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{trial.companyId?.name}</div>
                              <div className="small text-muted">{trial.companyId?.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="text-muted fw-bold">
                          {trial.planId?.name || "Trial"}
                        </td>

                        <td>
                          <span className="text-dark fw-bold">
                            {new Date(trial.validUpto).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>

                        {/* 🔥 STATUS BADGE (Active / Expired) 🔥 */}
                        <td>
                          {isExpired ? (
                            <span className="badge bg-danger">EXPIRED</span>
                          ) : (
                            <span className="badge bg-success">ACTIVE</span>
                          )}
                        </td>

                        <td className="text-end px-4">
                          <button 
                            className="btn btn-outline-danger btn-sm fw-bold px-3 py-1 rounded-pill"
                            onClick={() => handleRemoveAccess(trial._id)}
                          >
                            👤× Remove
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

export default ManageTrials;