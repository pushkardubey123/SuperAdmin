import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import "./Login.css"; // 🔥 Your custom Vanilla CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/superadmin/login`, { email, password });
      
      if (res.data.success) {
        localStorage.setItem("superAdminToken", res.data.token);
        localStorage.setItem("superAdminData", JSON.stringify(res.data.data));
        
        toast.success("Authentication successful. Welcome, Master Admin.");
        
        // Force reload to update the App.jsx routing state immediately
        window.location.href = "/dashboard"; 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials. Access denied.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="sa-login-wrapper">
      
      {/* Animated Background Orbs */}
      <div className="sa-orb sa-orb-1"></div>
      <div className="sa-orb sa-orb-2"></div>
      <div className="sa-grid-overlay"></div>

      <motion.div 
        className="sa-login-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="sa-glass-card">
          
          <div className="sa-card-header">
            <motion.div 
              className="sa-shield-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <FaShieldAlt />
            </motion.div>
            <h2 className="sa-brand-title">HareetechHR <span><br /> Super Admin</span></h2>
            <p className="sa-brand-subtitle">Master Control Panel</p>
          </div>

          <form onSubmit={handleLogin} className="sa-login-form">
            
            <div className="sa-input-group">
              <label className="sa-label">Email Address</label>
              <div className="sa-input-wrapper">
                <FaEnvelope className="sa-input-icon" />
                <input 
                  type="email" 
                  className="sa-input" 
                  placeholder="admin@audit365.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="sa-input-group">
              <label className="sa-label">Password</label>
              <div className="sa-input-wrapper">
                <FaLock className="sa-input-icon" />
                <input 
                  type="password" 
                  className="sa-input" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <motion.button 
              type="submit" 
              className="sa-submit-btn"
              disabled={isProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <div className="sa-spinner"></div>
              ) : (
                "Secure Login"
              )}
            </motion.button>

          </form>
          
          <div className="sa-card-footer">
            <p>Protected by 256-bit encryption</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;