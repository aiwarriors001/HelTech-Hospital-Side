import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const DEFAULT_PATIENTS = [
    { id: 'P-101', name: 'John Doe', age: 34, gender: 'Male', bloodGroup: 'O+', lastVisit: '2023-10-24', status: 'Active' },
    { id: 'P-102', name: 'Sarah Smith', age: 28, gender: 'Female', bloodGroup: 'A-', lastVisit: '2023-10-22', status: 'Active' },
    { id: 'P-103', name: 'Michael Brown', age: 45, gender: 'Male', bloodGroup: 'B+', lastVisit: '2023-10-20', status: 'Recovered' },
    { id: 'P-104', name: 'Emily Davis', age: 62, gender: 'Female', bloodGroup: 'AB+', lastVisit: '2023-10-18', status: 'Active' },
    { id: 'P-105', name: 'Robert Wilson', age: 50, gender: 'Male', bloodGroup: 'O-', lastVisit: '2023-10-15', status: 'Follow-up' },
];

export const DataProvider = ({ children }) => {
    // --- Prescriptions Logic ---
    const [prescriptions, setPrescriptions] = useState([]);

    const fetchPrescriptions = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('prescriptions')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                const formatted = data.map(item => {
                    // Extract diagnosis and advice if previously formatted into instructions string
                    let diag = item.diagnosis || item.disease || '';
                    let advice = item.doctor_advice || item.instructions || item.note || '';

                    if (!diag && advice && advice.startsWith('[Diagnosis:')) {
                        const match = advice.match(/^\[Diagnosis:\s*([^\]]+)\]\s*(.*)$/s);
                        if (match) {
                            diag = match[1].trim();
                            advice = match[2].trim();
                        }
                    }

                    if (!diag) diag = 'General Clinical Consultation';
                    if (!advice) advice = 'Take medications on time as directed with water.';

                    const meds = item.prescribed_medicines || item.medicine_name || 'Prescribed Regimen';
                    const assignedDate = item.assigned_on || (item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
                    const rxCode = item.prescription || (item.id ? `RX-${item.id.replace(/-/g, '').slice(0, 6).toUpperCase()}` : `RX-${Date.now().toString().slice(-6)}`);
                    const docName = item.doctor_name || item.doctor || 'Dr. Sarah Jenkins';
                    const medTiming = item.timing || item.timings || item.dosage_timings || 'Morning & Night (After Food)';

                    return {
                        id: item.id,
                        patientId: item.patient_id || 'N/A',
                        patientName: item.patient_name || 'Patient',
                        doctor: docName,
                        doctorName: docName,
                        diagnosis: diag,
                        assignedOn: assignedDate,
                        prescription: rxCode,
                        prescribedMedicines: meds,
                        timing: medTiming,
                        time: medTiming,
                        doctorAdvice: advice,
                        // Backward-compatible properties:
                        name: meds,
                        dose: item.dosage || 'As directed',
                        duration: item.duration || '5 Days',
                        note: advice,
                        instructions: advice,
                        timestamp: item.created_at || new Date().toISOString(),
                        raw: item
                    };
                });
                setPrescriptions(formatted);
                localStorage.setItem('prescriptions', JSON.stringify(formatted));
            } else {
                const saved = localStorage.getItem('prescriptions');
                if (saved) setPrescriptions(JSON.parse(saved));
            }
        } catch (error) {
            console.warn('Prescriptions fetch warning:', error);
            const saved = localStorage.getItem('prescriptions');
            if (saved) setPrescriptions(JSON.parse(saved));
        }
    }, []);

    const addPrescription = async (prescription) => {
        const tempId = crypto.randomUUID();
        const assignedDate = prescription.assignedOn || prescription.assigned_on || new Date().toISOString().split('T')[0];
        const rxCode = prescription.prescription || `RX-${Math.floor(100000 + Math.random() * 900000)}`;
        const docName = prescription.doctor || prescription.doctor_name || 'Dr. Sarah Jenkins';
        const patientName = prescription.patientName || prescription.patient_name || 'Patient';
        const diag = prescription.diagnosis || prescription.disease || 'General Consultation';
        const meds = prescription.prescribedMedicines || prescription.prescribed_medicines || prescription.name || 'Prescribed Regimen';
        const medTiming = prescription.timing || prescription.timings || prescription.time || 'Morning & Night (After Food)';
        const advice = prescription.doctorAdvice || prescription.doctor_advice || prescription.note || prescription.instructions || 'Take as advised with water.';
        const patientUHID = prescription.patientId || prescription.patient_id || 'P-' + Math.floor(100 + Math.random() * 900);

        const newPrescription = {
            id: tempId,
            patientId: patientUHID,
            patientName,
            doctor: docName,
            doctorName: docName,
            diagnosis: diag,
            assignedOn: assignedDate,
            prescription: rxCode,
            prescribedMedicines: meds,
            timing: medTiming,
            time: medTiming,
            doctorAdvice: advice,
            name: meds,
            dose: prescription.dose || 'As advised',
            duration: prescription.duration || '5 Days',
            note: advice,
            instructions: advice,
            timestamp: new Date().toISOString()
        };

        // Optimistic UI update
        const updated = [newPrescription, ...prescriptions];
        setPrescriptions(updated);
        localStorage.setItem('prescriptions', JSON.stringify(updated));

        // Insert into Supabase table
        try {
            // Attempt 1: Full payload unifying prescribed_medicines and timing
            const fullPayload = {
                patient_id: patientUHID,
                patient_name: patientName,
                doctor_name: docName,
                diagnosis: diag,
                assigned_on: assignedDate,
                prescription: rxCode,
                prescribed_medicines: meds,
                timing: medTiming,
                doctor_advice: advice,
                medicine_name: meds,
                dosage: prescription.dose || 'Standard',
                duration: prescription.duration || '5 Days',
                instructions: `[Diagnosis: ${diag}] [Timing: ${medTiming}] ${advice}`.trim()
            };

            let { data, error } = await supabase
                .from('prescriptions')
                .insert([fullPayload])
                .select();

            // If medicine_name column was dropped from Supabase or schema was altered to only have prescribed_medicines:
            if (error && (error.message?.includes('medicine_name') || error.message?.includes('column') || error.message?.includes('schema cache'))) {
                console.info('Retrying insert without legacy medicine_name column...');
                const singleMedPayload = {
                    patient_id: patientUHID,
                    patient_name: patientName,
                    doctor_name: docName,
                    diagnosis: diag,
                    assigned_on: assignedDate,
                    prescription: rxCode,
                    prescribed_medicines: meds,
                    timing: medTiming,
                    doctor_advice: advice,
                    dosage: prescription.dose || 'Standard',
                    duration: prescription.duration || '5 Days',
                    instructions: `[Diagnosis: ${diag}] [Timing: ${medTiming}] ${advice}`.trim()
                };
                const retryRes = await supabase
                    .from('prescriptions')
                    .insert([singleMedPayload])
                    .select();
                data = retryRes.data;
                error = retryRes.error;
            }

            if (!error && data && data[0]) {
                fetchPrescriptions();
            } else if (error) {
                console.warn('Prescription insert note:', error.message);
            }
        } catch (e) {
            console.warn('Supabase prescription error:', e.message);
        }

        return newPrescription;
    };

    const getPrescriptionsByPatient = (patientId) => {
        return prescriptions.filter(p => p.patientId === patientId);
    };

    const getAllPrescriptions = () => {
        return prescriptions;
    };

    // --- Patients Logic ---
    const [patients, setPatients] = useState(DEFAULT_PATIENTS);

    const fetchPatients = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                const formatted = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    age: item.age,
                    gender: item.gender,
                    bloodGroup: item.blood_group,
                    lastVisit: item.last_visit,
                    status: item.status || 'Active',
                    phone: item.phone,
                    address: item.address
                }));
                setPatients(formatted);
            }
        } catch (err) {
            console.warn('Patients fetch warning:', err);
        }
    }, []);

    const getAllPatients = () => patients;

    // --- Appointments Logic ---
    const [appointments, setAppointments] = useState([]);
    const [realTimePatientCount, setRealTimePatientCount] = useState(0);

    const fetchAppointments = useCallback(async () => {
        try {
            // Fetch from the existing appointments table
            let res = await supabase
                .from('appointments')
                .select('*')
                .order('appointment_date', { ascending: true });

            // If table is named 'appointment' (singular), fallback to it
            if (res.error && res.error.message?.includes('does not exist')) {
                res = await supabase
                    .from('appointment')
                    .select('*');
            }

            if (res.error) throw res.error;

            if (res.data) {
                const formatted = res.data.map(item => {
                    const dateVal = item.appointment_date || item.date || (item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
                    const timeVal = item.appointment_time || item.time || '10:00:00';
                    const dateTimeString = `${dateVal}T${timeVal}`;

                    return {
                        id: item.appointment_id || item.id,
                        patientName: item.patient_name || item.patientName || item.name || 'Unknown Patient',
                        patientId: item.patient_phone || item.patient_id || item.phone || 'N/A',
                        contactNumber: item.patient_phone || item.phone || item.mobile || 'N/A',
                        time: dateTimeString,
                        date: dateVal,
                        timeStr: timeVal,
                        reason: item.doctor_name ? `Dr. ${item.doctor_name}` : (item.doctor || item.reason || 'General Visit'),
                        doctor: item.doctor_name || item.doctor || 'Dr. Sarah Jenkins',
                        symptoms: item.symptoms || item.reason || 'Not specified',
                        specialist: item.specialist || item.department || item.specialty || 'General Physician',
                        status: item.status === 'booked' ? 'pending' : (item.status || 'pending'),
                        address: item.address || 'No address provided',
                        attenderName: item.attender_name || 'None',
                        attenderPhone: item.attender_phone || 'N/A',
                        raw: item
                    };
                });

                const uniqueAppointments = Array.from(new Map(formatted.map(item => [item.id, item])).values());
                setAppointments(uniqueAppointments);

                const uniquePatients = new Set(res.data.map(item => item.patient_name || item.patientName || item.name).filter(Boolean));
                setRealTimePatientCount(uniquePatients.size);
            }
        } catch (error) {
            console.error('Error fetching existing appointments:', error);
        }
    }, []);

    const createAppointment = async (apptData) => {
        const dateTimeString = apptData.time || `${apptData.date}T${apptData.timeStr || '10:00:00'}`;
        const tempId = `walkin-${Date.now()}`;

        // Optimistic UI update
        const optimisticAppt = {
            id: tempId,
            patientName: apptData.patientName,
            patientId: apptData.patientId || apptData.contactNumber,
            contactNumber: apptData.contactNumber || apptData.patientId,
            time: dateTimeString,
            reason: apptData.doctor || apptData.reason || 'General Visit',
            symptoms: apptData.symptoms || 'Outpatient Consultation',
            specialist: apptData.specialist || 'General Medicine',
            status: apptData.status || 'confirmed',
            address: apptData.address || 'In-Person Walk-in',
            attenderName: apptData.attenderName || 'Self',
            attenderPhone: apptData.attenderPhone || apptData.contactNumber
        };
        setAppointments(prev => [optimisticAppt, ...prev]);

        // Insert into the existing appointments table
        try {
            const dateStr = apptData.date || (dateTimeString ? dateTimeString.split('T')[0] : new Date().toISOString().split('T')[0]);
            const timeStr = apptData.timeStr || (dateTimeString && dateTimeString.includes('T') ? dateTimeString.split('T')[1].slice(0, 8) : '10:00:00');
            const cleanDoctor = (apptData.doctor || apptData.reason || 'Sarah Jenkins').replace('Dr. ', '');

            const { data, error } = await supabase
                .from('appointments')
                .insert([{
                    patient_name: apptData.patientName,
                    patient_phone: apptData.contactNumber || apptData.patientId,
                    doctor_name: cleanDoctor,
                    specialist: apptData.specialist || 'General Medicine',
                    symptoms: apptData.symptoms || 'Outpatient Consultation',
                    appointment_date: dateStr,
                    appointment_time: timeStr,
                    status: apptData.status || 'confirmed',
                    address: apptData.address || 'In-Person Walk-in',
                    attender_name: apptData.attenderName || 'Self',
                    attender_phone: apptData.attenderPhone || apptData.contactNumber || ''
                }])
                .select();

            if (error) {
                console.warn('Appointment insert note:', error.message);
            } else if (data && data[0]) {
                fetchAppointments();
            }
            return { data, error };
        } catch (e) {
            console.error('Error adding appointment to Supabase:', e);
            return { data: null, error: e };
        }
    };

    const confirmAppointment = async (id, extraData = {}) => {
        // Optimistic Update: Update UI immediately
        setAppointments(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status: 'confirmed', ...extraData } : apt
        ));

        try {
            // First try matching by appointment_id
            let { error } = await supabase
                .from('appointments')
                .update({ status: 'confirmed', ...extraData })
                .eq('appointment_id', id);

            if (error) {
                // Try fallback with 'id' column if appointment_id didn't match
                await supabase
                    .from('appointments')
                    .update({ status: 'confirmed', ...extraData })
                    .eq('id', id);
            }
            fetchAppointments();
        } catch (error) {
            console.error('Error confirming appointment:', error);
        }
    };

    const rescheduleAppointment = async (id, newTimeISO) => {
        try {
            const dateObj = new Date(newTimeISO);
            const dateStr = dateObj.toISOString().split('T')[0];
            const timeStr = dateObj.toTimeString().split(' ')[0];
            const dateTimeString = `${dateStr}T${timeStr}`;

            // Optimistic Update
            setAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, status: 'confirmed', time: dateTimeString } : apt
            ));

            let { error } = await supabase
                .from('appointments')
                .update({
                    status: 'confirmed',
                    appointment_date: dateStr,
                    appointment_time: timeStr
                })
                .eq('appointment_id', id);

            if (error) {
                await supabase
                    .from('appointments')
                    .update({
                        status: 'confirmed',
                        appointment_date: dateStr,
                        appointment_time: timeStr
                    })
                    .eq('id', id);
            }

            fetchAppointments();
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
        }
    };

    const getPendingAppointments = () => {
        return (appointments || []).filter(apt => apt && (apt.status === 'pending' || apt.status === 'booked'));
    };

    const getConfirmedAppointments = () => {
        return (appointments || []).filter(apt => apt && apt.status === 'confirmed');
    };

    // --- CareConnect (call_details) Logic ---
    const [callDetails, setCallDetails] = useState([]);
    const [callsLoading, setCallsLoading] = useState(true);

    const fetchCallDetails = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('call_details')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setCallDetails(data);
                localStorage.setItem('careconnect_call_details', JSON.stringify(data));
                localStorage.setItem('careconnect_consultancy_count', data.length.toString());
                window.dispatchEvent(new Event('storage'));
            } else if (error) {
                console.warn('Call details fetch warning:', error.message);
                const saved = localStorage.getItem('careconnect_call_details');
                if (saved) setCallDetails(JSON.parse(saved));
            }
        } catch (err) {
            console.warn('Call details fetch exception:', err);
            const saved = localStorage.getItem('careconnect_call_details');
            if (saved) setCallDetails(JSON.parse(saved));
        } finally {
            setCallsLoading(false);
        }
    }, []);

    const updateCallStatus = async (callId, newStatus, extraData = {}) => {
        // Optimistic UI update
        setCallDetails(prev => prev.map(call =>
            call.call_id === callId ? { ...call, status: newStatus, ...extraData } : call
        ));

        try {
            const { data, error } = await supabase
                .from('call_details')
                .update({ status: newStatus, ...extraData })
                .eq('call_id', callId)
                .select();

            if (error) {
                console.error('Error updating call status:', error.message);
                return { success: false, error };
            }
            fetchCallDetails();
            return { success: true, data };
        } catch (e) {
            console.error('Call status update exception:', e);
            return { success: false, error: e };
        }
    };

    const createCallRecord = async (callData) => {
        const channelName = callData.agora_channel_name || `careconnect_${Date.now()}`;
        const newRecord = {
            patient_name: callData.patient_name || 'Walk-in Telehealth Patient',
            patient_mobile: callData.patient_mobile || 'N/A',
            patient_email: callData.patient_email || '',
            location: callData.location || 'Remote',
            selected_hospital: callData.selected_hospital || 'City General Hospital',
            consultation_type: callData.consultation_type || 'Video Call',
            specialist_category: callData.specialist_category || 'General Physician',
            preferred_date: callData.preferred_date || new Date().toISOString().split('T')[0],
            preferred_time: callData.preferred_time || new Date().toTimeString().split(' ')[0],
            status: callData.status || 'accepted',
            assigned_doctor_id: callData.assigned_doctor_id || null,
            agora_channel_name: channelName
        };

        try {
            const { data, error } = await supabase
                .from('call_details')
                .insert([newRecord])
                .select();

            if (error) {
                console.error('Error inserting call record:', error);
                return { success: false, error };
            }
            fetchCallDetails();
            return { success: true, data: data?.[0] };
        } catch (e) {
            console.error('Call record insertion exception:', e);
            return { success: false, error: e };
        }
    };

    // Subscriptions and initial loads
    useEffect(() => {
        fetchAppointments();
        fetchPrescriptions();
        fetchPatients();
        fetchCallDetails();

        // Real-time channel for appointments table
        const aptChannel = supabase
            .channel('appointments_realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => {
                    fetchAppointments();
                }
            )
            .subscribe();

        // Real-time channel for prescriptions
        const rxChannel = supabase
            .channel('prescriptions_realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'prescriptions' },
                () => {
                    fetchPrescriptions();
                }
            )
            .subscribe();

        // Real-time channel for call_details
        const callsChannel = supabase
            .channel('call_details_realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'call_details' },
                () => {
                    fetchCallDetails();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(aptChannel);
            supabase.removeChannel(rxChannel);
            supabase.removeChannel(callsChannel);
        };
    }, [fetchAppointments, fetchPrescriptions, fetchPatients, fetchCallDetails]);

    return (
        <DataContext.Provider value={{
            prescriptions,
            addPrescription,
            fetchPrescriptions,
            getPrescriptionsByPatient,
            getAllPrescriptions,
            // Patients
            patients,
            fetchPatients,
            getAllPatients,
            // Appointments
            appointments,
            fetchAppointments,
            createAppointment,
            confirmAppointment,
            rescheduleAppointment,
            getPendingAppointments,
            getConfirmedAppointments,
            realTimePatientCount,
            // CareConnect (call_details)
            callDetails,
            callsLoading,
            fetchCallDetails,
            updateCallStatus,
            createCallRecord
        }}>
            {children}
        </DataContext.Provider>
    );
};
