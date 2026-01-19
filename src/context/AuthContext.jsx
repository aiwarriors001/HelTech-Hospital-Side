
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

import secureStorage from '../utils/secureStorage';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(secureStorage.getItem('activeRole') || 'hospital');

  useEffect(() => {
    // Mock getting user data based on role
    const fetchUserData = () => {
      if (role === 'hospital') {
        const hospitalUser = {
          id: 'hospital_001',
          role: 'hospital',
          name: 'City General Hospital',
          hospitalName: 'City General Hospital',
          email: 'admin@cityhospital.com',
          phone: '+1 234 567 8900',
          address: '123 Medical Center Drive',
          profileComplete: true
        };
        setUser(hospitalUser);
        secureStorage.setItem('user_session', hospitalUser); // Encrypt user data

        // Apply theme
        document.documentElement.style.setProperty('--primary-color', '#2563EB');
        document.documentElement.style.setProperty('--primary-light', '#EFF6FF');
        document.documentElement.style.setProperty('--primary-dark', '#1E40AF');
      } else {
        const patientUser = {
          id: 'patient_001',
          role: 'patient',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 234 567 8901',
          dateOfBirth: '1990-01-15',
          gender: 'male',
          bloodGroup: 'O+',
          address: '456 Patient Street',
          emergencyName: 'Jane Doe',
          emergencyPhone: '+1 234 567 8902',
          allergies: 'None',
          profileComplete: true
        };
        setUser(patientUser);
        secureStorage.setItem('user_session', patientUser); // Encrypt user data

        // Apply theme
        document.documentElement.style.setProperty('--primary-color', '#2563EB');
        document.documentElement.style.setProperty('--primary-light', '#EFF6FF');
        document.documentElement.style.setProperty('--primary-dark', '#1E40AF');
      }
    };

    fetchUserData();
  }, [role]);

  const switchRole = (newRole) => {
    setRole(newRole);
    secureStorage.setItem('activeRole', newRole);
  };

  const logout = () => {
    setUser(null);
    secureStorage.removeItem('activeRole');
    secureStorage.removeItem('user_session');
    // Optional: Redirect to login if separate login page exists
    // window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
