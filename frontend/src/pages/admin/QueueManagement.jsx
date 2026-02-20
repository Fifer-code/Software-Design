import "./QueueManagement.css"
import AdminSidebar from "../../components/AdminSidebar";

function QueueManagement(){

    return(
        <div className = "admin-layout">
        <AdminSidebar></AdminSidebar>
        <div className = "admin-shell">
            <h2>Queue Management</h2>
            <div className = "admin-card-container">
                <div className = "admin-card-1">
                    <h1>Availabe Queues & Information</h1>

                    <div className = "queue-grid-container">
                        <div className = "admin-subcard">
                            <h3>DMV Queue 1</h3>
                            <div className = "queue-description">
                                <p>People in Queue: 18</p>
                                <p>Estimated Wait: 45 minutes</p>
                                <p>Priority: Low</p>
                                <button type= "submit">Serve Next User</button>
                            </div>
                            <div className = "queue-list-container">
                            <div className = "queue-user">
                                    <p>User 1</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 2</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 3</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 4</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 5</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 6</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 7</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className = "admin-subcard">
                            <h3>Banking Queue 1</h3>
                            <div className = "queue-description">
                                <p>People in Queue: 7</p>
                                <p>Estimated Wait: 25 minutes</p>
                                <p>Priority: Medium</p>
                                <button type= "submit">Serve Next User</button>
                            </div>
                            <div className = "queue-list-container">
                                <div className = "queue-user">
                                    <p>User 1</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 2</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 3</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 4</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 5</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 6</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 7</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className = "admin-subcard">
                            <h3>Student Advising Queue 1</h3>
                            <div className = "queue-description">
                                <p>People in Queue: 4</p>
                                <p>Estimated Wait: 95 minutes</p>
                                <p>Priority: High</p>
                                <button type= "submit">Serve Next User</button>
                            </div>
                            <div className = "queue-list-container">
                                <div className = "queue-user">
                                    <p>User 1</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 2</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 3</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                                <div className = "queue-user">
                                    <p>User 4</p>
                                    <div className = "queue-user-actions">
                                        <button className = "queue-move-buttons">Move up</button>
                                        <button className = "queue-move-buttons">Move Down</button>
                                        <button className = "queue-move-buttons">Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className = "admin-subcard">
                            <h3>placeholder</h3>
                            <div className = "queue-description">
                                <p>People in Queue: </p>
                                <p>Estimated Wait: </p>
                                <p>Priority:</p>
                                <button type= "submit">Serve Next User</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default QueueManagement