import { useState } from "react";
import MainLayout from "../components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Header from "../components/Header";
import "./CommunityPage.css";

const CommunityPage = () => {
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreateCommunity = (e) => {
    e.preventDefault();
    
    if (!communityName || !communityDescription) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would create the community in the database
    toast({
      title: "Feature in development",
      description: "Sorry #PeopleSpeech, community feature not yet available, but don't worry, this feature is being worked on by professional developers.",
    });
  };

  return (
    <MainLayout initialIsLoggedIn={true}>
      <div className="community-container">
        <Header title="Communities">
          <p>Join existing communities or create your own</p>
        </Header>
        
        <h1 className="community-title">
          Top community that you can join & discuss
        </h1>
        
        <p className="community-description">
          You can join the community you want to discuss with anyone, anywhere, and anytime.
        </p>
        
        <div className="community-notice">
          <div className="community-notice-content">
            <span className="community-notice-icon">💬</span>
            <h2 className="community-notice-title">Nothing Community</h2>
            <p className="community-notice-text">
              sorry #PeopleSpeech, community feature not yet available, but don't worry, this feature is being worked on by professional developers. see you again...
            </p>
          </div>
        </div>
        
        <div className="create-community-section">
          <h2 className="create-community-title">Create a New Community</h2>
          
          <form onSubmit={handleCreateCommunity}>
            <div className="form-field">
              <label htmlFor="community-name" className="field-label">
                Community Name *
              </label>
              <Input
                id="community-name"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                placeholder="Enter community name"
                className="field-input"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="community-description" className="field-label">
                Community Description *
              </label>
              <textarea
                id="community-description"
                value={communityDescription}
                onChange={(e) => setCommunityDescription(e.target.value)}
                placeholder="Describe what your community is about"
                rows={4}
                className="field-textarea"
              />
            </div>
            
            <div className="checkbox-container">
              <input
                id="private-community"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="checkbox-input"
              />
              <label htmlFor="private-community" className="checkbox-label">
                Make this community private
              </label>
              <p className="checkbox-description">
                Private communities require admin approval for new members
              </p>
            </div>
            
            <Button 
              type="submit"
              className="create-button"
            >
              Create Community
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CommunityPage; 