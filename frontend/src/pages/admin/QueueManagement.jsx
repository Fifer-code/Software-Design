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
                    <h1>Avaialabe Queues</h1>
                    <p>Queue 1</p>
                    <p>Queue 2</p>
                    <p>Queue 3</p>
                    <p>Queue 4</p>
                    <p>Queue 5</p>
                    <p>Queue 6</p>
                </div>
                <div className = "admin-card-2">
                    <h1>Queue Information</h1>
                    <div className = "admin-subcard">
                        <h1>Reorder/Remove Users</h1>
                        <p>user 1</p>
                        <p>user 2</p>
                    </div>
                    <div className = "admin-subcard">
                        <h1>Serve Next User</h1>
                        <p>user 1</p>
                        <p>user 2</p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default QueueManagement