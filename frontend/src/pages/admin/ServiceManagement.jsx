import "./ServiceManagement.css"
import AdminSidebar from "../../components/AdminSidebar";

function ServiceManagement(){
    return(
        <div className = "admin-layout">
        <AdminSidebar></AdminSidebar>
        <div className = "admin-shell">
            <div className = "admin-card-1">
                <h1>Create Service</h1>
                <p>Create Brand New Custom Services</p>
                <form>
                    <div className = "form-group">
                        <label>Service Name:</label>
                        <input></input>
                    </div>
                    <div className = "form-group">
                        <label>Description:</label>
                        <textarea rows = "5" ></textarea>
                    </div>
                    <div className = "form-group">
                        <label>Expected Duration:</label>
                        <input></input>
                    </div>
                    <div className = "form-group">
                        <label>Priority: </label>
                        <input></input>
                    </div>
                    <button type = "submit">Create New Service</button>
                </form>
            </div>
            <div className = "admin-card-2 service-page">
                <h1>Edit Service</h1>
                <div>
                    <p>Service 1</p>
                </div>
                <div>
                    <p>Service 2</p>
                </div>
                <div>
                    <p>Service 3</p>
                </div>
                <div>
                    <p>Service 4</p>
                </div>
            </div>
        </div>
        </div>
    );
}

export default ServiceManagement;