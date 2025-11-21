// ResourcesTab.jsx
import React from 'react';
import "../../css/ResourcesTab.css"

const ResourcesTab = ({ course }) => {
    // Helper function to get file type from URL
    const getFileType = (url) => {
        if (!url) return 'File';
        const extension = url.split('.').pop().toLowerCase();
        const fileTypes = {
            'pdf': 'PDF',
            'zip': 'ZIP',
            'doc': 'DOC',
            'docx': 'DOCX',
            'ppt': 'PPT',
            'pptx': 'PPTX',
            'xls': 'XLS',
            'xlsx': 'XLSX',
            'txt': 'TXT',
            'jpg': 'JPG',
            'jpeg': 'JPEG',
            'png': 'PNG',
            'mp4': 'MP4',
            'mov': 'MOV',
            'avi': 'AVI'
        };
        return fileTypes[extension] || 'File';
    };

    // Helper function to get icon based on file type
    const getResourceIcon = (url) => {
        if (!url) return '📄';
        const extension = url.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': '📕',
            'zip': '📦',
            'doc': '📄',
            'docx': '📄',
            'ppt': '📊',
            'pptx': '📊',
            'xls': '📈',
            'xlsx': '📈',
            'txt': '📝',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'png': '🖼️',
            'mp4': '🎬',
            'mov': '🎬',
            'avi': '🎬'
        };
        return iconMap[extension] || '📄';
    };

    // Collect all lesson resources from the course
    const allResources = [];
    if (course.sections) {
        course.sections.forEach(section => {
            section.subsections.forEach(subsection => {
                if (subsection.lessons) {
                    subsection.lessons.forEach(lesson => {
                        // Check if lesson has resources array
                        if (lesson.resources && Array.isArray(lesson.resources)) {
                            lesson.resources.forEach(resource => {
                                allResources.push({
                                    ...resource,
                                    lessonTitle: lesson.title,
                                    sectionTitle: section.title,
                                    subsectionTitle: subsection.title,
                                    lessonId: lesson.id
                                });
                            });
                        }
                    });
                }
            });
        });
    }

    // Helper function to format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Helper function to get full file URL
    const getFileUrl = (filePath) => {
        if (!filePath) return '';
        if (filePath.startsWith('http')) return filePath;
        const baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_PROD_URL || 'http://127.0.0.1:8000';
        return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
    };

    return (
        <div className="resources-tab-container">
            <h3>Course Resources</h3>
            
            {/* Resource Summary */}
            <div className="resources-tab-summary">
                <div className="resources-tab-summary-card">
                    <div className="resources-tab-summary-icon">📚</div>
                    <div className="resources-tab-summary-content">
                        <h4>{allResources.length} Resources Available</h4>
                    </div>
                </div>
            </div>

            {/* All Resources Grid */}
            {allResources.length > 0 ? (
                <div className="resources-tab-section">
                    <div className="resources-tab-grid">
                        {allResources.map((resource, index) => (
                            <div key={resource.id || index} className="resources-tab-card">
                                <div className="resources-tab-icon">
                                    {getResourceIcon(resource.file)}
                                </div>
                                <div className="resources-tab-content">
                                    <div className="resources-tab-row">
                                        <h5>{resource.title || 'Untitled Resource'}</h5>
                                        <span className="resources-tab-type">
                                            {getFileType(resource.file)}
                                        </span>
                                        {resource.file_size && (
                                            <span className="resources-tab-size">
                                                {formatFileSize(resource.file_size)}
                                            </span>
                                        )}
                                        <a 
                                            href={getFileUrl(resource.file)} 
                                            className="resources-tab-download-btn"
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            download
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M4.66675 6.66667L8.00008 10L11.3334 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Download
                                        </a>
                                    </div>
                                    <div className="resources-tab-meta">
                                        <div className="resources-tab-source">
                                            From: <strong>{resource.lessonTitle} </strong>
                                        </div>
                                        <div className="resources-tab-section">
                                            {resource.sectionTitle} • {resource.subsectionTitle} 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="resources-tab-empty">
                    <div className="resources-tab-empty-icon">📭</div>
                    <h4>No Resources Available</h4>
                    <p>This course doesn't have any downloadable resources yet.</p>
                </div>
            )}
        </div>
    );
};

export default ResourcesTab;