import { Link } from "react-router-dom";
import "../static/Homepage.css";
import CoursesSection from "./CourseSection";

function Homepage() {
  return (
    <main className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            {/* Text */}
            <div className="hero-text">
              <h1>Transform Your Learning with Hayducate</h1>
              <p>
                Access premium online courses, expert-led tutorials, and interactive learning tools — all in one platform.
              </p>
              <div className="hero-buttons">
                <Link to="/all-courses" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/all-courses" className="btn btn-outline">
                  Browse Courses
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="hero-image">
              <img
                src="/japan.png"
                alt="Online learning illustration"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Hayducate?</h2>
          <p>From beginner to advanced, we provide the tools and resources you need to succeed.</p>
          <div className="feature-cards">
            <div className="feature-card">
              <h3>Expert Courses</h3>
              <p>Learn from industry experts and master practical skills that accelerate your career.</p>
            </div>
            <div className="feature-card">
              <h3>Interactive Learning</h3>
              <p>Hands-on exercises and projects make learning more engaging and effective.</p>
            </div>
            <div className="feature-card">
              <h3>Certificates</h3>
              <p>Earn professional certificates to showcase your new skills to employers worldwide.</p>
            </div>
          </div>
        </div>
      </section>
      <CoursesSection />  
      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2>What Our Students Say</h2>
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <p>"Hayducate's courses helped me land my dream job. Highly recommend!"</p>
              <h3>— Jane Doe</h3>
            </div>
            <div className="testimonial-card">
              <p>"The interactive exercises and real-world projects are amazing."</p>
              <h3>— John Smith</h3>
            </div>
            <div className="testimonial-card">
              <p>"A complete learning platform with certificates that matter."</p>
              <h3>— Sarah Lee</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Ready to Start Learning?</h2>
        <p>Join thousands of students transforming their careers today.</p>
        <Link to="/get-started" className="btn btn-cta">
          Get Started
        </Link>
      </section>
    </main>
  );
}

export default Homepage;
