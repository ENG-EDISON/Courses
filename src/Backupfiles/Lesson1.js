// import React, { useCallback, useState, useEffect } from 'react';
// import LessonResource from './LessonResource';

// const Lesson = ({ 
//   lesson, 
//   sectionIndex, 
//   subsectionIndex, 
//   lessonIndex, 
//   sections, 
//   setSections, 
//   onUpdate,
//   isExistingInDatabase,
//   isExpanded,
//   onToggle
// }) => {
//   const [isAddingResource, setIsAddingResource] = useState(false);
//   const [videoSource, setVideoSource] = useState(
//     lesson.video_file ? 'upload' : (lesson.video_url ? 'url' : 'upload')
//   );

//   const [previewUrl, setPreviewUrl] = useState(null);

//   // ✅ Generate preview dynamically when video changes
//   useEffect(() => {
//     if (lesson.video_file && typeof lesson.video_file !== 'string') {
//       const fileUrl = URL.createObjectURL(lesson.video_file);
//       setPreviewUrl(fileUrl);
//       return () => URL.revokeObjectURL(fileUrl);
//     } else if (lesson.video_file && typeof lesson.video_file === 'string') {
//       // If video_file is stored URL from backend
//       setPreviewUrl(lesson.video_file);
//     } else if (lesson.video_url) {
//        // eslint-disable-next-line
//       const youtubeMatch = lesson.video_url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^"&?\/\s]{11})/);
//       if (youtubeMatch) {
//         setPreviewUrl(`https://www.youtube.com/embed/${youtubeMatch[1]}`);
//       } else if (lesson.video_url.includes('vimeo.com')) {
//         const vimeoId = lesson.video_url.split('/').pop();
//         setPreviewUrl(`https://player.vimeo.com/video/${vimeoId}`);
//       } else {
//         setPreviewUrl(lesson.video_url);
//       }
//     } else {
//       setPreviewUrl(null);
//     }
//   }, [lesson.video_file, lesson.video_url]);

//   const updateLesson = useCallback((field, value) => {
//     const updatedSections = sections.map((section, secIndex) => {
//       if (secIndex === sectionIndex) {
//         const updatedSubsections = section.subsections.map((sub, subIdx) => {
//           if (subIdx === subsectionIndex) {
//             const updatedLessons = sub.lessons.map((les, lesIdx) =>
//               lesIdx === lessonIndex ? { ...les, [field]: value } : les
//             );
//             return { ...sub, lessons: updatedLessons };
//           }
//           return sub;
//         });
//         return { ...section, subsections: updatedSubsections };
//       }
//       return section;
//     });
//     setSections(updatedSections);
//     onUpdate(updatedSections);
//   }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

//   const deleteLesson = useCallback(() => {
//     const lessonToDelete = sections[sectionIndex]?.subsections[subsectionIndex]?.lessons[lessonIndex];
//     if (lessonToDelete?.id) {
//       if (!window.confirm('This lesson exists in the database. Do you want to delete it permanently?')) {
//         return;
//       }
//     }
//     const updatedSections = sections.map((section, secIndex) => {
//       if (secIndex === sectionIndex) {
//         const updatedSubsections = section.subsections.map((sub, subIdx) => {
//           if (subIdx === subsectionIndex) {
//             const updatedLessons = sub.lessons.filter((_, lesIdx) => lesIdx !== lessonIndex);
//             return { ...sub, lessons: updatedLessons };
//           }
//           return sub;
//         });
//         return { ...section, subsections: updatedSubsections };
//       }
//       return section;
//     });
//     setSections(updatedSections);
//     onUpdate(updatedSections);
//   }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

