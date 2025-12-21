// components/FeaturesSection.jsx or Features.jsx
import React from 'react';
import { BookOpen, Users, Target, Clock} from 'lucide-react';
import "../static/FeaturesSection.css";

const FeaturesSection = ({ 
  title = "Why Choose Hayducate?", 
  subtitle = "From beginner to advanced, we provide the tools and resources you need to succeed.",
  features = []
}) => {
  // Default features if none provided
  const defaultFeatures = [
    {
      title: "Expert Courses",
      description: "Learn from industry experts and master practical skills that accelerate your career.",
      icon: <BookOpen className="w-c-u-icon" />,
      color: "blue"
    },
    {
      title: "Interactive Learning",
      description: "Hands-on exercises and projects make learning more engaging and effective.",
      icon: <Users className="w-c-u-icon" />,
      color: "green"
    },
    {
      title: "Career Focused",
      description: "Curriculum designed to match current industry demands and job requirements.",
      icon: <Target className="w-c-u-icon" />,
      color: "purple"
    },
    {
      title: "Flexible Schedule",
      description: "Learn at your own pace with lifetime access to course materials.",
      icon: <Clock className="w-c-u-icon" />,
      color: "orange"
    }
  ];

  const featureItems = features.length > 0 ? features : defaultFeatures;

  return (
    <section className="w-c-u-section">
      <div className="w-c-u-container">
        <h2 className="w-c-u-title">{title}</h2>
        <p className="w-c-u-subtitle">{subtitle}</p>
        <div className="w-c-u-feature-cards">
          {featureItems.map((feature, index) => (
            <div 
              key={index} 
              className={`w-c-u-feature-card w-c-u-feature-${feature.color || 'blue'}`}
            >
              <div className="w-c-u-feature-icon">
                {feature.icon}
              </div>
              <h3 className="w-c-u-feature-title">{feature.title}</h3>
              <p className="w-c-u-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;