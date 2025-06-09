import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import ThreadCard from "../components/ThreadCard";
import { Smile, Bold, Italic, List, ListOrdered, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Header from "../components/Header";
import userAvatar from "../assets/user1.jpg";
import { getPosts, createPost, getDistinctCategories } from "../services/api";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const ThreadsPage = () => {
  const [threads, setThreads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchThreads();
    fetchAvailableCategories();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await getPosts({ category: 'general' });
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

  const fetchAvailableCategories = async () => {
    try {
      const response = await getDistinctCategories();
      console.log("Fetched distinct categories from backend:", response.data);
      const uniqueCategories = ['general', ...new Set(response.data.filter(cat => cat.toLowerCase() !== 'general'.toLowerCase()).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()))];
      console.log("Processed categories for dropdown:", uniqueCategories);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to fetch distinct categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories for selection",
        variant: "destructive",
      });
    }
  };

  const formatText = (command, value) => {
    document.execCommand(command, false, value);
  };

  const onEmojiSelect = (emoji) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(emoji.native));
        range.setStartAfter(range.endContainer);
        range.setEndAfter(range.endContainer);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.innerHTML += emoji.native;
      }
    }
    setShowEmojiPicker(false);
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
      const normalizedSelectedCategory = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).toLowerCase();
      
      const postData = {
        title: `Thread by ${currentUser.name}`,
        content: content,
        category: normalizedSelectedCategory.toLowerCase(),
        author: currentUser._id || currentUser.id
      };

      const response = await createPost(postData);
      const newThread = response.data;

      if (normalizedSelectedCategory === 'general') {
      setThreads(prevThreads => [newThread, ...prevThreads]);
      }

      if (normalizedSelectedCategory !== 'general' && !categories.some(cat => cat.toLowerCase() === normalizedSelectedCategory.toLowerCase())) {
        console.log("Dispatching newCategory event:", normalizedSelectedCategory);
        const event = new CustomEvent('newCategory', {
          detail: normalizedSelectedCategory
        });
        window.dispatchEvent(event);
        setCategories(prevCategories => [...prevCategories, normalizedSelectedCategory]);
      }

      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      toast({
        title: "Success",
        description: "Your thread has been created!",
      });

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

        {!currentUser && (
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-800 text-white py-4 rounded-xl hover:bg-gray-700 transition-colors mb-8 cursor-pointer"
          >
            Please log in to create a post
          </button>
        )}

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
                <div className="relative">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <Smile size={20} />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute z-10 bottom-full mb-2">
                      <Picker data={data} onEmojiSelect={onEmojiSelect} theme="dark" />
                    </div>
                  )}
                </div>
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
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="ml-2 bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handlePost} className="bg-blue-500 hover:bg-blue-600">
                POST
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading threads...</div>
        ) : (
          <div className="space-y-4">
            {threads.length > 0 ? (
              threads.map((thread) => (
                <ThreadCard key={thread._id} thread={thread} />
              ))
            ) : (
              <div className="text-center py-8">
                <p>No threads yet. Be the first to start a discussion!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ThreadsPage; 