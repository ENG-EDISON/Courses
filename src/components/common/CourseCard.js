import { Link } from "react-router-dom";
import "./CourseCard.css";

// StarRating Component
const StarRating = ({ rating, maxStars = 5 }) => {
  const numericRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="coursecard-rating-stars">
      {'★'.repeat(fullStars)}
      {hasHalfStar && '½'}
      {'☆'.repeat(emptyStars)}
    </span>
  );
};

// Main CourseCard Component
function CourseCard({ 
  course, 
  onMouseEnter, 
  onMouseLeave, 
  showCategory = false,
  layout = "vertical"
}) {
  // Format price with discount
  const formatPrice = (course) => {
    if (course.discount_price && course.discount_price < course.price) {
      return (
        <div className="coursecard-price-container">
          <span className="coursecard-original-price">${course.price}</span>
          <span className="coursecard-discount-price">${course.discount_price}</span>
        </div>
      );
    }
    return <span className="coursecard-current-price">${course.price}</span>;
  };

  // Get level badge color
  const getLevelColor = (level) => {
    const colors = {
      beginner: '#10b981',
      intermediate: '#f59e0b',
      advanced: '#ef4444'
    };
    return colors[level?.toLowerCase()] || '#64748b';
  };

  return (
    <div 
      className={`coursecard ${layout}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link to={`/course/${course.id}`} className="coursecard-link">
        <div className="coursecard-image-container">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="coursecard-thumbnail"
              onError={(e) => {
                e.target.src = "/japan.png";
              }}
            />
          ) : (
            <div className="coursecard-thumbnail-placeholder">
              <i className="fas fa-book-open"></i>
            </div>
          )}
          
          <div className="coursecard-badges">
            {course.is_featured && (
              <span className="coursecard-badge featured">Featured</span>
            )}
            {course.certificate_available && (
              <span className="coursecard-badge certificate">Certificate</span>
            )}
          </div>

          <div 
            className="coursecard-level-badge"
            style={{ backgroundColor: getLevelColor(course.level) }}
          >
            {course.level}
          </div>
        </div>

        <div className="coursecard-content">
          {showCategory && course.category && (
            <div className="coursecard-category">{course.category}</div>
          )}
          
          <div className="coursecard-header">
            <h3 className="coursecard-title">{course.title}</h3>
          </div>

          <div className="coursecard-instructor">
            <span className="coursecard-instructor-name">
              {course.instructor || "Professional Instructor"}
            </span>
          </div>

          <div className="coursecard-rating-container">
            <div className="coursecard-rating">
              <span className="coursecard-rating-value">
                {course.average_rating ? course.average_rating.toFixed(1) : '0.0'}
              </span>
              <StarRating rating={course.average_rating || 0} />
              <span className="coursecard-reviews-count">({course.total_reviews || 0})</span>
            </div>
          </div>

          <div className="coursecard-meta">
            <div className="coursecard-duration">
              <i className="fas fa-clock"></i>
              <span>{course.duration_hours || 0} total hours</span>
            </div>
            <div className="coursecard-lectures">
              <i className="fas fa-play-circle"></i>
              <span>{course.lectures_count || 0} lectures</span>
            </div>
          </div>

          <div className="coursecard-pricing">
            {formatPrice(course)}
            {course.discount_price && course.discount_price < course.price && (
              <span className="coursecard-discount-badge">
                Bestseller
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default CourseCard;