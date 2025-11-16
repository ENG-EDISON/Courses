import { useState } from 'react';
import DescriptionTab from './tabs/DescriptionTab';
import ObjectivesTab from './tabs/ObjectivesTab';
import ResourcesTab from './tabs/ResourcesTab';

const CourseDetails = ({ course }) => {
    const [activeTab, setActiveTab] = useState('resources'); // Changed default to 'resources'

    const renderTabContent = () => {
        switch (activeTab) {
            case 'description':
                return <DescriptionTab course={course} />;
            case 'objectives':
                return <ObjectivesTab course={course} />;
            case 'resources':
                return <ResourcesTab course={course} />;
            default:
                return null;
        }
    };

    return (
        <div className="course-details-section">
            <div className="details-tabs">
                <TabButton
                    active={activeTab === 'resources'}
                    onClick={() => setActiveTab('resources')}
                    label="Resources"
                />
                <TabButton
                    active={activeTab === 'description'}
                    onClick={() => setActiveTab('description')}
                    label="Description"
                />
                <TabButton
                    active={activeTab === 'objectives'}
                    onClick={() => setActiveTab('objectives')}
                    label="Objectives"
                />
            </div>

            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label }) => (
    <button
        className={`tab-btn ${active ? 'tab-btn--active' : ''}`}
        onClick={onClick}
    >
        {label}
    </button>
);

export default CourseDetails;