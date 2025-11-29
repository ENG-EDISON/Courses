import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./UdemyStylePopup.css";

function UdemyStylePopup({ course, isVisible, position, onMouseEnter, onMouseLeave }) {
  const popupRef = useRef(null);
  const popupTimerRef = useRef(null);

  // Handle positioning and visibility
  useEffect(() => {
    
    if (isVisible && popupRef.current && course) {
      const popup = popupRef.current;
      
      const offsetX = -30;
      const offsetY = -200;
      
      const adjustedX = position.x + offsetX;
      const adjustedY = position.y + offsetY;
      
      const maxX = window.innerWidth - popup.offsetWidth - 20;
      const maxY = window.innerHeight - popup.offsetHeight - 20;
      
      const finalPosition = {
        x: Math.max(20, Math.min(adjustedX, maxX)),
        y: Math.max(20, Math.min(adjustedY, maxY))
      };
            
      popup.style.left = `${finalPosition.x}px`;
      popup.style.top = `${finalPosition.y}px`;
      popup.style.display = 'block';
    }
  }, [isVisible, position, course]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    popupTimerRef.current = setTimeout(() => {
      onMouseLeave();
    }, 100);
  };

  const handleMouseEnter = () => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
    onMouseEnter();
  };

  if (!isVisible || !course) {
    return null;
  }

  return (
    <Link 
      to={`/course/${course.id}`}
      className="udemy-popup-link"
    >
      <div 
        ref={popupRef}
        className="udemy-popup"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      >
        <div className="popup-header">
          <div className="popup-header-top">
            <h4 className="popup-title">{course.title}</h4>
          </div>
          <div className="popup-meta">
            <span className="popup-level">{course.level || 'Beginner'}</span>
            <span className="popup-duration">{course.duration_hours || 0} total hours</span>
                        <div className="popup-instructor-badge">
              <i className="fas fa-chalkboard-teacher"></i>
              <span>{course.instructor_name || course.instructor || 'Professional Instructor'}</span>
            </div>
          </div>
        </div>

        <div className="popup-body">
          <div className="popup-description">
            {course.short_description 
              ? course.short_description.split(' ').slice(0, 25).join(' ') + 
                (course.short_description.split(' ').length > 25 ? '...' : '')
              : 'No description available.'
            }
          </div>

          <div className="popup-objectives">
            <div className="objectives-header">
              <i className="fas fa-bullseye"></i>
              <strong>Key Learning Objectives</strong>
            </div>
            <ul>
              {course.learning_objectives && course.learning_objectives.length > 0 ? (
                <>
                  {course.learning_objectives.slice(0, 3).map((objective, index) => (
                    <li key={objective.id || index}>
                      <span className="check-icon">✓</span>
                      <span className="objective-text">{objective.objective}</span>
                    </li>
                  ))}
                  {course.learning_objectives.length > 3 && (
                    <li className="more-objectives">
                      <span className="check-icon">+</span>
                      <span className="objective-text">
                        {course.learning_objectives.length - 3} more objectives
                      </span>
                    </li>
                  )}
                </>
              ) : (
                <li className="no-objectives">
                  <span className="check-icon">•</span>
                  <span className="objective-text">Learning objectives coming soon</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default UdemyStylePopup;