
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    House,
    SquaresFour,
    FileText,
    FolderOpen,
    ChatCircleDots,
    CalendarCheck,
    User,
    Users,
    PlusCircle,
    Hospital,
    UserCircle
} from '@phosphor-icons/react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { role } = useAuth();

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            ></div>
            <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="brand">
                    {role === 'patient' ? (
                        <PlusCircle weight="fill" size={32} />
                    ) : (
                        <Hospital weight="fill" size={32} />
                    )}
                    <h1>HelTech</h1>
                </div>

                <ul className="nav-menu">
                    <NavLink to="/" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <House size={20} /> <span>Home</span>
                    </NavLink>

                    <NavLink to="/dashboard" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                        <SquaresFour size={20} /> <span>Dashboard</span>
                    </NavLink>

                    {role === 'patient' ? (
                        <>
                            <NavLink to="/prescription" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                                <FileText size={20} /> <span>Upload Prescription</span>
                            </NavLink>
                            <NavLink to="/history" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                                <FolderOpen size={20} /> <span>My History</span>
                            </NavLink>

                            <NavLink to="/appointments" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                                <CalendarCheck size={20} /> <span>My Appointments</span>
                            </NavLink>
                            <NavLink to="/profile" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                                <User size={20} /> <span>Profile</span>
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/patients" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                                <Users size={20} /> <span>Patient Management</span>
                            </NavLink>

                            <NavLink to="/add-prescription" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                                <PlusCircle size={20} /> <span>Add Prescription</span>
                            </NavLink>

                            <NavLink to="/profile" onClick={() => toggleSidebar(false)} className={({ isActive }) => `nav-item hover-bounce-icon ${isActive ? 'active' : ''}`}>
                                <Hospital size={20} /> <span>Hospital Profile</span>
                            </NavLink>
                        </>
                    )}
                </ul>
            </nav>
        </>
    );
};

export default Sidebar;
