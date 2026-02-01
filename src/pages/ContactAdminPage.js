import { Link, useParams } from 'react-router-dom';
import "../static/ContactAdminPage.css";
import Footer from '../components/common/Footer';

function ContactAdminPage() {
    const { courseId } = useParams();

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="contact-admin-wrapper">
            <div className="contact-admin-page">
                <div className="contact-admin-container">
                    <div className="contact-admin-header">
                        <div className="contact-admin-breadcrumb">
                            <Link to={`/course/${courseId}`} className="contact-admin-back-link">
                                <i className="fas fa-arrow-left"></i>
                                <span className="contact-admin-back-text">Back to Course</span>
                            </Link>
                        </div>
                        <div className="contact-admin-header-content">
                            <div className="contact-admin-header-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <h1 className="contact-admin-title">Enrollment Support</h1>
                            <p className="contact-admin-subtitle">
                                This course requires manual enrollment assistance. Our dedicated support team is here to help you through the process.
                            </p>
                        </div>
                    </div>

                    <div className="contact-admin-content">
                        <div className="contact-admin-section-header">
                            <h2 className="contact-admin-section-title">Contact Our Enrollment Team</h2>
                            <p className="contact-admin-section-subtitle">Choose your preferred contact method</p>
                        </div>

                        <div className="contact-admin-grid">
                            {/* Email Card */}
                            <div className="contact-admin-card contact-admin-email-card">
                                <div className="contact-admin-card-header">
                                    <div className="contact-admin-card-icon">
                                        <i className="fas fa-envelope-open-text"></i>
                                    </div>
                                    <h3 className="contact-admin-card-title">Email Support</h3>
                                </div>
                                <div className="contact-admin-card-body">
                                    <p className="contact-admin-card-description">Preferred method for enrollment requests</p>
                                    <div className="contact-admin-options">
                                        <div className="contact-admin-option">
                                            <div className="contact-admin-option-header">
                                                <span className="contact-admin-option-label">Primary</span>
                                                <button 
                                                    className="contact-admin-copy-btn"
                                                    onClick={() => copyToClipboard('admin@hayducate.com')}
                                                    aria-label="Copy email address"
                                                >
                                                    <i className="far fa-copy"></i>
                                                </button>
                                            </div>
                                            <a 
                                                href="mailto:admin@hayducate.com?subject=Enrollment Request&body=Hello, I would like to enroll in a course."
                                                className="contact-admin-action contact-admin-primary-action"
                                            >
                                                <i className="fas fa-paper-plane"></i>
                                                <span className="contact-admin-action-text">Send Email</span>
                                            </a>
                                            <p className="contact-admin-email-address">admin@hayducate.com</p>
                                        </div>

                                        <div className="contact-admin-option">
                                            <div className="contact-admin-option-header">
                                                <span className="contact-admin-option-label">Secondary</span>
                                                <button 
                                                    className="contact-admin-copy-btn"
                                                    onClick={() => copyToClipboard('hayducate@gmail.com')}
                                                    aria-label="Copy email address"
                                                >
                                                    <i className="far fa-copy"></i>
                                                </button>
                                            </div>
                                            <a 
                                                href="mailto:hayducate@gmail.com?subject=Enrollment Request&body=Hello, I would like to enroll in a course."
                                                className="contact-admin-action contact-admin-secondary-action"
                                            >
                                                <i className="fas fa-envelope"></i>
                                                <span className="contact-admin-action-text">Send Email</span>
                                            </a>
                                            <p className="contact-admin-email-address">hayducate@gmail.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Card */}
                            <div className="contact-admin-card contact-admin-phone-card">
                                <div className="contact-admin-card-header">
                                    <div className="contact-admin-card-icon">
                                        <i className="fas fa-phone-volume"></i>
                                    </div>
                                    <h3 className="contact-admin-card-title">Phone Support</h3>
                                </div>
                                <div className="contact-admin-card-body">
                                    <p className="contact-admin-card-description">Speak with our enrollment specialists</p>
                                    <div className="contact-admin-option">
                                        <div className="contact-admin-option-header">
                                            <span className="contact-admin-option-label">Direct Line</span>
                                            <button 
                                                className="contact-admin-copy-btn"
                                                onClick={() => copyToClipboard('+254791294773')}
                                                aria-label="Copy phone number"
                                            >
                                                <i className="far fa-copy"></i>
                                            </button>
                                        </div>
                                        <div className="contact-admin-phone-display">
                                            <i className="fas fa-phone"></i>
                                            <span className="contact-admin-phone-number">+254 791 294 773</span>
                                        </div>
                                        <div className="contact-admin-phone-actions">
                                            <a href="tel:+254791294773" className="contact-admin-action contact-admin-call-action">
                                                <i className="fas fa-phone-alt"></i>
                                                <span className="contact-admin-action-text">Call Now</span>
                                            </a>
                                            <a 
                                                href="https://wa.me/254791294773" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="contact-admin-action contact-admin-whatsapp-action"
                                            >
                                                <i className="fab fa-whatsapp"></i>
                                                <span className="contact-admin-action-text">WhatsApp</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information Section */}
                        <div className="contact-admin-information-section">
                            <div className="contact-admin-info-card">
                                <div className="contact-admin-info-header">
                                    <i className="fas fa-lightbulb"></i>
                                    <h3 className="contact-admin-info-title">For Faster Processing</h3>
                                </div>
                                <div className="contact-admin-info-content">
                                    <p className="contact-admin-info-description">Include these details in your message:</p>
                                    <div className="contact-admin-info-grid">
                                        <div className="contact-admin-info-item">
                                            <div className="contact-admin-info-icon">
                                                <i className="fas fa-book"></i>
                                            </div>
                                            <div className="contact-admin-info-item-content">
                                                <h4 className="contact-admin-info-item-title">Course Info</h4>
                                                <p className="contact-admin-info-item-text">Course name and ID</p>
                                            </div>
                                        </div>
                                        <div className="contact-admin-info-item">
                                            <div className="contact-admin-info-icon">
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div className="contact-admin-info-item-content">
                                                <h4 className="contact-admin-info-item-title">Personal Details</h4>
                                                <p className="contact-admin-info-item-text">Full name and contact</p>
                                            </div>
                                        </div>
                                        <div className="contact-admin-info-item">
                                            <div className="contact-admin-info-icon">
                                                <i className="fas fa-calendar-alt"></i>
                                            </div>
                                            <div className="contact-admin-info-item-content">
                                                <h4 className="contact-admin-info-item-title">Start Date</h4>
                                                <p className="contact-admin-info-item-text">Preferred start date</p>
                                            </div>
                                        </div>
                                        <div className="contact-admin-info-item">
                                            <div className="contact-admin-info-icon">
                                                <i className="fas fa-question-circle"></i>
                                            </div>
                                            <div className="contact-admin-info-item-content">
                                                <h4 className="contact-admin-info-item-title">Questions</h4>
                                                <p className="contact-admin-info-item-text">Specific needs</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thank You Message */}
                        <div className="contact-admin-thank-you">
                            <div className="contact-admin-thank-you-card">
                                <div className="contact-admin-thank-you-content">
                                    <div className="contact-admin-thank-you-icon">
                                        <i className="fas fa-graduation-cap"></i>
                                    </div>
                                    <div>
                                        <h3 className="contact-admin-thank-you-title">Thank You for Choosing Hayducate!</h3>
                                        <p className="contact-admin-thank-you-message">
                                            We're excited to have you learn with us. Hayducate is an inline platform dedicated to 
                                            providing quality education and personalized learning experiences. Our team is here to 
                                            ensure you get the support you need to succeed in your educational journey.
                                        </p>
                                    </div>
                                </div>
                                <div className="contact-admin-platform-features">
                                    <div className="contact-admin-feature">
                                        <i className="fas fa-bolt contact-admin-feature-icon"></i>
                                        <span className="contact-admin-feature-text">Inline Learning Platform</span>
                                    </div>
                                    <div className="contact-admin-feature">
                                        <i className="fas fa-users contact-admin-feature-icon"></i>
                                        <span className="contact-admin-feature-text">Personalized Support</span>
                                    </div>
                                    <div className="contact-admin-feature">
                                        <i className="fas fa-rocket contact-admin-feature-icon"></i>
                                        <span className="contact-admin-feature-text">Career Growth Focus</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ContactAdminPage;