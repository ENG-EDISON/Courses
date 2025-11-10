import { Link } from 'react-router-dom';

const Breadcrumb = ({ courseTitle }) => (
    <div className="course-content__breadcrumb">
        <Link to="/enrolled-courses" className="breadcrumb-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            My Courses
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{courseTitle}</span>
    </div>
);

export default Breadcrumb;