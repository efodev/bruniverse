import React from 'react';
import './Header.css';
import menuIcon from '../assets/menu.png';
import logoIcon from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import avatarIcon from '../assets/Avatar.png';
import uploadIcon from '../assets/upload.png';

interface HeaderProps {
  currentUser: {
    name: string;
    id: string;
    avatar: string;
  };
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  return (
    <nav className="top-nav">
      <div className="nav-left">
        <button className="menu-btn">
          <img src={menuIcon} alt="Menu" />
        </button>
        <div className="logo">
          <img src={logoIcon} alt="Logo" />
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Team</a>
        </div>
        <div className="search-container">
          <img src={searchIcon} alt="Search" className="search-icon" />
          <input type="text" placeholder="Search Posts" className="search-input" />
        </div>
      </div>
      <div className="nav-right">
        <div className="user-section">
          <div className="avatar-container">
            <img src={avatarIcon} alt="User Avatar" />
            <img src={uploadIcon} alt="Edit Avatar" className="avatar-edit-icon" />
          </div>
          <span className="username">{currentUser.name}</span>
          <span className="user-id">ID: {currentUser.id}</span>
          <button className="logout-btn">Log Out</button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
