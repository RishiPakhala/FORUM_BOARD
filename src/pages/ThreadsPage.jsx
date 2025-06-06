import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import ThreadCard from "../components/ThreadCard";
import { Smile, Bold, Italic, List, ListOrdered, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Header from "../components/Header";
import userAvatar from "../assets/user1.jpg";
import { getPosts, createPost } from "../services/api";

const ThreadsPage = () => {
  const [threads, setThreads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await getPosts();
      setThreads(response.data.posts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch threads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatText = (command, value) => {
    document.execCommand(command, false, value);
  };

  const handlePost = async () => {
    const content = editorRef.current?.innerHTML || "";
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please log in to create a thread",
        variant: "destructive",
      });
      return;
    }

    try {
      const postData = {
        title: `Thread by ${currentUser.name}`,
        content: content,
        category: "general",
        author: currentUser._id || currentUser.id
      };

      const response = await createPost(postData);
      const newThread = response.data;

      // Add the new thread to the list
      setThreads(prevThreads => [newThread, ...prevThreads]);

      // Clear the editor
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      toast({
        title: "Success",
        description: "Your thread has been created!",
      });

      // Trigger a refresh of the profile page data
      const profileDataEvent = new CustomEvent('profileDataUpdate');
      window.dispatchEvent(profileDataEvent);

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create thread",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div>
        <Header title="Threads">
          <p>Create and explore discussions with the community</p>
        </Header>

        {/* Login Button for non-authenticated users */}
        {!currentUser && (
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-800 text-white py-4 rounded-xl hover:bg-gray-700 transition-colors mb-8 cursor-pointer"
          >
            Please log in to create a post
          </button>
        )}

        {/* Create Post Area */}
        {currentUser && (
          <div className="mb-8">
            <div className="flex items-start gap-2 mb-3">
              <img 
                src={userAvatar}
                alt="User avatar" 
                className="w-10 h-10 rounded-md mt-2 object-cover"
              />
              <div className="flex-1 post-input-area">
                <div
                  ref={editorRef}
                  contentEditable
                  className="post-input-content min-h-[100px] outline-none whitespace-pre-wrap break-words text-gray-300 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500"
                  data-placeholder="Whats on your mind ? post it"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Smile size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Bold size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Italic size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <List size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <ListOrdered size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Link2 size={20} />
                </Button>
              </div>
              <Button onClick={handlePost} className="bg-blue-500 hover:bg-blue-600">
                POST
              </Button>
            </div>
          </div>
        )}

        {/* Threads List */}
        {loading ? (
          <div className="text-center py-8">Loading threads...</div>
        ) : (
          <div className="space-y-4">
            {threads.length > 0 ? (
              threads.map((thread) => (
                <ThreadCard key={thread._id} thread={thread} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No threads yet. Be the first to start a conversation!
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ThreadsPage; 