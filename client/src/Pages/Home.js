import { useState, useEffect } from 'react';
import DreamsList from '../Components/DreamsList';
import SpeechToText from '../Components/SpeechToText';
import '../css/Home.css';

const Home = () => {
    const [dreams, setDreams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDreams = async () => {
            try {
                const response = await fetch('http://localhost:8000/get-dreams', {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch dreams');
                const data = await response.json();
                setDreams(data.dreams);
            } catch (err) {
                console.error('Failed to fetch dreams:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDreams();
    }, []); // Empty dependency array means this only runs once on mount

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>✨ Dream Summarizer</h1>
            </header>
            <div className="home-layout">
                <div className="dreams-sidebar">
                    {isLoading ? (
                        <p>Loading dreams...</p>
                    ) : (
                        <DreamsList dreams={dreams} />
                    )}
                </div>
                <div className="main-content">
                    <SpeechToText setDreams={setDreams} dreams={dreams} />
                </div>
            </div>
        </div>
    );
};

export default Home;