import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom"; // 🔥 Added location and navigate
import SuperAdminLayout from "./SuperAdminLayout";

const CreatePlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 🔥 Check if we are in Edit Mode
  const editPlanData = location.state?.planData || null;
  const isEditMode = !!editPlanData;

  const [formData, setFormData] = useState({
    name: "", price: 0, originalPrice: 0, durationDays: 30, isTrial: false, 
    description: "", targetAudience: "", badgeText: "", buttonText: "Subscribe Now", 
    themeColor1: "#4f46e5", themeColor2: "#7c3aed"
  });

  const [limits, setLimits] = useState({ maxEmployees: 0, maxStorageMB: 0, maxBranches: 0 });
  const [allowedModules, setAllowedModules] = useState([]);

  const availableModules = [
    "Attendance", "Payroll", "Leave Management", "Recruitment (ATS)", 
    "Asset Management", "Project Management", "Reports", "Meeting","Mail",
    "Events", "Birthdays & Anniversaries", "Notification", "LMS (KPIs)", "Documents", "WFH Requests", "Exit Management"
  ];

  // 🔥 Auto-fill form if editing
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: editPlanData.name || "",
        price: editPlanData.price || 0,
        originalPrice: editPlanData.originalPrice || 0,
        durationDays: editPlanData.durationDays || 30,
        isTrial: editPlanData.isTrial || false,
        description: editPlanData.description || "",
        targetAudience: editPlanData.targetAudience || "",
        badgeText: editPlanData.badgeText || "",
        buttonText: editPlanData.buttonText || "Subscribe Now",
        themeColor1: editPlanData.themeColor1 || "#4f46e5",
        themeColor2: editPlanData.themeColor2 || "#7c3aed"
      });
      setLimits({
        maxEmployees: editPlanData.limits?.maxEmployees ?? 0,
        maxStorageMB: editPlanData.limits?.maxStorageMB ?? 0,
        maxBranches: editPlanData.limits?.maxBranches ?? 0,
      });
      setAllowedModules(editPlanData.allowedModules || []);
    }
  }, [isEditMode, editPlanData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleLimitChange = (e) => {
    setLimits({ ...limits, [e.target.name]: Number(e.target.value) });
  };

  const handleModuleToggle = (moduleName) => {
    if (allowedModules.includes(moduleName)) {
      setAllowedModules(allowedModules.filter((m) => m !== moduleName));
    } else {
      setAllowedModules([...allowedModules, moduleName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const planData = { ...formData, limits, allowedModules };

    try {
      const token = localStorage.getItem("superAdminToken"); 
      const headers = { Authorization: `Bearer ${token}` };

      let res;
      // 🔥 Dynamic API Call (PUT vs POST)
      if (isEditMode) {
        res = await axios.put(`${import.meta.env.VITE_API_URL}/api/superadmin/plans/${editPlanData._id}`, planData, { headers });
      } else {
        res = await axios.post(`${import.meta.env.VITE_API_URL}/api/superadmin/plans/create`, planData, { headers });
      }

      if (res.data.success) {
        Swal.fire({ 
          icon: "success", 
          title: isEditMode ? "Plan Updated!" : "Plan Created!", 
          text: res.data.message 
        }).then(() => {
          navigate("/manage-plans"); // Send back to plans list
        });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Something went wrong" });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="container mt-4 mb-5">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            {/* 🔥 Dynamic Heading */}
            <h4 className="text-primary fw-bold">{isEditMode ? "✏️ Edit Premium Plan" : "➕ Create Premium Plan"}</h4>
            <p className="text-muted small">Define modules, aesthetic UI options, and pricing</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h6 className="text-uppercase text-muted fw-bold mb-3 mt-2">Basic Information & UI</h6>
              
              <div className="row g-3">
                <div className="col-md-4">
                  <label>Plan Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                
                <div className="col-md-8">
                  <label>Target Audience (Subtitle)</label>
                  <input type="text" className="form-control" name="targetAudience" placeholder="e.g. Best for growing teams up to 50 members" value={formData.targetAudience} onChange={handleInputChange} />
                </div>

                <div className="col-md-3">
                  <label>Badge Text</label>
                  <input type="text" className="form-control" name="badgeText" placeholder="e.g. Most Popular" value={formData.badgeText} onChange={handleInputChange} />
                </div>
                <div className="col-md-3">
                  <label>Button Text</label>
                  <input type="text" className="form-control" name="buttonText" placeholder="e.g. Upgrade Now" value={formData.buttonText} onChange={handleInputChange} required />
                </div>

                <div className="col-md-3">
                  <label>Gradient Start Color</label>
                  <input type="color" className="form-control form-control-color w-100" name="themeColor1" value={formData.themeColor1} onChange={handleInputChange} />
                </div>
                <div className="col-md-3">
                  <label>Gradient End Color</label>
                  <input type="color" className="form-control form-control-color w-100" name="themeColor2" value={formData.themeColor2} onChange={handleInputChange} />
                </div>
              </div>

              <hr className="my-4" />
              <h6 className="text-uppercase text-muted fw-bold mb-3">Pricing & Duration</h6>

              <div className="row g-3">
                <div className="col-md-3">
                  <label>Offer Price (₹) <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="col-md-3">
                  <label>Original Price (₹)</label>
                  <input type="number" className="form-control text-decoration-line-through text-muted" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} />
                  <small className="text-muted">Shown crossed out for discount effect</small>
                </div>
                <div className="col-md-3">
                  <label>Duration (days) <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" name="durationDays" value={formData.durationDays} onChange={handleInputChange} required />
                  <small className="text-muted">-1 = Lifetime</small>
                </div>
                <div className="col-md-3 d-flex align-items-center mt-4">
                  <div className="form-check form-switch ms-3">
                    <input className="form-check-input" type="checkbox" name="isTrial" checked={formData.isTrial} onChange={handleInputChange} />
                    <label className="form-check-label">Is Trial Plan?</label>
                  </div>
                </div>
                <div className="col-12 mt-3">
                  <label>Description (Internal / Detail)</label>
                  <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="2"></textarea>
                </div>
              </div>

              <hr className="my-4" />

              <h6 className="text-uppercase text-muted fw-bold mb-3">Module Access</h6>
              <div className="row g-3 mb-4">
                {availableModules.map((mod, index) => (
                  <div className="col-md-3 col-sm-6" key={index}>
                    <div className="form-check border rounded p-2 text-center transition-all" style={{ cursor: "pointer", backgroundColor: allowedModules.includes(mod) ? "#eef2ff" : "#fff" }} onClick={() => handleModuleToggle(mod)}>
                      <input className="form-check-input d-none" type="checkbox" checked={allowedModules.includes(mod)} readOnly />
                      <span className={allowedModules.includes(mod) ? "text-primary fw-bold" : "text-secondary"} style={{fontSize: "0.85rem"}}>{mod}</span>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <h6 className="text-uppercase text-muted fw-bold mb-3">Usage Limits (-1 for Unlimited)</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label>Max Employees</label>
                  <input type="number" className="form-control" name="maxEmployees" value={limits.maxEmployees} onChange={handleLimitChange} />
                </div>
                <div className="col-md-4">
                  <label>Storage Limit (MB)</label>
                  <input type="number" className="form-control" name="maxStorageMB" value={limits.maxStorageMB} onChange={handleLimitChange} />
                </div>
                <div className="col-md-4">
                  <label>Max Branches</label>
                  <input type="number" className="form-control" name="maxBranches" value={limits.maxBranches} onChange={handleLimitChange} />
                </div>
              </div>

              <div className="text-end mt-5">
                {/* 🔥 Dynamic Button Submit */}
                <button type="submit" className="btn btn-primary px-5 py-2 fw-bold rounded-pill shadow-sm">
                  {isEditMode ? "💾 Save Changes" : "➕ Create Aesthetic Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default CreatePlan;