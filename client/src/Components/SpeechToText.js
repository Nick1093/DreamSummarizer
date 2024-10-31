import { useState, useEffect } from 'react';
import '../css/SpeechToText.css';

const SpeechToText = ({setDreams, dreams}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [dreamTitle, setDreamTitle] = useState('');
    const [dreamSummary, setDreamSummary] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setTranscript(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setError(`Error: ${event.error}`);
            setIsListening(false);
        };

        if (isListening) {
            recognition.start();
        }

        return () => {
            recognition.stop();
        };
    }, [isListening]);

    const handleSummarize = async () => {
        if (!transcript) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: transcript }),
            });

            if (!response.ok) {
                throw new Error('Failed to get summary');
            }

            const data = await response.json();
            setDreamTitle(data.dream_summary_title);
            setDreamSummary(data.dream_summary_text);
            setError(''); // Clear any previous errors
        } catch (err) {
            setError('Failed to summarize: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDream = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/save-dream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: dreamTitle,
                    summary: dreamSummary,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save dream');
            }

            const data = await response.json();
            console.log('Dream saved:', data);
            
            // Add the new dream to the existing dreams array
            const newDream = {
                id: data.dream_id,
                title: dreamTitle,
                summary: dreamSummary,
                created_at: data.data.created_at
            };
            
            setDreams([newDream, ...dreams]); // Add new dream at the beginning
            setError('Dream saved successfully! ✨');
            
            // Optional: Clear the form
            clearAll();
        } catch (err) {
            setError('Failed to save dream: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const clearAll = () => {
        setTranscript('');
        setDreamTitle('');
        setDreamSummary('');
        setError('');
    };

    return (
        <div className="speech-container">
            <div className="controls">
                <button 
                    onClick={() => setIsListening(!isListening)}
                    className={isListening ? 'recording' : ''}
                >
                    {isListening ? '🔴 Stop Recording' : '🎤 Start Recording'}
                </button>

                <button 
                    onClick={handleSummarize}
                    disabled={!transcript || isLoading}
                >
                    {isLoading ? '🔄 Processing...' : '✨ Analyze Dream'}
                </button>

                <button 
                    onClick={clearAll}
                    disabled={!transcript && !dreamTitle}
                >
                    🗑️ Clear
                </button>
            </div>

            {error && (
                <div className={error.includes('successfully') ? 'success' : 'error'}>
                    {error}
                </div>
            )}

            <div className="transcript-section">
                <h3>Your Dream:</h3>
                <div className="transcript">
                    {transcript || 'Start speaking to record your dream...'}
                </div>
            </div>

            {(dreamTitle || dreamSummary) && (
                <div className="summary-section">
                    <h3>{dreamTitle}</h3>
                    <div className="summary">
                        {dreamSummary}
                    </div>
                    <button 
                        onClick={handleSaveDream}
                        disabled={isSaving}
                        className="save-button"
                    >
                        {isSaving ? '💾 Saving...' : '💾 Save Dream'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SpeechToText;