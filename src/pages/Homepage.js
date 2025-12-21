import { Link } from "react-router-dom";
import "../static/Homepage.css";
import CoursesSection from "../components/CourseSection";
import Footer from "../components/common/Footer";
import NavigationBar from "../components/common/NavigationBar";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import FeaturesSection from "./FeaturesSection";
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
                src="/embedded-systems3.jpg"
                alt="Online learning illustration"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <>
      <FeaturesSection/>
      <CoursesSection />  
      </>
      

      {/* Testimonials Section */}
      <TestimonialsCarousel/>

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