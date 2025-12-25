import React, { useState, useEffect, useCallback } from 'react';
import { getTestimonials } from '../api/TestimonialsApi';
import '../static/TestimonialsCarousel.css';

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine how many testimonials to show based on screen width
  const updateVisibleCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setVisibleCount(1);
    } else if (width < 1024) {
      setVisibleCount(2);
    } else {
      setVisibleCount(3);
    }
  }, []);

  // Fetch testimonials and handle responsive updates
  useEffect(() => {
    fetchTestimonials();
    updateVisibleCount();
    
    const handleResize = () => {
      updateVisibleCount();
      // Reset to first slide when resizing to avoid index issues
      setCurrentSlide(0);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateVisibleCount]);

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

  const nextSlide = () => {
    if (testimonials.length <= visibleCount) return;
    
    const totalSlides = Math.ceil(testimonials.length / visibleCount);
    setCurrentSlide((prevSlide) => 
      prevSlide === totalSlides - 1 ? 0 : prevSlide + 1
    );
  };

  const prevSlide = () => {
    if (testimonials.length <= visibleCount) return;
    
    const totalSlides = Math.ceil(testimonials.length / visibleCount);
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? totalSlides - 1 : prevSlide - 1
    );
  };

  const goToSlide = (slideIndex) => {
    const totalSlides = Math.ceil(testimonials.length / visibleCount);
    if (slideIndex < totalSlides) {
      setCurrentSlide(slideIndex);
    }
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

  // Get testimonials for current slide
  const getVisibleTestimonials = () => {
    if (testimonials.length === 0) return [];
    
    const startIndex = currentSlide * visibleCount;
    const endIndex = Math.min(startIndex + visibleCount, testimonials.length);
    
    return testimonials.slice(startIndex, endIndex);
  };

  if (loading) {
    return null;
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
    return null;
  }

  const visibleTestimonials = getVisibleTestimonials();
  const totalSlides = Math.ceil(testimonials.length / visibleCount);

  return (
    <section className="testimonials-carousel">
      <div className="carousel-wrapper">
        
        {/* Header */}
        <div className="testimonials-header">
          <h2 className="testimonials-title">What People Say</h2>
          <p className="testimonials-subtitle">Real stories from our learning community</p>
        </div>

        {/* Main Content */}
        <div className="carousel-content">
          
          {/* Left Navigation */}
          <button 
            onClick={prevSlide}
            className="carousel-nav carousel-nav-prev"
            aria-label="Previous slide"
            disabled={testimonials.length <= visibleCount}
          >
            <span className="nav-arrow">&lt;</span>
          </button>

          {/* Testimonial Cards Container */}
          <div className="testimonials-container">
            {visibleTestimonials.map((testimonial, index) => {
              const photoUrl = getPhotoUrl(testimonial.photo_url);
              const authorName = testimonial.author_info?.name || 'Student';
              const authorRole = testimonial.author_info?.role;
              const authorCompany = testimonial.author_info?.company;
              const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=4F46E5&color=fff&size=150&bold=true`;

              return (
                <div 
                  key={`${testimonial.id}-${currentSlide}-${index}`} 
                  className="testimonial-card-item"
                >
                  {/* Testimonial Card */}
                  <div className="testimonial-card">
                    
                    {/* Quote */}
                    <div className="testimonial-quote-container">
                      <div className="quote-mark">"</div>
                      <p className="testimonial-text">"{testimonial.quote}"</p>
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
                        {testimonial.is_verified && (
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
                          {new Date(testimonial.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Navigation */}
          <button 
            onClick={nextSlide}
            className="carousel-nav carousel-nav-next"
            aria-label="Next slide"
            disabled={testimonials.length <= visibleCount}
          >
            <span className="nav-arrow">&gt;</span>
          </button>

        </div>

        {/* Progress Dots */}
        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`progress-dot ${currentSlide === index ? 'active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsCarousel;