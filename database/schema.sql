-- ConnectHub Database Schema
-- MySQL 8.x
-- Run this file to create all tables

CREATE DATABASE IF NOT EXISTS connecthub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE connecthub_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    status ENUM('online', 'offline', 'idle', 'dnd') DEFAULT 'offline',
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    icon_url VARCHAR(500) DEFAULT NULL,
    owner_id INT NOT NULL,
    invite_code VARCHAR(20) UNIQUE,
    tree_node_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_invite (invite_code)
) ENGINE=InnoDB;

-- Server members
CREATE TABLE IF NOT EXISTS server_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'admin', 'moderator', 'member') DEFAULT 'member',
    nickname VARCHAR(100) DEFAULT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_member (server_id, user_id),
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_server (server_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    position INT DEFAULT 0,
    tree_node_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    INDEX idx_server (server_id)
) ENGINE=InnoDB;

-- Channels
CREATE TABLE IF NOT EXISTS channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    server_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('text', 'voice') DEFAULT 'text',
    topic TEXT DEFAULT NULL,
    position INT DEFAULT 0,
    tree_node_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_server (server_id)
) ENGINE=InnoDB;

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    edited BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_channel (channel_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Direct messages
CREATE TABLE IF NOT EXISTS direct_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    edited BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Friendships (accepted friends)
CREATE TABLE IF NOT EXISTS friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id_1 INT NOT NULL,
    user_id_2 INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_friendship (user_id_1, user_id_2),
    FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user1 (user_id_1),
    INDEX idx_user2 (user_id_2)
) ENGINE=InnoDB;

-- Friend requests
CREATE TABLE IF NOT EXISTS friend_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_request (sender_id, receiver_id),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('mention', 'dm', 'friend_request', 'announcement', 'general') DEFAULT 'general',
    priority INT DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    content TEXT NOT NULL,
    reference_id INT DEFAULT NULL,
    reference_type VARCHAR(50) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_priority (priority),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- User status tracking
CREATE TABLE IF NOT EXISTS user_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    status ENUM('online', 'offline', 'idle', 'dnd') DEFAULT 'offline',
    custom_status VARCHAR(200) DEFAULT NULL,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;
