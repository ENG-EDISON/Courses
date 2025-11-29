import { useState, useRef, useEffect } from "react";
import "../static/CourseSection.css";
import { getAllPublishedCardView } from "../api/CoursesApi";
import UdemyStylePopup from "./common/UdemyStylePopup";
import CourseCard from "./common/CourseCard";

function CourseSection() {
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

  // Don't render anything until courses are loaded OR if no courses exist
  if (!hasLoaded || courses.length === 0) {
    return null;
  }

  return (
    <section className="courses-section">
      <div className="courses-section__container">
        <h2>Popular Courses</h2>
        <p>Explore our top courses and start learning today.</p>

        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="courses-section__search"
        />

        {/* Buttons outside the courses-wrapper */}
        <button className="courses-section__scroll-btn courses-section__scroll-btn--left" onClick={() => scroll("left")}>&lt;</button>
        
        <div className="courses-section__wrapper">
          <div className="courses-section__cards" ref={scrollRef}>
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <CourseCard 
                  key={course.id}
                  course={course}
                  onMouseEnter={(e) => handleMouseEnter(course, e)}
                  onMouseLeave={handleMouseLeave}
                  showCategory={false}
                  layout="vertical"
                />
              ))
            ) : (
              <div className="courses-section__no-courses">
                <p>No courses found matching your search.</p>
              </div>
            )}
          </div>
        </div>
        
        <button className="courses-section__scroll-btn courses-section__scroll-btn--right" onClick={() => scroll("right")}>&gt;</button>

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

export default CourseSection;