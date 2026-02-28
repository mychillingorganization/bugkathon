import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthAPI } from '../config/api';

const AuthRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await AuthAPI.getProfile();
                localStorage.setItem('current_user', JSON.stringify(res.data));
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('current_user');
                setIsAuthenticated(false);
            }
        };
        verifySession();
    }, []);

    if (isAuthenticated === null) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><span className="spinner-small" style={{ width: '40px', height: '40px' }}></span></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AuthRoute;
