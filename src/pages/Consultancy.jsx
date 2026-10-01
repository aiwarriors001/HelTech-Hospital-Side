import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    AGORA_APP_ID,
    CALLING_WEBHOOK_BASE_URL,
    triggerCallingWebhook,
    joinAgoraSession,
    leaveAgoraSession,
    setAgoraMuted,
    setAgoraVideoOff
} from '../services/telemedicineService';
import {
    VideoCamera, VideoCameraSlash, Microphone, MicrophoneSlash, PhoneDisconnect, PhoneIncoming,
    Pulse, ChatCircleDots, ShieldCheck, CheckCircle, User, Stethoscope, Broadcast, DeviceMobile,
    LockKey, Clock, Sparkle, PhoneCall, ArrowRight, Desktop, MagnifyingGlass, Plus, X, Check,
    ArrowClockwise, Copy, CalendarBlank, MapPin, Pill, WarningCircle, CaretRight, Heartbeat
} from '@phosphor-icons/react';

const S = {
    tag: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 14px', borderRadius: '999px',
        background: 'rgba(124,58,237,0.09)', color: '#7C3AED',
        fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase', marginBottom: '14px',
        border: '1px solid rgba(124,58,237,0.18)'
    },
    h2: {
        fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main,#1F2937)',
        letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1.25
    },
    sub: { fontSize: '0.96rem', color: 'var(--text-muted,#64748B)', maxWidth: '680px', lineHeight: 1.6 },
    card: {
        background: 'var(--card-bg,#fff)', borderRadius: '18px',
        border: '1px solid var(--border-color,#E2E8F0)',
        padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    }
};

const Tag = ({ icon: Icon, label }) => (
    <div style={S.tag}><Icon size={14} weight="bold" /> {label}</div>
);

const onlineDoctors = [
    {
        name: 'Dr. Priya Ramanathan',
        role: 'Senior Cardiologist (MD, DM)',
        status: 'Available Now',
        statusColor: '#10B981',
        waitTime: '< 2 mins',
        avatar: 'PR'
    },
    {
        name: 'Dr. Arvind Swaminathan',
        role: 'Physician & General Medicine (MBBS, DNB)',
        status: 'Available Now',
        statusColor: '#10B981',
        waitTime: '< 3 mins',
        avatar: 'AS'
    },
    {
        name: 'Dr. Anita Roy',
        role: 'Consultant Paediatrician (MD)',
        status: 'In Session',
        statusColor: '#F59E0B',
        waitTime: 'Free in ~5 mins',
        avatar: 'AR'
    }
];

const consultFeatures = [
    {
        icon: VideoCamera,
        color: '#7C3AED',
        bg: '#7C3AED18',
        title: 'HD Video Session',
        desc: 'Ultra-low latency peer-to-peer video with auto-reconnect. Operates smoothly on mobile & web.'
    },
    {
        icon: Pulse,
        color: '#DC2626',
        bg: '#DC262618',
        title: 'Live Vitals Monitor',
        desc: 'Transmit SpO2, blood pressure readings, temperature, and pulse rate directly to doctor screen.'
    },
    {
        icon: ChatCircleDots,
        color: '#0D9488',
        bg: '#0D948818',
        title: 'In-Call Prescription',
        desc: 'Digital prescription signed and delivered instantly to patient registry upon session completion.'
    },
    {
        icon: LockKey,
        color: '#2563EB',
        bg: '#2563EB18',
        title: 'HIPAA & NABH Encrypted',
        desc: '256-bit AES cryptographic encryption guarantees total privacy of doctor-patient discussions.'
    }
];

