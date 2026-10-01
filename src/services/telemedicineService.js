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
        // Initialize Agora client
        if (!agoraClient) {
            agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        }

        // Listen for remote participants
        agoraClient.on('user-published', async (user, mediaType) => {
            await agoraClient.subscribe(user, mediaType);
            if (onRemoteUserJoined) {
                onRemoteUserJoined(user, mediaType);
            }
        });

        agoraClient.on('user-unpublished', (user, mediaType) => {
            if (onRemoteUserLeft) {
                onRemoteUserLeft(user, mediaType);
            }
        });

        // Join the channel
        const clientUid = await agoraClient.join(appId, channelName, token, uid);

        // Create local camera and microphone tracks
        let localTracksCreated = false;
        try {
            [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
                { encoderConfig: 'music_standard' },
                { encoderConfig: '720p_1' }
            );
            await agoraClient.publish([localAudioTrack, localVideoTrack]);
            localTracksCreated = true;
        } catch (deviceError) {
            console.warn('Microphone/camera access note:', deviceError.message);
            // Even if hardware camera is not available in dev, audio track might be attempted:
            try {
                localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                await agoraClient.publish([localAudioTrack]);
                localTracksCreated = true;
            } catch (micErr) {
                console.warn('Audio-only fallback note:', micErr.message);
            }
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
        await localAudioTrack.setEnabled(!muted);
        return true;
    }
    return false;
}

/**
 * Enable / Disable local video track
 */
export async function setAgoraVideoOff(videoOff) {
    if (localVideoTrack) {
        await localVideoTrack.setEnabled(!videoOff);
        return true;
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
