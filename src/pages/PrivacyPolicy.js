import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../static/LegalPages.css"
import Footer from '../components/common/Footer';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div>
            <div className="privacy-page">
                <div className="privacy-container">
                    <div className="privacy-header">
                        <button className="privacy-back-button" onClick={handleBack}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>
                        <h1>Privacy Policy</h1>
                        <p className="privacy-last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="privacy-content">
                        <section className="privacy-section">
                            <h2>1. Introduction</h2>
                            <p>
                                Welcome to Hayducate . We are committed to protecting your privacy
                                and ensuring the security of your personal information. This Privacy Policy explains how
                                we collect, use, disclose, and safeguard your information when you use our website,
                                mobile application, and services (collectively, the "Services").
                            </p>
                            <p>
                                By accessing or using our Services, you consent to the practices described in this
                                Privacy Policy. If you do not agree with our policies and practices, please do not
                                use our Services.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2>2. Information We Collect</h2>

                            <h3>2.1 Personal Information</h3>
                            <p>We may collect the following types of personal information:</p>
                            <ul className="privacy-list">
                                <li><strong>Account Information:</strong> Name, email address, password, profile picture</li>
                                <li><strong>Contact Information:</strong> Email address, phone number (if provided)</li>
                                <li><strong>Educational Information:</strong> Course progress, quiz scores, completion certificates</li>
                                <li><strong>Payment Information:</strong> Billing address, payment method details (processed by secure payment processors)</li>
                            </ul>

                            <h3>2.2 Automatically Collected Information</h3>
                            <p>When you use our Services, we automatically collect:</p>
                            <ul className="privacy-list">
                                <li><strong>Device Information:</strong> IP address, browser type, operating system, device type</li>
                                <li><strong>Usage Data:</strong> Pages visited, time spent, features used, clickstream data</li>
                                <li><strong>Location Data:</strong> General location information based on IP address</li>
                                <li><strong>Cookies and Tracking:</strong> Cookies, web beacons, and similar technologies</li>
                            </ul>
                        </section>

                        <section className="privacy-section">
                            <h2>3. How We Use Your Information</h2>
                            <p>We use the collected information for the following purposes:</p>
                            <ul className="privacy-list">
                                <li>To provide, maintain, and improve our Services</li>
                                <li>To personalize your learning experience</li>
                                <li>To process your transactions and send related information</li>
                                <li>To send administrative messages, updates, and security alerts</li>
                                <li>To respond to your comments, questions, and customer service requests</li>
                                <li>To analyze usage trends and improve our Services</li>
                                <li>To detect, prevent, and address technical issues and security breaches</li>
                                <li>To comply with legal obligations and enforce our terms of service</li>
                            </ul>
                        </section>

                        <section className="privacy-section">
                            <h2>4. Information Sharing and Disclosure</h2>
                            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>

                            <h3>4.1 Service Providers</h3>
                            <p>We may share your information with third-party service providers who perform services on our behalf, such as:</p>
                            <ul className="privacy-list">
                                <li>Payment processing</li>
                                <li>Data analysis</li>
                                <li>Email delivery</li>
                                <li>Hosting services</li>
                                <li>Customer service</li>
                            </ul>

                            <h3>4.2 Legal Requirements</h3>
                            <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>

                            <h3>4.3 Business Transfers</h3>
                            <p>In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred.</p>

                            <h3>4.4 Aggregated Data</h3>
                            <p>We may share aggregated, anonymized data that does not identify any individual.</p>
                        </section>

                        <section className="privacy-section">
                            <h2>5. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational security measures to protect your
                                personal information against unauthorized access, alteration, disclosure, or destruction.
                                These measures include:
                            </p>
                            <ul className="privacy-list">
                                <li>SSL encryption for data transmission</li>
                                <li>Secure server infrastructure</li>
                                <li>Regular security assessments</li>
                                <li>Access controls and authentication</li>
                                <li>Data encryption at rest</li>
                            </ul>
                            <p>
                                However, no method of transmission over the Internet or electronic storage is 100% secure,
                                and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2>6. Data Retention</h2>
                            <p>
                                We retain your personal information only for as long as necessary to fulfill the purposes
                                outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                                We will delete your information upon your request or when it is no longer needed for its intended purpose.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2>7. Your Rights and Choices</h2>
                            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                            <ul className="privacy-list">
                                <li><strong>Access:</strong> Request access to your personal information</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                                <li><strong>Restriction:</strong> Request restriction of processing of your information</li>
                                <li><strong>Portability:</strong> Request transfer of your information to another organization</li>
                                <li><strong>Objection:</strong> Object to processing of your information</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where we rely on consent</li>
                            </ul>
                            <p>To exercise these rights, please contact us at <a href="mailto:admin@hayducate.com" className="privacy-link">admin@hayducate.com</a>.</p>
                        </section>

                        <section className="privacy-section">
                            <h2>8. Cookies and Tracking Technologies</h2>
                            <p>
                                We use cookies and similar tracking technologies to track activity on our Services and
                                hold certain information. Cookies are files with a small amount of data that may include
                                an anonymous unique identifier.
                            </p>
                            <p>
                                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                However, if you do not accept cookies, you may not be able to use some portions of our Services.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2>9. Third-Party Links</h2>
                            <p>
                                Our Services may contain links to third-party websites or services that are not operated by us.
                                We have no control over and assume no responsibility for the content, privacy policies, or
                                practices of any third-party sites or services.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2>10. Children's Privacy</h2>
                            <p>
                                Our Services are not intended for children under the age of 13. We do not knowingly collect
                                personally identifiable information from children under 13. If you are a parent or guardian
                                and you are aware that your child has provided us with personal information, please contact us.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2>11. International Data Transfers</h2>
                            <p>
                                Your information may be transferred to — and maintained on — computers located outside of
                                your state, province, country, or other governmental jurisdiction where the data protection
                                laws may differ from those of your jurisdiction.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2>12. Changes to This Privacy Policy</h2>
                            <p>
                                We may update our Privacy Policy from time to time. We will notify you of any changes by
                                posting the new Privacy Policy on this page and updating the "Last Updated" date.
                            </p>
                            <p>
                                You are advised to review this Privacy Policy periodically for any changes. Changes to this
                                Privacy Policy are effective when they are posted on this page.
                            </p>
                        </section>

                        <section className="privacy-section">
                            <h2>13. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us:
                            </p>
                            <div className="privacy-contact-info">
                                <p><strong>Email:</strong> <a href="mailto:admin@hayducate.com" className="privacy-link">admin@hayducate.com</a></p>
                                <p><strong>Website:</strong> <a href="/contact" className="privacy-link">Contact Form</a></p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;