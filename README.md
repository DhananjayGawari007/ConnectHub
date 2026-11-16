# CONNECTHUB – Discord-Inspired Desktop & Web Platform

[![C++17](https://img.shields.io/badge/C%2B%2B-17-blue.svg)](https://isocpp.org/)
[![Electron](https://img.shields.io/badge/Electron-33-47848F.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-black.svg)](https://socket.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4%20LTS-orange.svg)](https://www.mysql.com/)

A modern, high-performance communication platform available both as a **Native Windows Desktop Application** and a **Web Application**. All four core data structures (**N-ary Tree**, **Graph**, **FIFO Queue**, and **Binary Max Heap**) are implemented in **C++17** and actively run in the backend engine.

---

## 🚀 How to Launch

### 1. Launch Native Desktop Application (Electron)
Double-click or run from terminal:
```cmd
scripts\start-desktop.bat
```
*(or run `npm run desktop`)*

### 2. Launch Web Application (Browser)
```cmd
scripts\start.bat
```
Opens `http://localhost:3000` in your browser.

### 3. Stop All Services
```cmd
scripts\stop.bat
```

---

## 🔑 Demo Accounts (Instant 1-Click Login)

The platform comes pre-configured with active demo accounts. Password for all accounts is:
```
password123
```

- `@alice` (Alice Johnson)
- `@bob` (Bob Smith)
- `@charlie` (Charlie Brown)
- `@diana` (Diana Prince)
- `@eve` (Eve Wilson)

On the login page (`/login`), click any of the **Instant 1-Click Login** badges to log in immediately!

---

## 📱 Responsive & Modern UI Features

- **Responsive Mobile & Desktop**:
  - Slide-out mobile drawer on screens $\le 768\text{px}$ with hamburger menu.
  - Collapsible server member sidebar for narrow windows.
  - Auto-adjusting chat viewport with smooth scrolling and instant message dispatch.
- **Enhanced Profile Management** (`/profile`):
  - Customizable profile banner color palette (`Blurple`, `Pink`, `Green`, `Yellow`, `Red`, `Charcoal`).
  - Custom status activity text (e.g., *"☕ Grinding Data Structures"*, *"🎮 In Voice"*).
  - Status mode toggles: **Online** 🟢, **Idle** 🟡, **Do Not Disturb** 🔴, **Invisible** ⚫.
  - Account statistics (Total servers, total friends, member since).
  - Profile achievement badges (*Server Owner*, *Early Supporter*).
- **Direct Messages & Social Graph**:
  - Mutual friends and "People you may know" friend recommendations powered by C++ Graph traversal.
  - Live typing indicators, message deletion, and instant WebSocket delivery.
- **Voice Channels**:
  - Live voice rooms with **Voice Connected / RTC** ping indicator and one-click disconnect.

---

## ⚡ C++ Backend Data Structures

The application relies on four compiled C++17 data structures linked via local IPC bridge:

1. **N-ary Tree** (`NaryTree.cpp`): Server $\rightarrow$ Category $\rightarrow$ Channel hierarchy.
2. **Graph Adjacency List** (`Graph.cpp`): User relationships, BFS/DFS traversal, mutual friends.
3. **FIFO Queue** (`MessageQueue.cpp`): Ordered message buffer before MySQL persistence.
4. **Binary Max Heap** (`MaxHeap.cpp`): Notification priority dispatching (Mentions $\rightarrow$ DMs $\rightarrow$ Friend Requests $\rightarrow$ Announcements).

To run the standalone C++ test suite (69 tests passing):
```cmd
scripts\test.bat
```
