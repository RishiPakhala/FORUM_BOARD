import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Bell, ExternalLink } from "lucide-react";
import { getTrendingTopics } from "../../services/api";
import "./Rightbar.css";

const defaultTopics = [
  { name: "IoT", icon: "🌐" },
  { name: "programming", icon: "💻" },
  { name: "sports", icon: "⚽" },
  { name: "gaming", icon: "🎮" },
  { name: "technology", icon: "📱" },
  { name: "science", icon: "🔬" },
  { name: "business", icon: "💼" },
  { name: "entertainment", icon: "🎬" },
  { name: "health", icon: "🏥" },
  { name: "education", icon: "📚" }
];

const defaultHappeningTopics = [
  "World Cup 2023",
  "Bitcoin News",
  "ChatGPT Updates",
  "Tech Layoffs",
  "Gaming Awards"
];

const Rightbar = ({ isLoggedIn }) => {
  const [trendingTopics, setTrendingTopics] = useState(defaultTopics);
  const [happeningNow, setHappeningNow] = useState(defaultHappeningTopics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      const response = await getTrendingTopics({ 
        timeRange: '24h',
        limit: 10,
        status: ['trending']
      });

      const topics = response.data.topics;
      
      if (topics && topics.length > 0) {
        // Map trending topics while keeping original names
        const trending = topics.map((topic, index) => ({
          name: topic.title, // Keep original title without transformation
          icon: defaultTopics[index % defaultTopics.length].icon,
          _id: topic._id
        }));

        setTrendingTopics(trending);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rightbar">
        <div className="rightbar-section">
          <div className="section-header">
            <h3 className="section-title">Loading...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rightbar">
      <div className="rightbar-section">
        <div className="section-header">
          <h3 className="section-title">Trending Topics</h3>
          <Users size={18} />
        </div>
        <div className="topic-list">
          {trendingTopics.map((topic) => (
            <Link 
              key={topic._id || topic.name} 
              to={`/topic/${topic.name}`}
              className="topic-item"
            >
              <div className="topic-avatar">{topic.icon}</div>
              <span className="topic-name">{topic.name}</span>
              <ExternalLink size={14} className="topic-icon" />
            </Link>
          ))}
          <button className="more-link">see more</button>
        </div>
      </div>

      <div className="rightbar-section">
        <div className="section-header">
          <h3 className="section-title">Whats Happenning?</h3>
          <Bell size={18} />
        </div>
        <div className="topic-list">
          {happeningNow.map((topic) => (
            <Link 
              key={topic} 
              to={`/topic/${topic}`}
              className="happening-item"
            >
              <div className="happening-content">
                <span className="hashtag">#</span>
                <span className="happening-title">{topic}</span>
              </div>
              <div className="happening-meta">
                <span className="happening-time">Trending</span>
                <ExternalLink size={14} className="happening-icon" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rightbar; 