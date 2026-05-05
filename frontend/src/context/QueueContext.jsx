// this is where the backend connects to frontend from whatever files necessary
import { createContext, useCallback, useState } from 'react';
import { getAuthHeaders } from '../utils/auth';

export const QueueContext = createContext();        // seems like it always underlined in red

export function QueueProvider({ children }) {
    // need to initialize everything from QueueController and ServiceController, but set them to minumum
    const [waitTimes, setWaitTimes] = useState({});
    const [queueLists, setQueueLists] = useState({ dmv: [], bank: [], advising: [] });
    const [queueStatuses, setQueueStatuses] = useState({});
    const [services, setServices] = useState(null);

    // fetch the necessary queue data and service data from server.js
    const fetchQueueData = useCallback(async () => {
        try {
            // connections and logic for the wait times
            const waitRes = await fetch('http://localhost:8080/api/queues/wait-time', {
                headers: getAuthHeaders()
            });
            const waitData = await waitRes.json();
            setWaitTimes(waitData.waitTimes || {});

            // connections and logic for the queue lists and updates
            const listRes = await fetch('http://localhost:8080/api/queues', {
                headers: getAuthHeaders()
            });
            const listData = await listRes.json();
            setQueueLists(listData.queues);
            setQueueStatuses(listData.statuses || {});

            // connections and logic for service configs and updates
            const serviceRes = await fetch('http://localhost:8080/api/services', {
                headers: getAuthHeaders()
            });
            const serviceData = await serviceRes.json();
            setServices(serviceData.services);
        } catch (err) {
            console.error("Failed to fetch queue data:", err);  // returns error for specific error if it can be found
        }
    }, []);

    // need to return the functions done to connect to frontend
    return (
        <QueueContext.Provider value={{
            waitTimes,
            queueLists,
            queueStatuses,
            services,
            fetchQueueData
        }}>
            {children}
        </QueueContext.Provider>
    );
}