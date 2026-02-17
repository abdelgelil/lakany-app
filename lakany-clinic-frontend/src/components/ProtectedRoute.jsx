import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// ⚠️ SET TO FALSE FOR PRODUCTION
const ALLOW_ALL_ROUTES_FOR_DEBUG = false; 

const RoleProtectedRoute = ({ allowedRoles = [], children }) => {
    const location = useLocation();
    const pathname = location.pathname.toLowerCase();
    
    // 0. DEV MODE BYPASS
    if (ALLOW_ALL_ROUTES_FOR_DEBUG) {
        return children ? children : <Outlet />;
    }

    // 1. Check tokens
    const patientToken = localStorage.getItem('token');
    const doctorToken = localStorage.getItem('doctor_token');
    const managementToken = localStorage.getItem('management_token');

    let currentUser = null;
    let currentRole = null;

    const parseUser = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch(e) { return null; }
    };

    // 2. Resolve Role (Priority based on URL path)
    if (pathname.startsWith('/doctor') && doctorToken) {
        currentUser = parseUser('doctor_user');
        currentRole = currentUser?.role || 'doctor'; // Fallback to 'doctor'
    } 
    else if (pathname.startsWith('/admin') && managementToken) {
        currentUser = parseUser('management_user');
        // Check for role inside user object or specific role key
        currentRole = currentUser?.role || localStorage.getItem('management_userRole') || 'admin';
    } 
    else if ((pathname.startsWith('/patient') || pathname === '/') && patientToken) {
        currentUser = parseUser('user');
        currentRole = currentUser?.role || 'patient';
    }

    // 3. Unauthenticated Redirects
    if (!currentRole) {
        if (pathname.startsWith('/doctor')) return <Navigate to="/doctor-login" state={{ from: location }} replace />;
        if (pathname.startsWith('/admin')) return <Navigate to="/management-login" state={{ from: location }} replace />;
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 4. Role Authorization
    const isAuthorized = allowedRoles.includes(currentRole);

    if (allowedRoles.length === 0 || isAuthorized) {
        return children ? children : <Outlet />;
    }

    // 5. Unauthorized (Wrong role) -> Redirect to their correct home
    console.warn(`Unauthorized access attempt. Role ${currentRole} is not in ${allowedRoles}`);
    
    if (currentRole === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (currentRole === 'management' || currentRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
};

export default RoleProtectedRoute;