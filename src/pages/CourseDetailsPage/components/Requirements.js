// components/course/Requirements.js
function Requirements({ requirements }) {
    return (
        <section className="content-section">
            <div className="section-header">
                <i className="fas fa-tools"></i>
                <h2>Requirements</h2>
            </div>
            <div className="section-content">
                <div className="requirements-content">
                    <p>{requirements}</p>
                </div>
            </div>
        </section>
    );
}

export default Requirements;