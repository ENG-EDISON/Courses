import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import "./CourseCard.css";

// Constants for better maintainability
const COURSE_CONSTANTS = {
  DEFAULT_THUMBNAIL: "/japan.png",
  MAX_STARS: 5,
  LEVEL_COLORS: {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
    expert: '#8b5cf6'
  },
  DEFAULT_INSTRUCTOR: "Professional Instructor",
  CURRENCY: "USD"
};

// Utility functions
const formatCurrency = (amount, currency = COURSE_CONSTANTS.CURRENCY) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};

const calculateDiscountPercentage = (originalPrice, discountPrice) => {
  if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

const validateCourseData = (course) => {
  const defaults = {
    id: 0,
    title: 'Untitled Course',
    instructor: COURSE_CONSTANTS.DEFAULT_INSTRUCTOR,
    price: '0.00',
    discount_price: null,
    average_rating: 0,
    total_reviews: 0,
    duration_hours: 0,
    lectures_count: 0,
    level: 'beginner',
    category: '',
    thumbnail: COURSE_CONSTANTS.DEFAULT_THUMBNAIL,
    is_featured: false,
    certificate_available: false,
    enrollment_count: 0
  };

  return { ...defaults, ...course };
};

// StarRating Component - Improved format
const StarRating = ({ rating, total_reviews, maxStars = COURSE_CONSTANTS.MAX_STARS }) => {
  const numericRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="coursecard-rating" aria-label={`Rating: ${numericRating.toFixed(1)} out of ${maxStars} stars`}>
      <span className="coursecard-rating-value">
        {numericRating.toFixed(1)}
      </span>
      <span className="coursecard-rating-stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(emptyStars)}
      </span>
      <span className="coursecard-reviews-count">
        ({Math.max(0, parseInt(total_reviews) || 0)} reviews)
      </span>
    </div>
  );
};

// Badge Components
const FeaturedBadge = () => (
  <span className="coursecard-badge featured" aria-label="Featured course">
    Featured
  </span>
);

const CertificateBadge = () => (
  <span className="coursecard-badge certificate" aria-label="Certificate available">
    Certificate
  </span>
);

const LevelBadge = ({ level }) => {
  const levelColor = COURSE_CONSTANTS.LEVEL_COLORS[level?.toLowerCase()] || '#64748b';

  return (
    <div
      className="coursecard-level-badge"
      style={{ backgroundColor: levelColor }}
      aria-label={`Course level: ${level}`}
    >
      {level || 'Beginner'}
    </div>
  );
};

const DiscountBadge = ({ percentage }) => (
  <span className="coursecard-discount-badge" aria-label={`${percentage}% discount`}>
    {percentage}% off
  </span>
);

// Image Component with error handling
const CourseThumbnail = ({ src, alt, className }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError || !src) {
    return (
      <div className={`${className} coursecard-thumbnail-placeholder`}>
        <i className="fas fa-book-open" aria-hidden="true"></i>
        <span className="sr-only">Course thumbnail placeholder</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

// Main CourseCard Component with outer padding
function CourseCard({
  course,
  onMouseEnter,
  onMouseLeave,
  showCategory = false,
  layout = "vertical",
  className = "",
  ...props
}) {
  // Validate and normalize course data
  const validatedCourse = useMemo(() => validateCourseData(course), [course]);
  console.log("Course Card", course);

  // Memoized calculations with improved discount logic
  const priceInfo = useMemo(() => {
    const originalPrice = parseFloat(validatedCourse.price) || 0;
    const discountPrice = validatedCourse.discount_price ? 
      parseFloat(validatedCourse.discount_price) : null;

    // Use the discount if explicitly marked as on discount OR if discount price is valid
    const hasDiscount = validatedCourse.is_on_discount || 
      (discountPrice && discountPrice < originalPrice && discountPrice > 0);

    const discountPercentage = hasDiscount && discountPrice ?
      calculateDiscountPercentage(originalPrice, discountPrice) : 0;

    return {
      originalPrice,
      discountPrice,
      hasDiscount: hasDiscount && discountPercentage > 0,
      discountPercentage,
      displayPrice: hasDiscount && discountPrice ? discountPrice : originalPrice
    };
  }, [validatedCourse.price, validatedCourse.discount_price, validatedCourse.is_on_discount]);

  // Event handlers
  const handleCardClick = (e) => {
    console.log('Course card clicked:', validatedCourse.id);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCardClick(e);
    }
  };

  return (
    <div className="coursecard-wrapper">
      <article
        className={`coursecard ${layout} ${className}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleCardClick}
        onKeyPress={handleKeyPress}
        tabIndex={0}
        role="button"
        aria-label={`View course: ${validatedCourse.title}`}
        {...props}
      >
        <Link
          to={`/course/${validatedCourse.id}`}
          className="coursecard-link"
          aria-label={`View details for ${validatedCourse.title}`}
        >
          {/* Image Section */}
          <div className="coursecard-image-container">
            <CourseThumbnail
              src={validatedCourse.thumbnail}
              alt={validatedCourse.title}
              className="coursecard-thumbnail"
            />

            {/* Badges */}
            <div className="coursecard-badges">
              {validatedCourse.is_featured && <FeaturedBadge />}
              {validatedCourse.certificate_available && <CertificateBadge />}
            </div>

            <LevelBadge level={validatedCourse.level} />
          </div>

          {/* Content Section */}
          <div className="coursecard-content">
            {/* Category */}
            {showCategory && validatedCourse.category && (
              <div className="coursecard-category">
                {validatedCourse.category}
              </div>
            )}

            {/* Header */}
            <header className="coursecard-header">
              <h3 className="coursecard-title">{validatedCourse.title}</h3>
            </header>

            {/* Instructor */}
            <div className="coursecard-instructor">
              <span className="coursecard-instructor-name">
                {validatedCourse.instructor_name || validatedCourse.instructor}
              </span>
            </div>

            {/* Rating & Duration in one line */}
            <div className="coursecard-meta-row">
              <StarRating 
                rating={validatedCourse.average_rating} 
                total_reviews={validatedCourse.total_reviews} 
              />

              <div className="coursecard-duration">
                <i className="fas fa-clock" aria-hidden="true"></i>
                <span>{validatedCourse.duration_hours || 0} total hours</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="coursecard-pricing">
              <div className="coursecard-price-container">
                {priceInfo.hasDiscount ? (
                  <>
                    <span className="coursecard-discount-price">
                      {formatCurrency(priceInfo.displayPrice)}
                    </span>
                    <span className="coursecard-original-price">
                      {formatCurrency(priceInfo.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="coursecard-current-price">
                    {formatCurrency(priceInfo.displayPrice)}
                  </span>
                )}
              </div>

              {priceInfo.hasDiscount && (
                <DiscountBadge percentage={priceInfo.discountPercentage} />
              )}
            </div>
          </div>
        </Link>
      </article>
    </div>
  );
}

export {
  CourseCard,
  StarRating,
  formatCurrency,
  calculateDiscountPercentage,
  validateCourseData
};

export default CourseCard;