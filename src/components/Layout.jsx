
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet, Link } from 'react-router-dom';
import { Plus, X, Pill } from '@phosphor-icons/react';
import { useState } from 'react';

const Layout = () => {
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = (state) => {
        setIsSidebarOpen(state !== undefined ? state : !isSidebarOpen);
    };

    return (
        <>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="main-content">
                <Header toggleSidebar={toggleSidebar} />
                <section className="view-section active" style={{ display: 'block' }}>
                    <div className="view-container">
                        <Outlet />
                    </div>
                </section>

                {/* Global Floating Action Button */}
                <div className="fab-container">
                    {isFabOpen && (
                        <div className="fab-actions-menu">

                            <Link to="/prescription" onClick={() => setIsFabOpen(false)} className="fab-action-item">
                                <span>New Prescription</span>
                                <Pill size={20} weight="fill" color="#00897b" />
                            </Link>
                        </div>
                    )}
                    <button
                        className="fab-btn"
                        onClick={() => setIsFabOpen(!isFabOpen)}
                        style={{ transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                        <Plus weight="bold" />
                    </button>
                </div>

                <footer className="main-footer">
                    <span>&copy; {new Date().getFullYear()} HelTech. All rights reserved.</span>
                    <span style={{ color: 'var(--border-color)' }}>|</span>
                    <span>
                        Developed by <strong style={{ color: 'var(--primary-color)' }}>AI Warriors</strong>
                    </span>
                </footer>
            </div>
        </>
    );
};

export default Layout;
