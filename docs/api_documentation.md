# ConnectHub API Documentation

All REST endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in with username/email and password | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |
| `POST` | `/api/auth/logout` | Sets status to offline and invalidates session | Yes |

---

## 2. Servers & Hierarchy (`/api/servers`)

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `GET` | `/api/servers` | Get all servers user is a member of | Yes |
| `POST` | `/api/servers` | Create server (adds root in C++ N-ary Tree) | Yes |
| `POST` | `/api/servers/join` | Join server via invite code | Yes |
| `GET` | `/api/servers/:serverId/hierarchy` | Get categories & channels + C++ N-ary Tree JSON | Yes |
| `GET` | `/api/servers/:serverId/members` | Get online and offline server members | Yes |
| `POST` | `/api/servers/:serverId/categories` | Add category (intermediate node in C++ Tree) | Yes |
| `POST` | `/api/servers/:serverId/channels` | Add text/voice channel (leaf in C++ Tree) | Yes |
| `PUT` | `/api/servers/channels/:channelId/move` | Move channel between categories in C++ Tree | Yes |
| `DELETE` | `/api/servers/channels/:channelId` | Delete channel (removes node from C++ Tree) | Yes |

---

## 3. Real-Time Messages (`/api/messages`)

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `POST` | `/api/messages/channel/:channelId` | Send channel message (enqueues in C++ Queue) | Yes |
| `GET` | `/api/messages/channel/:channelId` | Retrieve recent messages for channel | Yes |
| `POST` | `/api/messages/direct/:receiverId` | Send DM to friend (enqueues in C++ Queue) | Yes |
| `GET` | `/api/messages/direct/:otherUserId` | Retrieve 1-on-1 direct message history | Yes |
| `DELETE` | `/api/messages/:messageId` | Delete own message | Yes |
| `GET` | `/api/messages/queue/state` | Inspect C++ FIFO Message Queue state | Yes |
| `POST` | `/api/messages/queue/dequeue` | Dequeue front message from C++ Queue | Yes |

---

## 4. Friends & Social Graph (`/api/friends`)

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `GET` | `/api/friends` | Get accepted friends list | Yes |
| `POST` | `/api/friends/request` | Send friend request | Yes |
| `GET` | `/api/friends/requests` | Get incoming and outgoing pending requests | Yes |
| `PUT` | `/api/friends/request/:requestId/accept` | Accept request (adds edge in C++ Graph) | Yes |
| `PUT` | `/api/friends/request/:requestId/reject` | Reject pending friend request | Yes |
| `DELETE` | `/api/friends/:friendId` | Remove friendship (deletes edge in C++ Graph) | Yes |
| `GET` | `/api/friends/graph/state` | Get full C++ Adjacency List graph state | Yes |
| `GET` | `/api/friends/graph/bfs/:userId?` | Run Breadth-First Search on C++ Graph | Yes |
| `GET` | `/api/friends/graph/dfs/:userId?` | Run Depth-First Search on C++ Graph | Yes |
| `GET` | `/api/friends/graph/mutual/:otherUserId` | Calculate mutual friends via C++ Graph | Yes |
| `GET` | `/api/friends/graph/suggestions` | Get friend suggestions via C++ Graph | Yes |

---

## 5. Notifications & Priority Queue (`/api/notifications`)

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `GET` | `/api/notifications` | Get notifications ordered by priority | Yes |
| `POST` | `/api/notifications` | Create notification (inserts into C++ MaxHeap) | Yes |
| `POST` | `/api/notifications/extract-max` | Extract highest-priority alert from C++ MaxHeap | Yes |
| `PUT` | `/api/notifications/:id/read` | Mark individual notification as read | Yes |
| `GET` | `/api/notifications/heap/state` | Get C++ Binary Max Heap tree structure | Yes |

---

## 6. Data Structure Laboratory (`/api/ds-lab`)

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `GET` | `/api/ds-lab/all` | Fetch live states of all 4 C++ data structures | Yes |
| `POST` | `/api/ds-lab/execute` | Execute arbitrary C++ action with arguments | Yes |

---

## 7. Socket.IO Events

### Client Emits:
- `join_channel(channelId)`: Joins channel room.
- `leave_channel(channelId)`: Leaves channel room.
- `send_message({ channelId, content })`: Sends message to channel.
- `send_direct_message({ receiverId, content })`: Sends direct message.
- `typing_start({ channelId })`: Emits typing indicator.
- `typing_stop({ channelId })`: Stops typing indicator.
- `voice_join({ channelId })`: Joins voice room.
- `voice_signal({ targetSocketId, signal })`: WebRTC signaling.

### Server Broadcasts:
- `new_message`: Pushed to channel members when a message is enqueued and saved.
- `new_direct_message`: Pushed to recipient and sender user rooms.
- `user_status_changed`: Broadcasts online/offline status updates.
- `user_typing`: Broadcasts typing status to channel room.
- `user_stop_typing`: Broadcasts typing stop to channel room.
