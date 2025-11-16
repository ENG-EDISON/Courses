// components/course/Requirements.js
import "../css/Requirements.css"

function Requirements({ requirements }) {
    const formatRequirements = (text) => {
        if (!text) return null;
        
        // Split by lines and process each line
        const lines = text.split('\n').filter(line => line.trim());
        let inNumberedList = false;
        
        return lines.map((line, index) => {
            const trimmedLine = line.trim();
            const indented = line.startsWith(' ') || line.startsWith('\t');
            
            // Check if line starts with main number (like "1.", "2.", etc.)
            if (/^\d+\.\s/.test(trimmedLine)) {
                inNumberedList = false;
                return (
                    <div key={index} className="requirement-section">
                        <h4 className="requirement-heading">{trimmedLine}</h4>
                    </div>
                );
            }
            
            // Check if line starts with simple number (like "1", "2", etc.) - for the resistors list
            if (/^\d+\./.test(trimmedLine)) {
                inNumberedList = true;
                return (
                    <div key={index} className="requirement-numbered-item">
                        <span className="requirement-number">{trimmedLine}</span>
                    </div>
                );
            }
            
            // Check if line starts with arrow (>)
            if (trimmedLine.startsWith('>')) {
                return (
                    <div key={index} className="requirement-arrow-item">
                        <i className="fas fa-chevron-right requirement-arrow-icon"></i>
                        <span>{trimmedLine.substring(1).trim()}</span>
                    </div>
                );
            }
            
            // Check if line is indented (sub-items)
            if (indented && !inNumberedList) {
                return (
                    <div key={index} className="requirement-subitem">
                        <span className="subitem-bullet">•</span>
                        <span>{trimmedLine}</span>
                    </div>
                );
            }
            
            // Check if line contains colon (for definitions)
            if (trimmedLine.includes(':') && !trimmedLine.startsWith('>')) {
                const parts = trimmedLine.split(':');
                if (parts.length >= 2) {
                    return (
                        <div key={index} className="requirement-definition">
                            <strong>{parts[0].trim()}:</strong>
                            <span>{parts.slice(1).join(':').trim()}</span>
                        </div>
                    );
                }
            }
            
            // Check for parenthetical notes
            if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
                return (
                    <div key={index} className="requirement-note">
                        <i className="fas fa-info-circle note-icon"></i>
                        <span>{trimmedLine}</span>
                    </div>
                );
            }
            
            // Regular paragraph (new line) - check if it's likely a heading
            const isLikelyHeading = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(trimmedLine) && 
                                   !trimmedLine.includes('.') && 
                                   trimmedLine.length < 50;
            
            if (isLikelyHeading) {
                return (
                    <div key={index} className="requirement-subheading-plain">
                        <h5>{trimmedLine}</h5>
                    </div>
                );
            }
            
            // Regular paragraph
            return (
                <p key={index} className="requirement-paragraph">
                    {trimmedLine}
                </p>
            );
        });
    };

    return (
        <section className="content-section">
            <div className="section-header">
                <i className="fas fa-tools"></i>
                <h2>Requirements</h2>
            </div>
            <div className="section-content">
                <div className="requirements-content">
                    {formatRequirements(requirements)}
                </div>
            </div>
        </section>
    );
}

export default Requirements;