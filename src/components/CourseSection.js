import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../static/CourseSection.css";
import { getAllCoursesCardView } from "../api/CoursesApi";

function CoursesSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef(null);
  const popupRef = useRef(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getAllCoursesCardView();
        console.log('Courses API response:', response.data);
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle mouse move to update popup position
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (hoveredCourse && popupRef.current) {
        const popup = popupRef.current;
        const x = e.clientX + 15;
        const y = e.clientY + 15;
        
        // Ensure popup stays within viewport
        const maxX = window.innerWidth - popup.offsetWidth - 10;
        const maxY = window.innerHeight - popup.offsetHeight - 10;
        
        setPopupPosition({
          x: Math.min(x, maxX),
          y: Math.min(y, maxY)
        });
      }
    };

    if (hoveredCourse) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredCourse]);

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
    setHoveredCourse(course);
  };

  // Handle mouse leave for course card
  const handleMouseLeave = () => {
    setHoveredCourse(null);
  };

  if (loading) {
    return (
      <section className="courses">
        <div className="container">
          <h2>Popular Courses</h2>
          <div className="loading-spinner">Loading courses...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="courses">
        <div className="container">
          <h2>Popular Courses</h2>
          <p className="error-message">{error}</p>
        </div>
      </section>
    );
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

        {/* Udemy-style Hover Popup */}
        {hoveredCourse && (
          <div 
            ref={popupRef}
            className="udemy-popup"
            style={{
              position: 'fixed',
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              zIndex: 1000
            }}
          >
            <div className="popup-body">
              <h4 className="popup-title">{hoveredCourse.title}</h4>
              <div className="popup-description">
                {hoveredCourse.short_description || 'No description available.'}
              </div>

              <div className="popup-objectives">
                <strong>What you'll learn:</strong>
                <ul>
                  {hoveredCourse.learning_objectives && hoveredCourse.learning_objectives.length > 0 ? (
                    <>
                      {hoveredCourse.learning_objectives.slice(0, 5).map((objective) => (
                        <li key={objective.id}>
                          <span className="check-icon">✓</span>
                          {objective.objective}
                        </li>
                      ))}
                      {hoveredCourse.learning_objectives.length > 5 && (
                        <li className="more-objectives">
                          <span className="check-icon">⋯</span>
                          +{hoveredCourse.learning_objectives.length - 5} more objectives
                        </li>
                      )}
                    </>
                  ) : (
                    <li>No learning objectives specified</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CoursesSection;