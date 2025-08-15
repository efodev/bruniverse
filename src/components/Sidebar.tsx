import React from 'react';
import './Sidebar.css';
import downIcon from '../assets/down.png';
import searchIcon from '../assets/search.png';

interface SidebarProps {
  activeTab: 'likes' | 'comments' | 'messages';
  onTabChange: (tab: 'likes' | 'comments' | 'messages') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="left-sidebar">
      <div className="sidebar-buttons">
        <button 
          className={`sidebar-btn ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => onTabChange('likes')}
        >
          Likes
          <img src={downIcon} alt="Dropdown" className="dropdown-icon" />
        </button>
        <button 
          className={`sidebar-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => onTabChange('comments')}
        >
          Comments
          <img src={downIcon} alt="Dropdown" className="dropdown-icon" />
        </button>
        <button
          className={`sidebar-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => onTabChange('messages')}
        >
          Messages
          <img src={downIcon} alt="Dropdown" className="dropdown-icon" />
        </button>
      </div>
      <div className="search-posts">
        <div className="search-container">
          <img src={searchIcon} alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder={activeTab === 'comments' ? 'Post' : ''}
            className="search-input"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
