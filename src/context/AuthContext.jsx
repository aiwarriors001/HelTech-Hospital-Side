import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import secureStorage from '../utils/secureStorage';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const MOCK_HOSPITAL_USER = {
    id: 'hospital_001',
    role: 'hospital',
    name: 'Dr. Sarah Jenkins',
    hospitalName: 'City General Hospital',
    email: 'admin@cityhospital.com',
    phone: '+1 234 567 8900',
    address: '123 Medical Center Drive, Suite 400',
    department: 'Hospital Administration & Emergency Care',
    profileComplete: true
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => secureStorage.getItem('user_session') || null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Apply Hospital Branding Colors
    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', '#2563EB');
        document.documentElement.style.setProperty('--primary-light', '#EFF6FF');
        document.documentElement.style.setProperty('--primary-dark', '#1E40AF');
    }, []);

    // Initial session detection via Supabase
    useEffect(() => {
        const timeout = setTimeout(() => setLoading(false), 2000);

        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(timeout);
            if (session?.user) {
                const formattedUser = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
                    hospitalName: session.user.user_metadata?.hospital_name || 'City General Hospital',
                    role: 'hospital',
                    phone: session.user.user_metadata?.mobile_number || '+1 234 567 8900'
                };
                setUser(formattedUser);
                secureStorage.setItem('user_session', formattedUser);
                secureStorage.setItem('activeRole', 'hospital');
                loadUserProfile(session.user.id, session.user.email);
            }
            setLoading(false);
        }).catch(() => {
            clearTimeout(timeout);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const formattedUser = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
                    hospitalName: session.user.user_metadata?.hospital_name || 'City General Hospital',
                    role: 'hospital',
                    phone: session.user.user_metadata?.mobile_number || '+1 234 567 8900'
                };
                setUser(formattedUser);
                secureStorage.setItem('user_session', formattedUser);
                secureStorage.setItem('activeRole', 'hospital');
                loadUserProfile(session.user.id, session.user.email);
            } else if (!secureStorage.getItem('user_session')) {
                setUser(null);
                setProfile(null);
            }
        });

        return () => {
            clearTimeout(timeout);
            subscription?.unsubscribe();
        };
    }, []);

    const loadUserProfile = async (userId, userEmail) => {
        try {
            // First attempt to query by id
            let { data, error } = await supabase
                .from('hospital_profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            // Fallback to query by email if not found by id
            if (!data && userEmail) {
                const res = await supabase
                    .from('hospital_profiles')
                    .select('*')
                    .eq('email', userEmail)
                    .maybeSingle();
                data = res.data;
            }

            if (data) {
                setProfile(data);
            }
        } catch (e) {
            console.warn('Profile load:', e.message);
        }
    };

    const syncProfile = async (authUser) => {
        try {
            const profilePayload = {
                id: authUser.id,
                email: authUser.email,
                hospital_name: authUser.user_metadata?.hospital_name || '',
                lead_doctor_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
                mobile_number: authUser.user_metadata?.mobile_number || '',
                location: authUser.user_metadata?.hospital_location || '',
                role: 'hospital'
            };

            const { data, error } = await supabase
                .from('hospital_profiles')
                .upsert(profilePayload, { onConflict: 'id' })
                .select()
                .maybeSingle();
            if (!error && data) setProfile(data);
        } catch (e) {
            console.warn('syncProfile:', e.message);
        }
    };

    // Hospital Staff Sign In
    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const formattedUser = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                hospitalName: data.user.user_metadata?.hospital_name || 'City General Hospital',
                role: 'hospital',
                phone: data.user.user_metadata?.mobile_number || ''
            };

            setUser(formattedUser);
            secureStorage.setItem('user_session', formattedUser);
            secureStorage.setItem('activeRole', 'hospital');

            toast.success(`Welcome back, ${formattedUser.name}!`);
            return { user: formattedUser, error: null };
        } catch (error) {
            const msg =
                error.message === 'Invalid login credentials' ? 'Incorrect email or password' :
                error.message === 'Email not confirmed' ? 'Please confirm your email or use Instant Demo Login' :
                error.message?.includes('rate limit') ? 'Too many attempts — try again later' :
                error.message || 'Hospital sign in failed';
            toast.error(msg);
            return { user: null, error };
        }
    };

    // Hospital Staff Registration
    const signUp = async (email, password, metadata = {}) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: metadata.full_name,
                        mobile_number: metadata.mobile_number,
                        role: 'hospital',
                        hospital_name: metadata.hospital_name || metadata.full_name,
                        hospital_location: metadata.hospital_location || '',
                        password: password
                    }
                }
            });

            if (error) throw error;

            // Attempt to insert/upsert into hospital_profiles table
            if (data?.user) {
                const profilePayload = {
                    id: data.user.id,
                    email: email,
                    hospital_name: metadata.hospital_name || metadata.full_name,
                    lead_doctor_name: metadata.full_name,
                    mobile_number: metadata.mobile_number,
                    location: metadata.hospital_location || '',
                    role: 'hospital',
                    password: password
                };

                try {
                    const { error: upsertErr } = await supabase
                        .from('hospital_profiles')
                        .upsert([profilePayload], { onConflict: 'id' });

                    if (upsertErr) {
                        console.warn('Upsert by id failed, attempting direct insert:', upsertErr.message);
                        const { error: insertErr } = await supabase
                            .from('hospital_profiles')
                            .insert([profilePayload]);
                        if (insertErr) {
                            console.error('Hospital profile save error:', insertErr);
                        }
                    }
                } catch (pe) {
                    console.warn('Hospital profile save exception:', pe.message);
                }

                const formattedUser = {
                    id: data.user.id,
                    email: data.user.email,
                    name: metadata.full_name || email.split('@')[0],
                    hospitalName: metadata.hospital_name || metadata.full_name,
                    role: 'hospital',
                    phone: metadata.mobile_number || ''
                };

                if (data.session) {
                    setUser(formattedUser);
                    secureStorage.setItem('user_session', formattedUser);
                    secureStorage.setItem('activeRole', 'hospital');
                }
            }

            if (data?.user && !data?.session) {
                toast.success('Registration successful! Please confirm your email, or disable email confirmation in Supabase to login immediately.');
                return { user: data.user, error: null };
            }

            toast.success('Hospital account created successfully!');
            return { user: data.user, error: null };
        } catch (error) {
            const message =
                error.message === 'User already registered' ? 'Email already registered' :
                error.message || 'Failed to create hospital account';
            toast.error(message);
            return { user: null, error };
        }
    };

    // Google OAuth
    const signInWithOAuth = async (provider = 'google') => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: `${window.location.origin}/auth/callback` }
            });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            toast.error(`Failed to sign in with ${provider}`);
            return { data: null, error };
        }
    };

    // Instant Demo Hospital Login
    const demoLogin = () => {
        setUser(MOCK_HOSPITAL_USER);
        secureStorage.setItem('user_session', MOCK_HOSPITAL_USER);
        secureStorage.setItem('activeRole', 'hospital');
        toast.success('Logged in as Hospital Administrator & Doctor!');
        return MOCK_HOSPITAL_USER;
    };

    // Sign out & clear session
    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn('Sign out:', e.message);
        }
        setUser(null);
        setProfile(null);
        secureStorage.removeItem('activeRole');
        secureStorage.removeItem('user_session');
        toast.success('Signed out of hospital portal');
    };

    return (
        <AuthContext.Provider value={{
            user,
            role: 'hospital',
            profile,
            loading,
            isConfigured: isSupabaseConfigured,
            signIn,
            signUp,
            signInWithOAuth,
            signOut: logout,
            logout,
            demoLogin,
            syncProfile,
            loadUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