//   const addResource = useCallback(() => {
//     if (isAddingResource) return;
//     setIsAddingResource(true);
//     try {
//       const updatedSections = sections.map((section, secIndex) => {
//         if (secIndex === sectionIndex) {
//           const updatedSubsections = section.subsections.map((sub, subIdx) => {
//             if (subIdx === subsectionIndex) {
//               const updatedLessons = sub.lessons.map((les, lesIdx) => {
//                 if (lesIdx === lessonIndex) {
//                   const newResource = {
//                     title: `Resource ${(les.resources?.length || 0) + 1}`,
//                     file: null,
//                     resource_type: 'document',
//                     order: les.resources?.length || 0,
//                     isExisting: false
//                   };
//                   return { 
//                     ...les, 
//                     resources: [...(les.resources || []), newResource] 
//                   };
//                 }
//                 return les;
//               });
//               return { ...sub, lessons: updatedLessons };
//             }
//             return sub;
//           });
//           return { ...section, subsections: updatedSubsections };
//         }
//         return section;
//       });
//       setSections(updatedSections);
//       onUpdate(updatedSections);
//     } finally {
//       setTimeout(() => setIsAddingResource(false), 300);
//     }
//   }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate, isAddingResource]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
//     if (!validVideoTypes.includes(file.type)) {
//       alert('Please select a valid video file (MP4, MOV, AVI, MKV, WebM)');
//       return;
//     }

//     if (file.size > 500 * 1024 * 1024) {
//       alert('Video file must be smaller than 500MB');
//       return;
//     }

//     updateLesson('video_file', file);
//     updateLesson('video_url', '');
//     setVideoSource('upload');
//   };

//   const handleVideoSourceChange = (source) => {
//     setVideoSource(source);
//     if (source === 'upload') {
//       updateLesson('video_url', '');
//     } else {
//       updateLesson('video_file', null);
//     }
//   };

//   const hasExistingVideoFile = !!lesson.video_file && typeof lesson.video_file === 'string';

//   return (
//     <div className={`lesson-card ${isExistingInDatabase(lesson) ? 'existing-lesson' : 'new-lesson'}`}>
//       <div 
//         className={`lesson-header ${isExpanded ? 'expanded' : ''}`}
//         onClick={() => onToggle(sectionIndex, subsectionIndex, lessonIndex)}
//       >
//         <button 
//           className={`lesson-toggle ${isExpanded ? 'expanded' : ''}`}
//           onClick={(e) => { e.stopPropagation(); onToggle(sectionIndex, subsectionIndex, lessonIndex); }}
//         >▶</button>

//         <div className="order-input-group">
//           <label>ORDER</label>
//           <input
//             type="number"
//             value={lesson.order ?? lessonIndex}
//             onChange={(e) => updateLesson('order', parseInt(e.target.value) || 0)}
//             className="order-input"
//             min="0"
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>

//         <input
//           type="text"
//           value={lesson.title}
//           onChange={(e) => updateLesson('title', e.target.value)}
//           className="lesson-title-input"
//           placeholder="Lesson title"
//           onClick={(e) => e.stopPropagation()}
//         />

//         <div className="lesson-status">
//           <span className={`status-badge ${isExistingInDatabase(lesson) ? 'existing' : 'new'}`}>
//             {isExistingInDatabase(lesson) ? 'EXISTING' : 'NEW'}
//           </span>
//           {hasExistingVideoFile && <span className="upload-badge">UPLOADED</span>}
//         </div>

//         <div className="lesson-actions">
//           <button 
//             onClick={(e) => { e.stopPropagation(); addResource(); }}
//             className="btn-secondary"
//             disabled={isAddingResource}
//           >
//             + Add Resource
//           </button>
//           <button 
//             onClick={(e) => { e.stopPropagation(); deleteLesson(); }}
//             className="btn-danger"
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//       {isExpanded && (
//         <div className="lesson-content">
//           <div className="lesson-content-section">
//             <label className="section-label">Lesson Content</label>
//             <textarea
//               value={lesson.content}
//               onChange={(e) => updateLesson('content', e.target.value)}
//               placeholder="Enter lesson content..."
//               rows={4}
//               className="lesson-content-textarea"
//             />
//           </div>

//           <div className="lesson-content-section">
//             <label className="section-label">Video Settings</label>
//             <div className="video-source-toggle">
//               <label className="toggle-option">
//                 <input
//                   type="radio"
//                   value="upload"
//                   checked={videoSource === 'upload'}
//                   onChange={(e) => handleVideoSourceChange(e.target.value)}
//                 />
//                 Upload Video
//               </label>
//               <label className="toggle-option">
//                 <input
//                   type="radio"
//                   value="url"
//                   checked={videoSource === 'url'}
//                   onChange={(e) => handleVideoSourceChange(e.target.value)}
//                 />
//                 Use Video URL
//               </label>
//             </div>

