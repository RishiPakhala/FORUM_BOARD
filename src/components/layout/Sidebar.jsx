import { Link, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../../data/mockData";
import { Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import "./Sidebar.css";
import logo from "../../assets/logo.png";
import instagramIcon from "../../assets/instagram.jpg"; 
import twitterIcon from "../../assets/twitter.png"; 
import telegramIcon from "../../assets/telegram.png"; 

const Sidebar = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleAuthLink = (e, destination, actionName) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast({
        title: "Authentication Required",
        description: `Please login to ${actionName}`,
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img 
          src={logo} 
          alt="ConnectForum" 
          className="sidebar-logo" 
          style={{ width: "50px", height: "50px", borderRadius: "50%" }} 
        />
        <div>
          <h1 className="sidebar-title">ConnectForum.io</h1>
          <p className="sidebar-subtitle">Platform Discussion</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link 
          to="/profile" 
          className="sidebar-link"
          onClick={(e) => handleAuthLink(e, "/profile", "view your profile")}
        >
          <div className="sidebar-icon">
            <Users size={18} />
          </div>
          <span>Profile</span>
        </Link>
        <Link 
          to="/profile" 
          className="sidebar-link"
          onClick={(e) => handleAuthLink(e, "/profile", "view your threads")}
        >
          <div className="sidebar-icon">
            <span className="text-xl">#</span>
          </div>
          <span>Your Threads</span>
        </Link>
        <Link 
          to="/saved" 
          className="sidebar-link"
          onClick={(e) => handleAuthLink(e, "/saved", "view your saved threads")}
        >
          <div className="sidebar-icon">
            <span className="text-xl">📑</span>
          </div>
          <span>Saved</span>
        </Link>
      </nav>

      <div className="sidebar-categories">
        <h3 className="sidebar-heading">Categories</h3>
        <div className="category-list">
          {CATEGORIES.map((category) => (
            <Link 
              key={category.name}
              to={`/category/${category.name.toLowerCase()}`}
              className="category-link"
            >
              <div className="category-color" style={{ backgroundColor: getCategoryColor(category.color) }}></div>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="social-links">
          <a href="#" className="social-link">
            <img src={instagramIcon} alt="Instagram" />
          </a>
          <a href="#" className="social-link">
            <img src={twitterIcon} alt="Twitter" />
          </a>
          <a href="#" className="social-link">
            <img src={telegramIcon} alt="Telegram" />
          </a>
        </div>
        <p className="copyright">© 2024 ConnectForum.io</p>
      </div>
    </div>
  );
};

const getCategoryColor = (colorClass) => {
  const colors = {
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'yellow': '#eab308',
    'purple': '#a855f7',
    'pink': '#ec4899',
    'indigo': '#6366f1',
    'teal': '#14b8a6',
    'orange': '#f97316',
    'gray': '#6b7280'
  };
  return colors[colorClass] || '#6b7280';
};

export default Sidebar; 