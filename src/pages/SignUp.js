import React, { useState } from 'react';
import { signup } from '../api/UsersApi';
import '../static/SignUp.css';
import Footer from '../components/common/Footer';

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: []
    });
    const [passwordMatch, setPasswordMatch] = useState({
        isMatching: false,
        message: ''
    });

    // Password strength checker
    const checkPasswordStrength = (password) => {
        const feedback = [];
        let score = 0;

        // Length check
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('At least 8 characters');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('One lowercase letter');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('One uppercase letter');
        }

        // Number check
        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('One number');
        }

        // Special character check
        // eslint-disable-next-line
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            score += 1;
        } else {
            feedback.push('One special character');
        }

        // Determine strength level
        let strengthLevel = 'Very Weak';
        let strengthColor = '#e53e3e';

        if (score >= 4) {
            strengthLevel = 'Strong';
            strengthColor = '#38a169';
        } else if (score >= 3) {
            strengthLevel = 'Good';
            strengthColor = '#d69e2e';
        } else if (score >= 2) {
            strengthLevel = 'Fair';
            strengthColor = '#ed8936';
        } else if (score >= 1) {
            strengthLevel = 'Weak';
            strengthColor = '#e53e3e';
        }

        return {
            score,
            feedback,
            strengthLevel,
            strengthColor,
            isValid: score >= 3 // Consider password valid if score is 3 or higher
        };
    };

    // Password match checker
    const checkPasswordMatch = (password, confirmPassword) => {
        if (!confirmPassword) {
            return { isMatching: false, message: '' };
        }

        if (password === confirmPassword) {
            return { isMatching: true, message: 'Passwords match' };
        } else {
            return { isMatching: false, message: 'Passwords do not match' };
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Check password strength in real-time
        if (name === 'password') {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);

            // Also check match when password changes
            if (formData.password2) {
                const match = checkPasswordMatch(value, formData.password2);
                setPasswordMatch(match);
            }
        }

        // Check password match in real-time
        if (name === 'password2') {
            const match = checkPasswordMatch(formData.password, value);
            setPasswordMatch(match);
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!passwordStrength.isValid) {
            newErrors.password = 'Please choose a stronger password';
        }

        if (!formData.password2) {
            newErrors.password2 = 'Please confirm your password';
        } else if (!passwordMatch.isMatching) {
            newErrors.password2 = 'Passwords do not match';
        }

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await signup(formData);

            if (response.data.status === 'success') {
                // Redirect immediately to login
                window.location.href = '/login';
            }
        } catch (error) {
            console.log('Error response:', error.response); // Debug log

            if (error.response?.data) {
                // Direct Django validation errors
                setErrors(error.response.data);
            } else {
                setErrors({ general: 'Network error. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="sign-up-container">
                <div className="sign-up-card">
                    <div className="sign-up-header">
                        <div className="sign-up-logo">HAYDUCATE</div>
                        <h2 className="sign-up-title">Create Your Account</h2>
                        <p className="sign-up-subtitle">Join thousands of learners worldwide</p>
                    </div>

                    <form onSubmit={handleSubmit} className="sign-up-form">
                        <div className="sign-up-row">
                            <div className="sign-up-field-group">
                                <label htmlFor="first_name" className="sign-up-label">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={`sign-up-input ${errors.first_name ? 'sign-up-input-error' : ''}`}
                                    placeholder="Enter your first name"
                                />
                                {errors.first_name && (
                                    <span className="sign-up-error">{errors.first_name}</span>
                                )}
                            </div>

                            <div className="sign-up-field-group">
                                <label htmlFor="last_name" className="sign-up-label">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={`sign-up-input ${errors.last_name ? 'sign-up-input-error' : ''}`}
                                    placeholder="Enter your last name"
                                />
                                {errors.last_name && (
                                    <span className="sign-up-error">{errors.last_name}</span>
                                )}
                            </div>
                        </div>

                        <div className="sign-up-field-group">
                            <label htmlFor="username" className="sign-up-label">
                                Username *
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`sign-up-input ${errors.username ? 'sign-up-input-error' : ''}`}
                                placeholder="Choose a username"
                            />
                            {errors.username && (
                                <span className="sign-up-error">{errors.username}</span>
                            )}
                        </div>

                        <div className="sign-up-field-group">
                            <label htmlFor="email" className="sign-up-label">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`sign-up-input ${errors.email ? 'sign-up-input-error' : ''}`}
                                placeholder="Enter your email address"
                            />
                            {errors.email && (
                                <span className="sign-up-error">{errors.email}</span>
                            )}
                        </div>

                        <div className="sign-up-field-group">
                            <label htmlFor="password" className="sign-up-label">
                                Password *
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`sign-up-input ${errors.password ? 'sign-up-input-error' : ''}`}
                                placeholder="Create a strong password"
                            />

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="password-strength-indicator">
                                    <div className="password-strength-bar">
                                        <div
                                            className="password-strength-fill"
                                            style={{
                                                width: `${(passwordStrength.score / 5) * 100}%`,
                                                backgroundColor: passwordStrength.strengthColor
                                            }}
                                        ></div>
                                    </div>
                                    <div className="password-strength-text">
                                        <span style={{ color: passwordStrength.strengthColor }}>
                                            Strength: {passwordStrength.strengthLevel}
                                        </span>
                                        {passwordStrength.feedback.length > 0 && (
                                            <div className="password-feedback">
                                                {passwordStrength.feedback.map((item, index) => (
                                                    <div key={index} className="password-feedback-item">
                                                        • {item}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {errors.password && (
                                <span className="sign-up-error">{errors.password}</span>
                            )}
                        </div>

                        <div className="sign-up-field-group">
                            <label htmlFor="password2" className="sign-up-label">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                id="password2"
                                name="password2"
                                value={formData.password2}
                                onChange={handleChange}
                                className={`sign-up-input ${errors.password2 ? 'sign-up-input-error' : ''}`}
                                placeholder="Confirm your password"
                            />

                            {/* Password Match Indicator */}
                            {formData.password2 && (
                                <div className="password-match-indicator">
                                    <span
                                        className="password-match-text"
                                        style={{
                                            color: passwordMatch.isMatching ? '#38a169' : '#e53e3e',
                                            fontSize: '11px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {passwordMatch.isMatching ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </span>
                                </div>
                            )}

                            {errors.password2 && (
                                <span className="sign-up-error">{errors.password2}</span>
                            )}
                        </div>

                        {errors.general && (
                            <div className="sign-up-error" style={{ textAlign: 'center' }}>
                                {errors.general}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`sign-up-button ${isLoading ? 'sign-up-button-loading' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    Creating Account...
                                    <div className="sign-up-button-spinner"></div>
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="sign-up-footer">
                        <p>
                            Already have an account?{' '}
                            <a href="/login" className="sign-up-login-link">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SignUp;