//             {videoSource === 'upload' && (
//               <div className="file-upload-section">
//                 <label>Video File</label>
//                 <input
//                   type="file"
//                   accept="video/*"
//                   onChange={handleFileChange}
//                 />
//                 {previewUrl && (
//                   <video controls width="100%" style={{ marginTop: '10px', borderRadius: '8px' }}>
//                     <source src={previewUrl} />
//                     Your browser does not support the video tag.
//                   </video>
//                 )}
//               </div>
//             )}

//             {videoSource === 'url' && (
//               <div className="form-group">
//                 <label>Video URL</label>
//                 <input
//                   type="url"
//                   value={lesson.video_url || ''}
//                   onChange={(e) => updateLesson('video_url', e.target.value)}
//                   placeholder="https://youtube.com/watch?v=..."
//                   className="meta-input"
//                 />
//                 {previewUrl && (
//                   <div className="video-preview" style={{ marginTop: '10px' }}>
//                     {previewUrl.includes('youtube.com') || previewUrl.includes('vimeo.com') ? (
//                       <iframe
//                         src={previewUrl}
//                         width="100%"
//                         height="300"
//                         frameBorder="0"
//                         allowFullScreen
//                         title="Video Preview"
//                       ></iframe>
//                     ) : (
//                       <video controls width="100%">
//                         <source src={previewUrl} />
//                         Your browser does not support the video tag.
//                       </video>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="lesson-meta-grid">
//               <div className="meta-field">
//                 <label>Duration (minutes)</label>
//                 <input
//                   type="number"
//                   value={lesson.duration_minutes || 0}
//                   onChange={(e) => updateLesson('duration_minutes', parseInt(e.target.value) || 0)}
//                   min="0"
//                 />
//               </div>

//               <div className="meta-field checkbox-field">
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={lesson.is_preview || false}
//                     onChange={(e) => updateLesson('is_preview', e.target.checked)}
//                   />
//                   Preview Lesson
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Resources Section */}
//           <div className="lesson-content-section">
//             <div className="resources-header">
//               <h6>Lesson Resources ({lesson.resources?.length || 0})</h6>
//               <button onClick={addResource} className="btn-primary btn-sm" disabled={isAddingResource}>
//                 {isAddingResource ? 'Adding...' : '+ Add Resource'}
//               </button>
//             </div>

//             {(!lesson.resources || lesson.resources.length === 0) ? (
//               <p className="empty-resource">No resources yet</p>
//             ) : (
//               <div className="resources-grid">
//                 {lesson.resources.map((resource, resourceIndex) => (
//                   <LessonResource
//                     key={resource.id || resourceIndex}
//                     resource={resource}
//                     sectionIndex={sectionIndex}
//                     subsectionIndex={subsectionIndex}
//                     lessonIndex={lessonIndex}
//                     resourceIndex={resourceIndex}
//                     sections={sections}
//                     setSections={setSections}
//                     onUpdate={onUpdate}
//                     isExistingInDatabase={isExistingInDatabase}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // export default Lesson;
// import React, { useCallback, useState } from 'react';
// import LessonResource from './LessonResource';

// // Helper function to detect YouTube video ID
// const getYouTubeVideoId = (url) => {
//   if (!url) return null;
//   const match = url.match(
//     /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
//   );
//   return match ? match[1] : null;
// };

// const Lesson = ({
//   lesson,
//   sectionIndex,
//   subsectionIndex,
//   lessonIndex,
//   sections,
//   setSections,
//   onUpdate,
//   isExistingInDatabase,
//   isExpanded,
//   onToggle
// }) => {
//   const [isAddingResource, setIsAddingResource] = useState(false);
//   const [videoSource, setVideoSource] = useState(
//     lesson.video_file ? 'upload' : (lesson.video_url ? 'url' : 'upload')
//   );

//   const updateLesson = useCallback(
//     (field, value) => {
//       const updatedSections = sections.map((section, secIndex) => {
//         if (secIndex === sectionIndex) {
//           const updatedSubsections = section.subsections.map((sub, subIdx) => {
//             if (subIdx === subsectionIndex) {
//               const updatedLessons = sub.lessons.map((les, lesIdx) =>
//                 lesIdx === lessonIndex ? { ...les, [field]: value } : les
//               );
//               return { ...sub, lessons: updatedLessons };
//             }
//             return sub;
//           });
//           return { ...section, subsections: updatedSubsections };
//         }
//         return section;
//       });
//       setSections(updatedSections);
//       onUpdate(updatedSections);
//     },
//     [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]
//   );

