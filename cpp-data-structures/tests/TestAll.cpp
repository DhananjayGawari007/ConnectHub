// TestAll.cpp - Comprehensive tests for all data structures
#include <iostream>
#include <cassert>
#include <string>
#include "NaryTree.h"
#include "Graph.h"
#include "MessageQueue.h"
#include "MaxHeap.h"

int passed = 0;
int failed = 0;

#define TEST(name, expr) \
    do { \
        if (expr) { \
            std::cout << "  [PASS] " << name << "\n"; \
            passed++; \
        } else { \
            std::cout << "  [FAIL] " << name << "\n"; \
            failed++; \
        } \
    } while(0)

void testNaryTree() {
    std::cout << "\n=== N-ary Tree Tests ===\n";
    NaryTree tree;

    int s1 = tree.addServer("Server1");
    TEST("Add server", s1 > 0);

    int c1 = tree.addCategory(s1, "Category1");
    TEST("Add category", c1 > 0);

    int ch1 = tree.addChannel(c1, "general", NodeType::TEXT_CHANNEL);
    TEST("Add text channel", ch1 > 0);

    int ch2 = tree.addChannel(c1, "voice", NodeType::VOICE_CHANNEL);
    TEST("Add voice channel", ch2 > 0);

    TEST("Node count = 4", tree.getNodeCount() == 4);

    TreeNode* found = tree.searchById(ch1);
    TEST("Search by ID", found != nullptr && found->name == "general");

    found = tree.searchByName("voice");
    TEST("Search by name", found != nullptr && found->id == ch2);

    int c2 = tree.addCategory(s1, "Category2");
    TEST("Move channel", tree.moveChannel(ch1, c2));

    auto children = tree.getChildren(c2);
    TEST("Channel moved correctly", children.size() == 1 && children[0]->id == ch1);

    TEST("Delete node", tree.deleteNode(c1));
    TEST("Node count after delete = 3", tree.getNodeCount() == 3);

    TEST("Add category to invalid parent fails", tree.addCategory(999, "Fail") == -1);

    std::string json = tree.toJson();
    TEST("JSON serialization", !json.empty() && json[0] == '[');

    tree.clear();
    TEST("Clear tree", tree.getNodeCount() == 0);
}

void testGraph() {
    std::cout << "\n=== Graph Tests ===\n";
    Graph graph;

    TEST("Add user 1", graph.addUser(1, "Alice"));
    TEST("Add user 2", graph.addUser(2, "Bob"));
    TEST("Add user 3", graph.addUser(3, "Charlie"));
    TEST("Add user 4", graph.addUser(4, "Diana"));
    TEST("Duplicate user fails", !graph.addUser(1, "Alice2"));

    TEST("Add friendship 1-2", graph.addFriendship(1, 2));
    TEST("Add friendship 1-3", graph.addFriendship(1, 3));
    TEST("Add friendship 2, 3", graph.addFriendship(2, 3));
    TEST("Add friendship 2-4", graph.addFriendship(2, 4));
    TEST("Self-friendship fails", !graph.addFriendship(1, 1));
    TEST("Duplicate friendship fails", !graph.addFriendship(1, 2));

    TEST("Are friends (1,2)", graph.areFriends(1, 2));
    TEST("Are friends (2,1)", graph.areFriends(2, 1));
    TEST("Not friends (1,4)", !graph.areFriends(1, 4));

    TEST("Friend count Alice = 2", graph.getFriendCount(1) == 2);
    TEST("Vertex count = 4", graph.getVertexCount() == 4);
    TEST("Edge count = 4", graph.getEdgeCount() == 4);

    auto bfs = graph.bfs(1);
    TEST("BFS visits all connected", bfs.size() == 4);
    TEST("BFS starts at 1", bfs[0] == 1);

    auto dfs = graph.dfs(1);
    TEST("DFS visits all connected", dfs.size() == 4);
    TEST("DFS starts at 1", dfs[0] == 1);

    auto mutual = graph.getMutualFriends(1, 4);
    TEST("Mutual friends (1,4) = {2}", mutual.size() == 1 && mutual[0] == 2);

    TEST("Remove friendship", graph.removeFriendship(1, 2));
    TEST("No longer friends", !graph.areFriends(1, 2));
    TEST("Edge count = 3", graph.getEdgeCount() == 3);

    std::string json = graph.toJson();
    TEST("JSON serialization", !json.empty());

    graph.clear();
    TEST("Clear graph", graph.getVertexCount() == 0);
}

