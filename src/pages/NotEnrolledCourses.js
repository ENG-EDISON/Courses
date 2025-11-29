import { useState, useRef, useEffect } from "react";
import "../static/NotEnrolledCourses.css";
import CourseCard from "../components/common/CourseCard";
import UdemyStylePopup from "../components/common/UdemyStylePopup";
import { getUserNotEnrolledCourses } from "../api/EnrollmentApis";

function NotEnrolledCourses({ userId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Fetch not enrolled courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await getUserNotEnrolledCourses(userId);
        console.log('Full API response:', response);
        console.log('Response data:', response.data);
        
        // FIX: Handle different possible response structures
        let coursesData = [];
        
        if (response.data?.not_enrolled_courses) {
          coursesData = response.data.not_enrolled_courses;
        } else if (Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (response.data?.courses) {
          coursesData = response.data.courses;
        } else if (response.data?.results) {
          coursesData = response.data.results;
        }
        
        console.log('Extracted courses:', coursesData);
        setCourses(coursesData);
        setHasLoaded(true);
      } catch (err) {
        console.error('Error fetching not enrolled courses:', err);
        setError('Failed to load available courses');
        setHasLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

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
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    const cardRect = e.currentTarget.getBoundingClientRect();
    
    setPopupPosition({
      x: cardRect.left + (cardRect.width / 2) - 160,
      y: cardRect.top - 20
    });

    setHoveredCourse(course);
    setIsPopupVisible(true);
  };

  // Handle mouse leave for course card
  const handleMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsPopupVisible(false);
      setHoveredCourse(null);
    }, 100);
  };

  // Handle popup mouse enter
  const handlePopupMouseEnter = () => {
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

  // Show loading state
  if (loading) {
    return (
      <section className="n-e-c">
        <div className="n-e-c__container">
          <h2>Available Courses</h2>
          <p>Loading available courses...</p>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="n-e-c">
        <div className="n-e-c__container">
          <h2>Available Courses</h2>
          <p className="n-e-c__error">{error}</p>
        </div>
      </section>
    );
  }

  // Don't render anything if no courses exist after loading
  if (hasLoaded && courses.length === 0) {
    return null;
  }

  return (
    <section className="n-e-c">
      <div className="n-e-c__container">
        <h2>Available Courses</h2>
        <p>Discover new courses to expand your knowledge.</p>

        <input
          type="text"
          placeholder="Search available courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="n-e-c__search"
        />

        {/* Buttons outside the courses-wrapper */}
        <button className="n-e-c__scroll-btn n-e-c__scroll-btn--left" onClick={() => scroll("left")}>&lt;</button>
        
        <div className="n-e-c__wrapper">
          <div className="n-e-c__cards" ref={scrollRef}>
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
              <div className="n-e-c__no-courses">
                <p>No available courses found matching your search.</p>
              </div>
            )}
          </div>
        </div>
        
        <button className="n-e-c__scroll-btn n-e-c__scroll-btn--right" onClick={() => scroll("right")}>&gt;</button>

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

export default NotEnrolledCourses;