//   const deleteLesson = useCallback(() => {
//     const lessonToDelete = sections[sectionIndex]?.subsections[subsectionIndex]?.lessons[lessonIndex];

//     if (lessonToDelete?.id) {
//       if (window.confirm('This lesson exists in the database. Do you want to delete it permanently?')) {
//         console.log('Should delete existing lesson from database:', lessonToDelete.id);
//       } else {
//         return;
//       }
//     }

//     const updatedSections = sections.map((section, secIndex) => {
//       if (secIndex === sectionIndex) {
//         const updatedSubsections = section.subsections.map((sub, subIdx) => {
//           if (subIdx === subsectionIndex) {
//             const updatedLessons = sub.lessons.filter((_, lesIdx) => lesIdx !== lessonIndex);
//             return { ...sub, lessons: updatedLessons };
//           }
//           return sub;
//         });
//         return { ...section, subsections: updatedSubsections };
//       }
//       return section;
//     });
//     setSections(updatedSections);
//     onUpdate(updatedSections);
//   }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

//   const addResource = useCallback(() => {
//     if (isAddingResource) return;

//     setIsAddingResource(true);
//     try {
//       const updatedSections = sections.map((section, secIndex) => {
//         if (secIndex === sectionIndex) {
//           const updatedSubsections = section.subsections.map((sub, subIdx) => {
//             if (subIdx === subsectionIndex) {
//               const updatedLessons = sub.lessons.map((les, lesIdx) => {
//                 if (lesIdx === lessonIndex) {
//                   const newResource = {
//                     title: `Resource ${(les.resources?.length || 0) + 1}`,
//                     file: null,
//                     resource_type: 'document',
//                     order: les.resources?.length || 0,
//                     lesson: lessonIndex,
//                     isExisting: false
//                   };
//                   return {
//                     ...les,
//                     resources: [...(les.resources || []), newResource]
//                   };
//                 }
//                 return les;
//               });
//               return { ...sub, lessons: updatedLessons };
//             }
//             return sub;
//           });
//           return { ...section, subsections: updatedSubsections };
//         }
//         return section;
//       });
//       setSections(updatedSections);
//       onUpdate(updatedSections);
//     } finally {
//       setTimeout(() => setIsAddingResource(false), 300);
//     }
//   }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate, isAddingResource]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
//       if (!validVideoTypes.includes(file.type)) {
//         alert('Please select a valid video file (MP4, MOV, AVI, MKV, WebM)');
//         return;
//       }

//       if (file.size > 500 * 1024 * 1024) {
//         alert('Video file size must be less than 500MB');
//         return;
//       }

//       updateLesson('video_file', file);

//       if (videoSource === 'upload' && lesson.video_url) {
//         updateLesson('video_url', '');
//       }
//     }
//   };

//   const handleVideoSourceChange = (source) => {
//     setVideoSource(source);

//     if (source === 'upload' && lesson.video_url) {
//       updateLesson('video_url', '');
//     } else if (source === 'url' && lesson.video_file) {
//       updateLesson('video_file', null);
//     }
//   };

//   return (
//     <div className={`lesson-card ${isExistingInDatabase(lesson) ? 'existing-lesson' : 'new-lesson'}`}>
//       {/* Header */}
//       <div
//         className={`lesson-header ${isExpanded ? 'expanded' : ''}`}
//         onClick={() => onToggle(sectionIndex, subsectionIndex, lessonIndex)}
//       >
//         <button
//           className={`lesson-toggle ${isExpanded ? 'expanded' : ''}`}
//           onClick={(e) => {
//             e.stopPropagation();
//             onToggle(sectionIndex, subsectionIndex, lessonIndex);
//           }}
//         >
//           ▶
//         </button>

//         <div className="order-input-group">
//           <label>ORDER</label>
//           <input
//             type="number"
//             value={lesson.order !== undefined ? lesson.order : lessonIndex}
//             onChange={(e) => updateLesson('order', parseInt(e.target.value) || 0)}
//             className="order-input"
//             min="0"
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>

