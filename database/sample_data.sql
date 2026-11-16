-- ConnectHub Sample Data
-- Run after schema.sql

USE connecthub_db;

-- Sample users (passwords are bcrypt hashes of 'password123')
-- These will be inserted via the backend API for proper hashing
-- This file is for reference and testing with pre-hashed passwords

-- Insert sample users with pre-hashed password for 'password123'
INSERT INTO users (username, email, password_hash, display_name, bio, status) VALUES
('alice', 'alice@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Alice Johnson', 'Hello! I am Alice.', 'online'),
('bob', 'bob@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Bob Smith', 'Gaming enthusiast', 'online'),
('charlie', 'charlie@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Charlie Brown', 'Developer by day', 'offline'),
('diana', 'diana@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Diana Prince', 'Love coding!', 'idle'),
('eve', 'eve@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Eve Wilson', 'Music lover', 'online')
ON DUPLICATE KEY UPDATE username = username;

-- Sample server
INSERT INTO servers (name, description, owner_id, invite_code) VALUES
('ConnectHub Official', 'Official ConnectHub community server', 1, 'CONNECT2024')
ON DUPLICATE KEY UPDATE name = name;

-- Sample server members
INSERT INTO server_members (server_id, user_id, role) VALUES
(1, 1, 'owner'),
(1, 2, 'admin'),
(1, 3, 'member'),
(1, 4, 'member'),
(1, 5, 'member')
ON DUPLICATE KEY UPDATE role = role;

-- Sample categories
INSERT INTO categories (server_id, name, position) VALUES
(1, 'General', 0),
(1, 'Development', 1),
(1, 'Voice Channels', 2)
ON DUPLICATE KEY UPDATE name = name;

-- Sample channels
INSERT INTO channels (category_id, server_id, name, type, topic) VALUES
(1, 1, 'welcome', 'text', 'Welcome to ConnectHub!'),
(1, 1, 'general-chat', 'text', 'General discussion'),
(2, 1, 'cpp-help', 'text', 'C++ programming help'),
(2, 1, 'project-updates', 'text', 'Project announcements'),
(3, 1, 'general-voice', 'voice', 'General voice chat'),
(3, 1, 'study-room', 'voice', 'Study together')
ON DUPLICATE KEY UPDATE name = name;

-- Sample messages
INSERT INTO messages (channel_id, sender_id, content) VALUES
(2, 1, 'Hello everyone! Welcome to ConnectHub!'),
(2, 2, 'Hey Alice! This looks great!'),
(2, 3, 'Nice to be here!'),
(3, 1, 'Anyone need help with C++ data structures?'),
(3, 4, 'Yes! I am working on N-ary Trees.')
ON DUPLICATE KEY UPDATE content = content;

-- Sample friendships
INSERT INTO friendships (user_id_1, user_id_2) VALUES
(1, 2),
(1, 3),
(2, 3),
(2, 4),
(3, 5)
ON DUPLICATE KEY UPDATE user_id_1 = user_id_1;

-- Sample notifications
INSERT INTO notifications (user_id, type, priority, content) VALUES
(1, 'mention', 5, '@Alice was mentioned in #general-chat'),
(1, 'dm', 4, 'New direct message from Bob'),
(1, 'friend_request', 3, 'Diana sent you a friend request'),
(2, 'announcement', 2, 'New server rules have been posted'),
(3, 'general', 1, 'Server updated to version 2.0')
ON DUPLICATE KEY UPDATE content = content;

-- User status
INSERT INTO user_status (user_id, status, custom_status) VALUES
(1, 'online', 'Working on ConnectHub'),
(2, 'online', 'Gaming'),
(3, 'offline', NULL),
(4, 'idle', 'AFK'),
(5, 'online', 'Listening to music')
ON DUPLICATE KEY UPDATE status = status;
