import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
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
