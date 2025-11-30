import { Link } from "react-router-dom";
import "../static/Homepage.css";
import CoursesSection from "../components/CourseSection";
import Footer from "../components/common/Footer";
import NavigationBar from "../components/common/NavigationBar";

function Homepage() {
  return (
    <main className="homepage">
      <NavigationBar/>
      {/* Hero Section */}
      <section className="homepage-hero">
        <div className="homepage-container">
          <div className="homepage-hero-content">
            {/* Text */}
            <div className="homepage-hero-text">
              <h1>Transform Your Learning with Hayducate</h1>
              <p>
                Access premium online courses, expert-led tutorials, and interactive learning tools — all in one platform.
              </p>
              <div className="homepage-hero-buttons">
                <Link to="/all-courses" className="homepage-btn homepage-btn-primary">
                  <span>Get Started</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z" fill="currentColor"/>
                  </svg>
                </Link>
                <Link to="/all-courses" className="homepage-btn homepage-btn-outline">
                  <span>Browse Courses</span>
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="homepage-hero-image">
              <img
                src="/japan.png"
                alt="Online learning illustration"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="homepage-features">
        <div className="homepage-container">
          <h2>Why Choose Hayducate?</h2>
          <p>From beginner to advanced, we provide the tools and resources you need to succeed.</p>
          <div className="homepage-feature-cards">
            <div className="homepage-feature-card">
              <h3>Expert Courses</h3>
              <p>Learn from industry experts and master practical skills that accelerate your career.</p>
            </div>
            <div className="homepage-feature-card">
              <h3>Interactive Learning</h3>
              <p>Hands-on exercises and projects make learning more engaging and effective.</p>
            </div>
            <div className="homepage-feature-card">
              <h3>Certificates</h3>
              <p>Earn professional certificates to showcase your new skills to employers worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      <CoursesSection />  

      {/* Testimonials Section */}
      <section className="homepage-testimonials">
        <div className="homepage-container">
          <h2>What Our Students Say</h2>
          <div className="homepage-testimonial-cards">
            <div className="homepage-testimonial-card">
              <p>"Hayducate's courses helped me land my dream job. Highly recommend!"</p>
              <h3>Michael Jones</h3>
            </div>
            <div className="homepage-testimonial-card">
              <p>"The interactive exercises and real-world projects are amazing."</p>
              <h3>Brian Kagiri</h3>
            </div>
            <div className="homepage-testimonial-card">
              <p>"The instructors are experts who actually care about your success."</p>
              <h3>Sarah Mwende</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="homepage-cta">
        <div className="homepage-container">
          <h2>Ready to Start Learning?</h2>
          <p>Join thousands of students transforming their careers today.</p>
          <Link to="/all-courses" className="homepage-btn homepage-btn-cta">
            <span>Get Started Now</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z" fill="currentColor"/>
            </svg>
          </Link>
        </div>
      </section>
      <Footer/>

    </main>
  );
}

export default Homepage;