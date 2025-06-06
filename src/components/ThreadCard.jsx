import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Share, Save, Send, MessageCircle, Bold, Italic, List, ListOrdered, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import userAvatar from "../assets/user1.jpg";
import { 
  addTrendingReply, 
  toggleTrendingLike, 
  toggleTrendingDislike,
  addReply,
  toggleLike,
  toggleDislike,
  savePost,
  unsavePost,
  saveReply,
  unsaveReply,
  saveTrendingTopic,
  unsaveTrendingTopic,
  saveTrendingReply,
  unsaveTrendingReply,
  checkPostSaved,
  checkReplySaved,
  checkTrendingTopicSaved,
  checkTrendingReplySaved,
  toggleTrendingReplyLike,
  toggleReplyLike,
  toggleTrendingReplyDislike,
  toggleReplyDislike
} from "../services/api";
import api from "../services/api";

export const LoginButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/login')}
      className="w-full bg-gray-800 text-white py-4 rounded-xl hover:bg-gray-700 transition-colors mb-4"
    >
      Please log in to create a post
    </button>
  );
};

const ThreadCard = ({ thread, onThreadUpdate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [threadData, setThreadData] = useState({
    ...thread,
    replies: thread.replies?.map(reply => ({
      ...reply,
      likes: reply.likes || [],
      dislikes: reply.dislikes || [],
      userLiked: reply.userLiked || false,
      userDisliked: reply.userDisliked || false
    })) || []
  });
  const [isSaved, setIsSaved] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const navigate = useNavigate();

  // Determine if this is a trending topic or regular category post
  const isTrendingTopic = Boolean(threadData.topic);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user'); // Clear invalid data
        }
      } else {
        // Fetch from backend if not in local storage
        try {
          const response = await api.get('/user/profile');
          setCurrentUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Error fetching user data from backend:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Update threadData when thread prop changes
    setThreadData({
      ...thread,
      replies: thread.replies?.map(reply => ({
        ...reply,
        likes: reply.likes || [],
        dislikes: reply.dislikes || [],
        userLiked: reply.userLiked || false,
        userDisliked: reply.userDisliked || false
      })) || []
    });
  }, [thread]);

  const redirectToLogin = () => {
    toast({
      title: "Authentication Required",
      description: "Please log in to continue",
      variant: "destructive",
    });
    navigate('/login');
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      redirectToLogin();
      return;
    }

    try {
      let response;
      
      if (isTrendingTopic) {
        response = await addTrendingReply(threadData._id, replyContent);
      } else {
        response = await addReply(threadData._id, replyContent);
      }

      if (response.data) {
        // Create a new reply object with the response data
        const newReply = {
          _id: response.data._id,
          content: response.data.content,
          author: response.data.author,
          createdAt: response.data.createdAt,
          likes: response.data.likes || [],
          dislikes: response.data.dislikes || [],
          userLiked: false,
          userDisliked: false,
          saved: false
        };

        // Update the thread data with the new reply
        setThreadData(prevData => ({
          ...prevData,
          replies: [...(prevData.replies || []), newReply]
        }));

        // Clear the reply form
        setReplyContent("");
        setShowReplyForm(false);

        toast({
          title: "Success",
          description: "Reply added successfully!",
        });
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add reply",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      redirectToLogin();
      return;
    }

    try {
      let response;
      if (isTrendingTopic) {
        response = await toggleTrendingLike(threadData._id);
      } else {
        response = await toggleLike(threadData._id);
      }

      if (response.data) {
        const updatedData = {
          ...threadData,
          likes: response.data.likes || 0,
          dislikes: response.data.dislikes || 0,
          userLiked: response.data.userLiked || false,
          userDisliked: response.data.userDisliked || false
        };
        setThreadData(updatedData);
        if (onThreadUpdate) onThreadUpdate(updatedData);
        toast({
          title: "Success",
          description: response.data.userLiked ? "Post liked!" : "Like removed!",
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      redirectToLogin();
      return;
    }

    try {
      let response;
      if (isTrendingTopic) {
        response = await toggleTrendingDislike(threadData._id);
      } else {
        response = await toggleDislike(threadData._id);
      }

      if (response.data) {
        const updatedData = {
          ...threadData,
          likes: response.data.likes || 0,
          dislikes: response.data.dislikes || 0,
          userLiked: response.data.userLiked || false,
          userDisliked: response.data.userDisliked || false
        };
        setThreadData(updatedData);
        if (onThreadUpdate) onThreadUpdate(updatedData);
        toast({
          title: "Success",
          description: response.data.userDisliked ? "Post disliked!" : "Dislike removed!",
        });
      }
    } catch (error) {
      console.error('Error disliking post:', error);
      toast({
        title: "Error",
        description: "Failed to dislike post",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Success",
      description: "Link copied to clipboard!",
    });
  };

  const handleSave = async () => {
    if (!currentUser) {
      redirectToLogin();
      return;
    }

    try {
      const itemType = isTrendingTopic ? 'trending topic' : 'post';
      
      // First update the UI optimistically
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      
      // Make the API call
      let response;
      try {
        if (isTrendingTopic) {
          response = newSavedState 
            ? await saveTrendingTopic(threadData._id)
            : await unsaveTrendingTopic(threadData._id);
        } else {
          response = newSavedState
            ? await savePost(threadData._id)
            : await unsavePost(threadData._id);
        }

        // Update thread data after successful save
        if (response?.data) {
          setThreadData(prevData => ({
            ...prevData,
            saved: newSavedState,
            savedAt: response.data.savedAt || new Date().toISOString()
          }));

          toast({
            title: "Success",
            description: newSavedState 
              ? `${itemType} saved successfully!` 
              : `${itemType} removed from saved!`,
          });
        } else {
          throw new Error('No response from server');
        }
      } catch (error) {
        // Revert UI state
        setIsSaved(!newSavedState);
        setThreadData(prevData => ({
          ...prevData,
          saved: !newSavedState
        }));
        throw error;
      }
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: error.response?.status === 404 
          ? "Save feature is currently unavailable" 
          : error.response?.data?.message || error.message || "Failed to save item",
        variant: "destructive",
      });
    }
  };

  const handleReplyLike = async (replyId) => {
    if (!currentUser) {
      redirectToLogin();
      return;
    }

    try {
      const reply = threadData.replies.find(r => r._id === replyId);
      if (!reply) {
        throw new Error('Reply not found');
      }

      let response;
      if (isTrendingTopic) {
        response = await toggleTrendingReplyLike(threadData._id, replyId);
      } else {
        response = await toggleReplyLike(threadData._id, replyId);
      }

      if (response.data) {
        setThreadData(prevData => {
          const updatedReplies = prevData.replies.map(r => {
            if (r._id === replyId) {
              return {
                ...r,
                likes: response.data.likes ?? r.likes ?? 0,
                dislikes: response.data.dislikes ?? r.dislikes ?? 0,
                userLiked: response.data.userLiked ?? false,
                userDisliked: response.data.userDisliked ?? false
              };
            }
            return r;
          });

          return {
            ...prevData,
            replies: updatedReplies
          };
        });

        toast({
          title: "Success",
          description: response.data.userLiked ? "Reply liked!" : "Like removed!",
        });
      }
    } catch (error) {
      console.error('Error liking reply:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to like reply",
        variant: "destructive",
      });
    }
  };

  const handleReplyDislike = async (replyId) => {
    if (!currentUser) {
      redirectToLogin();
      return;
    }

    try {
      const reply = threadData.replies.find(r => r._id === replyId);
      if (!reply) {
        throw new Error('Reply not found');
      }

      let response;
      if (isTrendingTopic) {
        response = await toggleTrendingReplyDislike(threadData._id, replyId);
      } else {
        response = await toggleReplyDislike(threadData._id, replyId);
      }

      if (response.data) {
        setThreadData(prevData => {
          const updatedReplies = prevData.replies.map(r => {
            if (r._id === replyId) {
              return {
                ...r,
                likes: response.data.likes ?? r.likes ?? 0,
                dislikes: response.data.dislikes ?? r.dislikes ?? 0,
                userLiked: response.data.userLiked ?? false,
                userDisliked: response.data.userDisliked ?? false
              };
            }
            return r;
          });

          return {
            ...prevData,
            replies: updatedReplies
          };
        });

        toast({
          title: "Success",
          description: response.data.userDisliked ? "Reply disliked!" : "Dislike removed!",
        });
      }
    } catch (error) {
      console.error('Error disliking reply:', error);
      toast({
        title: "Error",
        description: error.response?.status === 404 
          ? "Could not dislike reply: Reply not found." 
          : error.response?.data?.message || "Failed to dislike reply",
        variant: "destructive",
      });
    }
  };

  const handleReplyShare = (replyId) => {
    const replyUrl = `${window.location.href}#reply-${replyId}`;
    navigator.clipboard.writeText(replyUrl);
    toast({
      title: "Success",
      description: "Reply link copied to clipboard!",
    });
  };

  const handleReplySave = async (replyId) => {
    if (!currentUser) {
      redirectToLogin();
      return;
    }

    try {
      const reply = threadData.replies.find(r => r._id === replyId);
      if (!reply) {
        throw new Error('Reply not found');
      }

      // Update UI optimistically
      const newSavedState = !reply.saved;
      setThreadData(prevData => ({
        ...prevData,
        replies: prevData.replies.map(r => {
          if (r._id === replyId) {
            return { ...r, saved: newSavedState };
          }
          return r;
        })
      }));

      // Make API call
      let response;
      try {
        if (isTrendingTopic) {
          response = newSavedState
            ? await saveTrendingReply(threadData._id, replyId)
            : await unsaveTrendingReply(threadData._id, replyId);
        } else {
          response = newSavedState
            ? await saveReply(threadData._id, replyId)
            : await unsaveReply(threadData._id, replyId);
        }

        if (!response?.data) {
          throw new Error('No response from server');
        }

        toast({
          title: "Success",
          description: newSavedState ? "Reply saved successfully!" : "Reply removed from saved!",
        });
      } catch (error) {
        // Revert UI state on error
        setThreadData(prevData => ({
          ...prevData,
          replies: prevData.replies.map(r => {
            if (r._id === replyId) {
              return { ...r, saved: !newSavedState };
            }
            return r;
          })
        }));
        throw error;
      }
    } catch (error) {
      console.error('Error saving reply:', error);
      toast({
        title: "Error",
        description: error.response?.status === 404 
          ? "Save feature is currently unavailable" 
          : error.response?.data?.message || error.message || "Failed to save reply",
        variant: "destructive",
      });
    }
  };

  // Add new function for text formatting
  const handleFormat = (type) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = replyContent.substring(start, end);
    let formattedText = '';

    switch(type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'bullet':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'number':
        formattedText = `\n1. ${selectedText}`;
        break;
      default:
        return;
    }

    const newContent = replyContent.substring(0, start) + formattedText + replyContent.substring(end);
    setReplyContent(newContent);
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = replyContent;
    const newText = text.substring(0, start) + emoji + text.substring(end);
    setReplyContent(newText);
    setShowEmojiPicker(false);
  };

  // Helper functions for like/dislike display
  const getLikeCount = (item) => {
    if (!item) return 0;
    if (item.likes?.count !== undefined) return item.likes.count;
    if (item.likes?.length !== undefined) return item.likes.length;
    if (typeof item.likes === 'number') return item.likes;
    return 0;
  };

  const getDislikeCount = (item) => {
    if (!item) return 0;
    if (item.dislikes?.count !== undefined) return item.dislikes.count;
    if (item.dislikes?.length !== undefined) return item.dislikes.length;
    if (typeof item.dislikes === 'number') return item.dislikes;
    return 0;
  };

  const hasUserLiked = (item) => {
    if (!currentUser || !item) return false;
    if (item.likes?.users) {
      return item.likes.users.some(id => id === currentUser._id);
    }
    if (Array.isArray(item.likes)) {
      return item.likes.includes(currentUser._id);
    }
    return Boolean(item.userLiked);
  };

  const hasUserDisliked = (item) => {
    if (!currentUser || !item) return false;
    if (item.dislikes?.users) {
      return item.dislikes.users.some(id => id === currentUser._id);
    }
    if (Array.isArray(item.dislikes)) {
      return item.dislikes.includes(currentUser._id);
    }
    return Boolean(item.userDisliked);
  };

  // Add useEffect to check saved status
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!currentUser || !threadData) return;

      try {
        let response;
        if (isTrendingTopic) {
          response = await checkTrendingTopicSaved(threadData._id);
        } else {
          response = await checkPostSaved(threadData._id);
        }

        if (response.data) {
          setIsSaved(response.data.saved);
          setThreadData(prevData => ({
            ...prevData,
            saved: response.data.saved
          }));
        }

        // Check saved status for replies
        if (threadData.replies && threadData.replies.length > 0) {
          const repliesPromises = threadData.replies.map(async reply => {
            try {
              const replyResponse = isTrendingTopic
                ? await checkTrendingReplySaved(threadData._id, reply._id)
                : await checkReplySaved(threadData._id, reply._id);
              
              return {
                ...reply,
                saved: replyResponse.data?.saved || false
              };
            } catch (error) {
              console.error('Error checking reply saved status:', error);
              return reply;
            }
          });

          const updatedReplies = await Promise.all(repliesPromises);
          setThreadData(prevData => ({
            ...prevData,
            replies: updatedReplies
          }));
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkSavedStatus();
  }, [currentUser, threadData._id, isTrendingTopic]);

  // Add this useEffect to initialize saved state when thread data changes
  useEffect(() => {
    if (threadData) {
      setIsSaved(Boolean(threadData.saved));
    }
  }, [threadData]);

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-4" style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}>
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={threadData.author?.avatar || userAvatar} 
          alt={threadData.author?.name || 'User'}
          className="w-10 h-10 rounded-md object-cover"
        />
        <div>
          <p className="font-medium">{currentUser?.name || 'Anonymous'}</p>
          <p className="text-sm text-gray-400">
            {new Date(threadData.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-md text-xs font-medium">
            {threadData.topic || threadData.category || "general"}
          </span>
        </div>
      </div>

      <Link to={`/thread/${threadData._id}`}>
        <h2 className="text-xl font-semibold mb-2">{threadData.title}</h2>
      </Link>
      
      <div 
        className="mb-4 prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: threadData.content }}
      />
      
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1 text-gray-400 thread-action-btn transition-colors ${
            hasUserLiked(threadData) ? 'text-purple-500' : ''
          }`}
        >
          <ThumbsUp size={20} />
          <span>{getLikeCount(threadData)}</span>
        </button>
        <button 
          onClick={handleDislike}
          className={`flex items-center gap-1 text-gray-400 thread-action-btn transition-colors ${
            hasUserDisliked(threadData) ? 'text-purple-500' : ''
          }`}
        >
          <ThumbsDown size={20} />
          <span>{getDislikeCount(threadData)}</span>
        </button>
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className={`flex items-center gap-1 text-gray-400 thread-action-btn transition-colors`}
        >
          <MessageCircle size={20} />
          <span>{threadData.replies?.length || 0}</span>
        </button>
        <button 
          onClick={handleShare}
          className={`text-gray-400 thread-action-btn transition-colors`}
        >
          <Share size={20} />
        </button>
        <button 
          onClick={handleSave}
          className={`text-gray-400 thread-action-btn transition-colors ml-auto ${isSaved ? 'text-purple-500' : ''}`}
        >
          <Save size={20} />
        </button>
      </div>

      {/* Updated Reply Form */}
      {showReplyForm && (
        <div className="mb-4 border-t border-gray-700 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={currentUser?.avatar || userAvatar} 
              alt={currentUser?.name || 'User'}
              className="w-8 h-8 rounded-md object-cover"
            />
            <p className="font-medium">{currentUser?.name || 'Anonymous'}</p>
          </div>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full rounded-md p-2 mb-2 reply-textarea"
            style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}
            rows={3}
          />
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 p-1 rounded-md emoji-toolbar" style={{ backgroundColor: 'hsl(var(--card))' }}>
              <button
                onClick={() => handleFormat('bold')}
                className="p-1 hover:bg-gray-700 rounded"
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => handleFormat('italic')}
                className="p-1 hover:bg-gray-700 rounded"
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => handleFormat('bullet')}
                className="p-1 hover:bg-gray-700 rounded"
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => handleFormat('number')}
                className="p-1 hover:bg-gray-700 rounded"
                title="Numbered List"
              >
                <ListOrdered size={16} />
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:bg-gray-700 rounded"
                title="Add Emoji"
              >
                😊
              </button>
              <button
                onClick={() => setReplyContent("")}
                className="p-1 hover:bg-gray-700 rounded"
                title="Clear"
              >
                <Undo size={16} />
              </button>
            </div>
          </div>
          {showEmojiPicker && (
            <div className="absolute z-10 mt-1">
              <div className="p-2 rounded-lg shadow-lg" style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>
                <div className="grid grid-cols-8 gap-1">
                  {["😊", "😂", "🤣", "❤️", "😍", "😒", "👍", "👎", "🎉", "🔥", "💯", "🤔", "😎", "😢", "😡", "👏"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="p-1 hover:bg-gray-700 rounded text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReply}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Send size={16} className="mr-2" />
              Reply
            </Button>
          </div>
        </div>
      )}

      {/* Replies List */}
      {threadData.replies && threadData.replies.length > 0 && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-4">Replies</h3>
          <div className="space-y-4">
            {threadData.replies.map((reply, index) => (
              <div key={index} className="rounded-lg p-4" id={`reply-${reply._id}`} style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}>
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src={reply.author?.avatar || userAvatar} 
                    alt={reply.author?.name || 'User'}
                    className="w-8 h-8 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium">{reply.author?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="ml-10">
                  <p className="text-gray-300">{reply.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => handleReplyLike(reply._id)}
                      className={`text-gray-400 thread-action-btn transition-colors flex items-center gap-1 ${
                        hasUserLiked(reply) ? 'text-purple-500' : ''
                      }`}
                    >
                      <ThumbsUp size={14} />
                      <span>{getLikeCount(reply)}</span>
                    </button>
                    <button 
                      onClick={() => handleReplyDislike(reply._id)}
                      className={`text-gray-400 thread-action-btn transition-colors flex items-center gap-1 ${
                        hasUserDisliked(reply) ? 'text-purple-500' : ''
                      }`}
                    >
                      <ThumbsDown size={14} />
                      <span>{getDislikeCount(reply)}</span>
                    </button>
                    <button 
                      onClick={() => handleReplyShare(reply._id)}
                      className={`text-gray-400 thread-action-btn transition-colors`}
                    >
                      <Share size={14} />
                    </button>
                    <button 
                      onClick={() => handleReplySave(reply._id)}
                      className={`text-gray-400 thread-action-btn transition-colors ml-auto ${
                        reply.saved ? 'text-purple-500' : ''
                      }`}
                    >
                      <Save size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadCard; 