# ConnectHub Architecture Documentation

## 1. System Overview
ConnectHub integrates modern web standards (React 18, Node.js 24, Express, Socket.IO) with low-level systems programming in C++17 and relational persistence in MySQL 8.4.

```mermaid
flowchart TD
    Client["React Frontend (SPA)"]
    Vite["Vite Dev Server (Port 3000)"]
    Backend["Node.js / Express Server (Port 5000)"]
    Socket["Socket.IO Real-Time Engine"]
    Bridge["C++ Bridge (child_process IPC)"]
    Engine["ConnectHubEngine.exe (C++17)"]
    MySQL[("MySQL 8.4 Server (Port 3307)")]

    Client <-->|HTTP / REST| Backend
    Client <-->|WebSockets (ws://)| Socket
    Backend <--> Socket
    Backend <-->|MySQL2 Driver (TCP)| MySQL
    Backend <-->|Standard I/O & Arguments (JSON IPC)| Bridge
    Bridge <--> Engine

    subgraph "C++ Data Structure Engine"
        Engine --> Tree["N-ary Tree (Hierarchy)"]
        Engine --> Graph["Graph Adjacency List (Social Network)"]
        Engine --> Queue["FIFO Message Queue"]
        Engine --> Heap["Binary Max Heap (Priority Queue)"]
    end
```

---

## 2. Component Breakdown

### 2.1 React Frontend
- **Framework**: React 18 SPA with Vite bundler.
- **Styling**: Discord-accurate Dark Charcoal and Navy theme (`#111214`, `#1e1f22`, `#2b2d31`, `#313338`) with Blurple (`#5865f2`) and Gold (`#f0b232`) accents.
- **Routing**: `react-router-dom` v6 with `ProtectedRoute` guards.
- **Real-Time Client**: `socket.io-client` with auto-reconnection and optimistic UI updates.
- **Laboratory Visualizers**: Canvas/SVG interactive animations for N-ary Tree, Social Graph (with step-by-step BFS/DFS highlight glowing), Conveyor-Belt FIFO Queue, and Level-Order Binary Max Heap.

### 2.2 Node.js Backend & API
- **Web Server**: Express.js with JSON parsing and CORS.
- **Authentication**: Stateless JSON Web Tokens (JWT) stored in LocalStorage, signed with HS256.
- **Socket.IO Handler**: Manages user rooms (`user_<id>`), server channel rooms (`channel_<id>`), voice signaling (`voice_<id>`), and typing indicators.

### 2.3 C++ Data Structure Engine
- **Language**: C++17 compiled with MSVC `cl.exe`.
- **Packaging**: Static library `datastructures.lib` linked into `ConnectHubEngine.exe` and test suite `TestAll.exe`.
- **IPC Protocol**: Structured JSON exchanged over fast process execution buffers.
- **Persistence**: Engine serializes state into `connecthub_engine_state.json` to ensure consistency.

### 2.4 MySQL 8.4 Relational Database
- **Port**: 3307.
- **Schema**: 11 normalized relational tables with foreign keys and cascade deletions.
- **Connection Pool**: `mysql2/promise` with 20 pooled connections and keep-alive heartbeats.
