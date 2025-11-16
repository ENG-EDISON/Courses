import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../static/TermsOfService.css"

const TermsOfService = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="terms-page">
            <div className="terms-container">
                <div className="terms-header">
                    <button className="terms-back-button" onClick={handleBack}>
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <h1>Terms of Service</h1>
                    <p className="terms-last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="terms-content">
                    <section className="terms-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            Welcome to Hayducate. By accessing or using our website, mobile application, 
                            services, and educational content (collectively, the "Services"), you agree 
                            to be bound by these Terms of Service ("Terms"). If you do not agree to these 
                            Terms, please do not use our Services.
                        </p>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify you 
                            of changes by updating the "Last Updated" date. Your continued use of our 
                            Services after changes constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>2. Eligibility and Account Registration</h2>
                        
                        <h3>2.1 Age Requirement</h3>
                        <p>
                            You must be at least 13 years old to use our Services. If you are under 18, 
                            you may only use our Services with the consent and supervision of a parent 
                            or legal guardian.
                        </p>

                        <h3>2.2 Account Creation</h3>
                        <p>To access certain features, you must register for an account. You agree to:</p>
                        <ul className="terms-list">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                            <li>Take responsibility for all activities that occur under your account</li>
                        </ul>

                        <h3>2.3 Account Termination</h3>
                        <p>
                            We reserve the right to suspend or terminate your account at our sole discretion 
                            if we believe you have violated these Terms or applicable laws.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>3. Account-Based Learning Experience</h2>
                        
                        <h3>3.1 Immediate Access to Learning Materials</h3>
                        <p>
                            We create user accounts upon expression of interest in our courses to provide immediate 
                            access to learning materials. This approach offers several significant benefits to our users:
                        </p>
                        
                        <div className="benefits-grid">
                            <div className="benefit-item">
                                <i className="fas fa-rocket"></i>
                                <h4>Instant Course Access</h4>
                                <p>Begin learning immediately without delays - your account gives you instant access to course materials the moment you express interest.</p>
                            </div>
                            
                            <div className="benefit-item">
                                <i className="fas fa-chart-line"></i>
                                <h4>Personalized Progress Tracking</h4>
                                <p>Your account automatically saves and tracks your learning progress, quiz scores, and course completion across all devices.</p>
                            </div>
                            
                            <div className="benefit-item">
                                <i className="fas fa-sync-alt"></i>
                                <h4>Seamless Learning Continuity</h4>
                                <p>Pick up exactly where you left off with automatically saved progress, bookmarks, and completed lessons.</p>
                            </div>
                            
                            <div className="benefit-item">
                                <i className="fas fa-certificate"></i>
                                <h4>Automatic Certificate Generation</h4>
                                <p>Upon course completion, your account automatically generates and stores completion certificates for easy access.</p>
                            </div>
                            
                            <div className="benefit-item">
                                <i className="fas fa-mobile-alt"></i>
                                <h4>Multi-Device Synchronization</h4>
                                <p>Access your courses and progress seamlessly across desktop, tablet, and mobile devices with automatic synchronization.</p>
                            </div>
                            
                            <div className="benefit-item">
                                <i className="fas fa-bell"></i>
                                <h4>Personalized Notifications</h4>
                                <p>Receive tailored course updates, new content alerts, and learning reminders based on your progress and interests.</p>
                            </div>
                        </div>

                        <h3>3.2 Enhanced Learning Features</h3>
                        <p>Your account enables advanced learning capabilities including:</p>
                        <ul className="terms-list">
                            <li><strong>Adaptive Learning Paths:</strong> Course recommendations based on your progress and performance</li>
                            <li><strong>Learning Analytics:</strong> Detailed insights into your study patterns and knowledge gaps</li>
                            <li><strong>Community Features:</strong> Participation in course discussions and peer learning</li>
                            <li><strong>Resource Library:</strong> Personalized access to supplementary learning materials</li>
                            <li><strong>Skill Assessment:</strong> Automated skill tracking and competency mapping</li>
                        </ul>

                        <h3>3.3 Data-Enhanced Learning Experience</h3>
                        <p>
                            By creating an account, we can provide a richer, more effective learning experience through:
                        </p>
                        <ul className="terms-list">
                            <li>Personalized course recommendations based on your learning behavior</li>
                            <li>Adaptive difficulty adjustments to match your skill level</li>
                            <li>Intelligent content sequencing for optimal learning progression</li>
                            <li>Performance analytics to help you identify areas for improvement</li>
                            <li>Automated review schedules based on your retention patterns</li>
                        </ul>

                        <h3>3.4 Account Management</h3>
                        <p>
                            You maintain full control over your account and can:
                        </p>
                        <ul className="terms-list">
                            <li>Update your learning preferences and notification settings at any time</li>
                            <li>Export your learning data and progress reports</li>
                            <li>Request account deletion and data removal in accordance with our Privacy Policy</li>
                            <li>Manage your communication preferences for course updates and promotions</li>
                        </ul>

                        <div className="notice-box">
                            <i className="fas fa-info-circle"></i>
                            <p>
                                <strong>Note:</strong> While we create accounts to enhance your learning experience, 
                                you retain full control over your data and can manage your account preferences 
                                or request deletion at any time through your account settings or by contacting us.
                            </p>
                        </div>
                    </section>

                    <section className="terms-section">
                        <h2>4. Services Description</h2>
                        <p>
                            Hayducate provides online educational content including but not limited to:
                        </p>
                        <ul className="terms-list">
                            <li>Video courses and tutorials</li>
                            <li>Interactive learning materials</li>
                            <li>Quizzes and assessments</li>
                            <li>Progress tracking and certificates</li>
                            <li>Community discussion forums</li>
                        </ul>
                        <p>
                            We reserve the right to modify, suspend, or discontinue any aspect of our 
                            Services at any time without prior notice.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>5. Payment and Billing</h2>
                        
                        <h3>5.1 Fees</h3>
                        <p>
                            Some Services may require payment of fees. You agree to pay all applicable 
                            fees as described in the specific course or service offering.
                        </p>

                        <h3>5.2 Subscription Terms</h3>
                        <p>
                            For subscription-based services, your subscription will automatically renew 
                            until canceled. You may cancel your subscription at any time through your 
                            account settings.
                        </p>

                        <h3>5.3 Refund Policy</h3>
                        <p>
                            We offer a 30-day money-back guarantee for most course purchases. Refund 
                            requests must be submitted through our official support channels. Subscription 
                            fees are non-refundable after the initial 30-day period.
                        </p>

                        <h3>5.4 Price Changes</h3>
                        <p>
                            We reserve the right to change our pricing at any time. We will provide 
                            notice of price changes to existing subscribers.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>6. Intellectual Property Rights</h2>
                        
                        <h3>6.1 Our Content</h3>
                        <p>
                            All content provided through our Services, including but not limited to 
                            videos, text, graphics, logos, images, course materials, and software, 
                            is the property of Hayducate or our licensors and is protected by 
                            copyright, trademark, and other intellectual property laws.
                        </p>

                        <h3>6.2 License Grant</h3>
                        <p>
                            Subject to your compliance with these Terms, we grant you a limited, 
                            non-exclusive, non-transferable, non-sublicensable license to access 
                            and use our Services and content for your personal, non-commercial 
                            educational purposes.
                        </p>

                        <h3>6.3 Restrictions</h3>
                        <p>You may not:</p>
                        <ul className="terms-list">
                            <li>Copy, modify, or create derivative works of our content</li>
                            <li>Distribute, sell, lease, or sublicense our content</li>
                            <li>Reverse engineer or attempt to extract source code</li>
                            <li>Remove any copyright or proprietary notices</li>
                            <li>Use our content for any commercial purpose without our express written consent</li>
                        </ul>

                        <h3>6.4 User Content</h3>
                        <p>
                            By submitting content (comments, forum posts, projects, etc.), you grant 
                            us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
                            and display such content in connection with our Services.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>7. User Conduct and Responsibilities</h2>
                        <p>You agree not to:</p>
                        <ul className="terms-list">
                            <li>Use our Services for any illegal purpose or in violation of any laws</li>
                            <li>Harass, abuse, or harm another person</li>
                            <li>Post or transmit any content that is defamatory, obscene, or offensive</li>
                            <li>Impersonate any person or entity</li>
                            <li>Share your account credentials with others</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with or disrupt the Services</li>
                            <li>Use automated systems (bots, scrapers, etc.) to access our Services</li>
                            <li>Circumvent any access or use restrictions</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>8. Third-Party Links and Content</h2>
                        <p>
                            Our Services may contain links to third-party websites or services that 
                            are not owned or controlled by Hayducate. We have no control over, and 
                            assume no responsibility for, the content, privacy policies, or practices 
                            of any third-party sites or services.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>9. Disclaimer of Warranties</h2>
                        <p>
                            OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES 
                            OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE 
                            BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
                            LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                            PURPOSE, AND NON-INFRINGEMENT.
                        </p>
                        <p>
                            WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, 
                            OR COMPLETELY SECURE. WE DO NOT WARRANT THAT ANY EDUCATIONAL RESULTS OR 
                            CAREER OUTCOMES ARE GUARANTEED.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>10. Limitation of Liability</h2>
                        <p>
                            TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL HAYDUCATE, ITS 
                            DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, 
                            LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                        </p>
                        <ul className="terms-list">
                            <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES</li>
                            <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES</li>
                            <li>ANY CONTENT OBTAINED FROM THE SERVICES</li>
                            <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>11. Indemnification</h2>
                        <p>
                            You agree to defend, indemnify, and hold harmless Hayducate and its 
                            affiliates, officers, directors, employees, and agents from and against 
                            any claims, damages, obligations, losses, liabilities, costs, or debt 
                            arising from:
                        </p>
                        <ul className="terms-list">
                            <li>Your use of and access to our Services</li>
                            <li>Your violation of any term of these Terms</li>
                            <li>Your violation of any third-party right, including any copyright or privacy right</li>
                            <li>Any claim that your content caused damage to a third party</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>12. Termination</h2>
                        <p>
                            These Terms remain in effect while you use our Services. We may suspend 
                            or terminate your account or access to Services at our sole discretion 
                            for any reason, including if we believe you have violated these Terms.
                        </p>
                        <p>
                            Upon termination, your right to use the Services will immediately cease. 
                            All provisions of these Terms which by their nature should survive 
                            termination shall survive, including ownership provisions, warranty 
                            disclaimers, indemnity, and limitations of liability.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>13. Governing Law and Dispute Resolution</h2>
                        
                        <h3>13.1 Governing Law</h3>
                        <p>
                            These Terms shall be governed by and construed in accordance with the 
                            laws of [Your Country/State], without regard to its conflict of law provisions.
                        </p>

                        <h3>13.2 Dispute Resolution</h3>
                        <p>
                            Any dispute arising from these Terms or your use of our Services shall 
                            be resolved through binding arbitration rather than in court, except 
                            that you may assert claims in small claims court if your claims qualify.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>14. Miscellaneous</h2>
                        
                        <h3>14.1 Entire Agreement</h3>
                        <p>
                            These Terms constitute the entire agreement between you and Hayducate 
                            regarding our Services and supersede all prior agreements.
                        </p>

                        <h3>14.2 Severability</h3>
                        <p>
                            If any provision of these Terms is held to be invalid or unenforceable, 
                            that provision will be enforced to the maximum extent permissible, and 
                            the other provisions will remain in full force and effect.
                        </p>

                        <h3>14.3 No Waiver</h3>
                        <p>
                            Our failure to enforce any right or provision of these Terms will not 
                            be considered a waiver of those rights.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>15. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms of Service, please contact us:
                        </p>
                        <div className="terms-contact-info">
                            <p><strong>Email:</strong> <a href="mailto:admin@hayducate.com" className="terms-link">admin@hayducate.com</a></p>
                            <p><strong>Website:</strong> <a href="/contact" className="terms-link">Contact Form</a></p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;