# ConnectHub – C++ Data Structures Engineering & Complexity Analysis

This document provides a detailed breakdown of the four C++ data structures implemented in ConnectHub, their time and space complexity, and how each solves a core operational problem in the platform.

---

## 1. N-ary Tree (Server & Channel Hierarchy)

### Files
- `cpp-data-structures/include/NaryTree.h`
- `cpp-data-structures/src/NaryTree.cpp`
- `cpp-data-structures/demos/NaryTreeDemo.cpp`

### Conceptual Purpose
Discord's organizational model is hierarchical:
```
Server (Root Node)
  ├── Category 1 (Intermediate Node)
  │     ├── #welcome (Text Channel Leaf)
  │     ├── #announcements (Text Channel Leaf)
  │     └── 🔊 Lounge (Voice Channel Leaf)
  └── Category 2 (Intermediate Node)
        └── #development (Text Channel Leaf)
```
An **N-ary Tree** models this structure naturally because each server has an arbitrary number of categories, and each category has an arbitrary number of channels.

### Operations & Complexity
| Operation | Time Complexity | Space Complexity | Description |
|-----------|-----------------|------------------|-------------|
| **Add Server (Root)** | $O(1)$ | $O(1)$ | Appends root node to vector and hash table |
| **Add Category / Channel** | $O(1)$ | $O(1)$ | Appends child pointer to parent's children collection |
| **Move Channel** | $O(1)$ | $O(1)$ | Unlinks child from old parent, reparents to new category |
| **Delete Subtree** | $O(k)$ | $O(k)$ | Recursively frees $k$ descendant nodes in the deleted subtree |
| **Search by ID** | $O(1)$ avg | $O(1)$ | Instant lookup via `std::unordered_map<int, TreeNode*>` |
| **Search by Name** | $O(n)$ | $O(1)$ | Linear scan across node map |

---

## 2. Graph – Adjacency List (Social Network)

### Files
- `cpp-data-structures/include/Graph.h`
- `cpp-data-structures/src/Graph.cpp`
- `cpp-data-structures/demos/GraphDemo.cpp`

### Conceptual Purpose
Users and friendships form an undirected, unweighted social graph:
- **Vertices ($V$)**: Individual registered users.
- **Edges ($E$)**: Mutual friendships.

### Traversal Algorithms
1. **BFS (Breadth-First Search)**:
   - Uses `std::queue<int>`.
   - Explores users layer-by-layer (immediate friends, then friends-of-friends).
   - Generates friend recommendations based on shortest social distance.
2. **DFS (Depth-First Search)**:
   - Uses `std::stack<int>`.
   - Traverses deep social chains to discover community clusters.
3. **Mutual Friends**:
   - Computes set intersection between `adjacencyList[user1]` and `adjacencyList[user2]`.

### Operations & Complexity
| Operation | Time Complexity | Space Complexity | Description |
|-----------|-----------------|------------------|-------------|
| **Add Vertex** | $O(1)$ avg | $O(1)$ | Inserts user into hash table |
| **Add Edge** | $O(1)$ avg | $O(1)$ | Inserts into both users' `std::unordered_set` |
| **Remove Edge** | $O(1)$ avg | $O(1)$ | Erases from both users' sets |
| **BFS Traversal** | $O(V + E)$ | $O(V)$ | Queue-driven level-order traversal |
| **DFS Traversal** | $O(V + E)$ | $O(V)$ | Stack-driven depth traversal |
| **Mutual Friends** | $O(\min(d_1, d_2))$ | $O(\min(d_1, d_2))$ | Set lookup across neighbor sets |

---

## 3. FIFO Message Queue (Ordered Message Processing)

### Files
- `cpp-data-structures/include/MessageQueue.h`
- `cpp-data-structures/src/MessageQueue.cpp`
- `cpp-data-structures/demos/QueueDemo.cpp`

### Conceptual Purpose
In high-throughput chat applications, multiple concurrent users send messages simultaneously. A **FIFO (First-In, First-Out) Linked Queue** guarantees:
1. Message delivery order matches real-time transmission timestamps.
2. Incoming messages are buffered safely before asynchronous database writes.
3. Front and Rear pointers maintain $O(1)$ push and pop operations without array resizing penalties.

### Operations & Complexity
| Operation | Time Complexity | Space Complexity | Description |
|-----------|-----------------|------------------|-------------|
| **Enqueue** | $O(1)$ | $O(1)$ | Appends node to `rear->next` and advances rear |
| **Dequeue** | $O(1)$ | $O(1)$ | Pops from `front`, advances front, frees old head |
| **Peek** | $O(1)$ | $O(1)$ | Inspects `front->data` |
| **Size / IsEmpty** | $O(1)$ | $O(1)$ | Constant-time count inspection |

---

## 4. Binary Max Heap (Priority Notification Queue)

### Files
- `cpp-data-structures/include/MaxHeap.h`
- `cpp-data-structures/src/MaxHeap.cpp`
- `cpp-data-structures/demos/PriorityQueueDemo.cpp`

### Conceptual Purpose
Not all user notifications have equal importance. ConnectHub classifies alerts into five distinct priority tiers:
- **Priority 5**: Direct Mention (`@username`) – Immediate urgency
- **Priority 4**: Direct Message (Private 1-on-1 chat)
- **Priority 3**: Friend Request
- **Priority 2**: Server Announcement
- **Priority 1**: General Platform Update

ConnectHub implements a complete **array-backed Binary Max Heap** in C++ satisfying the Max Heap Property:
$$\forall i > 0, \quad \text{priority}(\text{parent}(i)) \ge \text{priority}(i)$$
Index arithmetic:
$$\text{parent}(i) = \left\lfloor\frac{i - 1}{2}\right\rfloor, \quad \text{left}(i) = 2i + 1, \quad \text{right}(i) = 2i + 2$$

### Operations & Complexity
| Operation | Time Complexity | Space Complexity | Description |
|-----------|-----------------|------------------|-------------|
| **Insert** | $O(\log n)$ | $O(1)$ | Appends to array and executes `heapifyUp()` |
| **Extract Max** | $O(\log n)$ | $O(1)$ | Swaps root with last element, pops, runs `heapifyDown()` |
| **Peek Max** | $O(1)$ | $O(1)$ | Returns root element at index 0 |
| **Build Heap** | $O(n)$ | $O(1)$ | Floyd's bottom-up linear heap construction algorithm |
