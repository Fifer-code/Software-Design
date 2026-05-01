import "./QueueManagement.css";
import AdminSidebar from "../../components/AdminSidebar";
import { useContext, useEffect } from "react";
import { QueueContext } from "../../context/QueueContext";
import { getAuthHeaders } from "../../utils/auth";
import personIcon from '../../assets/person.svg';

function QueueManagement() {
    const { waitTimes, queueLists, queueStatuses, services, fetchQueueData } = useContext(QueueContext);

    useEffect(() => {
        fetchQueueData();
    }, []);

    const handleServeNext = async (serviceId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/queues/${serviceId}/serve`, {
                method: "POST",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                fetchQueueData();
            } else {
                console.error("Failed to serve next:", await response.text());
            }
        } catch (error) {
            console.error("Error serving next user:", error);
        }
    };

    if (!services || !queueLists || !waitTimes) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-shell"><h2>Loading data...</h2></div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-shell">
                <h2>Queue Management</h2>

                <div className="queue-table-shell">
                    <div className="queue-table-header" role="row">
                        <div className="queue-col queue-col-service">Service</div>
                        <div className="queue-col">People in Queue</div>
                        <div className="queue-col">Estimated Wait</div>
                        <div className="queue-col">Priority</div>
                        <div className="queue-col">Status</div>
                        <div className="queue-col queue-col-action">Action</div>
                    </div>

                    <div className="queue-table-body">
                        {services.map((service) => {
                            const people = queueLists?.[service.id]?.length || 0;
                            const wait = waitTimes?.[service.id] || 0;
                            const priority = service.priority || "Low";
                            const status = queueStatuses?.[service.id] || "open";

                            return (
                                <div key={service.id} className="queue-row" role="row">
                                    <div className="queue-col queue-col-service">
                                        <div className="queue-service-name">{service.name || "Unnamed Queue"}</div>
                                        {service.description && (
                                            <div className="queue-service-desc">{service.description}</div>
                                        )}
                                    </div>
                                    <div className="queue-col queue-value"><img src={personIcon} alt="person" className="qm-person-icon"/> {people}</div>
                                    <div className="queue-col queue-value">{wait} min</div>
                                    <div className="queue-col queue-value">
                                        <span className={`queue-chip queue-chip-priority-${priority.toLowerCase()}`}>
                                            {priority}
                                        </span>
                                    </div>
                                    <div className="queue-col queue-value">
                                        <span className={`queue-chip queue-chip-status-${status.toLowerCase()}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div className="queue-col queue-col-action">
                                        <button
                                            type="button"
                                            className="serve-button"
                                            onClick={() => handleServeNext(service.id)}
                                            disabled={people === 0}
                                        >
                                            Serve Next User
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QueueManagement;
