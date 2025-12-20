import React, { useState, useEffect } from 'react';
import { getTestimonials } from '../api/TestimonialsApi';
import '../static/TestimonialsCarousel.css';

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch testimonials
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await getTestimonials();
      setTestimonials(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load testimonials');
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    
    if (photoUrl.startsWith('/media/')) {
      return `http://127.0.0.1:8000${photoUrl}`;
    }
    
    return photoUrl;
  };

  if (loading) {
    return (
      <div className="testimonials-loading">
        <div className="spinner"></div>
        <p>Loading testimonials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="testimonials-error">
        <p>{error}</p>
        <button onClick={fetchTestimonials} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="testimonials-empty">
        <p>No testimonials available yet.</p>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];
  const photoUrl = getPhotoUrl(currentTestimonial.photo_url);
  const authorName = currentTestimonial.author_info?.name || 'Student';
  const authorRole = currentTestimonial.author_info?.role;
  const authorCompany = currentTestimonial.author_info?.company;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=4F46E5&color=fff&size=150&bold=true`;

  return (
    <section className="testimonials-carousel">
      <div className="carousel-wrapper">
        
        {/* Header */}
        <div className="testimonials-header">
          <h2 className="testimonials-title">What Our Students Say</h2>
          <p className="testimonials-subtitle">Real stories from our learning community</p>
        </div>

        {/* Main Content */}
        <div className="carousel-content">
          
          {/* Left Navigation */}
          <button 
            onClick={prevTestimonial}
            className="carousel-nav carousel-nav-prev"
            aria-label="Previous testimonial"
          >
            <span className="nav-arrow">&lt;</span>
          </button>

          {/* Testimonial Card */}
          <div className="testimonial-card">
            
            {/* Quote */}
            <div className="testimonial-quote-container">
              <div className="quote-mark">"</div>
              <p className="testimonial-text">"{currentTestimonial.quote}"</p>
            </div>

            {/* Author Info */}
            <div className="testimonial-author-info">
              <div className="author-avatar">
                <img 
                  src={photoUrl || fallbackAvatar}
                  alt={authorName}
                  className="author-image"
                  onError={(e) => {
                    e.target.src = fallbackAvatar;
                  }}
                />
                {currentTestimonial.is_verified && (
                  <span className="verified-indicator" title="Verified student">
                    ✓
                  </span>
                )}
              </div>
              
              <div className="author-details">
                <h3 className="author-name">{authorName}</h3>
                
                <div className="author-meta">
                  {authorRole && (
                    <span className="author-role">{authorRole}</span>
                  )}
                  {authorRole && authorCompany && (
                    <span className="meta-separator"> • </span>
                  )}
                  {authorCompany && (
                    <span className="author-company">{authorCompany}</span>
                  )}
                </div>
                
                <div className="testimonial-date">
                  {new Date(currentTestimonial.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Right Navigation */}
          <button 
            onClick={nextTestimonial}
            className="carousel-nav carousel-nav-next"
            aria-label="Next testimonial"
          >
            <span className="nav-arrow">&gt;</span>
          </button>

        </div>

        {/* Progress Dots */}
        <div className="carousel-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsCarousel;