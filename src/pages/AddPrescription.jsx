import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Pill, User, Clock, CheckCircle } from '@phosphor-icons/react';

const AddPrescription = () => {
    const { addPrescription } = useData();
    const [formData, setFormData] = useState({
        name: '',
        dose: '',
        time: '',
        patientName: ''
    });
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.dose || !formData.time || !formData.patientName) return;

        addPrescription({
            ...formData,
            patientId: 'P-' + Math.floor(Math.random() * 1000) // Mock ID
        });

        setSuccess(true);
        setFormData({
            name: '',
            dose: '',
            time: '',
            patientName: ''
        });

        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="card-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                        Add New Prescription
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Create a new prescription for a patient</p>
                </div>

                <div className="prescription-form-card" style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
                    <form onSubmit={handleSubmit} className="prescription-stack">
                        <div className="form-group">
                            <label className="form-label">
                                <User style={{ display: 'inline', marginRight: '8px', verticalAlign: '-2px', color: 'var(--primary-color)' }} />
                                Patient Name
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                name="patientName"
                                placeholder="e.g. John Doe"
                                value={formData.patientName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    <Pill style={{ display: 'inline', marginRight: '8px', verticalAlign: '-2px', color: 'var(--primary-color)' }} />
                                    Tablet Name
                                </label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Paracetamol"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    <Clock style={{ display: 'inline', marginRight: '8px', verticalAlign: '-2px', color: 'var(--primary-color)' }} />
                                    Dosage
                                </label>
                                <input
                                    className="form-input"
                                    type="text"
                                    name="dose"
                                    placeholder="e.g. 500mg"
                                    value={formData.dose}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Time to take</label>
                            <input
                                className="form-input"
                                type="text"
                                name="time"
                                placeholder="e.g. Morning, After Food"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary ripple-button hover-lift"
                            style={{
                                marginTop: '16px',
                                height: '54px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '1.1rem',
                                background: 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                            <PlusCircle weight="bold" size={22} /> Add Prescription
                        </button>
                    </form>

                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    marginTop: '24px',
                                    padding: '16px',
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    fontWeight: '600',
                                    border: '1px solid #a7f3d0'
                                }}
                            >
                                <CheckCircle weight="fill" size={24} />
                                Prescription successfully added!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AddPrescription;
