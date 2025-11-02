import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCourses, searchCourses } from "../api/CoursesApi";
import "../static/AllCoursesPage.css";

// StarRating Component (moved outside for better organization)
const StarRating = ({ rating, maxStars = 5 }) => {
  const numericRating = parseFloat(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="allcourses-rating-stars">
      {'★'.repeat(fullStars)}
      {hasHalfStar && '½'}
      {'☆'.repeat(emptyStars)}
    </span>
  );
};

// Course Card Component (moved outside for better organization)
const AllCoursesCard = ({ course, formatPrice, getLevelColor }) => (
  <div className="allcourses-course-card">
    <Link to={`/course/${course.id}`} className="allcourses-course-link">
      <div className="allcourses-course-image-container">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="allcourses-course-thumbnail"
          />
        ) : (
          <div className="allcourses-thumbnail-placeholder">
            <i className="fas fa-book-open"></i>
          </div>
        )}
        
        <div className="allcourses-course-badges">
          {course.is_featured && (
            <span className="allcourses-badge featured">Featured</span>
          )}
          {course.certificate_available && (
            <span className="allcourses-badge certificate">Cert</span>
          )}
        </div>

        <div 
          className="allcourses-level-badge"
          style={{ backgroundColor: getLevelColor(course.level) }}
        >
          {course.level}
        </div>
      </div>

      <div className="allcourses-course-content">
        <div className="allcourses-course-header">
          <h3 className="allcourses-course-title">{course.title}</h3>
        </div>

        <div className="allcourses-course-meta">
          <div className="allcourses-rating">
            <StarRating rating={course.average_rating || 0} />
            <span className="allcourses-rating-value">
              {course.average_rating ? course.average_rating.toFixed(1) : '0.0'}
            </span>
            <span>({course.total_reviews || 0})</span>
          </div>
          
          <div className="allcourses-pricing">
            {formatPrice(course)}
          </div>
        </div>

        <div className="allcourses-course-footer">
          <div className="allcourses-enrollments">
            <i className="fas fa-users"></i>
            <span>{course.enrollment_count} enrolled</span>
          </div>
          <div className="allcourses-duration">
            <i className="fas fa-clock"></i>
            <span>{course.duration_hours}h</span>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

function AllCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [groupedCourses, setGroupedCourses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Fetch all courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await getAllCourses();
                console.log('Courses data:', response.data);
                setCourses(response.data);
                groupCoursesByCategory(response.data);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Group courses by category
    const groupCoursesByCategory = (coursesData) => {
        const grouped = {};
        
        coursesData.forEach(course => {
            const categoryName = course.category?.name || 'Uncategorized';
            if (!grouped[categoryName]) {
                grouped[categoryName] = {
                    category: course.category,
                    courses: []
                };
            }
            grouped[categoryName].courses.push(course);
        });
        
        setGroupedCourses(grouped);
    };

    // Handle search
    const handleSearch = async (e) => {
        e.preventDefault();
        console.log('Search triggered with query:', searchQuery);
        
        if (!searchQuery.trim()) {
            console.log('Empty search query, clearing results');
            setSearchResults(null);
            return;
        }

        try {
            setSearchLoading(true);
            setError("");
            console.log('Making API call to search courses...');
            
            const response = await searchCourses(searchQuery);
            console.log('Search API response:', response);
            console.log('Search results data:', response.data);
            
            setSearchResults(response.data);
            
        } catch (err) {
            console.error('Search error details:', err);
            console.error('Error response:', err.response);
            
            // Try client-side search as fallback
            console.log('Trying client-side search as fallback...');
            const clientSideResults = performClientSideSearch(searchQuery);
            setSearchResults(clientSideResults);
            
            if (clientSideResults.length === 0) {
                setError('Search failed. Showing all courses instead.');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    // Client-side search fallback
    const performClientSideSearch = (query) => {
        const searchTerm = query.toLowerCase().trim();
        console.log('Performing client-side search for:', searchTerm);
        
        const results = courses.filter(course => {
            const searchableText = `
                ${course.title || ''} 
                ${course.description || ''} 
                ${course.short_description || ''}
                ${course.category?.name || ''}
            `.toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
        
        console.log('Client-side search results:', results);
        return results;
    };

    // Clear search
    const clearSearch = () => {
        console.log('Clearing search');
        setSearchQuery("");
        setSearchResults(null);
        setError("");
    };

    // Format price with discount
    const formatPrice = (course) => {
        if (course.discount_price && course.discount_price < course.price) {
            return (
                <div className="allcourses-price-container">
                    <span className="allcourses-original-price">${course.price}</span>
                    <span className="allcourses-discount-price">${course.discount_price}</span>
                    <span className="allcourses-discount-badge">
                        Save {Math.round(((course.price - course.discount_price) / course.price) * 100)}%
                    </span>
                </div>
            );
        }
        return <span className="allcourses-current-price">${course.price}</span>;
    };

    // Get level badge color
    const getLevelColor = (level) => {
        const colors = {
            beginner: '#10b981',
            intermediate: '#f59e0b',
            advanced: '#ef4444'
        };
        return colors[level] || '#64748b';
    };

    if (loading && courses.length === 0) {
        return (
            <div className="allcourses-loading">
                <div className="allcourses-loading-animation">
                    <div className="allcourses-loading-spinner"></div>
                    <div className="allcourses-loading-pulse"></div>
                </div>
                <div className="allcourses-loading-text">
                    <h3>Loading Courses</h3>
                    <p>Preparing your learning catalog...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="allcourses-page">
            {/* Header Section */}
            <div className="allcourses-hero">
                <div className="allcourses-hero-background"></div>
                <div className="allcourses-hero-content">
                    <h1 className="allcourses-hero-title">Explore Our Courses</h1>
                    <p className="allcourses-hero-subtitle">
                        Discover expert-led courses to advance your career and skills
                    </p>
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="allcourses-search-container">
                        <div className="allcourses-search-input-group">
                            <i className="fas fa-search allcourses-search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search courses, topics, or instructors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="allcourses-search-input"
                                disabled={searchLoading}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="allcourses-clear-search"
                                    disabled={searchLoading}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                            <button 
                                type="submit" 
                                className="allcourses-search-btn"
                                disabled={searchLoading}
                            >
                                {searchLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Searching...
                                    </>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="allcourses-search-error">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Search Results Info */}
                    {searchResults && (
                        <div className="allcourses-search-results-info">
                            <div className="allcourses-results-count">
                                Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                            </div>
                            <button onClick={clearSearch} className="allcourses-clear-results">
                                Show All Courses
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="allcourses-container">
                {/* Search Results View */}
                {searchResults ? (
                    <div className="allcourses-search-results-section">
                        {searchLoading ? (
                            <div className="allcourses-search-loading">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Searching courses...</p>
                            </div>
                        ) : (
                            <>
                                <div className="allcourses-results-grid">
                                    {searchResults.map(course => (
                                        <AllCoursesCard 
                                          key={course.id} 
                                          course={course} 
                                          formatPrice={formatPrice} 
                                          getLevelColor={getLevelColor} 
                                        />
                                    ))}
                                </div>
                                {searchResults.length === 0 && (
                                    <div className="allcourses-no-results">
                                        <i className="fas fa-search"></i>
                                        <h3>No courses found</h3>
                                        <p>Try different keywords or browse all courses</p>
                                        <button onClick={clearSearch} className="allcourses-browse-all-btn">
                                            Browse All Courses
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    /* Categories View */
                    <div className="allcourses-categories-section">
                        {Object.entries(groupedCourses).map(([categoryName, categoryData]) => (
                            <div key={categoryName} className="allcourses-category-section">
                                <div className="allcourses-category-header">
                                    <h2 className="allcourses-category-title">{categoryName}</h2>
                                    <div className="allcourses-category-meta">
                                        <span className="allcourses-course-count">
                                            {categoryData.courses.length} course{categoryData.courses.length !== 1 ? 's' : ''}
                                        </span>
                                        <div className="allcourses-category-actions">
                                            <button className="allcourses-view-all-btn">
                                                View All
                                                <i className="fas fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="allcourses-scroll-container">
                                    <div className="allcourses-scroll">
                                        {categoryData.courses.map(course => (
                                            <AllCoursesCard 
                                              key={course.id} 
                                              course={course} 
                                              formatPrice={formatPrice} 
                                              getLevelColor={getLevelColor} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AllCoursesPage;