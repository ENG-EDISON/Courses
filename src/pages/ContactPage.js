import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../static/ContactPage.css"
import { createMessage } from '../api/ContactMessages';
import Footer from '../components/common/Footer';

const ContactPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
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

        // Name validation
        if (!formData.customer_name.trim()) {
            newErrors.customer_name = 'Name is required';
        } else if (formData.customer_name.trim().length < 2) {
            newErrors.customer_name = 'Name must be at least 2 characters long';
        } else if (formData.customer_name.trim().length > 50) {
            newErrors.customer_name = 'Name must be less than 50 characters';
        }

        // Email validation
        if (!formData.customer_email) {
            newErrors.customer_email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
            newErrors.customer_email = 'Please enter a valid email address';
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters long';
        } else if (formData.message.trim().length > 1000) {
            newErrors.message = 'Message must be less than 1000 characters';
        }

        // Subject validation (optional)
        if (formData.subject && formData.subject.length > 200) {
            newErrors.subject = 'Subject must be less than 200 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('');

        try {
            await createMessage(formData);
            
            setSubmitStatus('success');
            setFormData({ 
                customer_name: '', 
                customer_email: '', 
                subject: '', 
                message: '' 
            });
            
            setTimeout(() => {
                setSubmitStatus('');
            }, 5000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            }
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="c-p-wrapper">
            <div className="c-p-page">
                <div className="c-p-container">
                    <div className="c-p-header">
                        <div className="c-p-header-nav">
                            <button className="c-p-back-button" onClick={handleBack}>
                                <i className="fas fa-arrow-left"></i>
                                <span className="c-p-back-text">Back</span>
                            </button>
                        </div>
                        <div className="c-p-header-content">
                            <div className="c-p-header-icon">
                                <i className="fas fa-comments"></i>
                            </div>
                            <h1 className="c-p-title">Contact Us</h1>
                            <p className="c-p-subtitle">
                                We're here to help! Send us a message and our team will get back to you as soon as possible.
                            </p>
                        </div>
                    </div>

                    <div className="c-p-content">
                        <div className="c-p-section-header">
                            <h2 className="c-p-section-title">Get in Touch</h2>
                            <p className="c-p-section-subtitle">Choose your preferred way to reach us</p>
                        </div>

                        <div className="c-p-grid">
                            {/* Contact Information Card */}
                            <div className="c-p-card c-p-info-card">
                                <div className="c-p-card-header">
                                    <div className="c-p-card-icon">
                                        <i className="fas fa-headset"></i>
                                    </div>
                                    <h3 className="c-p-card-title">Contact Information</h3>
                                </div>
                                <div className="c-p-card-body">
                                    <div className="c-p-info-item">
                                        <div className="c-p-info-icon">
                                            <i className="fas fa-envelope-open-text"></i>
                                        </div>
                                        <div className="c-p-info-content">
                                            <h4 className="c-p-info-title">Email Address</h4>
                                            <p className="c-p-info-text">admin@hayducate.com</p>
                                            <a 
                                                href="mailto:admin@hayducate.com" 
                                                className="c-p-info-action"
                                            >
                                                Send Email Directly
                                            </a>
                                        </div>
                                    </div>

                                    <div className="c-p-info-item">
                                        <div className="c-p-info-icon">
                                            <i className="fas fa-clock"></i>
                                        </div>
                                        <div className="c-p-info-content">
                                            <h4 className="c-p-info-title">Response Time</h4>
                                            <p className="c-p-info-text">We aim to respond within 24 hours</p>
                                        </div>
                                    </div>

                                    <div className="c-p-info-item">
                                        <div className="c-p-info-icon">
                                            <i className="fas fa-lightbulb"></i>
                                        </div>
                                        <div className="c-p-info-content">
                                            <h4 className="c-p-info-title">For Best Results</h4>
                                            <p className="c-p-info-text">Include detailed information about your inquiry</p>
                                            <ul className="c-p-info-tips">
                                                <li>Your course/account details</li>
                                                <li>Clear description of the issue</li>
                                                <li>Any error messages received</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form Card */}
                            <div className="c-p-card c-p-form-card">
                                <div className="c-p-card-header">
                                    <div className="c-p-card-icon">
                                        <i className="fas fa-paper-plane"></i>
                                    </div>
                                    <h3 className="c-p-card-title">Send a Message</h3>
                                </div>
                                <div className="c-p-card-body">
                                    <form className="c-p-form" onSubmit={handleSubmit}>
                                        <div className="c-p-form-group">
                                            <label htmlFor="customer_name" className="c-p-form-label">
                                                Full Name <span className="c-p-required">*</span>
                                            </label>
                                            <div className="c-p-input-wrapper">
                                                <input
                                                    type="text"
                                                    id="customer_name"
                                                    name="customer_name"
                                                    value={formData.customer_name}
                                                    onChange={handleChange}
                                                    className={`c-p-input ${errors.customer_name ? 'c-p-input-error' : ''}`}
                                                    placeholder="Enter your full name"
                                                    disabled={isSubmitting}
                                                    maxLength="50"
                                                />
                                                <div className="c-p-input-icon">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                            </div>
                                            {errors.customer_name && (
                                                <div className="c-p-error-message">
                                                    <i className="fas fa-exclamation-circle"></i>
                                                    {errors.customer_name}
                                                </div>
                                            )}
                                            <div className="c-p-input-help">
                                                {formData.customer_name.length}/50 characters
                                            </div>
                                        </div>

                                        <div className="c-p-form-group">
                                            <label htmlFor="customer_email" className="c-p-form-label">
                                                Email Address <span className="c-p-required">*</span>
                                            </label>
                                            <div className="c-p-input-wrapper">
                                                <input
                                                    type="email"
                                                    id="customer_email"
                                                    name="customer_email"
                                                    value={formData.customer_email}
                                                    onChange={handleChange}
                                                    className={`c-p-input ${errors.customer_email ? 'c-p-input-error' : ''}`}
                                                    placeholder="Enter your email address"
                                                    disabled={isSubmitting}
                                                />
                                                <div className="c-p-input-icon">
                                                    <i className="fas fa-envelope"></i>
                                                </div>
                                            </div>
                                            {errors.customer_email && (
                                                <div className="c-p-error-message">
                                                    <i className="fas fa-exclamation-circle"></i>
                                                    {errors.customer_email}
                                                </div>
                                            )}
                                        </div>

                                        <div className="c-p-form-group">
                                            <label htmlFor="subject" className="c-p-form-label">
                                                Subject (Optional)
                                            </label>
                                            <div className="c-p-input-wrapper">
                                                <input
                                                    type="text"
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className={`c-p-input ${errors.subject ? 'c-p-input-error' : ''}`}
                                                    placeholder="What is this regarding?"
                                                    disabled={isSubmitting}
                                                    maxLength="200"
                                                />
                                                <div className="c-p-input-icon">
                                                    <i className="fas fa-tag"></i>
                                                </div>
                                            </div>
                                            {errors.subject && (
                                                <div className="c-p-error-message">
                                                    <i className="fas fa-exclamation-circle"></i>
                                                    {errors.subject}
                                                </div>
                                            )}
                                            <div className="c-p-input-help">
                                                {formData.subject.length}/200 characters
                                            </div>
                                        </div>

                                        <div className="c-p-form-group">
                                            <label htmlFor="message" className="c-p-form-label">
                                                Message <span className="c-p-required">*</span>
                                            </label>
                                            <div className="c-p-textarea-wrapper">
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    className={`c-p-textarea ${errors.message ? 'c-p-textarea-error' : ''}`}
                                                    placeholder="Tell us how we can help you..."
                                                    rows="6"
                                                    disabled={isSubmitting}
                                                    maxLength="1000"
                                                />
                                                <div className="c-p-textarea-icon">
                                                    <i className="fas fa-comment-dots"></i>
                                                </div>
                                            </div>
                                            {errors.message && (
                                                <div className="c-p-error-message">
                                                    <i className="fas fa-exclamation-circle"></i>
                                                    {errors.message}
                                                </div>
                                            )}
                                            <div className="c-p-textarea-help">
                                                <span className={`c-p-char-count ${formData.message.length > 900 ? 'c-p-char-warning' : ''}`}>
                                                    {formData.message.length}/1000 characters
                                                </span>
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            className="c-p-submit-button"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <i className="fas fa-spinner c-p-spinner"></i>
                                                    <span className="c-p-submit-text">Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-paper-plane"></i>
                                                    <span className="c-p-submit-text">Send Message</span>
                                                </>
                                            )}
                                        </button>

                                        {submitStatus === 'success' && (
                                            <div className="c-p-success-message">
                                                <div className="c-p-success-icon">
                                                    <i className="fas fa-check-circle"></i>
                                                </div>
                                                <div className="c-p-success-content">
                                                    <h4 className="c-p-success-title">Message Sent Successfully!</h4>
                                                    <p className="c-p-success-text">
                                                        Thank you for contacting us. We've received your message and will 
                                                        get back to you within 24 hours.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {submitStatus === 'error' && (
                                            <div className="c-p-error-message c-p-error-alert">
                                                <div className="c-p-error-icon">
                                                    <i className="fas fa-exclamation-circle"></i>
                                                </div>
                                                <div className="c-p-error-content">
                                                    <h4 className="c-p-error-title">Oops! Something went wrong</h4>
                                                    <p className="c-p-error-text">
                                                        There was an error sending your message. Please try again or 
                                                        contact us directly at admin@hayducate.com
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Quick Response Note */}
                        <div className="c-p-response-note">
                            <div className="c-p-note-card">
                                <div className="c-p-note-icon">
                                    <i className="fas fa-rocket"></i>
                                </div>
                                <div className="c-p-note-content">
                                    <h3 className="c-p-note-title">Quick Response Guarantee</h3>
                                    <p className="c-p-note-text">
                                        We understand your time is valuable. Our team is committed to responding to 
                                        all inquiries within 24 hours during business days.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ContactPage;