//         <input
//           type="text"
//           value={lesson.title}
//           onChange={(e) => updateLesson('title', e.target.value)}
//           className="lesson-title-input"
//           placeholder="Lesson title"
//           onClick={(e) => e.stopPropagation()}
//         />

//         <div className="lesson-status">
//           <span className={`status-badge ${isExistingInDatabase(lesson) ? 'existing' : 'new'}`}>
//             {isExistingInDatabase(lesson) ? 'EXISTING' : 'NEW'}
//           </span>
//           {lesson.video_file && <span className="upload-badge">UPLOADED</span>}
//         </div>

//         <div className="lesson-actions">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               addResource();
//             }}
//             className="btn-secondary"
//             disabled={isAddingResource}
//           >
//             + Add Resource
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               deleteLesson();
//             }}
//             className="btn-danger"
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//       {/* Content */}
//       {isExpanded && (
//         <div className="lesson-content">
//           <label className="section-label">Lesson Content</label>
//           <textarea
//             value={lesson.content}
//             onChange={(e) => updateLesson('content', e.target.value)}
//             placeholder="Enter lesson content..."
//             rows={4}
//             className="lesson-content-textarea"
//           />

//           {/* Video Settings */}
//           <div className="lesson-content-section">
//             <label className="section-label">Video Settings</label>

//             <div className="video-source-toggle">
//               <label className="toggle-option">
//                 <input
//                   type="radio"
//                   value="upload"
//                   checked={videoSource === 'upload'}
//                   onChange={(e) => handleVideoSourceChange(e.target.value)}
//                 />
//                 <span className="toggle-label">Upload Video File</span>
//               </label>
//               <label className="toggle-option">
//                 <input
//                   type="radio"
//                   value="url"
//                   checked={videoSource === 'url'}
//                   onChange={(e) => handleVideoSourceChange(e.target.value)}
//                 />
//                 <span className="toggle-label">Use Video URL</span>
//               </label>
//             </div>

//             {/* Upload File */}
//             {videoSource === 'upload' && (
//               <div className="file-upload-section">
//                 <input
//                   type="file"
//                   accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
//                   onChange={handleFileChange}
//                   className="file-input"
//                 />
//                 {lesson.video_file && (
//                   <video
//                     controls
//                     width="400"
//                     src={
//                       typeof lesson.video_file === 'string'
//                         ? lesson.video_file
//                         : URL.createObjectURL(lesson.video_file)
//                     }
//                     style={{ marginTop: '10px', borderRadius: '8px' }}
//                   />
//                 )}
//               </div>
//             )}

//             {/* Video URL */}
//             {videoSource === 'url' && (
//               <div className="form-group">
//                 <label>Video URL</label>
//                 <input
//                   type="url"
//                   value={lesson.video_url || ''}
//                   onChange={(e) => updateLesson('video_url', e.target.value)}
//                   placeholder="https://youtube.com/watch?v=..."
//                   className="meta-input"
//                 />
//                 <small>Supports YouTube, Vimeo, or direct video links</small>

//                 {lesson.video_url && (() => {
//                   const videoId = getYouTubeVideoId(lesson.video_url);
//                   return videoId ? (
//                     <iframe
//                       width="400"
//                       height="225"
//                       src={`https://www.youtube.com/embed/${videoId}`}
//                       title="YouTube video preview"
//                       frameBorder="0"
//                       allowFullScreen
//                       style={{ marginTop: '10px', borderRadius: '8px' }}
//                     ></iframe>
//                   ) : (
//                     <video
//                       controls
//                       src={lesson.video_url}
//                       width="400"
//                       style={{ marginTop: '10px', borderRadius: '8px' }}
//                     />
//                   );
//                 })()}
//               </div>
//             )}
//           </div>

//           {/* Lesson Resources */}
//           <div className="lesson-content-section">
//             <div className="resources-header">
//               <div className="resources-title">
//                 <h6>Lesson Resources</h6>
//                 <span className="resource-count">{lesson.resources?.length || 0} resource(s)</span>
//               </div>
//               <button onClick={addResource} className="btn-primary btn-sm" disabled={isAddingResource}>
//                 {isAddingResource ? 'Adding...' : '+ Add Resource'}
//               </button>
//             </div>

