import { useState, useEffect } from 'react';
import DreamsList from '../Components/DreamsList';
import SpeechToText from '../Components/SpeechToText';
import '../css/Home.css';

const Home = () => {
    const [dreams, setDreams] = useState([]);

    useEffect(() => {
        fetchDreams();
    }, []);

    const fetchDreams = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/get-dreams');
            if (!response.ok) {
                throw new Error('Failed to fetch dreams');
            }
            const data = await response.json();
            setDreams(data.dreams);
        } catch (err) {
            console.error('Failed to fetch dreams:', err);
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>✨ Dream Summarizer</h1>
            </header>
            <div className="home-layout">
                <div className="dreams-sidebar">
                    <DreamsList dreams={dreams} />
                </div>
                <div className="main-content">
                    <SpeechToText setDreams={setDreams} dreams={dreams} />
                </div>
            </div>
        </div>
    );
};

export default Home;