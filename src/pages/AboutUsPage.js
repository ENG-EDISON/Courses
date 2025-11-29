import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../static/AboutUsPage.css"
import Footer from '../components/common/Footer';

const AboutUsPage = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div>
            <div className="about-us-page">
                <div className="about-container">
                    <div className="about-header">
                        <button className="back-button" onClick={handleBack}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>
                        <h1>About Hayducate</h1>
                        <p className="tagline">Empowering Learners Through Quality Education</p>
                    </div>

                    <div className="about-content">
                        <section className="mission-section">
                            <div className="mission-content">
                                <h2>Our Mission</h2>
                                <p>
                                    At Hayducate, we believe that education should be accessible, engaging, and transformative.
                                    Our mission is to break down barriers to learning by providing high-quality educational content
                                    that empowers individuals to achieve their personal and professional goals.
                                </p>
                            </div>
                            <div className="mission-image">
                                <i className="fas fa-graduation-cap"></i>
                            </div>
                        </section>

                        <section className="story-section">
                            <h2>Our Story</h2>
                            <div className="story-content">
                                <div className="story-text">
                                    <p>
                                        Hayducate began as a passion project with a simple goal: to make complex topics understandable
                                        and accessible to everyone. What started as a YouTube channel creating educational videos has
                                        grown into a comprehensive learning platform dedicated to:
                                    </p>
                                    <ul className="values-list">
                                        <li>
                                            <i className="fas fa-check-circle"></i>
                                            <strong>Clear Explanations:</strong> Breaking down complex concepts into easy-to-understand lessons
                                        </li>
                                        <li>
                                            <i className="fas fa-check-circle"></i>
                                            <strong>Practical Knowledge:</strong> Focusing on skills and knowledge you can apply immediately
                                        </li>
                                        <li>
                                            <i className="fas fa-check-circle"></i>
                                            <strong>Engaging Content:</strong> Making learning enjoyable through well-produced videos and interactive elements
                                        </li>
                                        <li>
                                            <i className="fas fa-check-circle"></i>
                                            <strong>Community Focus:</strong> Building a supportive learning community where everyone can grow together
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="youtube-section">
                            <h2>Our YouTube Channel</h2>
                            <div className="youtube-stats">
                                <div className="stat-card">
                                    <i className="fas fa-play-circle"></i>
                                    <h3>Educational Videos</h3>
                                    <p>High-quality tutorials, explanations, and educational content</p>
                                </div>
                                <div className="stat-card">
                                    <i className="fas fa-users"></i>
                                    <h3>Growing Community</h3>
                                    <p>Thousands of subscribers learning together</p>
                                </div>
                                <div className="stat-card">
                                    <i className="fas fa-lightbulb"></i>
                                    <h3>Diverse Topics</h3>
                                    <p>Covering technology, programming, and essential skills</p>
                                </div>
                            </div>
                        </section>

                        <section className="features-section">
                            <h2>What Makes Hayducate Different</h2>
                            <div className="features-grid">
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-rocket"></i>
                                    </div>
                                    <h3>Project-Based Learning</h3>
                                    <p>Learn by doing with real-world projects and practical examples</p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <h3>Self-Paced Progress</h3>
                                    <p>Learn at your own speed with content available 24/7</p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-handshake"></i>
                                    </div>
                                    <h3>Beginner Friendly</h3>
                                    <p>No prior experience needed - we start from the basics</p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-code"></i>
                                    </div>
                                    <h3>Latest Technologies</h3>
                                    <p>Stay current with up-to-date content and modern practices</p>
                                </div>
                            </div>
                        </section>

                        <section className="team-section">
                            <h2>Our Commitment</h2>
                            <div className="commitment-content">
                                <div className="commitment-text">
                                    <p>
                                        We're committed to creating educational content that not only teaches but inspires.
                                        Every video, course, and resource is crafted with care to ensure you get the most
                                        value from your learning journey.
                                    </p>
                                    <div className="commitment-points">
                                        <div className="commitment-point">
                                            <i className="fas fa-star"></i>
                                            <span>Quality over quantity in every lesson</span>
                                        </div>
                                        <div className="commitment-point">
                                            <i className="fas fa-heart"></i>
                                            <span>Passionate about student success</span>
                                        </div>
                                        <div className="commitment-point">
                                            <i className="fas fa-sync-alt"></i>
                                            <span>Continuous improvement based on feedback</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="join-section">
                            <div className="join-content">
                                <h2>Join Our Learning Community</h2>
                                <p>
                                    Whether you're looking to start a new career, enhance your skills, or simply learn something new,
                                    Hayducate is here to support your journey. Subscribe to our YouTube channel and join thousands of
                                    learners who are transforming their lives through education.
                                </p>
                                <div className="cta-buttons">
                                    <button
                                        className="cta-button primary"
                                        onClick={() => window.open('https://www.youtube.com/@hayducate', '_blank')}
                                    >
                                        <i className="fab fa-youtube"></i>
                                        Visit Our YouTube Channel
                                    </button>
                                    <button
                                        className="cta-button secondary"
                                        onClick={() => navigate('/all-courses')}
                                    >
                                        <i className="fas fa-book"></i>
                                        Explore Courses
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AboutUsPage;