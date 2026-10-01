import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layout & Hospital Operations Pages
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Profile from './pages/Profile';
import Prescription from './pages/Prescription';
import Services from './pages/Services';
import Appointment from './pages/Appointment';
import Consultancy from './pages/Consultancy';

// Hospital Staff Authentication Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';

// Protected Route Guard for Hospital Staff
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'var(--bg-color, #F8FAFC)'
            }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: '#2563EB' }}></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <Routes>
                    {/* Public Hospital Authentication Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Protected Hospital Management System */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Home />} />
                        <Route path="home" element={<Home />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="patients" element={<Patients />} />
                        <Route path="add-prescription" element={<Navigate to="/prescription" replace />} />
                        <Route path="prescription" element={<Prescription />} />
                        <Route path="appointment" element={<Appointment />} />
                        <Route path="consultancy" element={<Consultancy />} />
                        <Route path="services" element={<Services />} />
                        <Route path="profile" element={<Profile />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        style: {
                            background: '#FFFFFF',
                            color: '#1F2937',
                            padding: '14px 18px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        },
                        success: {
                            iconTheme: {
                                primary: '#10B981',
                                secondary: '#FFFFFF',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#FFFFFF',
                            },
                        },
                    }}
                />
            </DataProvider>
        </AuthProvider>
    );
}

export default App;
