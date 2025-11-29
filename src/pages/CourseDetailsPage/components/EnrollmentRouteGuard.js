// src/components/EnrollmentRouteGuard.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { checkEnrollment } from '../../../api/EnrollmentApis';

function EnrollmentRouteGuard({ children }) {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    const [checkingEnrollment, setCheckingEnrollment] = useState(true);

    useEffect(() => {
        const checkEnrollmentAndRedirect = async () => {
            if (!courseId) {
                setCheckingEnrollment(false);
                return;
            }

            // Only check enrollment if user is logged in
            if (!isLoggedIn) {
                setCheckingEnrollment(false);
                return;
            }

            try {
                const response = await checkEnrollment(courseId);
                if (response.data.is_enrolled) {
                    // Immediate redirect - don't show details page at all
                    console.log('User enrolled, redirecting to course content');
                    navigate(`/course-content/${courseId}`, { replace: true });
                    return;
                }
            } catch (error) {
                console.error('Error checking enrollment in route guard:', error);
            } finally {
                setCheckingEnrollment(false);
            }
        };

        if (!authLoading) {
            checkEnrollmentAndRedirect();
        }
    }, [courseId, isLoggedIn, authLoading, navigate]);

    if (authLoading || checkingEnrollment) {
        return (
            <div className="enrollment-check-loading" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="loading-spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p>Checking course access...</p>
                <style>
                    {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    `}
                </style>
            </div>
        );
    }

    return children;
}

export default EnrollmentRouteGuard;