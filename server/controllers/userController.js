const User = require('../models/User');
const Post = require('../models/Post');

// Get user's content (threads and responses)
exports.getUserContent = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user and populate threads and responses with full content
    const user = await User.findById(userId)
      .populate({
        path: 'threads',
        select: 'title content category createdAt likes dislikes views status replies',
        populate: [{
          path: 'author',
          select: 'name image role'
        }, {
          path: 'replies',
          populate: {
            path: 'author',
            select: 'name image role'
          }
        }]
      })
      .populate({
        path: 'responses',
        select: 'title content category createdAt likes dislikes',
        populate: {
          path: 'author',
          select: 'name image role'
        }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform the data to include formatted dates and calculated metrics
    const threads = user.threads.map(thread => ({
      ...thread.toObject(),
      createdAt: thread.createdAt.toLocaleDateString(),
      likesCount: thread.likes?.count || 0,
      dislikesCount: thread.dislikes?.count || 0,
      repliesCount: thread.replies?.length || 0
    }));

    const responses = user.responses.map(response => ({
      ...response.toObject(),
      createdAt: response.createdAt.toLocaleDateString(),
      likesCount: response.likes?.count || 0,
      dislikesCount: response.dislikes?.count || 0
    }));

    res.json({
      threads,
      responses
    });
  } catch (error) {
    console.error('Error fetching user content:', error);
    res.status(500).json({ error: 'Failed to fetch user content' });
  }
};

// Get user's liked content
exports.getLikedContent = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find posts that the user has liked with full content
    const likedPosts = await Post.find({
      'likes.users': userId
    })
    .select('title content category createdAt likes dislikes views status replies')
    .populate('author', 'name image role')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name image role'
      }
    });

    // Find responses that the user has liked
    const postsWithLikedResponses = await Post.find({
      'replies.likes.users': userId
    })
    .select('title content category createdAt likes dislikes replies')
    .populate('author', 'name image role')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name image role'
      }
    });

    // Extract the liked responses
    const likedResponses = postsWithLikedResponses.flatMap(post =>
      post.replies.filter(reply => reply.likes.users.includes(userId))
    );

    // Transform the data to include formatted dates and calculated metrics
    const formattedPosts = likedPosts.map(post => ({
      ...post.toObject(),
      createdAt: post.createdAt.toLocaleDateString(),
      likesCount: post.likes?.count || 0,
      dislikesCount: post.dislikes?.count || 0,
      repliesCount: post.replies?.length || 0
    }));

    const formattedResponses = likedResponses.map(response => ({
      ...response,
      createdAt: response.createdAt.toLocaleDateString(),
      likesCount: response.likes?.count || 0,
      dislikesCount: response.dislikes?.count || 0
    }));

    res.json([...formattedPosts, ...formattedResponses]);
  } catch (error) {
    console.error('Error fetching liked content:', error);
    res.status(500).json({ error: 'Failed to fetch liked content' });
  }
};

// Get user's saved items
exports.getSavedItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({
        path: 'savedPosts',
        populate: { path: 'author', select: 'name image' }
      })
      .populate({
        path: 'savedReplies',
        populate: { path: 'author', select: 'name image' }
      })
      .populate({
        path: 'savedTrendingTopics',
        populate: { path: 'author', select: 'name image' }
      })
      .populate({
        path: 'savedTrendingReplies',
        populate: { path: 'author', select: 'name image' }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = (user.savedPosts || []).filter(p => p && p._id);
    const replies = (user.savedReplies || []).filter(r => r && r._id);
    const trendingTopics = (user.savedTrendingTopics || []).filter(t => t && t._id);
    const trendingReplies = (user.savedTrendingReplies || []).filter(tr => tr && tr._id);
    console.log('Saved posts:', posts);
    console.log('Saved replies:', replies);
    console.log('Saved trending topics:', trendingTopics);
    console.log('Saved trending replies:', trendingReplies);
    res.json({
      posts,
      replies,
      trendingTopics,
      trendingReplies
    });
  } catch (error) {
    console.error('Error fetching saved items:', error);
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
}; 