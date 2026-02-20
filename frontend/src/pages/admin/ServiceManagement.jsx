import "./ServiceManagement.css"
import AdminSidebar from "../../components/AdminSidebar";

function ServiceManagement(){
    return(
        <div className = "admin-layout">
        <AdminSidebar></AdminSidebar>
        <div className = "admin-shell">
            <h2>Service Management</h2>

            <div className = "admin-card-container">

                <div className = "admin-card-1">
                    <h1>Create Service</h1>
                    <p>Create Brand New Custom Services</p>
                    <form className = "admin-create-form">
                        <div className = "form-group">
                            <label>Service Name:</label>
                            <input type="text" required maxLength="100" />
                        </div>
                        <div className = "form-group">
                            <label>Description:</label>
                            <textarea rows = "5" required></textarea>
                        </div>
                        <div className = "form-group">
                            <label>Expected Duration:</label>
                            <input type = "number"  required min = "1"/>
                        </div>
                        <div className = "form-group" >
                            <label>Priority: </label>
                            <select defaultValue="" required>
                                <option value="" disabled hidden></option>
                                <option value = "high">High</option>
                                <option value = "medium">Medium</option>
                                <option value = "low">Low</option>
                            </select>
                        </div>
                        <button type = "submit">Create New Service</button>
                    </form>
                </div>

                <div className = "admin-card-2">
                    <h1>Edit Service</h1>

                    <div className="admin-subcard">
                        <h3>DMV Queue 1</h3>
                        
                        <form className="admin-edit-form">
                            <div className = "edit-left">
                                <div className = "form-group">
                                    <label>Service Name: </label>
                                    <input type = "text" required maxLength="100" />
                                </div>
                                <div className = "form-group">
                                    <label>Expected Duration: </label>
                                    <input type = "number"  required min = "1"/>
                                </div>
                            </div>

                            <div className="edit-middle">
                                <div className = "form-group">
                                    <label>Description:</label>
                                    <textarea rows="2"></textarea>
                                </div>
                            </div>

                            <div className="edit-right">
                                <div className = "form-group" >
                                    <label>Priority: </label>
                                    <select defaultValue="" required>
                                        <option value="" disabled hidden></option>
                                        <option value = "high">High</option>
                                        <option value = "medium">Medium</option>
                                        <option value = "low">Low</option>
                                    </select>
                                </div>
                                <button type="submit" className="save-btn">Save</button>
                            </div>
                        </form>

                    </div>

                    <div className = "admin-subcard">
                        <h3>Banking Queue 1</h3>

                        <form className="admin-edit-form">
                            <div className = "edit-left">
                                <div className = "form-group">
                                    <label>Service Name: </label>
                                    <input type = "text" required maxLength="100" />
                                </div>
                                <div className = "form-group">
                                    <label>Expected Duration: </label>
                                    <input type = "number"  required min = "1"/>
                                </div>
                            </div>

                            <div className="edit-middle">
                                <div className = "form-group">
                                    <label>Description:</label>
                                    <textarea rows="2"></textarea>
                                </div>
                            </div>

                            <div className="edit-right">
                                <div className = "form-group" >
                                <label>Priority: </label>
                                    <select defaultValue="" required>
                                        <option value="" disabled hidden></option>
                                        <option value = "high">High</option>
                                        <option value = "medium">Medium</option>
                                        <option value = "low">Low</option>
                                    </select>
                                </div>
                                <button type="submit" className="save-btn">Save</button>
                            </div>
                        </form>
                    </div>

                    <div className = "admin-subcard">
                        <h3>Student Advising Queue 1</h3>

                        <form className="admin-edit-form">
                            <div className = "edit-left">
                                <div className = "form-group">
                                    <label>Service Name: </label>
                                    <input type = "text" required maxLength="100" />
                                </div>
                                <div className = "form-group">
                                    <label>Expected Duration: </label>
                                    <input type = "number"  required min = "1"/>
                                </div>
                            </div>

                            <div className="edit-middle">
                                <div className = "form-group">
                                    <label>Description:</label>
                                    <textarea rows="2"></textarea>
                                </div>
                            </div>

                            <div className="edit-right">
                                <div className = "form-group" >
                                    <label>Priority: </label>
                                    <select defaultValue="" required>
                                    <option value="" disabled hidden></option>
                                        <option value = "high">High</option>
                                        <option value = "medium">Medium</option>
                                        <option value = "low">Low</option>
                                    </select>
                                </div>
                                <button type="submit" className="save-btn">Save</button>
                            </div>
                        </form>
                    </div>

                    <div className = "admin-subcard">
                        <h3>placeholder</h3>

                        <form className="admin-edit-form">
                            <div className = "edit-left">
                                <div className = "form-group">
                                    <label>Service Name: </label>
                                    <input type = "text" required maxLength="100" />
                                </div>
                                <div className = "form-group">
                                    <label>Expected Duration: </label>
                                    <input type = "number"  required min = "1"/>
                                </div>
                            </div>

                            <div className="edit-middle">
                                <div className = "form-group">
                                    <label>Description:</label>
                                    <textarea rows="2"></textarea>
                                </div>
                            </div>

                            <div className="edit-right">
                                <div className = "form-group" >
                                    <label>Priority: </label>
                                    <select defaultValue="" required>
                                    <option value="" disabled hidden></option>
                                        <option value = "high">High</option>
                                        <option value = "medium">Medium</option>
                                        <option value = "low">Low</option>
                                    </select>
                                </div>
                                <button type="submit" className="save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default ServiceManagement;