
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Envelope, Phone, MapPin, IdentificationBadge, Buildings, GenderIntersex, Calendar } from '@phosphor-icons/react';

const Profile = () => {
    const { user, role } = useAuth();

    if (!user) return <div>Loading...</div>;

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="profile-info-row">
            <div className="profile-icon-box">
                <Icon size={20} weight="duotone" />
            </div>
            <div>
                <span className="profile-label">{label}</span>
                <span className="profile-value">{value || 'Not provided'}</span>
            </div>
        </div>
    );

    return (
        <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header Card */}
                <div className="profile-header-card hover-lift">
                    <div className="profile-header-content">
                        <div className="profile-avatar-xl">
                            {user.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="profile-name">{user.name}</h1>
                            <p className="profile-role-badge">
                                {role === 'patient' ? 'Patient Account' : 'Hospital Administrator'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="profile-grid">
                    {/* Contact Info */}
                    <div className="profile-section-card hover-lift">
                        <h3 className="section-title">Contact Information</h3>
                        <InfoRow icon={Envelope} label="Email Address" value={user.email} />
                        <InfoRow icon={Phone} label="Phone Number" value={user.phone} />
                        <InfoRow icon={MapPin} label="Address" value={user.address} />
                    </div>

                    {/* Role Specific Info */}
                    <div className="profile-section-card hover-lift">
                        <h3 className="section-title">{role === 'patient' ? 'Medical Details' : 'Institution Details'}</h3>

                        {role === 'patient' ? (
                            <>
                                <InfoRow icon={IdentificationBadge} label="Patient ID" value={user.id} />
                                <InfoRow icon={Calendar} label="Date of Birth" value={user.dateOfBirth} />
                                <InfoRow icon={GenderIntersex} label="Gender" value={user.gender} />
                                <InfoRow icon={User} label="Blood Group" value={user.bloodGroup} />
                            </>
                        ) : (
                            <>
                                <InfoRow icon={IdentificationBadge} label="Hospital ID" value={user.id} />
                                <InfoRow icon={Buildings} label="Hospital Name" value={user.hospitalName} />
                                <InfoRow icon={IdentificationBadge} label="Admin Status" value={user.profileComplete ? 'Verified' : 'Pending'} />
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
