import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/PasswordInput';
import { OAuthButtons } from '../components/OAuthButtons';
import { Hospital } from '@phosphor-icons/react';

export const Login = () => {
    const navigate = useNavigate();
    const { signIn, signInWithOAuth, user } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const { user: signedInUser, error } = await signIn(formData.email, formData.password);
        if (signedInUser && !error) {
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
                    <h1 className="auth-title">Hospital Portal Login</h1>
                    <p className="auth-subtitle">Authorized clinical & administrative staff access</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Hospital Email / Username</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="doctor@hospital.com or admin@cityhospital.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={submitting}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>Password</label>
                        </div>
                        <PasswordInput
                            id="password"
                            placeholder="Enter your security password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={submitting}
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
                            <><span className="spinner"></span>&nbsp; Authenticating Staff...</>
                        ) : (
                            'Sign In to Hospital Portal'
                        )}
                    </motion.button>
                </form>



                <div className="auth-divider">Or staff single sign-on</div>

                <OAuthButtons
                    onGoogleClick={() => handleOAuthSignIn('google')}
                    disabled={oauthLoading || submitting}
                />

                <div className="auth-footer">
                    New hospital facility?{' '}
                    <Link to="/signup" className="auth-link">Register Hospital</Link>
                </div>
            </motion.div>
        </AuthLayout>
    );
};

export default Login;
