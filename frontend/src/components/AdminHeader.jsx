import "./AdminHeader.css";

export default function AdminHeader(){
    return(
        <div className = "admin-header">
            <div className = "header-left">
                <div className = "header-left-name">
                    <a>Admin Dashboard</a>
                </div>
            </div>
            <div className = "header-center">
                QueueSmart Admin
            </div>
            <div className = "header-right">
                <div className = "action-1">
                    <a>Queue Management</a>
                </div>
                <div className = "action-2">
                    <a>Service Management</a>
                </div>
                <div className = "action-3">
                    <a>Log-in / Register</a>
                </div>
            </div>
        </div>
    );
}
