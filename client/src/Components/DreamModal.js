import '../css/DreamModal.css';

const DreamModal = ({ dream, onClose }) => {
    if (!dream) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{dream.title}</h2>
                <p className="dream-date">
                    {new Date(dream.created_at).toLocaleDateString()}
                </p>
                <div className="dream-summary">
                    {dream.summary}
                </div>
            </div>
        </div>
    );
};

export default DreamModal;