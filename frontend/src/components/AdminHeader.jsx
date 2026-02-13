import "./AdminHeader.css";
import burgerSidebarIcon from "../assets/burger-sidebar.svg";

export default function AdminHeader(){
    return(
        <div className = "admin-header">
            <div className = "header-left">
                <button className = "burger-sidebar-button">
                    <img className = "burger-sidebar-icon" src = {burgerSidebarIcon} />
                </button>
                <div className = "header-left-name">
                    Admin
                </div>
            </div>
            <div className = "header-center">
                QueueSmart Admin Page
            </div>
            <div className = "header-right">
                <div className = "action-1">
                    <a>Log-in Page</a>
                </div>
                <div className = "action-2">
                    <a>View as User</a>
                </div>
            </div>
        </div>
    );
}
