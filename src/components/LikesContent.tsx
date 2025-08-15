import React, { useState } from 'react';
import './LikesContent.css';

const LikesContent: React.FC = () => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);

  const [username, setUsername] = useState('Melody Chen');
  const [about, setAbout] = useState('Hi! Brown 28\', Studying Computer Science and Sociology. I love making friends and doing projects. Nice meeting you all!');
  const [contacts, setContacts] = useState('Instagram: itsmelody');
  const [tags, setTags] = useState(['Music', 'Sports', 'Books', 'CS', 'Startup']);

  // Username handlers
  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
  };

  const handleUsernameSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingUsername(false);
    }
  };

  const handleUsernameBlur = () => {
    setIsEditingUsername(false);
  };

  // About handlers
  const handleAboutEdit = () => {
    setIsEditingAbout(true);
  };

  const handleAboutSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditingAbout(false);
    }
  };

  const handleAboutBlur = () => {
    setIsEditingAbout(false);
  };

  // Contacts handlers
  const handleContactsEdit = () => {
    setIsEditingContacts(true);
  };

  const handleContactsSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingContacts(false);
    }
  };

  const handleContactsBlur = () => {
    setIsEditingContacts(false);
  };

  // Tags handlers
  const handleTagsEdit = () => {
    setIsEditingTags(true);
  };

  const handleTagDelete = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement;
      const newTag = input.value.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        input.value = '';
      }
    }
  };

  // Character count for about
  const aboutCharCount = 280 - about.length;
  return (
    <div className="likes-content">
      <div className="user-profile">
        <div className="profile-header">
          <span className="recommend-text">We Recommend Using Your Real Name</span>
        </div>
        
        <div className="profile-field1">
          <label>Username</label>
          <div className="field-container">
            {isEditingUsername ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleUsernameSubmit}
                onBlur={handleUsernameBlur}
                className="field-input"
                autoFocus
              />
            ) : (
              <div className="field-value" onClick={handleUsernameEdit}>
                {username}
              </div>
            )}
            <svg
              className="edit-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              onClick={handleUsernameEdit}
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </div>
        </div>
        
        <div className="profile-field2">
          <label>About</label>
          <div className="field-container">
            {isEditingAbout ? (
              <div className="field-value2 with-char-count">
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  onKeyDown={handleAboutSubmit}
                  onBlur={handleAboutBlur}
                  className="field-textarea"
                  autoFocus
                  maxLength={280}
                />
                <span className="char-count">{aboutCharCount} characters left</span>
              </div>
            ) : (
              <div className="field-value2 with-char-count" onClick={handleAboutEdit}>
                {about}
                <span className="char-count">{aboutCharCount} characters left</span>
              </div>
            )}
            <svg
              className="edit-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              onClick={handleAboutEdit}
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </div>
        </div>
        
        <div className="profile-field3">
          <label>Email</label>
          <div className="field-container">
            <div className="field-value-readonly">xiaoxiao_chen@brown.edu</div>
          </div>
        </div>

        <div className="profile-field4">
          <label>Other Contacts</label>
          <div className="field-container">
            {isEditingContacts ? (
              <input
                type="text"
                value={contacts}
                onChange={(e) => setContacts(e.target.value)}
                onKeyDown={handleContactsSubmit}
                onBlur={handleContactsBlur}
                className="field-input"
                autoFocus
              />
            ) : (
              <div className="field-value" onClick={handleContactsEdit}>
                {contacts}
              </div>
            )}
            <svg
              className="edit-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              onClick={handleContactsEdit}
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </div>
        </div>

        <div className="profile-field4">
          <label>Total Brownie</label>
          <div className="field-container">
            <div className="field-value-readonly">50</div>
          </div>
        </div>
        
        <div className="profile-field4">
          <label>Tags</label>
          <div className="field-container">
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <img
                    src="/src/assets/del.png"
                    alt="delete"
                    className="tag-delete"
                    onClick={() => handleTagDelete(tag)}
                  />
                </span>
              ))}
              {isEditingTags && (
                <input
                  type="text"
                  placeholder="Add new tag..."
                  onKeyDown={handleTagAdd}
                  onBlur={() => setIsEditingTags(false)}
                  className="tag-input"
                  autoFocus
                />
              )}
              <svg
                className="tags-edit-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                onClick={handleTagsEdit}
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </div>
            <span className="tags-char-count">5 tags maximum</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikesContent;
