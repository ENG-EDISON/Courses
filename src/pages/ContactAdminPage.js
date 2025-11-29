import { Link, useParams } from 'react-router-dom';
import "../static/ContactAdminPage.css";
import Footer from '../components/common/Footer';

function ContactAdminPage() {
    const { courseId } = useParams();

    return (
        <div>
            <div className="contact-admin-page">
                <div className="contact-admin-container">
                    <div className="contact-admin-header">
                        <Link to={`/course/${courseId}`} className="back-to-course">
                            <i className="fas fa-arrow-left"></i>
                            Back to Course
                        </Link>
                        <h1>Contact Admin for Enrollment</h1>
                        <p>This course requires manual enrollment. Please contact our admin team.</p>
                    </div>

                    <div className="contact-admin-content">
                        <div className="contact-info">
                            <div className="contact-method">
                                <div className="contact-icon">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <div className="contact-details">
                                    <h3>Email Admin</h3>
                                    <p>Send us an email and we'll help you enroll in this course.</p>
                                    <a
                                        href="mailto:admin@hayducate.com?subject=Enrollment Request for Course"
                                        className="contact-btn email-btn"
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                        Email admin@hayducate.com
                                    </a>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="contact-icon">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <div className="contact-details">
                                    <h3>Call Us</h3>
                                    <p>Speak directly with our enrollment team.</p>
                                    <a href="tel:+1234567890" className="contact-btn phone-btn">
                                        <i className="fas fa-phone"></i>
                                        +1 (234) 567-890
                                    </a>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="contact-icon">
                                    <i className="fas fa-comments"></i>
                                </div>
                                <div className="contact-details">
                                    <h3>Live Chat</h3>
                                    <p>Chat with our support team for immediate assistance.</p>
                                    <button className="contact-btn chat-btn">
                                        <i className="fas fa-comment"></i>
                                        Start Live Chat
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="enrollment-info">
                            <h3>What to Include in Your Message:</h3>
                            <ul>
                                <li>Course name you want to enroll in</li>
                                <li>Your full name</li>
                                <li>Email address</li>
                                <li>Any questions about the course</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ContactAdminPage;