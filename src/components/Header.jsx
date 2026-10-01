import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, SignOut, List } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const location = useLocation();
    const navigate = useNavigate();

    const getPageTitle = (path) => {
        switch (path) {
            case '/':
            case '/home':
                return 'Hospital Command Center';
            case '/dashboard':
                return 'Hospital Analytics & Requests';
            case '/patients':
                return 'Patient Management (EMR)';
            case '/add-prescription':
                return 'Issue Prescription';
            case '/prescription':
                return 'Prescription Registry';
            case '/appointment':
                return 'Patient Appointments & Approvals';
            case '/consultancy':
                return 'CareConnect Video Consultancy';
            case '/profile':
                return 'Hospital Facility Profile';
            default:
                return 'HelTech Hospital';
        }
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const getInitials = (name) => {
        if (!name) return 'H';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <header className="top-bar">
            {/* Page Title & Hamburger */}
            <div className="page-title-container">
                <button className="hamburger-btn" onClick={() => toggleSidebar()}>
                    <List size={24} />
                </button>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    {getPageTitle(location.pathname)}
                </h2>
            </div>

            <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                {/* Theme Toggle */}
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* Hospital User Profile Preview */}
                <div className="user-profile-preview" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem' }}>
                        {user?.hospitalName || user?.name || 'City General Hospital'}
                    </span>
                    <div className="avatar" style={{ background: '#2563EB', color: 'white' }}>
                        {getInitials(user?.hospitalName || user?.name)}
                    </div>
                </div>

                {/* Sign Out */}
                <button
                    className="theme-toggle"
                    onClick={handleLogout}
                    title="Sign Out of Hospital Portal"
                    style={{ color: '#EF4444' }}
                >
                    <SignOut size={20} weight="bold" />
                </button>
            </div>
        </header>
    );
};

export default Header;
