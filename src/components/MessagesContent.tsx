import React, { useState } from 'react';
import './MessagesContent.css';

interface User {
  name: string;
  id: string;
  avatar: string;
}

interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

interface MessagesContentProps {
  selectedUser?: string;
}

const MessagesContent: React.FC<MessagesContentProps> = ({ selectedUser }) => {
  const [selectedConversation] = useState<string>('sunny');
  const [newMessage, setNewMessage] = useState('');

  const currentUser: User = {
    name: 'Melody',
    id: '652397',
    avatar: 'M'
  };

  const conversations: Conversation[] = [
    {
      id: 'sunny',
      user: { name: 'Sunny Barbor', id: 'S', avatar: 'S' },
      lastMessage: 'Hey there! How are you?',
      timestamp: '2 days ago'
    },
    {
      id: 'bruce',
      user: { name: 'Bruce Liang', id: 'B', avatar: 'B' },
      lastMessage: 'Hi Melody! Nice to meet u',
      timestamp: '2 days ago'
    },
    {
      id: 'william',
      user: { name: 'William Sparks', id: 'W', avatar: 'W' },
      lastMessage: 'Thanks for the help!',
      timestamp: '2 days ago'
    }
  ];

  // 头像颜色映射，与MainPage.tsx保持一致
  const getAvatarColor = (userName: string) => {
    switch (userName) {
      case 'Sunny Barbor':
        return '#9c27b0';
      case 'Bruce Liang':
        return '#dc3545';
      case 'William Sparks':
        return '#3f51b5';
      default:
        return '#dc3545';
    }
  };

  const [messagesData, setMessagesData] = useState<{ [key: string]: Message[] }>({
    bruce: [
      {
        id: '1',
        sender: currentUser,
        content: 'Hi Bruce! I\'m Melody.',
        timestamp: '2:56 PM',
        isCurrentUser: true
      },
      {
        id: '2',
        sender: { name: 'Bruce Liang', id: 'B', avatar: 'B' },
        content: 'Hi Melody! Nice to meet u',
        timestamp: '5:06 PM',
        isCurrentUser: false
      },
      {
        id: '3',
        sender: currentUser,
        content: 'I love your music!',
        timestamp: '11:20 AM',
        isCurrentUser: true
      }
    ],
    sunny: [
      {
        id: '1',
        sender: { name: 'Sunny Barbor', id: 'S', avatar: 'S' },
        content: 'Hey there! How are you?',
        timestamp: '3:15 PM',
        isCurrentUser: false
      },
      {
        id: '2',
        sender: currentUser,
        content: 'Hi Sunny! I\'m doing great, thanks!',
        timestamp: '3:20 PM',
        isCurrentUser: true
      }
    ],
    william: [
      {
        id: '1',
        sender: { name: 'William Sparks', id: 'W', avatar: 'W' },
        content: 'Thanks for the help!',
        timestamp: '1:30 PM',
        isCurrentUser: false
      },
      {
        id: '2',
        sender: currentUser,
        content: 'You\'re welcome! Happy to help.',
        timestamp: '1:35 PM',
        isCurrentUser: true
      }
    ]
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const newMessageObj: Message = {
        id: Date.now().toString(),
        sender: currentUser,
        content: newMessage.trim(),
        timestamp: currentTime,
        isCurrentUser: true
      };

      // 添加消息到当前对话
      setMessagesData(prev => ({
        ...prev,
        [currentConversationId]: [
          ...(prev[currentConversationId] || []),
          newMessageObj
        ]
      }));

      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 根据传入的selectedUser或默认选择来确定当前用户和消息
  const currentSelectedUser = selectedUser
    ? conversations.find(conv => conv.user.name === selectedUser)?.user || conversations[0].user
    : conversations.find(conv => conv.id === selectedConversation)?.user || conversations[0].user;

  const currentConversationId = selectedUser
    ? conversations.find(conv => conv.user.name === selectedUser)?.id || 'sunny'
    : selectedConversation;

  const currentMessages = messagesData[currentConversationId] || messagesData['sunny'];

  return (
    <div className="messages-content">
      {/* 聊天区域 */}
      <div className="chat-area">
        {currentSelectedUser ? (
          <>
            {/* 聊天头部 */}
            <div className="chat-header">
              <button className="back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="chat-user-info">
                {/* <div className="chat-avatar" style={{ backgroundColor: getAvatarColor(currentSelectedUser.name) }}>{currentSelectedUser.avatar}</div> */}
                {/* <div className="chat-user-details"> */}
                  {/* <div className="chat-user-name">{currentSelectedUser.name}</div> */}
                  <div className="chat-status">Chat</div>
                {/* </div> */}
              </div>
            </div>

            {/* 消息列表 */}
            <div className="messages-container">
              <div className="date-separator">
                <span>Yesterday</span>
              </div>
              
              {currentMessages.map((message) => (
                <div key={message.id} className={`message-group ${message.isCurrentUser ? 'own-message-group' : 'other-message-group'}`}>
                  <div className={`message-time-header ${message.isCurrentUser ? 'own-time' : 'other-time'}`}>
                    {message.timestamp}
                  </div>
                  <div className={`message ${message.isCurrentUser ? 'own-message' : 'other-message'}`}>
                    {!message.isCurrentUser && (
                      <div className="message-avatar" style={{ backgroundColor: getAvatarColor(message.sender.name) }}>{message.sender.avatar}</div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">
                        {message.content}
                      </div>
                    </div>
                    {message.isCurrentUser && (
                      <div className="message-avatar own-avatar">{message.sender.avatar}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 消息输入框 */}
            <div className="message-input-container">
              <div className="message-input-wrapper">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="I wanna talk about Bruniverse with you"
                  className="message-input"
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <img src="/src/assets/send.png" alt="send" width="20" height="20" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-conversation">
            <p>选择一个对话开始聊天</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesContent;
