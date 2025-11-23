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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const calculateDiscountPercentage = (originalPrice, discountPrice) => {
  if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

const validateCourseData = (course) => {
  const defaults = {
    id: 0,
    title: "Untitled Course",
    instructor: COURSE_CONSTANTS.DEFAULT_INSTRUCTOR,
    price: "0.00",
    discount_price: null,
    average_rating: 0,
    total_reviews: 0,
    duration_hours: 0,
    lectures_count: 0,
    level: "beginner",
    category: "",
    thumbnail: COURSE_CONSTANTS.DEFAULT_THUMBNAIL,
    is_featured: false,
    certificate_available: false,
    enrollment_count: 0,
  };

  return { ...defaults, ...course };
};

// ⭐ Star Rating
const StarRating = ({ rating, total_reviews, maxStars = COURSE_CONSTANTS.MAX_STARS }) => {
  const numericRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="coursecard-rating" aria-label={`Rating: ${numericRating.toFixed(1)} out of ${maxStars} stars`}>
      <span className="coursecard-rating-value">{numericRating.toFixed(1)}</span>
      <span className="coursecard-rating-stars">
        {"★".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(emptyStars)}
      </span>
      <span className="coursecard-reviews-count">({Math.max(0, parseInt(total_reviews) || 0)} reviews)</span>
    </div>
  );
};

// 🎖️ Badges
const FeaturedBadge = () => <span className="coursecard-badge featured">Featured</span>;

const CertificateBadge = () => <span className="coursecard-badge certificate">Certificate</span>;

const LevelBadge = ({ level }) => {
  const levelColor = COURSE_CONSTANTS.LEVEL_COLORS[level?.toLowerCase()] || "#64748b";

  return (
    <div
      className="coursecard-level-badge"
      style={{ backgroundColor: levelColor }}
    >
      {level || "Beginner"}
    </div>
  );
};

const DiscountBadge = ({ percentage }) => (
  <span className="coursecard-discount-badge">{percentage}% off</span>
);

// 🖼 Thumbnail
const CourseThumbnail = ({ src, alt, className }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !src) {
    return (
      <div className={`${className} coursecard-thumbnail-placeholder`}>
        <i className="fas fa-book-open"></i>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

// 📌 Main Component
function CourseCard({
  course,
  onMouseEnter,
  onMouseLeave,
  showCategory = false,
  layout = "vertical",
  className = "",
  ...props
}) {
  const validatedCourse = useMemo(() => validateCourseData(course), [course]);

  const priceInfo = useMemo(() => {
    const originalPrice = parseFloat(validatedCourse.price) || 0;
    const discountPrice =
      validatedCourse.discount_price !== null
        ? parseFloat(validatedCourse.discount_price)
        : null;

    const hasDiscount =
      discountPrice !== null &&
      discountPrice > 0 &&
      discountPrice < originalPrice;

    const discountPercentage = hasDiscount
      ? calculateDiscountPercentage(originalPrice, discountPrice)
      : 0;

    const shouldShowDiscount = hasDiscount && discountPrice !== 0;

    return {
      originalPrice,
      discountPrice,
      hasDiscount,
      discountPercentage,
      displayPrice: hasDiscount ? discountPrice : originalPrice,
      shouldShowDiscount,
    };
  }, [
    validatedCourse.price,
    validatedCourse.discount_price,
  ]);

  return (
    <div className="coursecard-wrapper" >
      <article
        className={`coursecard ${layout} ${className}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        tabIndex={0}
        role="button"
        {...props}
      >
        <Link to={`/course/${validatedCourse.id}`} className="coursecard-link" >
          {/* IMAGE */}
          <div className="coursecard-image-container" >
            <CourseThumbnail
              src={validatedCourse.thumbnail}
              alt={validatedCourse.title}
              className="coursecard-thumbnail"
            />

            <div className="coursecard-badges">
              {validatedCourse.is_featured && <FeaturedBadge />}
              {validatedCourse.certificate_available && <CertificateBadge />}
            </div>

            <LevelBadge level={validatedCourse.level} />
          </div>

          {/* CONTENT */}
          <div className="coursecard-content">
            {showCategory && validatedCourse.category && (
              <div className="coursecard-category">{validatedCourse.category}</div>
            )}

            <h3 className="coursecard-title">{validatedCourse.title}</h3>

            <div className="coursecard-instructor">
              {validatedCourse.instructor_name || validatedCourse.instructor}
            </div>

            <div className="coursecard-meta-row">
              <StarRating
                rating={validatedCourse.average_rating}
                total_reviews={validatedCourse.total_reviews}
              />

              <div className="coursecard-duration">
                <i className="fas fa-clock"></i>
                <span>{validatedCourse.duration_hours || 0} hours</span>
              </div>
            </div>

            {/* PRICE */}
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

              {priceInfo.shouldShowDiscount && (
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
  validateCourseData,
};

export default CourseCard;
