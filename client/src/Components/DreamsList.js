import '../css/DreamsList.css';

const DreamsList = ({ dreams }) => {
    // Add a default value if dreams is undefined
    const dreamsList = dreams || [];

    return (
        <div className="dreams-list">
            <h2>Dream Journal</h2>
            {!dreamsList.length ? (
                <p>No dreams recorded yet.</p>
            ) : (
                <ul>
                    {dreamsList.map((dream) => (
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