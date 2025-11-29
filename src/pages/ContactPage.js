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
            newErrors.customer_email = 'Email is invalid';
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
            // Send data to your Django REST API
            await createMessage(formData);
            
            setSubmitStatus('success');
            // Reset form
            setFormData({ 
                customer_name: '', 
                customer_email: '', 
                subject: '', 
                message: '' 
            });
            
            // Reset status after 5 seconds
            setTimeout(() => {
                setSubmitStatus('');
            }, 5000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            
            if (error.response && error.response.data) {
                // Handle Django validation errors
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
        <div>
        <div className="contact-page">
            <div className="contact-container">
                <div className="contact-header">
                    <button className="back-button" onClick={handleBack}>
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <h1>Contact Us</h1>
                    <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>

                <div className="contact-content">
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <div className="contact-method">
                            <i className="fas fa-envelope"></i>
                            <div>
                                <h3>Email</h3>
                                <p>admin@hayducate.com</p>
                            </div>
                        </div>
                        <div className="contact-method">
                            <i className="fas fa-clock"></i>
                            <div>
                                <h3>Response Time</h3>
                                <p>Usually within 24 hours</p>
                            </div>
                        </div>
                        <div className="contact-method">
                            <i className="fas fa-info-circle"></i>
                            <div>
                                <h3>What to Include</h3>
                                <p>Please provide detailed information about your inquiry so we can assist you better.</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="customer_name">Full Name *</label>
                                <input
                                    type="text"
                                    id="customer_name"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    className={errors.customer_name ? 'error' : ''}
                                    placeholder="Enter your full name"
                                    disabled={isSubmitting}
                                />
                                {errors.customer_name && <span className="error-message">{errors.customer_name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="customer_email">Email Address *</label>
                                <input
                                    type="email"
                                    id="customer_email"
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleChange}
                                    className={errors.customer_email ? 'error' : ''}
                                    placeholder="Enter your email"
                                    disabled={isSubmitting}
                                />
                                {errors.customer_email && <span className="error-message">{errors.customer_email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject (Optional)</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={errors.subject ? 'error' : ''}
                                    placeholder="What is this regarding?"
                                    disabled={isSubmitting}
                                />
                                {errors.subject && <span className="error-message">{errors.subject}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={errors.message ? 'error' : ''}
                                    placeholder="Tell us how we can help you..."
                                    rows="6"
                                    disabled={isSubmitting}
                                />
                                {errors.message && <span className="error-message">{errors.message}</span>}
                                <div className="character-count">
                                    {formData.message.length}/1000 characters
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane"></i>
                                        Send Message
                                    </>
                                )}
                            </button>

                            {submitStatus === 'success' && (
                                <div className="success-message">
                                    <i className="fas fa-check-circle"></i>
                                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    Sorry, there was an error sending your message. Please try again.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
        </div>
    );
};

export default ContactPage;