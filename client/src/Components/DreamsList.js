import { useState } from 'react';
import '../css/DreamsList.css';
import DreamModal from './DreamModal';

const DreamsList = ({ dreams }) => {
    const [selectedDream, setSelectedDream] = useState(null);
    const dreamsList = dreams || [];

    return (
        <div className="dreams-list">
            <h2>Dream Journal</h2>
            {!dreamsList.length ? (
                <p>No dreams recorded yet.</p>
            ) : (
                <ul>
                    {dreamsList.map((dream) => (
                        <li 
                            key={dream.id} 
                            className="dream-item"
                            onClick={() => setSelectedDream(dream)}
                        >
                            <h3>{dream.title}</h3>
                            <p>{dream.summary}</p>
                            <span className="dream-date">
                                {new Date(dream.created_at).toLocaleDateString()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            
            {selectedDream && (
                <DreamModal 
                    dream={selectedDream} 
                    onClose={() => setSelectedDream(null)}
                />
            )}
        </div>
    );
};

export default DreamsList;