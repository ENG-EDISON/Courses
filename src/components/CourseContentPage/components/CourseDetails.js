import ResourcesTab from './tabs/ResourcesTab';

const CourseDetails = ({ course }) => {
    return (
        <div className="course-details-section">
            <div className="resources-section">
                <h3>Resources</h3>
                <ResourcesTab course={course} />
            </div>
        </div>
    );
};

export default CourseDetails;