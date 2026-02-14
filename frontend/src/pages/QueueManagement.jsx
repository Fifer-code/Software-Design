import "./QueueManagement.css"
import AdminHeader from "../components/AdminHeader"

function QueueManagement(){

    return(
        <>
        <AdminHeader />
        <div className = "admin-shell">
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
                <div className = "admin-queue-management">
                    <h1>Reorder/Remove Users</h1>
                    <p>user 1</p>
                    <p>user 2</p>
                </div>
                <div className = "admin-queue-management">
                    <h1>Serve Next User</h1>
                    <p>user 1</p>
                    <p>user 2</p>
                </div>
            </div>
        </div>
        </>
    );
}

export default QueueManagement