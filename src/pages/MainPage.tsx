import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LikesContent from '../components/LikesContent';
import CommentsContent from '../components/CommentsContent';
import MessagesContent from '../components/MessagesContent';
import './MainPage.css';

interface User {
  name: string;
  id: string;
  avatar: string;
}

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'likes' | 'comments' | 'messages'>('likes');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // 管理点赞帖子的状态
  const [likedPosts, setLikedPosts] = useState<{[key: string]: {liked: boolean, count: number}}>({
    '1': { liked: true, count: 7 },
    '2': { liked: true, count: 13 },
    '3': { liked: true, count: 13 },
    '4': { liked: true, count: 13 },
    '5': { liked: true, count: 13 },
    '6': { liked: true, count: 13 }
  });

  const handlePostLike = (postId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setLikedPosts(prev => {
      const currentPost = prev[postId] || { liked: true, count: 7 }; // 默认值
      return {
        ...prev,
        [postId]: {
          liked: !currentPost.liked,
          count: currentPost.liked ? currentPost.count - 1 : currentPost.count + 1
        }
      };
    });
  };

  const currentUser: User = {
    name: 'Melody',
    id: '652397',
    avatar: 'M'
  };

  const renderLeftContent = () => {
    switch (activeTab) {
      case 'likes':
        return (
          <div className="liked-posts-section">
            <div className="posts-list">
              {[
                { id: '1', title: 'Not sure to take PHYS 1116 or 1112', type: 'questions', likes: 7 },
                { id: '2', title: 'Promotion of Event 3: New Year Eve...', type: 'Promotion', likes: 13 },
                { id: '3', title: 'Promotion of Event 3: New Year Eve...', type: 'Promotion', likes: 13 },
                { id: '4', title: 'Promotion of Event 3: New Year Eve...', type: 'Promotion', likes: 13 },
                { id: '5', title: 'Promotion of Event 3: New Year Eve...', type: 'Promotion', likes: 13 },
                { id: '6', title: 'Promotion of Event 3: New Year Eve...', type: 'Promotion', likes: 13 }
              ].map((post) => (
                <div key={post.id} className="post-item">
                  <div className="post-type-badge">{post.type}</div>
                  <div className="post-info">
                    <div className="post-title-row">
                      <span className="post-title">{post.title}</span>
                      <button
                        className={`post-like-btn ${(likedPosts[post.id]?.liked ?? true) ? 'liked' : ''}`}
                        onClick={(e) => handlePostLike(post.id, e)}
                        type="button"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={(likedPosts[post.id]?.liked ?? true) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {likedPosts[post.id]?.count ?? post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bottom-section">
              <div className="scroll-hint">Scroll for more...</div>
              <button className="add-post-btn">
                <img src="/src/assets/add.png" alt="add" width="50" height="50" />
              </button>
            </div>
          </div>
        );
      case 'comments':
        return (
          <div className="activity-section">
            <div className="activity-list">
              {[
                { user: 'Harry', content: 'commented your Post "What should we bring to spring concert?..."', avatar: 'H', color: '#dc3545' },
                { user: 'Billie', content: 'commented your Post "Finding people for my Team Project!..."', avatar: 'B', color: '#6f42c1' },
                { user: 'Sunny', content: 'commented your Post "Finding people for my Team Project!..."', avatar: 'S', color: '#28a745' }
              ].map((item, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-avatar" style={{ backgroundColor: item.color }}>{item.avatar}</div>
                  <div className="activity-content">
                    <span className="activity-user">{item.user}</span>
                    <span className="activity-text">{item.content}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bottom-section">
              <div className="scroll-hint">Scroll for more...</div>
              <button className="add-post-btn">
                <img src="/src/assets/add.png" alt="add" width="50" height="50" />
              </button>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="conversations-section">
            <div className="conversations-list">
              {[
                { user: 'Sunny Barbor', lastMessage: 'Hey there! How are you?', time: '4 days ago', avatar: 'S', color: '#9c27b0' },
                { user: 'Bruce Liang', lastMessage: 'Hi Melody! Nice to meet u', time: '2 days ago', avatar: 'B', color: '#dc3545' },
                { user: 'William Sparks', lastMessage: 'Thanks for the help!', time: '3 days ago', avatar: 'W', color: '#3f51b5' }
              ].map((conversation, index) => (
                <div
                  key={index}
                  className={`conversation-item ${(selectedUser || 'Sunny Barbor') === conversation.user ? 'active' : ''}`}
                  onClick={() => setSelectedUser(conversation.user)}
                >
                  <div className="conversation-avatar" style={{ backgroundColor: conversation.color }}>{conversation.avatar}</div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conversation.user}</div>
                  </div>
                  <div className="conversation-time">{conversation.time}</div>
                </div>
              ))}
            </div>
            <div className="bottom-section">
              <div className="scroll-hint">Scroll for more...</div>
              <button className="add-post-btn">
                <img src="/src/assets/add.png" alt="add" width="50" height="50" />
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRightContent = () => {
    switch (activeTab) {
      case 'likes':
        return <LikesContent />;
      case 'comments':
        return <CommentsContent />;
      case 'messages':
        return <MessagesContent selectedUser={selectedUser || 'Sunny Barbor'} />;
      default:
        return <LikesContent />;
    }
  };

  return (
    <div className="page-container">
      <Header currentUser={currentUser} />

      <div className="main-container">
        <div className="left-section">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <main className="main-content">
            {renderLeftContent()}
          </main>
        </div>

        <div className="divider"></div>

        <aside className="right-sidebar">
          {renderRightContent()}
        </aside>
      </div>
    </div>
  );
};

export default MainPage;
