import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
    const navigate = useNavigate();
    const { syncProfile } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (data?.session) {
                    try {
                        if (syncProfile) {
                            await syncProfile(data.session.user);
                        }
                    } catch (syncErr) {
                        console.warn('Profile sync:', syncErr.message);
                    }
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 800);
                } else {
                    throw new Error('No session returned from authentication provider');
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setError(err.message || 'Authentication failed');
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
            }
        };

        handleCallback();
    }, [navigate, syncProfile]);

    if (error) {
        return (
            <div className="auth-container">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ color: '#EF4444', marginBottom: '0.5rem' }}>Authentication Failed</h2>
                    <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                        Redirecting to login...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center' }}
            >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Completing Sign In...</h2>
                <p style={{ color: 'var(--text-muted)' }}>Synchronizing your secure session</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div className="spinner" style={{ width: '2rem', height: '2rem', borderTopColor: '#2563EB', borderColor: 'rgba(37,99,235,0.2)' }}></div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthCallback;
