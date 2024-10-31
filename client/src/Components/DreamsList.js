import '../css/DreamsList.css';

const DreamsList = ({ dreams }) => {
    return (
        <div className="dreams-list">
            <h2>Dream Journal</h2>
            {dreams.length === 0 ? (
                <p>No dreams recorded yet.</p>
            ) : (
                <ul>
                    {dreams.map((dream) => (
                        <li key={dream.id} className="dream-item">
                            <h3>{dream.title}</h3>
                            <p>{dream.summary}</p>
                            <span className="dream-date">
                                {new Date(dream.created_at).toLocaleDateString()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DreamsList;