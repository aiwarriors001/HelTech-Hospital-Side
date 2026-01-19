
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, ChatCircleDots, ChartLine, FileText, FolderOpen } from '@phosphor-icons/react';

const Home = () => {
    const { user, role } = useAuth();

    if (!user) return <div>Loading...</div>;

    if (role === 'patient') {
        return (
            <div id="home-content">
                <div className="hero-banner fade-in">
                    <div className="hero-content">
                        <h1>Welcome, {user.name}!</h1>
                        <p>Manage your health, prescriptions, and appointments with ease.</p>
                        <Link to="/prescription" className="cta-btn ripple-button hover-lift">
                            <FileText weight="bold" style={{ marginRight: '8px' }} /> Upload Prescription
                        </Link>
                    </div>
                </div>

                <div className="quick-actions stagger-children">
                    <Link to="/prescription" className="action-card hover-lift hover-bounce-icon shadow-layered">
                        <div className="action-icon teal">
                            <FileText weight="fill" />
                        </div>
                        <h3>Upload Prescription</h3>
                        <p>Upload new prescriptions easily</p>
                    </Link>

                    <Link to="/history" className="action-card hover-lift hover-bounce-icon shadow-layered">
                        <div className="action-icon blue">
                            <FolderOpen weight="fill" />
                        </div>
                        <h3>My History</h3>
                        <p>View your medical history</p>
                    </Link>


                </div>
            </div>
        )
    }

    return (
        <div id="home-content">
            <div className="hero-banner fade-in">
                <div className="hero-content">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Welcome back, {user.hospitalName || user.name}</h1>
                    <p style={{ fontSize: '1.2rem', opacity: '0.9', maxWidth: '700px', marginBottom: '32px' }}>
                        Your central command center for patient care and hospital administration. Access real-time data, manage records, and streamline operations efficiently.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link to="/patients" className="cta-btn ripple-button hover-lift">
                            <Users weight="bold" style={{ marginRight: '8px' }} /> Patient Directory
                        </Link>
                        <Link to="/dashboard" className="cta-btn-outline ripple-button hover-lift">
                            <ChartLine weight="bold" style={{ marginRight: '8px' }} /> View Analytics
                        </Link>
                    </div>
                </div>
            </div>

            <h3 className="section-header">Quick Access</h3>

            <div className="quick-actions stagger-children">
                <Link to="/patients" className="action-card hover-lift hover-bounce-icon shadow-layered">
                    <div className="action-icon blue">
                        <Users weight="fill" />
                    </div>
                    <h3>Electronic Medical Records</h3>
                    <p>Comprehensive digital patient histories and care continuity.</p>
                </Link>



                <Link to="/dashboard" className="action-card hover-lift hover-bounce-icon shadow-layered">
                    <div className="action-icon pink">
                        <ChartLine weight="fill" />
                    </div>
                    <h3>Hospital Insights</h3>
                    <p>Real-time analytics for resource optimization.</p>
                </Link>
            </div>
        </div>
    );
};

export default Home;
