# Bruniverse Database Schema & Development Plan

## Database Schema (SQL)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brown_email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_picture_url TEXT,
    bio TEXT,
    graduation_year INTEGER,
    concentration VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    duo_verified BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    verification_code CHAR(6),
    verification_expires BOOLEAN DEFAULT false
);
-- User Verification
CREATE TABLE verifications (
  id VARCHAR(25) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id UUID,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes separately
CREATE INDEX idx_token ON verifications (token);
CREATE INDEX idx_email ON verifications (email);
CREATE INDEX idx_expires_at ON verifications (expires_at);
CREATE INDEX idx_user_id ON verifications (user_id);

-- New login_attempts table to track login security
CREATE TABLE login_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL, -- Store email for failed attempts even if user doesn't exist
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes separately (correct PostgreSQL syntax)
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX idx_login_attempts_email_attempted ON login_attempts(email, attempted_at);

-- Optional: login_sessions table for active session tracking
CREATE TABLE login_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE, -- UNIQUE for UPSERT
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_token VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for login_sessions
CREATE INDEX idx_login_sessions_token ON login_sessions(session_token);
CREATE INDEX idx_login_sessions_expires ON login_sessions(expires_at);

-- Optional: Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/
-- User tags/interests
CREATE TABLE user_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Categories for posts
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color_hex VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    anonymity_reason TEXT,
    is_pinned BOOLEAN DEFAULT false,
    pinned_by UUID REFERENCES users(id),
    pinned_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by UUID REFERENCES users(id),
    moderation_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, flagged
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP,
    moderation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments/replies table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id), -- for nested replies
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes/reactions table
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'like', -- like, helpful, thanks, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_post_like UNIQUE(user_id, post_id),
    CONSTRAINT unique_user_comment_like UNIQUE(user_id, comment_id),
    CONSTRAINT like_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Direct messages
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_deleted_by_sender BOOLEAN DEFAULT false,
    is_deleted_by_recipient BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation threads for DMs
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_conversation UNIQUE(participant_1_id, participant_2_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- comment_reply, post_like, dm_received, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_post_id UUID REFERENCES posts(id),
    related_comment_id UUID REFERENCES comments(id),
    related_user_id UUID REFERENCES users(id),
    is_read BOOLEAN DEFAULT false,
    is_emailed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Moderation reports
CREATE TABLE moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- User roles and permissions
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- admin, moderator, student
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocked users
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_block UNIQUE(blocker_id, blocked_id)
);

-- Search indexing for posts (for full-text search)
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

## Additional MVP Deliverables

### Authentication & Security

- Brown SSO integration with Duo 2FA
- Email verification system
- Session management and JWT tokens
- Rate limiting for API endpoints
- CSRF protection

### Content Moderation System

- Automated content filtering (profanity, spam detection)
- Manual moderation queue for admins
- User reporting system
- Content guidelines and community standards
- Appeal process for moderated content

### Search & Filtering

- Full-text search across posts and comments
- Category-based filtering
- Date range filtering
- User-specific post history
- Trending posts algorithm

### Notification System

- Email notifications for replies and mentions
- In-app notification center
- Digest emails (daily/weekly summaries)
- Notification preferences management

### Mobile Responsiveness

- Progressive Web App (PWA) capabilities
- Touch-friendly interface
- Offline reading capabilities
- Mobile-optimized image handling

### Analytics & Insights

- Post engagement metrics
- User activity tracking
- Popular categories and trends
- Moderation statistics dashboard

## Tech Stack Resources

### Next.js & TypeScript Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **TypeScript with Next.js**: https://nextjs.org/docs/basic-features/typescript
- **Next.js Examples**: https://github.com/vercel/next.js/tree/canary/examples

### UI Components & Libraries

- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/ (Beautiful, accessible components)
- **Radix UI**: https://www.radix-ui.com/ (Headless UI primitives)
- **Headless UI**: https://headlessui.com/
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/ (Schema validation)

### Authentication

- **NextAuth.js**: https://next-auth.js.org/
- **Auth0**: https://auth0.com/
- **Clerk**: https://clerk.com/

### Database & ORM

- **Prisma**: https://www.prisma.io/ (Recommended ORM for TypeScript)
- **Drizzle ORM**: https://orm.drizzle.team/
- **TypeORM**: https://typeorm.io/

### Free Database Services for Testing

- **Supabase**: https://supabase.com/ (PostgreSQL, generous free tier)
- **PlanetScale**: https://planetscale.com/ (MySQL, serverless)
- **Neon**: https://neon.tech/ (PostgreSQL, serverless)
- **Railway**: https://railway.app/ (PostgreSQL, good for development)
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Aiven**: https://aiven.io/ (30-day free trial)

### Real-time Features

- **Socket.io**: https://socket.io/
- **Pusher**: https://pusher.com/
- **Ably**: https://ably.com/

### File Storage

- **Vercel Blob**: https://vercel.com/storage/blob
- **Cloudinary**: https://cloudinary.com/
- **AWS S3**: https://aws.amazon.com/s3/

### Email Services

- **Resend**: https://resend.com/ (Developer-friendly)
- **SendGrid**: https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/

### Deployment

- **Vercel**: https://vercel.com/ (Seamless Next.js deployment)
- **Netlify**: https://www.netlify.com/
- **Railway**: https://railway.app/

## Recommended Development Approach

1. **Phase 1 (Weeks 1-2)**: Set up basic authentication, database, and user profiles
2. **Phase 2 (Weeks 3-4)**: Implement post creation, viewing, and basic commenting
3. **Phase 3 (Weeks 5-6)**: Add search, filtering, and category system
4. **Phase 4 (Weeks 7-8)**: Implement moderation system and admin dashboard
5. **Phase 5 (Weeks 9-10)**: Add direct messaging and notifications
6. **Phase 6 (Weeks 11-12)**: Polish UI, testing, and deployment preparation

## Security Considerations

- Input sanitization and validation
- SQL injection prevention (use parameterized queries)
- XSS protection
- Rate limiting on sensitive endpoints
- Proper error handling without information leakage
- Regular security audits and dependency updates
