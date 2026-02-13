import "./AdminHeader.css"

export default function AdminHeader(){
    return(
        <div className = "admin-header">
            <div className = "header-left">
                Admin
            </div>
            <div className = "header-center">
                QueueSmart Admin Page
            </div>
            <div className = "header-right">
                actions
            </div>
        </div>
    );
}