void testMessageQueue() {
    std::cout << "\n=== Message Queue Tests ===\n";
    MessageQueue queue;

    TEST("Initially empty", queue.isEmpty());
    TEST("Initial size = 0", queue.size() == 0);

    queue.enqueue(Message(1, 1, 100, "Hello", "2024-01-01 10:00:00", "Alice"));
    queue.enqueue(Message(2, 2, 100, "Hi", "2024-01-01 10:01:00", "Bob"));
    queue.enqueue(Message(3, 3, 100, "Hey", "2024-01-01 10:02:00", "Charlie"));

    TEST("Not empty after enqueue", !queue.isEmpty());
    TEST("Size = 3", queue.size() == 3);

    Message front = queue.peek();
    TEST("Peek returns first (FIFO)", front.messageId == 1 && front.senderName == "Alice");

    Message d1 = queue.dequeue();
    TEST("Dequeue first = Alice", d1.messageId == 1);

    Message d2 = queue.dequeue();
    TEST("Dequeue second = Bob", d2.messageId == 2);

    Message d3 = queue.dequeue();
    TEST("Dequeue third = Charlie", d3.messageId == 3);

    TEST("Empty after dequeue all", queue.isEmpty());

    // Test exception on empty dequeue
    bool caught = false;
    try { queue.dequeue(); } catch (const std::runtime_error&) { caught = true; }
    TEST("Exception on empty dequeue", caught);

    // Test getAllMessages
    queue.enqueue(Message(4, 1, 100, "Msg4", "2024-01-01 11:00:00", "Alice"));
    queue.enqueue(Message(5, 2, 100, "Msg5", "2024-01-01 11:01:00", "Bob"));
    auto all = queue.getAllMessages();
    TEST("getAllMessages size = 2", all.size() == 2);

    std::string json = queue.toJson();
    TEST("JSON serialization", !json.empty());

    queue.clear();
    TEST("Clear queue", queue.isEmpty());
}

void testMaxHeap() {
    std::cout << "\n=== Max Heap Tests ===\n";
    MaxHeap heap;

    TEST("Initially empty", heap.isEmpty());
    TEST("Initial size = 0", heap.size() == 0);

    heap.insert(Notification(1, 1, 1, "general", "Update", "2024-01-01 10:00:00"));
    heap.insert(Notification(2, 1, 5, "mention", "Mention", "2024-01-01 10:01:00"));
    heap.insert(Notification(3, 1, 3, "friend_request", "Request", "2024-01-01 10:02:00"));
    heap.insert(Notification(4, 1, 4, "dm", "DM", "2024-01-01 10:03:00"));
    heap.insert(Notification(5, 1, 2, "announcement", "Announce", "2024-01-01 10:04:00"));

    TEST("Size = 5", heap.size() == 5);

    Notification top = heap.peekMax();
    TEST("Peek max priority = 5", top.priority == 5);
    TEST("Peek max type = mention", top.type == "mention");

    Notification e1 = heap.extractMax();
    TEST("Extract max priority = 5", e1.priority == 5);

    Notification e2 = heap.extractMax();
    TEST("Next max priority = 4", e2.priority == 4);

    Notification e3 = heap.extractMax();
    TEST("Next max priority = 3", e3.priority == 3);

    Notification e4 = heap.extractMax();
    TEST("Next max priority = 2", e4.priority == 2);

    Notification e5 = heap.extractMax();
    TEST("Next max priority = 1", e5.priority == 1);

    TEST("Empty after extracting all", heap.isEmpty());

    // Build heap
    std::vector<Notification> notifs = {
        Notification(10, 1, 2, "a", "A", "t"),
        Notification(11, 1, 5, "b", "B", "t"),
        Notification(12, 1, 1, "c", "C", "t"),
        Notification(13, 1, 4, "d", "D", "t"),
    };
    heap.buildHeap(notifs);
    TEST("Build heap size = 4", heap.size() == 4);
    TEST("Build heap max = 5", heap.peekMax().priority == 5);

    std::string json = heap.toJson();
    TEST("JSON serialization", !json.empty());

    heap.clear();
    TEST("Clear heap", heap.isEmpty());
}

int main() {
    std::cout << "=============================================\n";
    std::cout << " ConnectHub - Data Structure Test Suite\n";
    std::cout << "=============================================\n";

    testNaryTree();
    testGraph();
    testMessageQueue();
    testMaxHeap();

    std::cout << "\n=============================================\n";
    std::cout << " Results: " << passed << " passed, " << failed << " failed\n";
    std::cout << "=============================================\n";

    return failed > 0 ? 1 : 0;
}
