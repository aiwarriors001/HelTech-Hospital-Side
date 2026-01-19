
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Clock, Flask, CheckCircle } from '@phosphor-icons/react';

const Prescription = () => {
    const { addPrescription } = useData();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        dose: '',
        time: ''
    });
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.dose || !formData.time) return;

        addPrescription({
            ...formData,
            patientId: user.id,
            patientName: user.name
        });

        setSuccess(true);
        setFormData({ name: '', dose: '', time: '' });

        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="card-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>
                        Upload Prescription
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your medication details below</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', borderRadius: '16px', background: 'var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-main)' }}>
                            <Pill style={{ display: 'inline', marginRight: '8px', verticalAlign: '-2px', color: 'var(--primary-color)' }} />
                            Tablet Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Paracetamol"
                            className="form-input"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-color)',
                                color: 'var(--text-main)',
                                transition: 'all 0.3s'
                            }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-main)' }}>
                            <Flask style={{ display: 'inline', marginRight: '8px', verticalAlign: '-2px', color: 'var(--primary-color)' }} />
                            Dose (mg/ml)
                        </label>
                        <input
                            type="text"
                            value={formData.dose}
                            onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                            placeholder="e.g. 500mg"
                            className="form-input"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-color)',
                                color: 'var(--text-main)'
                            }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-main)' }}>
                            <Clock style={{ display: 'inline', marginRight: '8px', verticalAlign: '-2px', color: 'var(--primary-color)' }} />
                            Time to take
                        </label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="form-input"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-color)',
                                color: 'var(--text-main)'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="cta-btn hover-lift"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        Add Prescription
                    </button>
                </form>

                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                marginTop: '20px',
                                padding: '16px',
                                background: '#e8f5e9',
                                color: '#2e7d32',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontWeight: '500'
                            }}
                        >
                            <CheckCircle weight="fill" size={24} />
                            Prescription added successfully!
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Prescription;
