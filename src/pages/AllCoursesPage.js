import { useState, useEffect, useRef } from "react";
import { getAllPublishedCardView, searchCourses } from "../api/CoursesApi";
import "../static/AllCoursesPage.css";
import UdemyStylePopup from "../components/common/UdemyStylePopup";
import CourseCard from "../components/common/CourseCard";
import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";

function AllCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [groupedCourses, setGroupedCourses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hoveredCourse, setHoveredCourse] = useState(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const hoverTimerRef = useRef(null);
    
    // Refs for each category scroll container
    const scrollRefs = useRef({});

    // Fetch all courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await getAllPublishedCardView();
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

    // Group courses by category
    const groupCoursesByCategory = (coursesData) => {
        const grouped = {};
        
        coursesData.forEach(course => {
            const categoryName = course.category || 'Uncategorized';
            if (!grouped[categoryName]) {
                grouped[categoryName] = {
                    category: {
                        name: course.category,
                        slug: course.category_slug
                    },
                    courses: []
                };
            }
            grouped[categoryName].courses.push(course);
        });
        
        setGroupedCourses(grouped);
    };

    // Scroll function for each category
    const scrollCategory = (categoryName, direction) => {
        const scrollContainer = scrollRefs.current[categoryName];
        if (scrollContainer) {
            const scrollAmount = 300;
            scrollContainer.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
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

    // Mouse handlers for course cards
    const handleCardMouseEnter = (course, e) => {
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

    const handleCardMouseLeave = () => {
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

    // Check if there are no courses at all
    const hasNoCourses = Object.keys(groupedCourses).length === 0 || 
                         Object.values(groupedCourses).every(category => category.courses.length === 0);

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
                                        <CourseCard 
                                            key={course.id}
                                            course={course}
                                            onMouseEnter={(e) => handleCardMouseEnter(course, e)}
                                            onMouseLeave={handleCardMouseLeave}
                                            showCategory={true}
                                            layout="vertical"
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
                    {hasNoCourses ? (
                        // Show when there are no courses at all
                        <div className="allcourses-no-courses">
                            <div className="no-courses-content">
                                <i className="fas fa-book-open no-courses-icon"></i>
                                <h2 className="no-courses-title">Coming Soon</h2>
                                <p className="no-courses-message">
                                    We're currently working on adding amazing courses to our catalog. 
                                    Check back soon for new learning opportunities!
                                </p>
                                <div className="no-courses-actions">
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="no-courses-retry-btn"
                                    >
                                        <i className="fas fa-redo"></i>
                                        Check Again
                                    </button>
                                    <Link to="/" className="no-courses-home-btn">
                                        <i className="fas fa-home"></i>
                                        Back to Home
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Show categories when courses exist
                        Object.entries(groupedCourses).map(([categoryName, categoryData]) => (
                            <div key={categoryName} className="allcourses-category-section">
                                <div className="allcourses-category-header">
                                    <h2 className="allcourses-category-title">{categoryName}</h2>
                                    <div className="allcourses-category-meta">
                                        <span className="allcourses-course-count">
                                            {categoryData.courses.length} course{categoryData.courses.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="allcourses-scroll-container">
                                    {/* Left Arrow */}
                                    <button 
                                        className="allcourses-scroll-arrow left"
                                        onClick={() => scrollCategory(categoryName, "left")}
                                    >
                                        &lt;
                                    </button>
                                    
                                    {/* Scrollable Content */}
                                    <div 
                                        className="allcourses-scroll"
                                        ref={el => scrollRefs.current[categoryName] = el}
                                    >
                                        {categoryData.courses.map(course => (
                                            <CourseCard 
                                                key={course.id}
                                                course={course}
                                                onMouseEnter={(e) => handleCardMouseEnter(course, e)}
                                                onMouseLeave={handleCardMouseLeave}
                                                showCategory={false}
                                                layout="vertical"
                                            />
                                        ))}
                                    </div>
                                    
                                    {/* Right Arrow */}
                                    <button 
                                        className="allcourses-scroll-arrow right"
                                        onClick={() => scrollCategory(categoryName, "right")}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                )}
            </div>
   
            {/* Footer - Now inside the component */}
            <Footer/>

            {/* Reusable Udemy-style Popup */}
            <UdemyStylePopup
              course={hoveredCourse}
              isVisible={isPopupVisible && !!hoveredCourse}
              position={popupPosition}
              onMouseEnter={handlePopupMouseEnter}
              onMouseLeave={handlePopupMouseLeave}
            />
        </div>
    );
}

export default AllCoursesPage;