import React, { useState } from 'react';
import './CommentsContent.css';

interface User {
  name: string;
  id: string;
  avatar: string;
}

interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  timestamp: string;
  tags: string[];
}

const CommentsContent: React.FC = () => {
  const [postLiked, setPostLiked] = useState(false);
  const [postStarred, setPostStarred] = useState(false);
  const [postLikes, setPostLikes] = useState(15);
  const [postStars, setPostStars] = useState(8);

  const [commentLikes, setCommentLikes] = useState<{[key: string]: {liked: boolean, count: number}}>({
    '1': { liked: false, count: 3 },
    '2': { liked: false, count: 7 },
    '3': { liked: false, count: 2 },
    '4': { liked: false, count: 5 }
  });

  const handlePostLike = () => {
    setPostLiked(!postLiked);
    setPostLikes(postLiked ? postLikes - 1 : postLikes + 1);
  };

  const handlePostStar = () => {
    setPostStarred(!postStarred);
    setPostStars(postStarred ? postStars - 1 : postStars + 1);
  };

  const handleCommentLike = (commentId: string) => {
    setCommentLikes(prev => ({
      ...prev,
      [commentId]: {
        liked: !prev[commentId].liked,
        count: prev[commentId].liked ? prev[commentId].count - 1 : prev[commentId].count + 1
      }
    }));
  };
  const post: Post = {
    id: '170',
    title: 'Looking for Internship Advice',
    content: `Hey everyone! 👋
Hope you're doing great! I'm currently starting to think about internships and wanted to ask for some advice from folks who've been through the process. I'm especially interested in roles related to creative tech, product design, music + AI.
Feel free to DM me or drop advice here or DM me — I really appreciate it! 🙏
Thanks in advance!!`,
    author: {
      name: 'Melody Chen',
      id: '652397',
      avatar: 'M'
    },
    timestamp: '5 days ago',
    tags: ['questions']
  };

  const comments: Comment[] = [
    {
      id: '1',
      user: {
        name: 'Bruce Liang',
        id: 'B',
        avatar: 'B'
      },
      content: 'Hi! I\'m here offering some advice. I would say talk to people from both the CS Department and Music Department at Brown. Also, there\'s a lab doing Music generation here. This is the link https://musicgen.com. Check it out and hope it helps!',
      timestamp: '4 days ago'
    }
  ];



  return (
    <div className="comments-content">
      {/* 主要内容区域 */}
      <div className="content-area">
        {/* 帖子内容 */}
        <div className="post-container">
          <div className="post-header">
            <div className="post-author">
              <div className="author-avatar">{post.author.avatar}</div>
              <div className="author-info">
                <div className="author-name-line">
                  <span className="author-name">{post.author.name}</span>
                  <span className="post-timestamp">{post.timestamp}</span>
                </div>
                <div className="post-meta">
                  <span className="post-tag">{post.tags[0]}</span>
                  <button className="delete-btn">Delete</button>
                  <button className="edit-btn">Edit</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="post-content">
            <h2 className="post-title">{post.title} <span className="post-id">#{post.id}</span></h2>
            <div className="post-text">{post.content}</div>
          </div>
          
          <div className="post-actions">
            <button className={`action-btn ${postLiked ? 'liked' : ''}`} onClick={handlePostLike}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={postLiked ? "currentColor" : "none"}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>{postLikes}</span>
            </button>
            <button className="action-btn">
              <img src="/src/assets/messages-square.png" alt="messages" width="16" height="16" />
            </button>
            <button className={`action-btn ${postStarred ? 'starred' : ''}`} onClick={handlePostStar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={postStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              <span>{postStars}</span>
            </button>
          </div>
        </div>

        {/* 评论区域 */}
        <div className="comments-section">
          <h3 className="comments-title">Comments</h3>
          
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-avatar">{comment.user.avatar}</div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.user.name}</span>
                  <span className="comment-timestamp">{comment.timestamp}</span>
                  <div className="comment-actions">
                    <button
                      className={`comment-action ${commentLikes[comment.id]?.liked ? 'liked' : ''}`}
                      onClick={() => handleCommentLike(comment.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={commentLikes[comment.id]?.liked ? "currentColor" : "none"}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>{commentLikes[comment.id]?.count || 0}</span>
                    </button>
                    <button className="comment-action">
                      <img src="/src/assets/messages-square.png" alt="messages" width="14" height="14" />
                    </button>
                  </div>
                </div>
                <div className="comment-text">{comment.content}</div>
                <button className="best-answer-btn">Best Answer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentsContent;
