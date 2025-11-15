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
      const offsetX = -15;
      const offsetY = -100;
      
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

  if (!isVisible || !course) return null;

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
      >
        <div className="popup-body">
          <h4 className="popup-title">{course.title}</h4>
          <div className="popup-description">
            {course.short_description || 'No description available.'}
          </div>

          <div className="popup-objectives">
            <strong>What you'll learn:</strong>
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
                        +{course.learning_objectives.length - 3} more objectives
                      </span>
                    </li>
                  )}
                </>
              ) : (
                <li className="no-objectives">
                  <span className="check-icon">•</span>
                  <span className="objective-text">No learning objectives specified</span>
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