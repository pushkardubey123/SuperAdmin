import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import SuperAdminLayout from "./SuperAdminLayout";

const AllEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/superadmin/enquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEnquiries(res.data.data);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load enquiries." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // 2. Update Status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/superadmin/enquiries/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        // UI instantly update karein bina reload kiye
        setEnquiries(enquiries.map(enq => enq._id === id ? { ...enq, status: newStatus } : enq));
        Swal.fire({ icon: "success", title: "Updated", text: "Status updated successfully!", timer: 1500, showConfirmButton: false });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to update status." });
    }
  };

  // 3. Delete Enquiry
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Enquiry?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("superAdminToken");
        const res = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/superadmin/enquiries/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setEnquiries(enquiries.filter(enq => enq._id !== id));
          Swal.fire({ icon: "success", title: "Deleted!", text: "Enquiry removed.", timer: 1500, showConfirmButton: false });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: "Failed to delete." });
      }
    }
  };

  return (
    <SuperAdminLayout>
    <div className="container mt-4">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-4">
          <h4 className="text-primary fw-bold mb-1">📩 All Enquiry</h4>
          <p className="text-muted small mb-0">Manage leads and contact requests from your website.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th>Contact Info</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end px-4">Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.95rem" }}>
                  {enquiries.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-5 text-muted">No enquiries found.</td></tr>
                  ) : (
                    enquiries.map((enq) => (
                      <tr key={enq._id}>
                        <td className="px-4 fw-bold text-dark">{enq.name}</td>
                        <td>
                          <div>📞 {enq.mobileNo}</div>
                          <div className="text-muted small">✉️ {enq.email}</div>
                        </td>
                        <td className="text-muted" style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={enq.message}>
                          {enq.message || "-"}
                        </td>
                        <td className="text-muted small">
                          {new Date(enq.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        
                        {/* STATUS DROPDOWN */}
                        <td>
                          <select 
                            className={`form-select form-select-sm fw-bold ${enq.status === 'Contacted' ? 'text-success bg-success bg-opacity-10' : 'text-warning bg-warning bg-opacity-10'}`}
                            value={enq.status || "Pending"}
                            onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                            style={{ width: "120px", border: "none" }}
                          >
                            <option value="Pending" className="text-dark">⏳ Pending</option>
                            <option value="Contacted" className="text-dark">✅ Contacted</option>
                          </select>
                        </td>

                        {/* DELETE BUTTON */}
                        <td className="text-end px-4">
                          <button 
                            className="btn btn-outline-danger btn-sm rounded-circle"
                            onClick={() => handleDelete(enq._id)}
                            title="Delete Enquiry"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
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

export default AllEnquiry;