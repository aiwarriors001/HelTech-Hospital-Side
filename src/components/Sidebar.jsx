import React from 'react';
import { NavLink } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
    House,
    SquaresFour,
    Users,
    Pill,
    Hospital,
    CalendarCheck,
    VideoCamera
} from '@phosphor-icons/react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { callDetails } = useData();
    const pendingCallsCount = (callDetails || []).filter(c => c && c.status === 'pending').length;

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            ></div>
            <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="brand">
                    <Hospital weight="fill" size={32} color="#2563EB" />
                    <h1>HelTech</h1>
                </div>

                <ul className="nav-menu">
                    <NavLink to="/" end onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <House size={20} /> <span>Home</span>
                    </NavLink>

                    <NavLink to="/dashboard" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <SquaresFour size={20} /> <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/appointment" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <CalendarCheck size={20} /> <span>Appointment</span>
                    </NavLink>

                    <NavLink to="/consultancy" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <VideoCamera size={20} /> <span>CareConnect</span>
                            </div>
                            {pendingCallsCount > 0 && (
                                <span style={{
                                    background: '#EF4444',
                                    color: 'white',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    padding: '2px 7px',
                                    borderRadius: '999px',
                                    lineHeight: 1.2
                                }}>
                                    {pendingCallsCount}
                                </span>
                            )}
                        </div>
                    </NavLink>

                    <NavLink to="/patients" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <Users size={20} /> <span>Patient Management</span>
                    </NavLink>

                    <NavLink to="/prescription" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <Pill size={20} /> <span>Prescriptions & Registry</span>
                    </NavLink>

                    <NavLink to="/profile" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <Hospital size={20} /> <span>Hospital Profile</span>
                    </NavLink>
                </ul>
            </nav>
        </>
    );
};

export default Sidebar;
