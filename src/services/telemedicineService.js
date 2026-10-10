import AgoraRTC from 'agora-rtc-sdk-ng';

export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || '0ccc8578a4994635b7da33658c5bc319';
export const CALLING_WEBHOOK_BASE_URL = import.meta.env.VITE_CALLING_WEBHOOK_BASE_URL || 'https://sends-exclusive-compromise-strengthen.trycloudflare.com';

// Disable excessive Agora logging in dev console
AgoraRTC.setLogLevel(3);

let agoraClient = null;
let localAudioTrack = null;
let localVideoTrack = null;

/**
 * Triggers the calling webhook service when a telemedicine call is initiated or accepted
 * Sends patient and channel metadata so external IVR, SIP, or phone bridges can dispatch.
 */
export async function triggerCallingWebhook(callData) {
    if (!CALLING_WEBHOOK_BASE_URL) return { success: false, reason: 'No webhook URL configured' };

    const payload = {
        action: 'call_initiated',
        call_id: callData.call_id || `call_${Date.now()}`,
        patient_name: callData.patient_name || 'Telehealth Patient',
        patient_mobile: callData.patient_mobile || '',
        patient_email: callData.patient_email || '',
        location: callData.location || '',
        specialist_category: callData.specialist_category || 'General Physician',
        consultation_type: callData.consultation_type || 'Video Call',
        agora_channel_name: callData.agora_channel_name || `careconnect_${Date.now()}`,
        agora_app_id: AGORA_APP_ID,
        doctor_name: callData.doctor_name || 'Hospital Doctor',
        hospital_name: callData.hospital_name || 'HelTech Hospital',
        timestamp: new Date().toISOString()
    };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        // Try standard webhook endpoint
        let endpoint = `${CALLING_WEBHOOK_BASE_URL.replace(/\/$/, '')}/api/call`;
        
        let response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        }).catch(async () => {
            // Fallback to base root endpoint if subpath doesn't match
            return await fetch(`${CALLING_WEBHOOK_BASE_URL.replace(/\/$/, '')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            }).catch(() => null);
        });

        clearTimeout(timeoutId);

        if (response && response.ok) {
            console.log('Calling webhook successfully delivered:', payload.agora_channel_name);
            return { success: true, status: response.status };
        } else {
            console.info('Calling webhook returned response status:', response ? response.status : 'offline');
            return { success: false, status: response?.status, offline: true };
        }
    } catch (err) {
        console.warn('Calling webhook notification note (non-blocking):', err.message);
        return { success: false, error: err.message, offline: true };
    }
}

/**
 * Initializes and joins an Agora WebRTC channel
 */
export async function joinAgoraSession({
    channelName,
    appId = AGORA_APP_ID,
    token = null,
    uid = null,
    onRemoteUserJoined,
    onRemoteUserLeft
}) {
    try {
        // Clean up previous client if any before joining new session
        if (agoraClient) {
            try {
                await leaveAgoraSession();
            } catch (_) {}
        }
        agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

        // Autoplay policy failure recovery
        AgoraRTC.onAudioAutoplayFailed = () => {
            console.warn('Audio autoplay failed. Automatically resuming on next interaction.');
            const resumeAudio = () => {
                if (agoraClient && agoraClient.remoteUsers) {
                    agoraClient.remoteUsers.forEach(u => {
                        if (u.audioTrack) u.audioTrack.play();
                    });
                }
            };
            window.addEventListener('click', resumeAudio, { once: true });
            window.addEventListener('touchstart', resumeAudio, { once: true });
        };

        // Listen for remote participants publishing media
        agoraClient.on('user-published', async (user, mediaType) => {
            try {
                await agoraClient.subscribe(user, mediaType);
                if (mediaType === 'audio' && user.audioTrack) {
                    user.audioTrack.setVolume(100);
                    user.audioTrack.play();
                }
                if (onRemoteUserJoined) {
                    onRemoteUserJoined(user, mediaType);
                }
            } catch (subErr) {
                console.warn('Subscription error for remote user:', subErr);
            }
        });

        agoraClient.on('user-unpublished', (user, mediaType) => {
            if (onRemoteUserLeft) {
                onRemoteUserLeft(user, mediaType);
            }
        });

        // Join the channel
        const clientUid = await agoraClient.join(appId, channelName, token, uid);

        // Check if any remote participants are already in channel and subscribe immediately
        if (agoraClient.remoteUsers && agoraClient.remoteUsers.length > 0) {
            for (const rUser of agoraClient.remoteUsers) {
                if (rUser.hasAudio) {
                    try {
                        await agoraClient.subscribe(rUser, 'audio');
                        if (rUser.audioTrack) {
                            rUser.audioTrack.setVolume(100);
                            rUser.audioTrack.play();
                        }
                        if (onRemoteUserJoined) onRemoteUserJoined(rUser, 'audio');
                    } catch (_) {}
                }
                if (rUser.hasVideo) {
                    try {
                        await agoraClient.subscribe(rUser, 'video');
                        if (onRemoteUserJoined) onRemoteUserJoined(rUser, 'video');
                    } catch (_) {}
                }
            }
        }

        // Create local camera and microphone tracks with optimal clinical audio processing
        let localTracksCreated = false;
        try {
            // High-clarity clinical speech with AEC (Echo Cancellation), AGC (Gain Control), and ANS (Noise Suppression)
            localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: 'speech_standard',
                AEC: true,
                AGC: true,
                ANS: true
            });
            localAudioTrack.setVolume(100);
            await localAudioTrack.setEnabled(true);
        } catch (micError) {
            console.warn('Microphone hardware access note:', micError.message);
        }

        try {
            localVideoTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: '720p_1',
                optimizationMode: 'detail'
            });
            await localVideoTrack.setEnabled(true);
        } catch (camError) {
            console.warn('Camera hardware access note:', camError.message);
        }

        // Publish available local tracks to remote participant
        const tracksToPublish = [localAudioTrack, localVideoTrack].filter(Boolean);
        if (tracksToPublish.length > 0) {
            await agoraClient.publish(tracksToPublish);
            localTracksCreated = true;
        }

        return {
            client: agoraClient,
            uid: clientUid,
            localTracksCreated,
            hasLocalVideo: !!localVideoTrack,
            hasLocalAudio: !!localAudioTrack,
            localVideoTrack,
            localAudioTrack
        };
    } catch (err) {
        console.error('Agora join session error:', err);
        throw err;
    }
}

/**
 * Mute / Unmute local audio track
 */
export async function setAgoraMuted(muted) {
    if (localAudioTrack) {
        try {
            if (typeof localAudioTrack.setMuted === 'function') {
                await localAudioTrack.setMuted(muted);
            } else {
                await localAudioTrack.setEnabled(!muted);
            }
            return true;
        } catch (_) {
            await localAudioTrack.setEnabled(!muted);
            return true;
        }
    }
    return false;
}

/**
 * Enable / Disable local video track
 */
export async function setAgoraVideoOff(videoOff) {
    if (localVideoTrack) {
        try {
            if (typeof localVideoTrack.setMuted === 'function') {
                await localVideoTrack.setMuted(videoOff);
            } else {
                await localVideoTrack.setEnabled(!videoOff);
            }
            return true;
        } catch (_) {
            await localVideoTrack.setEnabled(!videoOff);
            return true;
        }
    }
    return false;
}

/**
 * Leave Agora session and close hardware tracks
 */
export async function leaveAgoraSession() {
    try {
        if (localAudioTrack) {
            localAudioTrack.stop();
            localAudioTrack.close();
            localAudioTrack = null;
        }
        if (localVideoTrack) {
            localVideoTrack.stop();
            localVideoTrack.close();
            localVideoTrack = null;
        }
        if (agoraClient) {
            await agoraClient.leave();
            agoraClient.removeAllListeners();
            agoraClient = null;
        }
    } catch (e) {
        console.warn('Error leaving Agora session:', e);
    }
}
