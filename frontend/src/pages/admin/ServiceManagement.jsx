import { useState, useEffect } from "react";
import "./ServiceManagement.css";
import AdminSidebar from "../../components/AdminSidebar";

// modular reusable form to edit service
const ServiceEditForm = ({ serviceId, title, initialData }) => {
    // decided on an object rather than variables
    const [formData, setFormData] = useState({
        name: initialData.name || "",
        duration: initialData.duration || "",
        description: initialData.description || "",
        priority: initialData.priority || ""
    });

    // updates form fields
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // connects to the backend to update the specific service by id
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/services/${serviceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    duration: Number(formData.duration)
                })
            });
            const data = await response.json();
            console.log(`${title} updated:`, data);
            alert(`${title} successfully updated!`);
        } catch (error) {
            console.error(`Error updating ${title}:`, error);
        }
    };

    return (
        <div className="admin-subcard">
            <h3>{title}</h3>
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
                        <label>Priority: </label>
                        <select name="priority" required value={formData.priority} onChange={handleChange}>
                            <option value="" disabled hidden></option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <button type="submit" className="save-btn">Save</button>
                </div>
            </form>
        </div>
    );
};

function ServiceManagement() {
    // backend connection and initializatio
    const [services, setServices] = useState(null); 

    // initial fetch of services from server.js
    useEffect(() => {
        fetch('http://localhost:8080/api/services')
            .then(res => res.json())
            .then(data => setServices(data.services))
            .catch(err => console.error("Failed to fetch services:", err));
    }, []);

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-shell">
                <h2>Service Management</h2>
                <div className="admin-card-container">
                    
                    <div className="admin-card-1">
                        <h1>Create Service</h1>
                        <p>Create Brand New Custom Services</p>
                        <form className="admin-create-form">
                            <div className="form-group">
                                <label>Service Name:</label>
                                <input type="text" required maxLength="100" />
                            </div>
                            <div className="form-group">
                                <label>Description:</label>
                                <textarea rows="5" required></textarea>
                            </div>
                            <div className="form-group">
                                <label>Expected Duration:</label>
                                <input type="number" required min="1" />
                            </div>
                            <div className="form-group">
                                <label>Priority: </label>
                                <select defaultValue="" required>
                                    <option value="" disabled hidden></option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <button type="submit">Create New Service</button>
                        </form>
                    </div>

                    <div className="admin-card-2">
                        <h1>Edit Service</h1>
                        
                        {/* checks connection to backend */}
                        {services ? (
                            <>
                                <ServiceEditForm 
                                    serviceId="dmv" 
                                    title="DMV Queue 1" 
                                    initialData={services.dmv} 
                                />
                                <ServiceEditForm 
                                    serviceId="bank"
                                    title="Banking Queue 1"
                                    initialData={services.bank}
                                />
                                <ServiceEditForm
                                    serviceId="advising"
                                    title="Student Advising Queue 1"
                                    initialData={services.advising}
                                />
                                <ServiceEditForm
                                    serviceId="placeholder"
                                    title="Placeholder"
                                    initialData={services.placeholder}
                                />
                            </>
                        ) : (
                            <p>Loading services...</p>
                        )} {/* shows placeholder if not connected to backend */}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ServiceManagement;