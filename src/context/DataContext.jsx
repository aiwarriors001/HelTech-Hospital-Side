
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        // Load from local storage on mount
        const saved = localStorage.getItem('prescriptions');
        if (saved) {
            setPrescriptions(JSON.parse(saved));
        }
    }, []);

    const addPrescription = (prescription) => {
        const newPrescription = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...prescription
        };

        const updated = [newPrescription, ...prescriptions];
        setPrescriptions(updated);
        localStorage.setItem('prescriptions', JSON.stringify(updated));
        return newPrescription;
    };

    const getPrescriptionsByPatient = (patientId) => {
        return prescriptions.filter(p => p.patientId === patientId);
    };

    const getAllPrescriptions = () => {
        return prescriptions;
    };

    // --- Patient Logic ---
    const [patients, setPatients] = useState([
        { id: 'P-101', name: 'John Doe', age: 34, gender: 'Male', bloodGroup: 'O+', lastVisit: '2023-10-24', status: 'Active' },
        { id: 'P-102', name: 'Sarah Smith', age: 28, gender: 'Female', bloodGroup: 'A-', lastVisit: '2023-10-22', status: 'Active' },
        { id: 'P-103', name: 'Michael Brown', age: 45, gender: 'Male', bloodGroup: 'B+', lastVisit: '2023-10-20', status: 'Recovered' },
        { id: 'P-104', name: 'Emily Davis', age: 62, gender: 'Female', bloodGroup: 'AB+', lastVisit: '2023-10-18', status: 'Active' },
        { id: 'P-105', name: 'Robert Wilson', age: 50, gender: 'Male', bloodGroup: 'O-', lastVisit: '2023-10-15', status: 'Follow-up' },
    ]);

    const getAllPatients = () => patients;

    // --- Appointment Logic ---
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('appointment_date', { ascending: true }); // User schema uses appointment_date

            if (error) throw error;
            if (data) {
                // Map User's Schema to Frontend Expected Format
                // Schema: appointment_id, patient_name, patient_phone, doctor_name, appointment_date, appointment_time, status
                const formatted = data.map(item => {
                    // Combine date and time for frontend display
                    const dateTimeString = `${item.appointment_date}T${item.appointment_time}`;

                    return {
                        id: item.appointment_id, // Map appointment_id to id
                        patientName: item.patient_name,
                        patientId: item.patient_phone || 'N/A',
                        contactNumber: item.patient_phone || 'N/A', // Explicit contact number
                        time: dateTimeString,
                        reason: item.doctor_name ? `Dr. ${item.doctor_name}` : 'General Visit',
                        symptoms: item.symptoms || 'Not specified',
                        specialist: item.specialist || 'General Physician',
                        status: item.status === 'booked' ? 'pending' : item.status,
                        // New Fields
                        address: item.address || 'No address provided',
                        attenderName: item.attender_name || 'None',
                        attenderPhone: item.attender_phone || 'N/A'
                    };
                });
                // Deduplicate by ID just in case
                const uniqueAppointments = Array.from(new Map(formatted.map(item => [item.id, item])).values());

                setAppointments(uniqueAppointments);

                // --- Real-time Patient Count ---
                // Since we don't have a patients table, we derive count from unique patient names in appointments
                const uniquePatients = new Set(data.map(item => item.patient_name || item.patientName));
                setRealTimePatientCount(uniquePatients.size);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    useEffect(() => {
        // Initial Fetch
        fetchAppointments();

        // Real-time Subscription
        const channel = supabase
            .channel('appointments_change')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchAppointments(); // Refresh data on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const confirmAppointment = async (id) => {
        // Optimistic Update: Update UI immediately
        setAppointments(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status: 'confirmed' } : apt
        ));

        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'confirmed' })
                .eq('appointment_id', id); // Use appointment_id

            if (error) {
                // Revert on error
                console.error('Error confirming appointment:', error);
                fetchAppointments(); // Re-fetch to sync truth
                throw error;
            }
        } catch (error) {
            console.error('Error confirming appointment:', error);
        }
    };

    const rescheduleAppointment = async (id, newTimeISO) => {
        try {
            // Split ISO string back to date and time for schema
            const dateObj = new Date(newTimeISO);
            const dateStr = dateObj.toISOString().split('T')[0];
            const timeStr = dateObj.toTimeString().split(' ')[0];
            const dateTimeString = `${dateStr}T${timeStr}`;

            // Optimistic Update
            setAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, status: 'confirmed', time: dateTimeString } : apt
            ));

            const { error } = await supabase
                .from('appointments')
                .update({
                    status: 'confirmed',
                    appointment_date: dateStr,
                    appointment_time: timeStr
                })
                .eq('appointment_id', id); // Use appointment_id

            if (error) {
                fetchAppointments(); // Revert/Sync on error
                throw error;
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
        }
    };

    const getPendingAppointments = () => {
        return (appointments || []).filter(apt => apt && apt.status === 'pending');
    };

    const getConfirmedAppointments = () => {
        return (appointments || []).filter(apt => apt && apt.status === 'confirmed');
    };

    const [realTimePatientCount, setRealTimePatientCount] = useState(0);

    return (
        <DataContext.Provider value={{
            prescriptions,
            addPrescription,
            getPrescriptionsByPatient,
            getAllPrescriptions,
            // Patients
            patients,
            getAllPatients,
            // Appointments
            appointments,
            confirmAppointment,
            rescheduleAppointment,
            getPendingAppointments,
            getConfirmedAppointments,
            realTimePatientCount
        }}>
            {children}
        </DataContext.Provider>
    );
};
