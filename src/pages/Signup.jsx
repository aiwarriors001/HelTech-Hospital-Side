import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/PasswordInput';
import { OAuthButtons } from '../components/OAuthButtons';
import { Hospital } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

export const Signup = () => {
    const navigate = useNavigate();
    const { signUp, signInWithOAuth } = useAuth();
    const [formData, setFormData] = useState({
        hospitalName: '',
        fullName: '',
        mobileNumber: '',
        hospitalLocation: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(false);

    const validateForm = () => {
        if (!formData.hospitalName.trim()) {
            toast.error('Hospital name is required');
            return false;
        }
        if (!formData.fullName.trim()) {
            toast.error('Doctor / Administrator name is required');
            return false;
        }
        const cleanedPhone = formData.mobileNumber.replace(/\D/g, '');
        if (cleanedPhone.length < 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return false;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        const { user, error } = await signUp(formData.email, formData.password, {
            full_name: formData.fullName,
            hospital_name: formData.hospitalName,
            mobile_number: formData.mobileNumber,
            hospital_location: formData.hospitalLocation,
            role: 'hospital'
        });

        if (user && !error) {
            navigate('/', { replace: true });
        }
        setSubmitting(false);
    };

    const handleOAuthSignIn = async (provider = 'google') => {
        setOauthLoading(true);
        await signInWithOAuth(provider);
    };


    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name || e.target.id]: e.target.value }));
    };

    return (
        <AuthLayout>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {/* Brand Logo Header */}
                <div className="auth-brand">
                    <div className="auth-brand-logo" style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)' }}>
                        <Hospital weight="bold" size={24} />
                    </div>
                    <span className="auth-brand-title">HelTech</span>
                </div>

                <div className="auth-header">
                    <h1 className="auth-title">Register Hospital</h1>
                    <p className="auth-subtitle">Set up your hospital command center & EMR</p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="hospitalName" className="form-label">Hospital / Clinic Name</label>
                        <input
                            type="text"
                            id="hospitalName"
                            name="hospitalName"
                            className="form-input"
                            placeholder="e.g. Chennai Apollo Hospital or Madurai Meenakshi Clinic"
                            value={formData.hospitalName}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fullName" className="form-label">Administrator / Lead Doctor Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className="form-input"
                            placeholder="e.g. Dr. Murugan or Dr. Kavitha"
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mobileNumber" className="form-label">Hospital Contact Number</label>
                        <input
                            type="tel"
                            id="mobileNumber"
                            name="mobileNumber"
                            className="form-input"
                            placeholder="e.g. 9444123456"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="hospitalLocation" className="form-label">Hospital Location / Address</label>
                        <textarea
                            id="hospitalLocation"
                            name="hospitalLocation"
                            className="form-input"
                            placeholder="e.g. 12, Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017"
                            value={formData.hospitalLocation}
                            onChange={handleChange}
                            disabled={submitting}
                            rows={2}
                            style={{ resize: 'none', lineHeight: '1.5' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Official Hospital Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="e.g. admin@chennaihospital.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <PasswordInput
                            id="password"
                            placeholder="Create a strong password (min 6 chars)"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={submitting}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <PasswordInput
                            id="confirmPassword"
                            placeholder="Repeat password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={submitting}
                            autoComplete="new-password"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={submitting}
                        whileHover={{ scale: submitting ? 1 : 1.01 }}
                        whileTap={{ scale: submitting ? 1 : 0.99 }}
                    >
                        {submitting ? (
                            <><span className="spinner"></span>&nbsp; Registering Hospital...</>
                        ) : (
                            'Register Hospital Facility'
                        )}
                    </motion.button>
                </form>



                <div className="auth-divider">Or continue with</div>

                <OAuthButtons
                    onGoogleClick={() => handleOAuthSignIn('google')}
                    disabled={oauthLoading || submitting}
                />

                <div className="auth-footer">
                    Already registered?{' '}
                    <Link to="/login" className="auth-link">Hospital Sign In</Link>
                </div>
            </motion.div>
        </AuthLayout>
    );
};

export default Signup;
