
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, SignOut, List } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const navigate = useNavigate();
    const location = useLocation();

    const getPageTitle = (path) => {
        switch (path) {
            case '/': return 'Home';
            case '/dashboard': return 'Dashboard';
            case '/patients': return 'Patient Management';
            case '/add-prescription': return 'Add Prescription';

            case '/profile': return 'Profile';
            case '/prescription': return 'Upload Prescription';
            case '/history': return 'My History';
            case '/appointments': return 'My Appointments';
            default: return 'HelTech';
        }
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const getInitials = (name) => {
        if (!name) return '?';
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {getPageTitle(location.pathname)}
                </h2>
            </div>

            <div className="top-bar-right">
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <div className="user-profile-preview">
                    <span style={{ color: 'var(--text-main)' }}>{user?.name || 'User'}</span>
                    <div className="avatar">{getInitials(user?.name)}</div>
                </div>
                <button
                    className="theme-toggle"
                    onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                            window.location.reload();
                        }
                    }}
                    title="Logout"
                    style={{ color: 'var(--error-color, #ef4444)', marginLeft: '8px' }}
                >
                    <SignOut size={20} weight="bold" />
                </button>
            </div>
        </header>
    );
};

export default Header;
