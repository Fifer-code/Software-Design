// this is where the backend connects to frontend from whatever files necessary
import { createContext, useState, useEffect } from 'react';

export const QueueContext = createContext();        // seems like it always underlined in red

export function QueueProvider({ children }) {
    // need to initialize everything from QueueController and ServiceController, but set them to minumum
    const [waitTimes, setWaitTimes] = useState({ dmv: 0, bank: 0, advising: 0, placeholder: 0 });
    const [queueLists, setQueueLists] = useState({ dmv: [], bank: [], advising: [], placeholder: [] });
    const [services, setServices] = useState(null);

    // fetch the necessary queue data and service data from server.js
    const fetchQueueData = async () => {
        try {
            // connections and logic for the wait times
            const waitRes = await fetch('http://localhost:8080/api/queue/wait-time');
            const waitData = await waitRes.json();
            setWaitTimes({
                dmv: waitData.dmvWaitTime,
                bank: waitData.bankWaitTime,
                advising: waitData.advisingWaitTime,
                placeholder: waitData.placeholderWaitTime,
            });

            // connections and logic for the queue lists and updates
            const listRes = await fetch('http://localhost:8080/api/queue');
            const listData = await listRes.json();
            setQueueLists(listData.queues);

            // connections and logic for service configs and updates
            const serviceRes = await fetch('http://localhost:8080/api/services');
            const serviceData = await serviceRes.json();
            setServices(serviceData.services);
        } catch (err) {
            console.error("Failed to fetch queue data:", err);  // returns error for specific error if it can be found
        }
    };

    // used for initial fetching of data. also seems like it always underlined in red
    useEffect(() => {
        fetchQueueData();
    }, []);

    // need to return the functions done to connect to frontend
    return (
        <QueueContext.Provider value={{ 
            waitTimes, 
            queueLists, 
            services, 
            fetchQueueData
        }}>
            {children}
        </QueueContext.Provider>
    );
}