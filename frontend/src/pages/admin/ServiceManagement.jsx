import { useState, useEffect, useContext } from "react";
import "./ServiceManagement.css";
import AdminSidebar from "../../components/AdminSidebar";
import { getAuthHeaders } from "../../utils/auth";
import { QueueContext } from "../../context/QueueContext";
import { useNotifications } from "../../context/NotificationContext";

// Service edit form (uses notifications internally)
const SubcategoryEditor = ({ subcategories, onChange }) => {
    const [newName, setNewName] = useState("");
    const [newPriority, setNewPriority] = useState("Low");

    const handleAdd = () => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        if (subcategories.find(sc => sc.name === trimmed)) return;
        onChange([...subcategories, { name: trimmed, priority: newPriority }]);
        setNewName("");
        setNewPriority("Low");
    };

    const handleRemove = (name) => onChange(subcategories.filter(sc => sc.name !== name));

    const handlePriorityChange = (name, priority) =>
        onChange(subcategories.map(sc => sc.name === name ? { ...sc, priority } : sc));

    return (
        <div className="subcategory-editor">
            <label>Subcategories:</label>
            {subcategories.map(sc => (
                <div key={sc.name} className="subcategory-row">
                    <span className="subcategory-name">{sc.name}</span>
                    <select value={sc.priority} onChange={(e) => handlePriorityChange(sc.name, e.target.value)}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <button type="button" className="delete-btn" onClick={() => handleRemove(sc.name)}>✕</button>
                </div>
            ))}
            <div className="subcategory-add-row">
                <input
                    type="text"
                    placeholder="Subcategory name"
                    value={newName}
                    maxLength={100}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                />
                <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <button type="button" className="save-btn" onClick={handleAdd}>Add</button>
            </div>
        </div>
    );
};

