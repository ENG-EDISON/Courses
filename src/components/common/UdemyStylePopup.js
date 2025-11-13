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
      const maxX = window.innerWidth - popup.offsetWidth - 20;
      const maxY = window.innerHeight - popup.offsetHeight - 20;
      
      const adjustedPosition = {
        x: Math.min(position.x, maxX),
        y: Math.min(position.y, maxY)
      };
      
      popup.style.left = `${adjustedPosition.x}px`;
      popup.style.top = `${adjustedPosition.y}px`;
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

  // Handle mouse leave with delay to allow moving to popup
  const handleMouseLeave = () => {
    popupTimerRef.current = setTimeout(() => {
      onMouseLeave();
    }, 100);
  };

  // Handle mouse enter to clear any pending leave
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
                      {objective.objective}
                    </li>
                  ))}
                  {course.learning_objectives.length > 3 && (
                    <li className="more-objectives">
                      <span className="check-icon">⋯</span>
                      +{course.learning_objectives.length - 3} more objectives
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
    </Link>
  );
}

export default UdemyStylePopup;