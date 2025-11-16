import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./UdemyStylePopup.css";

function UdemyStylePopup({ course, isVisible, position, onMouseEnter, onMouseLeave }) {
  const popupRef = useRef(null);
  const popupTimerRef = useRef(null);

  // Handle positioning and visibility
  useEffect(() => {
    console.log('Popup effect running:', { isVisible, position, course: !!course });
    
    if (isVisible && popupRef.current && course) {
      const popup = popupRef.current;
      console.log('Popup dimensions:', popup.offsetWidth, popup.offsetHeight);
      
      const offsetX = 20; // Show to the right of cursor
      const offsetY = -100;
      
      const adjustedX = position.x + offsetX;
      const adjustedY = position.y + offsetY;
      
      const maxX = window.innerWidth - popup.offsetWidth - 20;
      const maxY = window.innerHeight - popup.offsetHeight - 20;
      
      const finalPosition = {
        x: Math.max(20, Math.min(adjustedX, maxX)),
        y: Math.max(20, Math.min(adjustedY, maxY))
      };
      
      console.log('Final position:', finalPosition);
      
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

  console.log('Popup render:', { isVisible, course: !!course });

  if (!isVisible || !course) {
    console.log('Popup not rendering - condition not met');
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
        <div className="popup-body">
          <h4 className="popup-title">{course.title}</h4>
          <div className="popup-description">
            {course.short_description 
              ? course.short_description.split(' ').slice(0, 20).join(' ') + 
                (course.short_description.split(' ').length > 20 ? '...' : '')
              : 'No description available.'
            }
          </div>

          <div className="popup-objectives">
            <strong>What you'll learn:</strong>
            <ul>
              {course.learning_objectives && course.learning_objectives.length > 0 ? (
                <>
                  {course.learning_objectives.slice(0, 2).map((objective, index) => (
                    <li key={objective.id || index}>
                      <span className="check-icon">✓</span>
                      <span className="objective-text">{objective.objective}</span>
                    </li>
                  ))}
                  {course.learning_objectives.length > 2 && (
                    <li className="more-objectives">
                      <span className="check-icon">+</span>
                      <span className="objective-text">
                        +{course.learning_objectives.length - 2} more objectives
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