const Consultancy = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        callDetails,
        callsLoading,
        fetchCallDetails,
        updateCallStatus,
        createCallRecord
    } = useData();

    // Active session state
    const [activeCall, setActiveCall] = useState(null);
    const [sessionConnecting, setSessionConnecting] = useState(false);
    const [connectingDoctor, setConnectingDoctor] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showVitals, setShowVitals] = useState(true);
    const [remoteUserJoined, setRemoteUserJoined] = useState(false);
    const [hasLocalVideoTrack, setHasLocalVideoTrack] = useState(false);
    const [hasLocalAudioTrack, setHasLocalAudioTrack] = useState(false);
    const [webhookNotified, setWebhookNotified] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Leave Agora session if component unmounts
    useEffect(() => {
        return () => {
            leaveAgoraSession();
        };
    }, []);

    // Filters and search
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'accepted' | 'completed'
    const [searchQuery, setSearchQuery] = useState('');
    const [directRoomInput, setDirectRoomInput] = useState('');

    // Modal state for manual new call
    const [showNewCallModal, setShowNewCallModal] = useState(false);
    const [isSubmittingNewCall, setIsSubmittingNewCall] = useState(false);
    const [newCallForm, setNewCallForm] = useState({
        patient_name: '',
        patient_mobile: '',
        patient_email: '',
        location: '',
        specialist_category: 'General Physician',
        consultation_type: 'Video Call',
        preferred_date: new Date().toISOString().split('T')[0],
        preferred_time: '10:00:00'
    });

    const timerRef = useRef(null);

    // Call duration timer
    useEffect(() => {
        if (activeCall && !sessionConnecting) {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setCallDuration(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activeCall, sessionConnecting]);

    const hospitalName = user?.hospitalName || 'City General Hospital';

    // Format timer (MM:SS)
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Filter calls
    const filteredCalls = useMemo(() => {
        let list = callDetails || [];

        // Tab filter
        if (activeTab === 'pending') {
            list = list.filter(c => c.status === 'pending');
        } else if (activeTab === 'accepted') {
            list = list.filter(c => c.status === 'accepted' || c.status === 'active' || c.status === 'in-progress');
        } else if (activeTab === 'completed') {
            list = list.filter(c => c.status === 'completed');
        }

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(c =>
                (c.patient_name && c.patient_name.toLowerCase().includes(q)) ||
                (c.patient_mobile && c.patient_mobile.includes(q)) ||
                (c.patient_email && c.patient_email.toLowerCase().includes(q)) ||
                (c.location && c.location.toLowerCase().includes(q)) ||
                (c.specialist_category && c.specialist_category.toLowerCase().includes(q)) ||
                (c.agora_channel_name && c.agora_channel_name.toLowerCase().includes(q))
            );
        }

        return list;
    }, [callDetails, activeTab, searchQuery]);

    // Counters
    const totalCallsCount = (callDetails || []).length;
    const pendingCallsCount = (callDetails || []).filter(c => c.status === 'pending').length;
    const acceptedCallsCount = (callDetails || []).filter(c => c.status === 'accepted' || c.status === 'active' || c.status === 'in-progress').length;
    const completedCallsCount = (callDetails || []).filter(c => c.status === 'completed').length;

    // Start / Join Call
    const handleStartCall = async (call, assignedDoc = null) => {
        const doc = assignedDoc || onlineDoctors[0];
        setConnectingDoctor(doc);
        setSessionConnecting(true);

        const channelName = call.agora_channel_name || `careconnect_${Date.now()}`;
        const updatedCall = {
            ...call,
            status: 'accepted',
            agora_channel_name: channelName,
            assigned_doctor_id: user.id || 'doc-on-duty'
        };

        setActiveCall(updatedCall);
        setRemoteUserJoined(false);

        // 1. Dispatch Calling Webhook (non-blocking)
        triggerCallingWebhook({
            ...updatedCall,
            doctor_name: doc.name,
            hospital_name: hospitalName
        }).then(res => {
            if (res && res.success) {
                setWebhookNotified(true);
            }
        }).catch(err => {
            console.warn('Calling webhook note:', err);
        });

        // 2. Update Supabase call_details sheet
        try {
            await updateCallStatus(call.call_id, 'accepted', {
                agora_channel_name: channelName,
                assigned_doctor_id: user.id || 'doc-on-duty'
            });
            toast.success(`Connected to CareConnect room for ${call.patient_name || 'Patient'}`);
        } catch (e) {
            console.error('Error starting call:', e);
        }

        // 3. Connect to live Agora RTC session
        try {
            const session = await joinAgoraSession({
                channelName,
                appId: AGORA_APP_ID,
                onRemoteUserJoined: (remoteUser, mediaType) => {
                    setRemoteUserJoined(true);
                    if (mediaType === 'video' && remoteVideoRef.current && remoteUser.videoTrack) {
                        remoteUser.videoTrack.play(remoteVideoRef.current);
                    }
                    if (mediaType === 'audio' && remoteUser.audioTrack) {
                        remoteUser.audioTrack.play();
                    }
                },
                onRemoteUserLeft: () => {
                    setRemoteUserJoined(false);
                }
            });

            if (session.hasLocalVideo && localVideoRef.current && session.localVideoTrack) {
                session.localVideoTrack.play(localVideoRef.current);
                setHasLocalVideoTrack(true);
            }
            setHasLocalAudioTrack(session.hasLocalAudio);
        } catch (agoraErr) {
            console.warn('Agora media session note:', agoraErr.message);
        }

        setTimeout(() => {
            setSessionConnecting(false);
        }, 1000);
    };

    // End Call
    const handleEndCall = async () => {
        if (!activeCall) return;

        await leaveAgoraSession();
        setHasLocalVideoTrack(false);
        setHasLocalAudioTrack(false);
        setRemoteUserJoined(false);
        setWebhookNotified(false);

        try {
            // Update in Supabase call_details sheet
            await updateCallStatus(activeCall.call_id, 'completed');
            toast.success('Consultation session saved as Completed in call_details!');
        } catch (e) {
            console.error('Error ending call:', e);
        }

        setActiveCall(null);
        setConnectingDoctor(null);
        setSessionConnecting(false);
    };

    const handleToggleMute = async () => {
        const next = !isMuted;
        setIsMuted(next);
        await setAgoraMuted(next);
        toast(next ? 'Microphone muted' : 'Microphone active', { icon: next ? '🔇' : '🎙️' });
    };

    const handleToggleVideo = async () => {
        const next = !isVideoOff;
        setIsVideoOff(next);
        await setAgoraVideoOff(next);
        toast(next ? 'Camera paused' : 'Camera active', { icon: next ? '📷' : '📹' });
    };

    // Join with direct code or PIN
    const handleDirectJoin = () => {
        if (!directRoomInput.trim()) {
            toast.error('Please enter a Room PIN or Agora Channel Name');
            return;
        }

        const input = directRoomInput.trim();
        // Check if there is an existing call with this channel name or call_id
        const matched = (callDetails || []).find(c =>
            (c.agora_channel_name && c.agora_channel_name.toLowerCase() === input.toLowerCase()) ||
            (c.call_id && c.call_id.toLowerCase().includes(input.toLowerCase())) ||
            (c.patient_mobile && c.patient_mobile.includes(input))
        );

        if (matched) {
            handleStartCall(matched);
            setDirectRoomInput('');
        } else {
            // Join as ad-hoc live consultation
            const tempCall = {
                call_id: 'custom-' + Date.now(),
                patient_name: 'Patient (Room: ' + input + ')',
                patient_mobile: 'N/A',
                consultation_type: 'Video Call',
                specialist_category: 'General Physician',
                agora_channel_name: input.startsWith('careconnect_') ? input : `careconnect_${input}`,
                status: 'accepted'
            };
            handleStartCall(tempCall);
            setDirectRoomInput('');
        }
    };

    // Handle Quick New Call creation in call_details
    const handleCreateNewCall = async (e) => {
        e.preventDefault();
        if (!newCallForm.patient_name) {
            toast.error('Patient name is required');
            return;
        }

        setIsSubmittingNewCall(true);
        try {
            const channel = `careconnect_${Date.now()}`;
            const res = await createCallRecord({
                ...newCallForm,
                selected_hospital: hospitalName,
                status: 'pending',
                agora_channel_name: channel
            });

            if (res.success) {
                toast.success('Teleconsultation request added to call_details sheet!');
                setShowNewCallModal(false);
                setNewCallForm({
                    patient_name: '',
                    patient_mobile: '',
                    patient_email: '',
                    location: '',
                    specialist_category: 'General Physician',
                    consultation_type: 'Video Call',
                    preferred_date: new Date().toISOString().split('T')[0],
                    preferred_time: '10:00:00'
                });
            } else {
                toast.error('Failed to create call in Supabase');
            }
        } catch (err) {
            toast.error('Error saving call: ' + err.message);
        } finally {
            setIsSubmittingNewCall(false);
        }
    };

    // Navigate to issue prescription for this patient
    const handlePrescribe = (patientName, patientPhone) => {
        navigate(`/prescription?patient=${encodeURIComponent(patientName || '')}&phone=${encodeURIComponent(patientPhone || '')}`);
    };

    // Copy room ID
    const copyChannelName = (name) => {
        if (!name) return;
        navigator.clipboard.writeText(name);
        toast.success(`Copied room code: ${name}`);
    };

    if (!user) return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderTopColor: '#7C3AED' }}></div>
        </div>
    );

    return (
        <div style={{ paddingBottom: '60px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <Tag icon={VideoCamera} label="CareConnect Telemedicine • Live Consultations" />
                    <h1 style={S.h2}>CareConnect — Live Video Consultancy</h1>
                    <p style={S.sub}>
                        Instant face-to-face teleconsultation with {hospitalName} specialists. High-definition video with live status syncing, room encryption, and instant electronic prescriptions.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={() => fetchCallDetails()}
                        className="btn btn-secondary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                        title="Refresh Queue"
                    >
                        <ArrowClockwise size={18} /> Refresh
                    </button>

                    <button
                        onClick={() => setShowNewCallModal(true)}
                        className="btn btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#7C3AED',
                            borderColor: '#7C3AED',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={18} weight="bold" /> Schedule / Instant Call
                    </button>
                </div>
            </div>

            {/* Stat Cards from call_details */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
            }}>
                <div style={{ ...S.card, padding: '18px 22px', borderLeft: '4px solid #7C3AED' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted,#64748B)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Total Teleconsultations
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main,#1F2937)' }}>{totalCallsCount}</span>
                        <span style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 700, background: 'rgba(124,58,237,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                            All Sessions
                        </span>
                    </div>
                </div>

                <div style={{ ...S.card, padding: '18px 22px', borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted,#64748B)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Waiting in Queue
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706' }}>{pendingCallsCount}</span>
                        {pendingCallsCount > 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', animation: 'pulse 1.5s infinite' }}></span>
                                Needs Doctor
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ ...S.card, padding: '18px 22px', borderLeft: '4px solid #2563EB' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted,#64748B)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        In Session / Accepted
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#2563EB' }}>{acceptedCallsCount}</span>
                        <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600 }}>Active Rooms</span>
                    </div>
                </div>

                <div style={{ ...S.card, padding: '18px 22px', borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted,#64748B)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Completed Consultations
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>{completedCallsCount}</span>
                        <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>Archived</span>
                    </div>
                </div>
            </div>

            {/* Live Interactive Video Call Console (When Active) */}
            {activeCall && (
                <div style={{
                    marginBottom: '32px',
                    borderRadius: '20px',
                    background: '#0B0F19',
                    border: '2px solid #7C3AED',
                    boxShadow: '0 16px 40px -8px rgba(124, 58, 237, 0.4)',
                    overflow: 'hidden',
                    color: 'white'
                }}>
                    {/* Top Call Bar */}
                    <div style={{
                        padding: '16px 24px',
                        background: 'rgba(255,255,255,0.06)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '12px',
                                background: '#7C3AED', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <VideoCamera size={24} weight="fill" color="white" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>
                                        CareConnect Room: {activeCall.patient_name || 'Telehealth Patient'}
                                    </h3>
                                    <span style={{
                                        background: 'rgba(52, 211, 153, 0.2)',
                                        color: '#34D399',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399' }} /> LIVE
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '2px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <span>Phone: {activeCall.patient_mobile || 'N/A'}</span>
                                    <span>•</span>
                                    <span>Specialist: {activeCall.specialist_category || 'General Physician'}</span>
                                    <span>•</span>
                                    <span
                                        onClick={() => copyChannelName(activeCall.agora_channel_name)}
                                        style={{ cursor: 'pointer', color: '#A78BFA', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                        title="Click to copy channel"
                                    >
                                        Room: {activeCall.agora_channel_name || 'N/A'} <Copy size={13} />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                background: 'rgba(0,0,0,0.4)',
                                padding: '6px 14px',
                                borderRadius: '999px',
                                fontFamily: 'monospace',
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#F43F5E',
                                border: '1px solid rgba(244, 63, 94, 0.3)'
                            }}>
                                {formatTime(callDuration)}
                            </div>

                            <button
                                onClick={handleEndCall}
                                style={{
                                    background: '#DC2626',
                                    color: 'white',
                                    border: 'none',
                                    padding: '9px 18px',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                                }}
                            >
                                <PhoneDisconnect size={18} weight="bold" /> End Call
                            </button>
                        </div>
                    </div>

                    {/* Main Screen Viewport */}
                    {sessionConnecting ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: '#7C3AED', margin: '0 auto 16px' }}></div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>Connecting to Video Session...</h4>
                            <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>Establishing encrypted clinical video stream ({activeCall.agora_channel_name})</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', minHeight: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', overflow: 'hidden' }}>
                            {/* Real Agora Remote Video Stream Layer */}
                            <div
                                ref={remoteVideoRef}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 1,
                                    backgroundColor: '#070A12',
                                    display: remoteUserJoined ? 'block' : 'none'
                                }}
                            />

                            {/* Patient Stage View (Active when patient video is preparing / audio mode) */}
                            {!remoteUserJoined && (
                                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', margin: 'auto 0', padding: '24px 0' }}>
                                    <div style={{
                                        width: 104, height: 104, borderRadius: '50%',
                                        background: isVideoOff ? '#334155' : 'linear-gradient(135deg, #7C3AED, #2563EB)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 16px',
                                        fontSize: '2.2rem', fontWeight: 800,
                                        border: '3px solid rgba(255,255,255,0.2)',
                                        boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)'
                                    }}>
                                        {isVideoOff ? <VideoCameraSlash size={40} color="#94A3B8" /> : (activeCall.patient_name ? activeCall.patient_name.slice(0, 2).toUpperCase() : 'PT')}
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: 'white' }}>
                                        {activeCall.patient_name || 'Patient'}
                                    </h3>
                                    <p style={{ color: '#94A3B8', fontSize: '0.88rem', margin: '0 0 14px' }}>
                                        {activeCall.location || 'Remote Consultation'} • {activeCall.consultation_type || 'Video Call'}
                                    </p>

                                    <div style={{ display: 'inline-flex', gap: '14px', alignItems: 'center', background: 'rgba(255,255,255,0.08)', padding: '8px 18px', borderRadius: '999px', fontSize: '0.82rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399' }}>
                                            <Pulse size={16} weight="bold" /> Agora Channel: {activeCall.agora_channel_name}
                                        </span>
                                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93C5FD' }}>
                                            <ShieldCheck size={16} weight="bold" /> AES-256 Encrypted
                                        </span>
                                        {webhookNotified && (
                                            <>
                                                <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                                                <span style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CheckCircle size={14} weight="fill" /> Webhook Dispatched
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Floating Doctor PIP (Picture-In-Picture with live webcam stream) */}
                            <div style={{
                                position: 'absolute',
                                bottom: '24px',
                                right: '24px',
                                width: '170px',
                                height: '118px',
                                background: '#1E293B',
                                borderRadius: '12px',
                                border: '2px solid rgba(255,255,255,0.25)',
                                overflow: 'hidden',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                                zIndex: 10
                            }}>
                                {/* Live Local Doctor Webcam Track */}
                                <div
                                    ref={localVideoRef}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: (!isVideoOff && hasLocalVideoTrack) ? 'block' : 'none'
                                    }}
                                />

                                {/* Fallback Doctor Graphic when camera is muted/off */}
                                {(isVideoOff || !hasLocalVideoTrack) && (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '6px'
                                    }}>
                                        <div style={{
                                            width: 42, height: 42, borderRadius: '50%',
                                            background: '#7C3AED', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '1rem', marginBottom: '4px',
                                            color: 'white'
                                        }}>
                                            {isVideoOff ? <VideoCameraSlash size={20} /> : (connectingDoctor?.avatar || 'DOC')}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                                            {connectingDoctor?.name?.split(' ')[1] || 'Doctor (You)'}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: isVideoOff ? '#EF4444' : (hasLocalAudioTrack ? '#10B981' : '#94A3B8') }}>
                                            {isVideoOff ? 'Cam Off' : (hasLocalVideoTrack ? 'Cam Active' : 'Mic Active')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Live Patient Vitals Overlay HUD */}
                            {showVitals && (
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '24px',
                                    background: 'rgba(15, 23, 42, 0.85)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    gap: '16px',
                                    fontSize: '0.8rem',
                                    zIndex: 10
                                }}>
                                    <div>
                                        <div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600 }}>Heart Rate</div>
                                        <div style={{ color: '#F43F5E', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Heartbeat size={14} weight="fill" /> 74 bpm
                                        </div>
                                    </div>
                                    <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                                    <div>
                                        <div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600 }}>Blood Pressure</div>
                                        <div style={{ color: '#38BDF8', fontWeight: 800 }}>120/80</div>
                                    </div>
                                    <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                                    <div>
                                        <div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600 }}>SpO2</div>
                                        <div style={{ color: '#34D399', fontWeight: 800 }}>99%</div>
                                    </div>
                                    <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                                    <div>
                                        <div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 600 }}>Temp</div>
                                        <div style={{ color: '#FBBF24', fontWeight: 800 }}>98.4°F</div>
                                    </div>
                                </div>
                            )}

                            {/* In-Call Controls Toolbar */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '14px',
                                marginTop: '20px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.06)',
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)',
                                position: 'relative',
                                zIndex: 10
                            }}>
                                <button
                                    onClick={handleToggleMute}
                                    style={{
                                        width: 44, height: 44, borderRadius: '50%',
                                        background: isMuted ? '#EF4444' : 'rgba(255,255,255,0.15)',
                                        border: 'none', color: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                                >
                                    {isMuted ? <MicrophoneSlash size={22} weight="bold" /> : <Microphone size={22} weight="bold" />}
                                </button>

                                <button
                                    onClick={handleToggleVideo}
                                    style={{
                                        width: 44, height: 44, borderRadius: '50%',
                                        background: isVideoOff ? '#EF4444' : 'rgba(255,255,255,0.15)',
                                        border: 'none', color: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                                >
                                    {isVideoOff ? <VideoCameraSlash size={22} weight="bold" /> : <VideoCamera size={22} weight="bold" />}
                                </button>

                                <button
                                    onClick={() => setShowVitals(!showVitals)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        background: showVitals ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.1)',
                                        color: showVitals ? '#38BDF8' : 'white',
                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                        cursor: 'pointer',
                                        fontSize: '0.84rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Pulse size={16} weight="bold" /> Vitals HUD
                                </button>

                                <button
                                    onClick={() => handlePrescribe(activeCall.patient_name, activeCall.patient_mobile)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        color: '#34D399',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        cursor: 'pointer',
                                        fontSize: '0.84rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Pill size={16} weight="bold" /> Issue Prescription
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Live Banner & Direct Room Code Join */}
            <div style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 55%, #2563EB 100%)',
                padding: '30px 34px',
                color: 'white',
                marginBottom: '32px',
                boxShadow: '0 12px 32px -8px rgba(124, 58, 237, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.16)', padding: '5px 14px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 10px #34D399' }}></span>
                        CARECONNECT CLINIC ACTIVE
                    </div>
                    <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'white', marginBottom: '8px', lineHeight: 1.25 }}>
                        {pendingCallsCount > 0 ? `${pendingCallsCount} Patient(s) Waiting in Telemedicine Queue` : 'All Telehealth Consultations Up to Date'}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                        Accept incoming video calls from the queue below, or input a 6-digit PIN / room code to enter a session room.
                    </p>
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <input
                            type="text"
                            placeholder="e.g. careconnect_176867... or PIN"
                            value={directRoomInput}
                            onChange={(e) => setDirectRoomInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDirectJoin()}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                padding: '10px 14px',
                                outline: 'none',
                                fontSize: '0.88rem',
                                minWidth: '220px'
                            }}
                        />
                        <button
                            onClick={handleDirectJoin}
                            style={{
                                background: 'white',
                                color: '#7C3AED',
                                fontWeight: 800,
                                padding: '10px 18px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.88rem'
                            }}
                        >
                            Join Room
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Section: Supabase call_details Management & Specialists */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '28px', marginBottom: '36px' }}>
                {/* Left Column: Call Details Table / List */}
                <div style={S.card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main,#1F2937)', margin: '0 0 4px 0' }}>
                                Teleconsultations & Live Queue
                            </h3>
                            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted,#64748B)', margin: 0 }}>
                                Live incoming requests and scheduled teleconsultation sessions
                            </p>
                        </div>

                        {/* Search Input */}
                        <div style={{ position: 'relative', width: '220px' }}>
                            <MagnifyingGlass size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search patient, room..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '7px 12px 7px 32px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color, #E2E8F0)',
                                    background: 'var(--bg-color, #F8FAFC)',
                                    fontSize: '0.84rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        borderBottom: '1px solid var(--border-color,#E2E8F0)',
                        paddingBottom: '12px',
                        marginBottom: '18px',
                        overflowX: 'auto'
                    }}>
                        {[
                            { key: 'all', label: `All (${totalCallsCount})` },
                            { key: 'pending', label: `Waiting Queue (${pendingCallsCount})`, badge: pendingCallsCount > 0 },
                            { key: 'accepted', label: `In Session (${acceptedCallsCount})` },
                            { key: 'completed', label: `Completed (${completedCallsCount})` }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    background: activeTab === tab.key ? '#7C3AED' : 'transparent',
                                    color: activeTab === tab.key ? 'white' : 'var(--text-muted,#64748B)',
                                    border: 'none',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.84rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {tab.label}
                                {tab.badge && (
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }}></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Calls List */}
                    {callsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="spinner" style={{ width: '2rem', height: '2rem', borderTopColor: '#7C3AED', margin: '0 auto 12px' }}></div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted,#64748B)' }}>Loading calls from Supabase...</div>
                        </div>
                    ) : filteredCalls.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-color,#F8FAFC)', borderRadius: '12px', border: '1px dashed var(--border-color,#E2E8F0)' }}>
                            <VideoCamera size={36} color="#94A3B8" weight="duotone" style={{ margin: '0 auto 10px' }} />
                            <div style={{ fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '4px' }}>No teleconsultation calls found</div>
                            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted,#64748B)', marginBottom: '16px' }}>
                                {searchQuery ? 'Try matching another patient or room term' : 'There are no calls matching this filter in call_details'}
                            </div>
                            <button
                                onClick={() => setShowNewCallModal(true)}
                                className="btn btn-primary"
                                style={{ background: '#7C3AED', borderColor: '#7C3AED', fontSize: '0.84rem', padding: '8px 16px', borderRadius: '8px' }}
                            >
                                <Plus size={16} weight="bold" /> Schedule a Call
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredCalls.map(call => {
                                const isPending = call.status === 'pending';
                                const isAccepted = call.status === 'accepted' || call.status === 'active' || call.status === 'in-progress';
                                const isCompleted = call.status === 'completed';

                                const statusBg = isPending ? '#FEF3C7' : isAccepted ? '#DBEAFE' : '#D1FAE5';
                                const statusColor = isPending ? '#D97706' : isAccepted ? '#2563EB' : '#059669';
                                const statusLabel = isPending ? 'Waiting in Queue' : isAccepted ? 'In Session / Accepted' : 'Completed';

                                return (
                                    <div
                                        key={call.call_id}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            background: 'var(--bg-color, #F8FAFC)',
                                            border: `1.5px solid ${isPending ? '#FDE68A' : 'var(--border-color, #E2E8F0)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '14px',
                                            transition: 'border-color 0.15s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: '12px',
                                                background: isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(124, 58, 237, 0.12)',
                                                color: isPending ? '#D97706' : '#7C3AED',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: '0.94rem'
                                            }}>
                                                {call.patient_name ? call.patient_name.slice(0, 2).toUpperCase() : 'PT'}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-main,#1F2937)' }}>
                                                        {call.patient_name || 'Anonymous Patient'}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 700,
                                                        background: statusBg,
                                                        color: statusColor,
                                                        padding: '2px 8px',
                                                        borderRadius: '999px'
                                                    }}>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted,#64748B)', marginTop: '2px' }}>
                                                    {call.patient_mobile || 'No Mobile'} • {call.specialist_category || 'General Physician'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                                                    {call.preferred_date || 'Today'} at {call.preferred_time || '10:00 AM'}
                                                    {call.location ? ` • ${call.location}` : ''}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {/* Channel Name badge */}
                                            {call.agora_channel_name && (
                                                <div
                                                    onClick={() => copyChannelName(call.agora_channel_name)}
                                                    style={{
                                                        background: 'rgba(124,58,237,0.08)',
                                                        color: '#7C3AED',
                                                        fontSize: '0.74rem',
                                                        fontWeight: 700,
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                    title="Click to copy room code"
                                                >
                                                    <Broadcast size={13} /> {call.agora_channel_name.length > 20 ? call.agora_channel_name.slice(0, 16) + '...' : call.agora_channel_name}
                                                </div>
                                            )}

                                            {isPending && (
                                                <button
                                                    onClick={() => handleStartCall(call)}
                                                    className="btn btn-primary"
                                                    style={{
                                                        background: '#7C3AED',
                                                        borderColor: '#7C3AED',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.84rem',
                                                        fontWeight: 700,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <VideoCamera size={16} weight="fill" /> Accept & Call
                                                </button>
                                            )}

                                            {isAccepted && (
                                                <button
                                                    onClick={() => handleStartCall(call)}
                                                    className="btn btn-primary"
                                                    style={{
                                                        background: '#2563EB',
                                                        borderColor: '#2563EB',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.84rem',
                                                        fontWeight: 700,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <VideoCamera size={16} weight="fill" /> Join Session
                                                </button>
                                            )}

                                            {!isCompleted && (
                                                <button
                                                    onClick={() => updateCallStatus(call.call_id, 'completed').then(() => toast.success('Consultation marked completed!'))}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #10B981',
                                                        color: '#10B981',
                                                        padding: '7px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Mark consultation completed"
                                                >
                                                    <Check size={16} weight="bold" /> Complete
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handlePrescribe(call.patient_name, call.patient_mobile)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid var(--border-color,#E2E8F0)',
                                                    color: 'var(--text-muted,#64748B)',
                                                    padding: '7px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer'
                                                }}
                                                title="Issue prescription for patient"
                                            >
                                                <Pill size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column: Telehealth Doctors on Duty & Direct Join */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Available Specialists Roster */}
                    <div style={S.card}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main,#1F2937)', marginBottom: '3px' }}>
                                    Telehealth Specialists On Duty
                                </h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted,#64748B)', margin: 0 }}>
                                    Physicians ready to accept patient calls
                                </p>
                            </div>
                            <Stethoscope size={22} color="#7C3AED" weight="duotone" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {onlineDoctors.map((doc) => (
                                <div
                                    key={doc.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        background: 'var(--bg-color,#F8FAFC)',
                                        border: '1px solid var(--border-color,#E2E8F0)',
                                        gap: '10px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: '10px',
                                            background: 'rgba(124,58,237,0.12)', color: '#7C3AED',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '0.85rem'
                                        }}>
                                            {doc.avatar}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main,#1F2937)' }}>
                                                {doc.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted,#64748B)' }}>
                                                {doc.role.split('(')[0]}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: doc.statusColor }}>
                                            {doc.status}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted,#94A3B8)' }}>
                                            {doc.waitTime}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Teleconsultation Checklist */}
                    <div style={S.card}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main,#1F2937)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DeviceMobile size={20} color="#7C3AED" weight="bold" /> Clinical Checklist
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { text: 'Ensure patient camera & microphone are tested in lobby' },
                                { text: 'Check recent prescriptions & diagnostic lab records' },
                                { text: 'Record vital signs (Pulse, SpO2, Blood Pressure)' },
                                { text: 'Issue signed digital prescription at session conclusion' }
                            ].map(({ text }, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-main,#374151)' }}>
                                    <CheckCircle size={15} color="#7C3AED" weight="bold" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enterprise Telemedicine Features */}
            <div style={{ marginTop: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--text-main,#1F2937)', marginBottom: '6px' }}>
                        Enterprise Telemedicine Infrastructure
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted,#64748B)', margin: 0 }}>
                        High-reliability WebRTC sessions synced seamlessly with Supabase database
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                    {consultFeatures.map(({ icon: Icon, color, bg, title, desc }) => (
                        <div key={title} style={{ ...S.card, textAlign: 'center', padding: '24px 20px' }}>
                            <div style={{ width: 50, height: 50, borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Icon size={24} color={color} weight="fill" />
                            </div>
                            <h4 style={{ fontWeight: 800, color: 'var(--text-main,#1F2937)', marginBottom: '8px', fontSize: '0.95rem' }}>{title}</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted,#64748B)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal: Add New Call to call_details sheet */}
            {showNewCallModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--card-bg,#fff)',
                        borderRadius: '20px',
                        padding: '28px',
                        width: '100%',
                        maxWidth: '520px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-color,#E2E8F0)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(124,58,237,0.1)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <VideoCamera size={22} weight="fill" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main,#1F2937)' }}>
                                    Schedule / Instant CareConnect Call
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowNewCallModal(false)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted,#64748B)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateNewCall} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '5px' }}>
                                    Patient Name *
                                </label>
                                <input
                                    required
                                    className="form-input"
                                    placeholder="e.g. Diwakaran"
                                    value={newCallForm.patient_name}
                                    onChange={e => setNewCallForm({ ...newCallForm, patient_name: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '5px' }}>
                                        Mobile Number
                                    </label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. 9876543210"
                                        value={newCallForm.patient_mobile}
                                        onChange={e => setNewCallForm({ ...newCallForm, patient_mobile: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '5px' }}>
                                        Patient Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="patient@example.com"
                                        value={newCallForm.patient_email}
                                        onChange={e => setNewCallForm({ ...newCallForm, patient_email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '5px' }}>
                                        Specialty Category
                                    </label>
                                    <select
                                        className="form-input"
                                        value={newCallForm.specialist_category}
                                        onChange={e => setNewCallForm({ ...newCallForm, specialist_category: e.target.value })}
                                    >
                                        <option value="General Physician">General Physician</option>
                                        <option value="Cardiology">Cardiology</option>
                                        <option value="Paediatrics">Paediatrics</option>
                                        <option value="Orthopedics">Orthopedics</option>
                                        <option value="Neurology">Neurology</option>
                                        <option value="Dermatology">Dermatology</option>
                                        <option value="Gynecology">Gynecology</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '5px' }}>
                                        Consultation Type
                                    </label>
                                    <select
                                        className="form-input"
                                        value={newCallForm.consultation_type}
                                        onChange={e => setNewCallForm({ ...newCallForm, consultation_type: e.target.value })}
                                    >
                                        <option value="Video Call">Video Call</option>
                                        <option value="General">General</option>
                                        <option value="Specialist">Specialist</option>
                                        <option value="Emergency Telehealth">Emergency Telehealth</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '5px' }}>
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={newCallForm.preferred_date}
                                        onChange={e => setNewCallForm({ ...newCallForm, preferred_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '5px' }}>
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={newCallForm.preferred_time}
                                        onChange={e => setNewCallForm({ ...newCallForm, preferred_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '5px' }}>
                                    Patient Location (City/Town)
                                </label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. Trichy"
                                    value={newCallForm.location}
                                    onChange={e => setNewCallForm({ ...newCallForm, location: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowNewCallModal(false)}
                                    className="btn btn-secondary"
                                    style={{ padding: '9px 18px', borderRadius: '8px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingNewCall}
                                    className="btn btn-primary"
                                    style={{
                                        background: '#7C3AED',
                                        borderColor: '#7C3AED',
                                        padding: '9px 22px',
                                        borderRadius: '8px',
                                        fontWeight: 700
                                    }}
                                >
                                    {isSubmittingNewCall ? 'Scheduling Call...' : 'Save & Schedule Call'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Consultancy;