//             {(!lesson.resources || lesson.resources.length === 0) ? (
//               <div className="empty-resource-state">
//                 <div className="empty-resource-icon">📎</div>
//                 <p>No resources added yet</p>
//                 <button onClick={addResource} className="btn-primary" disabled={isAddingResource}>
//                   Add First Resource
//                 </button>
//               </div>
//             ) : (
//               <div className="resources-grid">
//                 {lesson.resources.map((resource, resourceIndex) => (
//                   <LessonResource
//                     key={resource.id || resourceIndex}
//                     resource={resource}
//                     sectionIndex={sectionIndex}
//                     subsectionIndex={subsectionIndex}
//                     lessonIndex={lessonIndex}
//                     resourceIndex={resourceIndex}
//                     sections={sections}
//                     setSections={setSections}
//                     onUpdate={onUpdate}
//                     isExistingInDatabase={isExistingInDatabase}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };



import React, { useCallback, useState } from 'react';
import LessonResource from '../components/course_management/CourseStructure/LessonResource';

// Helper function to detect YouTube video ID
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : null;
};

const Lesson = ({
  lesson,
  sectionIndex,
  subsectionIndex,
  lessonIndex,
  sections,
  setSections,
  onUpdate,
  isExistingInDatabase,
  isExpanded,
  onToggle
}) => {
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [videoSource, setVideoSource] = useState(
    lesson.video_file ? 'upload' : (lesson.video_url ? 'url' : 'upload')
  );

  // ✅ ADD RESOURCE API CALLBACKS
  const handleResourceCreate = useCallback((newResourceData, sectionIndex, subsectionIndex, lessonIndex, resourceIndex) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((subsection, subIndex) => {
          if (subIndex === subsectionIndex) {
            const updatedLessons = subsection.lessons.map((lesson, lesIndex) => {
              if (lesIndex === lessonIndex) {
                const updatedResources = lesson.resources.map((resource, resIndex) => {
                  if (resIndex === resourceIndex) {
                    return { 
                      ...newResourceData, 
                      isExisting: true 
                    };
                  }
                  return resource;
                });
                return { ...lesson, resources: updatedResources };
              }
              return lesson;
            });
            return { ...subsection, lessons: updatedLessons };
          }
          return subsection;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    
    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, setSections, onUpdate]);

  const handleResourceUpdate = useCallback((resourceId, updatedData) => {
    const updatedSections = sections.map(section => ({
      ...section,
      subsections: section.subsections.map(subsection => ({
        ...subsection,
        lessons: subsection.lessons.map(lesson => ({
          ...lesson,
          resources: lesson.resources.map(resource => 
            resource.id === resourceId ? { 
              ...updatedData, 
              isExisting: true 
            } : resource
          )
        }))
      }))
    }));
    
    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, setSections, onUpdate]);

  const handleResourceDelete = useCallback((resourceId, sectionIndex, subsectionIndex, lessonIndex, resourceIndex) => {
    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((subsection, subIndex) => {
          if (subIndex === subsectionIndex) {
            const updatedLessons = subsection.lessons.map((lesson, lesIndex) => {
              if (lesIndex === lessonIndex) {
                const updatedResources = lesson.resources.filter((_, resIndex) => resIndex !== resourceIndex);
                return { ...lesson, resources: updatedResources };
              }
              return lesson;
            });
            return { ...subsection, lessons: updatedLessons };
          }
          return subsection;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    
    setSections(updatedSections);
    if (onUpdate) {
      onUpdate(updatedSections);
    }
  }, [sections, setSections, onUpdate]);

  const updateLesson = useCallback(
    (field, value) => {
      const updatedSections = sections.map((section, secIndex) => {
        if (secIndex === sectionIndex) {
          const updatedSubsections = section.subsections.map((sub, subIdx) => {
            if (subIdx === subsectionIndex) {
              const updatedLessons = sub.lessons.map((les, lesIdx) =>
                lesIdx === lessonIndex ? { ...les, [field]: value } : les
              );
              return { ...sub, lessons: updatedLessons };
            }
            return sub;
          });
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      });
      setSections(updatedSections);
      onUpdate(updatedSections);
    },
    [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]
  );

  const deleteLesson = useCallback(() => {
    const lessonToDelete = sections[sectionIndex]?.subsections[subsectionIndex]?.lessons[lessonIndex];

    if (lessonToDelete?.id) {
      if (window.confirm('This lesson exists in the database. Do you want to delete it permanently?')) {
        console.log('Should delete existing lesson from database:', lessonToDelete.id);
      } else {
        return;
      }
    }

    const updatedSections = sections.map((section, secIndex) => {
      if (secIndex === sectionIndex) {
        const updatedSubsections = section.subsections.map((sub, subIdx) => {
          if (subIdx === subsectionIndex) {
            const updatedLessons = sub.lessons.filter((_, lesIdx) => lesIdx !== lessonIndex);
            return { ...sub, lessons: updatedLessons };
          }
          return sub;
        });
        return { ...section, subsections: updatedSubsections };
      }
      return section;
    });
    setSections(updatedSections);
    onUpdate(updatedSections);
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate]);

  const addResource = useCallback(() => {
    if (isAddingResource) return;

    setIsAddingResource(true);
    try {
      const updatedSections = sections.map((section, secIndex) => {
        if (secIndex === sectionIndex) {
          const updatedSubsections = section.subsections.map((sub, subIdx) => {
            if (subIdx === subsectionIndex) {
              const updatedLessons = sub.lessons.map((les, lesIdx) => {
                if (lesIdx === lessonIndex) {
                  const newResource = {
                    title: `Resource ${(les.resources?.length || 0) + 1}`,
                    file: null,
                    resource_type: 'document',
                    order: les.resources?.length || 0,
                    lesson: lessonIndex,
                    isExisting: false
                  };
                  return {
                    ...les,
                    resources: [...(les.resources || []), newResource]
                  };
                }
                return les;
              });
              return { ...sub, lessons: updatedLessons };
            }
            return sub;
          });
          return { ...section, subsections: updatedSubsections };
        }
        return section;
      });
      setSections(updatedSections);
      onUpdate(updatedSections);
    } finally {
      setTimeout(() => setIsAddingResource(false), 300);
    }
  }, [sectionIndex, subsectionIndex, lessonIndex, sections, setSections, onUpdate, isAddingResource]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
      if (!validVideoTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, MOV, AVI, MKV, WebM)');
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        alert('Video file size must be less than 500MB');
        return;
      }

      updateLesson('video_file', file);

      if (videoSource === 'upload' && lesson.video_url) {
        updateLesson('video_url', '');
      }
    }
  };

  const handleVideoSourceChange = (source) => {
    setVideoSource(source);

    if (source === 'upload' && lesson.video_url) {
      updateLesson('video_url', '');
    } else if (source === 'url' && lesson.video_file) {
      updateLesson('video_file', null);
    }
  };

  return (
    <div className={`lesson-card ${isExistingInDatabase(lesson) ? 'existing-lesson' : 'new-lesson'}`}>
      {/* Header */}
      <div
        className={`lesson-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => onToggle(sectionIndex, subsectionIndex, lessonIndex)}
      >
        <button
          className={`lesson-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(sectionIndex, subsectionIndex, lessonIndex);
          }}
        >
          ▶
        </button>

        <div className="order-input-group">
          <label>ORDER</label>
          <input
            type="number"
            value={lesson.order !== undefined ? lesson.order : lessonIndex}
            onChange={(e) => updateLesson('order', parseInt(e.target.value) || 0)}
            className="order-input"
            min="0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <input
          type="text"
          value={lesson.title}
          onChange={(e) => updateLesson('title', e.target.value)}
          className="lesson-title-input"
          placeholder="Lesson title"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="lesson-status">
          <span className={`status-badge ${isExistingInDatabase(lesson) ? 'existing' : 'new'}`}>
            {isExistingInDatabase(lesson) ? 'EXISTING' : 'NEW'}
          </span>
          {lesson.video_file && <span className="upload-badge">UPLOADED</span>}
        </div>

        <div className="lesson-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addResource();
            }}
            className="btn-secondary"
            disabled={isAddingResource}
          >
            + Add Resource
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteLesson();
            }}
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="lesson-content">
          <label className="section-label">Lesson Content</label>
          <textarea
            value={lesson.content}
            onChange={(e) => updateLesson('content', e.target.value)}
            placeholder="Enter lesson content..."
            rows={4}
            className="lesson-content-textarea"
          />

          {/* Video Settings */}
          <div className="lesson-content-section">
            <label className="section-label">Video Settings</label>

            <div className="video-source-toggle">
              <label className="toggle-option">
                <input
                  type="radio"
                  value="upload"
                  checked={videoSource === 'upload'}
                  onChange={(e) => handleVideoSourceChange(e.target.value)}
                />
                <span className="toggle-label">Upload Video File</span>
              </label>
              <label className="toggle-option">
                <input
                  type="radio"
                  value="url"
                  checked={videoSource === 'url'}
                  onChange={(e) => handleVideoSourceChange(e.target.value)}
                />
                <span className="toggle-label">Use Video URL</span>
              </label>
            </div>

            {/* Upload File */}
            {videoSource === 'upload' && (
              <div className="file-upload-section">
                <input
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {lesson.video_file && (
                  <video
                    controls
                    width="400"
                    src={
                      typeof lesson.video_file === 'string'
                        ? lesson.video_file
                        : URL.createObjectURL(lesson.video_file)
                    }
                    style={{ marginTop: '10px', borderRadius: '8px' }}
                  />
                )}
              </div>
            )}

            {/* Video URL */}
            {videoSource === 'url' && (
              <div className="form-group">
                <label>Video URL</label>
                <input
                  type="url"
                  value={lesson.video_url || ''}
                  onChange={(e) => updateLesson('video_url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="meta-input"
                />
                <small>Supports YouTube, Vimeo, or direct video links</small>

                {lesson.video_url && (() => {
                  const videoId = getYouTubeVideoId(lesson.video_url);
                  return videoId ? (
                    <iframe
                      width="400"
                      height="225"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video preview"
                      frameBorder="0"
                      allowFullScreen
                      style={{ marginTop: '10px', borderRadius: '8px' }}
                    ></iframe>
                  ) : (
                    <video
                      controls
                      src={lesson.video_url}
                      width="400"
                      style={{ marginTop: '10px', borderRadius: '8px' }}
                    />
                  );
                })()}
              </div>
            )}

            {/* Lesson Meta Fields */}
            <div className="lesson-meta-grid">
              <div className="meta-field">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={lesson.duration_minutes || 0}
                  onChange={(e) => updateLesson('duration_minutes', parseInt(e.target.value) || 0)}
                  min="0"
                  className="meta-input"
                />
              </div>

              <div className="meta-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={lesson.is_preview || false}
                    onChange={(e) => updateLesson('is_preview', e.target.checked)}
                  />
                  Preview Lesson
                </label>
              </div>
            </div>
          </div>

          {/* Lesson Resources */}
          <div className="lesson-content-section">
            <div className="resources-header">
              <div className="resources-title">
                <h6>Lesson Resources</h6>
                <span className="resource-count">{lesson.resources?.length || 0} resource(s)</span>
              </div>
              <button onClick={addResource} className="btn-primary btn-sm" disabled={isAddingResource}>
                {isAddingResource ? 'Adding...' : '+ Add Resource'}
              </button>
            </div>

            {(!lesson.resources || lesson.resources.length === 0) ? (
              <div className="empty-resource-state">
                <div className="empty-resource-icon">📎</div>
                <p>No resources added yet</p>
                <button onClick={addResource} className="btn-primary" disabled={isAddingResource}>
                  Add First Resource
                </button>
              </div>
            ) : (
              <div className="resources-grid">
                {lesson.resources.map((resource, resourceIndex) => (
                  <LessonResource
                    key={resource.id || resourceIndex}
                    resource={resource}
                    sectionIndex={sectionIndex}
                    subsectionIndex={subsectionIndex}
                    lessonIndex={lessonIndex}
                    resourceIndex={resourceIndex}
                    sections={sections}
                    setSections={setSections}
                    onUpdate={onUpdate}
                    isExistingInDatabase={isExistingInDatabase}
                    lessonId={lesson.id} // ✅ Pass lesson ID
                    onResourceCreate={handleResourceCreate} // ✅ Pass callbacks
                    onResourceUpdate={handleResourceUpdate}
                    onResourceDelete={handleResourceDelete}
                  />
                ))}
                {console.log("lessonId",lessonId)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lesson;