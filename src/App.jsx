
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Profile from './pages/Profile';
import AddPrescription from './pages/AddPrescription';

import Prescription from './pages/Prescription';
import { History, Appointments } from './pages/PatientPages';

function App() {
    return (
        <AuthProvider>
            <DataProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="patients" element={<Patients />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="add-prescription" element={<AddPrescription />} />


                        {/* Patient Specific Routes */}
                        <Route path="prescription" element={<Prescription />} />
                        <Route path="history" element={<History />} />
                        <Route path="appointments" element={<Appointments />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </DataProvider>
        </AuthProvider>
    );
}

export default App;
