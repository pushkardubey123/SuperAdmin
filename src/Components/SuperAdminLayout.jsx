import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiGrid, FiUsers, FiClock, FiFileText, 
  FiLogOut, FiLayers, FiShield, FiMenu
} from "react-icons/fi";
import Swal from "sweetalert2";
import "./AdminLayout.css"; 

const SuperAdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1100);
  const [adminData, setAdminData] = useState({ name: "Master Admin", email: "" });
  const location = useLocation();
  const navigate = useNavigate();

  // Handle Responsive Sidebar
  useEffect(() => {
    if (window.innerWidth <= 1100) setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1100) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Admin Data
  useEffect(() => {
    const storedData = localStorage.getItem("superAdminData");
    if (storedData) {
      setAdminData(JSON.parse(storedData));
    }
  }, []);

  // 🔥 LOGOUT LOGIC (FIXED) 🔥
  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to exit the master panel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, Logout"
    }).then((result) => {
      if (result.isConfirmed) {
        // 1. Sirf SuperAdmin ke tokens remove karo (Employee data safe rahega agar test kar rahe ho)
        localStorage.removeItem("superAdminToken");
        localStorage.removeItem("superAdminData");
        
        // 2. HARD REDIRECT: Taaki App.jsx wapas se auth state check kare
        window.location.href = "/";
      }
    });
  };

  // Nav Items for Super Admin
  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: <FiGrid /> },
    { name: "Manage Superadmins", to: "/manage-clients", icon: <FiUsers /> },
    { name: "All Enquiries", to: "/enquiries", icon: <FiFileText /> },
    { name: "Manage Plans", to: "/manage-plans", icon: <FiLayers /> },
    { name: "Manage Trials", to: "/manage-trials", icon: <FiClock /> }
  ];

  return (
    <div className={`hrms-master-container ${sidebarOpen ? "expanded" : "collapsed"}`}>
      
      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 1100 && (
        <div 
          className="mobile-overlay-click-trap" 
          style={{ position: 'fixed', inset: 0, zIndex: 1040, background: "rgba(0,0,0,0.5)"}}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR STARTS --- */}
      <aside className="midnight-sidebar">
        <div className="sidebar-header-box">
            <div className="logo-icon-circle"><FiShield /></div>
            {sidebarOpen && (
              <div className="header-text-box">
                <h4 className="hey-text m-0">HareetechHR</h4>
                <p className="sub-text m-0">Master Control</p>
              </div>
            )}
        </div>

        <div className="nav-items-scroller mt-2">
            {navItems.map((item, i) => {
              const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <div key={i} className="nav-group-item w-100">
                    <Link to={item.to} className={`nav-link-main ${isActive ? "active" : ""}`}>
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.name}</span>
                    </Link>
                </div>
              );
            })}
        </div>

        <div className="sidebar-bottom-action">
           {/* LOGOUT BUTTON HERE */}
           <button onClick={handleLogout} className="btn-logout-premium">
              <span className="logout-icon-box"><FiLogOut /></span>
              {sidebarOpen && <span className="logout-text">Sign Out</span>}
           </button>
        </div>
      </aside>
      {/* --- SIDEBAR ENDS --- */}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="main-viewport-content">
        
        {/* Mobile Header (Shows only on small screens) */}
        <div className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm d-xl-none mb-3">
          <div className="d-flex align-items-center">
             <FiShield className="text-primary fs-3 me-2" />
             <h5 className="m-0 fw-bold text-dark">Master Admin</h5>
          </div>
          <button className="btn btn-light border-0" onClick={() => setSidebarOpen(true)}>
             <FiMenu className="fs-3" />
          </button>
        </div>

        {/* Scrollable View for Children */}
        <div className="main-scroll-view p-4">
          <div className="content-wrapper" style={{ padding: '0', minHeight: '80vh' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;