const ServiceEditForm = ({ serviceId, title, status, initialData, onRefresh, onClose }) => {
    const { addNotification } = useNotifications();
    const [formData, setFormData] = useState({
        name: initialData.name || "",
        duration: initialData.duration || "",
        description: initialData.description || "",
        priority: initialData.priority || "",
        category: initialData.category || "",
        status: status || "open"
    });
    const [subcategories, setSubcategories] = useState(initialData.subcategories || []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/services/${serviceId}`, {
                method: 'PUT',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    ...formData,
                    duration: Number(formData.duration),
                    subcategories
                })
            });
            const data = await response.json();
            console.log(`${title} updated:`, data);

            const actionMap = { open: 'open', paused: 'pause', closed: 'close' };
            await fetch(`http://localhost:8080/api/queues/${serviceId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ action: actionMap[formData.status] })
            });

            addNotification(`${formData.name} successfully updated!`, "success");
            onRefresh();
            onClose();
        } catch (error) {
            console.error(`Error updating ${title}:`, error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${title}"? This will remove its queue and all waiting entries.`)) return;
        try {
            const response = await fetch(`http://localhost:8080/api/services/${serviceId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            addNotification(data.message, "info");
            onRefresh();
            onClose();
        } catch (error) {
            console.error(`Error deleting ${title}:`, error);
        }
    };

    return (
        <div className="service-edit-expanded">
            <form className="admin-edit-form" onSubmit={handleSubmit}>
                <div className="edit-left">
                    <div className="form-group">
                        <label>Service Name: </label>
                        <input
                            type="text"
                            name="name"
                            required maxLength="100"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Expected Duration: </label>
                        <input
                            type="number"
                            name="duration"
                            required min="1"
                            value={formData.duration}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Status:</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="open">Open</option>
                            <option value="paused">Paused</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
                <div className="edit-middle">
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            rows="2"
                            name="description"
                            required value={formData.description}
                            onChange={handleChange}>
                        </textarea>
                    </div>
                </div>
                <div className="edit-right">
                    <div className="form-group">
                        <label>Category:</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="" disabled hidden></option>
                            <option value="DMV">DMV</option>
                            <option value="Banking">Banking</option>
                            <option value="Student Advising">Student Advising</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Priority: </label>
                        <select name="priority" required value={formData.priority} onChange={handleChange}>
                            <option value="" disabled hidden></option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div className="edit-form-actions">
                        <button type="submit" className="save-btn">Save</button>
                        <button type="button" className="delete-btn" onClick={handleDelete}>Delete</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </form>
            <SubcategoryEditor subcategories={subcategories} onChange={setSubcategories} />
        </div>
    );
};

function ServiceManagement() {
    const { queueStatuses } = useContext(QueueContext);
    const { addNotification } = useNotifications();
    const [services, setServices] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [activeView, setActiveView] = useState('edit'); // 'create' or 'edit'

    const fetchServices = () => {
        fetch('http://localhost:8080/api/services', {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => setServices(data.services))
            .catch(err => console.error("Failed to fetch services:", err));
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const [newService, setNewService] = useState({
        category: '',
        name: '',
        description: '',
        duration: '',
        priority: ''
    });
    const [newServiceSubcategories, setNewServiceSubcategories] = useState([]);

    const handleNewServiceChange = (e) => {
        setNewService({ ...newService, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const generatedId = newService.name.toLowerCase().replace(/\s+/g, '');

            const response = await fetch('http://localhost:8080/api/services', {
                method: 'POST',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    id: generatedId,
                    ...newService,
                    duration: Number(newService.duration),
                    subcategories: newServiceSubcategories
                })
            });

            if (response.ok) {
                addNotification("Service successfully created!", "success");
                setNewService({ category: '', name: '', description: '', duration: '', priority: '' });
                setNewServiceSubcategories([]);
                fetchServices();
            } else {
                const err = await response.json();
                addNotification(`Failed to create service: ${err.message}`, "warning");
            }
        } catch (error) {
            console.error("Error creating service:", error);
        }
    };

    const createCard = (
        <div className="admin-card-1">
            <form className="admin-create-form" onSubmit={handleCreate}>
                <div className="form-group">
                    <label>Service Category:</label>
                    <select name="category" value={newService.category} onChange={handleNewServiceChange} required>
                        <option value="" disabled hidden></option>
                        <option value="DMV">DMV</option>
                        <option value="Banking">Banking</option>
                        <option value="Student Advising">Student Advising</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Queue Name:</label>
                    <input type="text" name="name" value={newService.name} onChange={handleNewServiceChange} required maxLength="100" />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea rows="5" name="description" value={newService.description} onChange={handleNewServiceChange} required></textarea>
                </div>
                <div className="form-group">
                    <label>Expected Duration:</label>
                    <input type="number" name="duration" value={newService.duration} onChange={handleNewServiceChange} required min="1" />
                </div>
                <div className="form-group">
                    <label>Priority: </label>
                    <select name="priority" value={newService.priority} onChange={handleNewServiceChange} required>
                        <option value="" disabled hidden></option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <SubcategoryEditor subcategories={newServiceSubcategories} onChange={setNewServiceSubcategories} />
                <button type="submit">Create New Service</button>
            </form>
        </div>
    );

    const editCard = (
        <div className="admin-card-2">
            <div className="service-table-shell">
                <div className="service-table-header">
                    <div className="service-col service-col-name">Queue Name</div>
                    <div className="service-col">Duration</div>
                    <div className="service-col">Category</div>
                    <div className="service-col">Priority</div>
                    <div className="service-col">Status</div>
                    <div className="service-col service-col-action">Action</div>
                </div>
                <div className="service-table-body">
                    {services ? (
                        services.map((service) => (
                            <div key={service.id}>
                                <div className="service-row">
                                    <div className="service-col service-col-name">
                                        <div className="service-name">{service.name}</div>
                                        <div className="service-desc">{service.description}</div>
                                    </div>
                                    <div className="service-col">{service.duration} min</div>
                                    <div className="service-col">{service.category || "—"}</div>
                                    <div className="service-col">
                                        <span className={`service-chip service-priority-${service.priority?.toLowerCase() || 'low'}`}>
                                            {service.priority || "Low"}
                                        </span>
                                    </div>
                                    <div className="service-col">
                                        <span className={`service-chip service-status-${queueStatuses?.[service.id]?.toLowerCase() || 'open'}`}>
                                            {queueStatuses?.[service.id] || "open"}
                                        </span>
                                    </div>
                                    <div className="service-col service-col-action">
                                        <button
                                            type="button"
                                            className="edit-btn"
                                            onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                                        >
                                            {expandedId === service.id ? "Close" : "Edit"}
                                        </button>
                                    </div>
                                </div>
                                {expandedId === service.id && (
                                    <ServiceEditForm
                                        serviceId={service.id}
                                        title={service.name}
                                        status={queueStatuses?.[service.id] || 'open'}
                                        initialData={service}
                                        onRefresh={fetchServices}
                                        onClose={() => setExpandedId(null)}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="service-loading">Loading services...</div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-shell">
                <h2>Service Management</h2>
                <div className="view-toggle-buttons">
                    <button
                        className={`toggle-btn ${activeView === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveView('create')}
                    >
                        Create Queue
                    </button>
                    <button
                        className={`toggle-btn ${activeView === 'edit' ? 'active' : ''}`}
                        onClick={() => setActiveView('edit')}
                    >
                        Edit Queue
                    </button>
                </div>
                <div className="admin-card-container">
                    {activeView === 'create' ? createCard : null}
                    {activeView === 'edit' ? editCard : null}
                </div>
            </div>
        </div>
    );
}

export default ServiceManagement;
