import React from 'react';
import './Footer.css'; // Optional CSS file

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4>Hayducate</h4>
                    <p>Empowering learners through quality education</p>
                </div>
                
                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <div className="contact-info">
                        <div className="contact-item">
                            <span className="contact-label">Email:</span>
                            <a href="mailto:admin@hayducate.com" className="contact-link">
                                admin@hayducate.com
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul className="footer-links">
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/all-courses">Courses</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; {currentYear} Hayducate. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;