import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export const PasswordInput = ({
    id,
    placeholder = 'Enter password',
    value,
    onChange,
    disabled = false,
    autoComplete = 'current-password',
    required = true
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="input-wrapper">
            <input
                type={showPassword ? 'text' : 'password'}
                id={id}
                name={id}
                className="form-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                autoComplete={autoComplete}
                required={required}
            />
            <motion.div
                className="input-icon"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={showPassword ? 'Hide password' : 'Show password'}
            >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </motion.div>
        </div>
    );
};

export default PasswordInput;
