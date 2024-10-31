import { createContext, useContext, useState } from 'react';

const DreamsContext = createContext();

export const DreamsProvider = ({ children }) => {
    const [shouldRefresh, setShouldRefresh] = useState(false);

    const refreshDreams = () => {
        setShouldRefresh(prev => !prev);
    };

    return (
        <DreamsContext.Provider value={{ shouldRefresh, refreshDreams }}>
            {children}
        </DreamsContext.Provider>
    );
};

export const useDreams = () => useContext(DreamsContext);
