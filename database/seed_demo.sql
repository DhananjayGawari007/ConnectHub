INSERT INTO users (username, email, password_hash, display_name, bio, status) VALUES
('alice', 'alice@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Alice Johnson', 'ConnectHub Explorer & C++ fan', 'online'),
('bob', 'bob@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Bob Smith', 'Gaming enthusiast and developer', 'online'),
('charlie', 'charlie@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Charlie Brown', 'Full-stack software developer', 'idle'),
('diana', 'diana@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Diana Prince', 'Designing beautiful user interfaces', 'online'),
('eve', 'eve@example.com', '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', 'Eve Wilson', 'Music lover and community manager', 'offline')
ON DUPLICATE KEY UPDATE password_hash = '$2b$10$vwXC3sWluvcF4b3YIp9ETepsl1NPzuSdp4p6V9OFNpEbMpeMiPidS', status = VALUES(status);

-- Ensure demo server exists
INSERT INTO servers (id, name, description, owner_id, invite_code) VALUES
(1, 'ConnectHub Official', 'The official community server for ConnectHub', 1, 'CONNECT2024')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Ensure demo categories exist
INSERT INTO categories (id, server_id, name, position) VALUES
(1, 1, 'Welcome & Rules', 0),
(2, 1, 'Text Channels', 1),
(3, 1, 'Voice Lounges', 2)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Ensure demo channels exist
INSERT INTO channels (id, category_id, server_id, name, type, topic) VALUES
(1, 1, 1, 'welcome', 'text', 'Welcome to ConnectHub! Say hi to everyone.'),
(2, 1, 1, 'announcements', 'text', 'Official updates and patch notes.'),
(3, 2, 1, 'general', 'text', 'General discussion about anything.'),
(4, 2, 1, 'development', 'text', 'Code sharing, debugging, and tech talk.'),
(5, 3, 1, 'General Voice', 'voice', 'Hangout voice lounge.'),
(6, 3, 1, 'Gaming Room', 'voice', 'Gaming voice channel.')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Add all users to server_members
INSERT IGNORE INTO server_members (server_id, user_id, role)
SELECT 1, id, IF(username='alice', 'owner', 'member') FROM users;

-- Add friendships between demo users
INSERT IGNORE INTO friendships (user_id_1, user_id_2)
SELECT u1.id, u2.id FROM users u1, users u2
WHERE (u1.username='alice' AND u2.username='bob')
   OR (u1.username='alice' AND u2.username='charlie')
   OR (u1.username='bob' AND u2.username='diana')
   OR (u1.username='charlie' AND u2.username='eve');

SELECT id, username, email, display_name, status FROM users;
