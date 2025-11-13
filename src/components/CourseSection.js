import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../static/CourseSection.css";
import { getAllPublishedCardView } from "../api/CoursesApi";
import UdemyStylePopup from "./common/UdemyStylePopup";

function CoursesSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const scrollRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllPublishedCardView();
        console.log('Courses API response:', response.data);
        setCourses(response.data);
        setHasLoaded(true);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setHasLoaded(true);
      }
    };

    fetchCourses();
  }, []);

  // Hide popup on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isPopupVisible) {
        setIsPopupVisible(false);
        setHoveredCourse(null);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isPopupVisible]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Format price display
  const formatPrice = (course) => {
    if (course.discount_price && course.discount_price !== course.price) {
      return (
        <div className="course-price">
          <span className="original-price">${course.price}</span>
          <span className="discount-price">${course.discount_price}</span>
        </div>
      );
    }
    return <div className="course-price">${course.price}</div>;
  };

  // Handle mouse enter for course card
  const handleMouseEnter = (course, e) => {
    // Clear any existing timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    // Get the card position and dimensions
    const cardRect = e.currentTarget.getBoundingClientRect();
    
    // Position popup above the card (centered horizontally)
    setPopupPosition({
      x: cardRect.left + (cardRect.width / 2) - 160,
      y: cardRect.top - 20
    });

    setHoveredCourse(course);
    setIsPopupVisible(true);
  };

  // Handle mouse leave for course card
  const handleMouseLeave = () => {
    // Add a small delay before hiding to allow moving to popup
    hoverTimerRef.current = setTimeout(() => {
      setIsPopupVisible(false);
      setHoveredCourse(null);
    }, 100);
  };

  // Handle popup mouse enter
  const handlePopupMouseEnter = () => {
    // Clear the hide timer when mouse enters popup
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsPopupVisible(true);
  };

  // Handle popup mouse leave
  const handlePopupMouseLeave = () => {
    setIsPopupVisible(false);
    setHoveredCourse(null);
  };

  // Don't render anything until courses are loaded
  if (!hasLoaded) {
    return null;
  }

  return (
    <section className="courses">
      <div className="container">
        <h2>Popular Courses</h2>
        <p>Explore our top courses and start learning today.</p>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="course-search"
        />

        <div className="courses-wrapper">
          <button className="scroll-btn left" onClick={() => scroll("left")}>&lt;</button>
          <div className="course-cards" ref={scrollRef}>
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <div 
                  key={course.id} 
                  className="course-card"
                  onMouseEnter={(e) => handleMouseEnter(course, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link to={`/course/${course.id}`}>
                    <img 
                      src={course.thumbnail || "/japan.png"} 
                      alt={course.title} 
                      onError={(e) => {
                        e.target.src = "/japan.png";
                      }}
                    />
                    <div className="course-card-content">
                      <h3>{course.title}</h3>
                      <div className="course-meta">
                        <span className="course-level">{course.level}</span>
                        <span className="course-duration">{course.duration_hours}h</span>
                        {course.certificate_available && (
                          <span className="course-certificate">📜 Certificate</span>
                        )}
                      </div>
                      {formatPrice(course)}
                      <div className="course-rating">
                        ⭐ {course.average_rating || 'No ratings'} 
                        <span className="reviews-count">({course.total_reviews})</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <p>No courses found matching your search.</p>
              </div>
            )}
          </div>
          <button className="scroll-btn right" onClick={() => scroll("right")}>&gt;</button>
        </div>

        {/* Reusable Udemy-style Popup */}
        <UdemyStylePopup
          course={hoveredCourse}
          isVisible={isPopupVisible && !!hoveredCourse}
          position={popupPosition}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        />
      </div>
    </section>
  );
}

export default CoursesSection;