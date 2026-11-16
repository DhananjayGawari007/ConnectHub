#include <iostream>
#include <string>
#include <fstream>
#include <sstream>
#include <vector>
#include "NaryTree.h"
#include "Graph.h"
#include "MessageQueue.h"
#include "MaxHeap.h"

// Global in-memory data structures
static NaryTree g_tree;
static Graph g_graph;
static MessageQueue g_queue;
static MaxHeap g_heap;

const std::string STATE_FILE = "connecthub_engine_state.json";

void saveState() {
    std::ofstream out(STATE_FILE);
    if (!out.is_open()) return;
    out << "{\n";
    out << "  \"tree\": " << g_tree.toJson() << ",\n";
    out << "  \"graph\": " << g_graph.toJson() << ",\n";
    out << "  \"queue\": " << g_queue.toJson() << ",\n";
    out << "  \"heap\": " << g_heap.toJson() << "\n";
    out << "}\n";
    out.close();
}

void loadInitialSampleData() {
    // Populate tree
    int s1 = g_tree.addServer("ConnectHub Official");
    int c1 = g_tree.addCategory(s1, "General");
    int c2 = g_tree.addCategory(s1, "Development");
    g_tree.addChannel(c1, "welcome", NodeType::TEXT_CHANNEL);
    g_tree.addChannel(c1, "general-chat", NodeType::TEXT_CHANNEL);
    g_tree.addChannel(c1, "voice-hangout", NodeType::VOICE_CHANNEL);
    g_tree.addChannel(c2, "cpp-help", NodeType::TEXT_CHANNEL);
    g_tree.addChannel(c2, "code-reviews", NodeType::TEXT_CHANNEL);

    // Populate graph
    g_graph.addUser(1, "alice");
    g_graph.addUser(2, "bob");
    g_graph.addUser(3, "charlie");
    g_graph.addUser(4, "diana");
    g_graph.addUser(5, "eve");
    g_graph.addFriendship(1, 2);
    g_graph.addFriendship(1, 3);
    g_graph.addFriendship(2, 3);
    g_graph.addFriendship(2, 4);
    g_graph.addFriendship(3, 5);

    // Populate queue
    g_queue.enqueue(Message(1, 1, 100, "Welcome to ConnectHub!", "2024-01-01 12:00:00", "alice"));
    g_queue.enqueue(Message(2, 2, 100, "Hey Alice, this platform is great!", "2024-01-01 12:01:00", "bob"));
    g_queue.enqueue(Message(3, 3, 100, "All data structures running in C++!", "2024-01-01 12:02:00", "charlie"));

    // Populate heap
    g_heap.insert(Notification(1, 1, 5, "mention", "@alice you were mentioned in #general-chat", "2024-01-01 12:00:00"));
    g_heap.insert(Notification(2, 1, 4, "dm", "New direct message from bob", "2024-01-01 12:01:00"));
    g_heap.insert(Notification(3, 1, 3, "friend_request", "diana sent you a friend request", "2024-01-01 12:02:00"));
    g_heap.insert(Notification(4, 1, 2, "announcement", "Server rules updated", "2024-01-01 12:03:00"));
    g_heap.insert(Notification(5, 1, 1, "general", "ConnectHub updated to v1.0", "2024-01-01 12:04:00"));

    saveState();
}

std::string handleCommand(const std::string& action, const std::vector<std::string>& args) {
    std::ostringstream res;
    res << "{\"success\":true,\"action\":\"" << action << "\",\"data\":";

    try {
        // --- N-ARY TREE COMMANDS ---
        if (action == "tree_get") {
            res << g_tree.toJson();
        } else if (action == "tree_add_server" && args.size() >= 1) {
            int id = g_tree.addServer(args[0]);
            res << "{\"id\":" << id << ",\"name\":\"" << args[0] << "\"}";
        } else if (action == "tree_add_category" && args.size() >= 2) {
            int sId = std::stoi(args[0]);
            int id = g_tree.addCategory(sId, args[1]);
            res << "{\"id\":" << id << ",\"serverId\":" << sId << ",\"name\":\"" << args[1] << "\"}";
        } else if (action == "tree_add_channel" && args.size() >= 3) {
            int cId = std::stoi(args[0]);
            NodeType type = (args[2] == "voice" || args[2] == "voice_channel") ? NodeType::VOICE_CHANNEL : NodeType::TEXT_CHANNEL;
            int id = g_tree.addChannel(cId, args[1], type);
            res << "{\"id\":" << id << ",\"categoryId\":" << cId << ",\"name\":\"" << args[1] << "\"}";
        } else if (action == "tree_delete_node" && args.size() >= 1) {
            int id = std::stoi(args[0]);
            bool ok = g_tree.deleteNode(id);
            res << "{\"deleted\":" << (ok ? "true" : "false") << ",\"id\":" << id << "}";
        } else if (action == "tree_move_channel" && args.size() >= 2) {
            int chId = std::stoi(args[0]);
            int newCatId = std::stoi(args[1]);
            bool ok = g_tree.moveChannel(chId, newCatId);
            res << "{\"moved\":" << (ok ? "true" : "false") << "}";
        } else if (action == "tree_search" && args.size() >= 1) {
            TreeNode* node = nullptr;
            try {
                int id = std::stoi(args[0]);
                node = g_tree.searchById(id);
            } catch (...) {
                node = g_tree.searchByName(args[0]);
            }
            if (node) {
                res << "{\"found\":true,\"id\":" << node->id << ",\"name\":\"" << node->name << "\",\"type\":\"" << node->typeToString() << "\"}";
            } else {
                res << "{\"found\":false}";
            }
        } else if (action == "tree_clear") {
            g_tree.clear();
            res << "{\"cleared\":true}";
        }

        // --- GRAPH COMMANDS ---
        else if (action == "graph_get") {
            res << g_graph.toJson();
        } else if (action == "graph_add_user" && args.size() >= 2) {
            int uId = std::stoi(args[0]);
            bool ok = g_graph.addUser(uId, args[1]);
            res << "{\"added\":" << (ok ? "true" : "false") << ",\"id\":" << uId << ",\"username\":\"" << args[1] << "\"}";
        } else if (action == "graph_remove_user" && args.size() >= 1) {
            int uId = std::stoi(args[0]);
            bool ok = g_graph.removeUser(uId);
            res << "{\"removed\":" << (ok ? "true" : "false") << "}";
        } else if (action == "graph_add_friendship" && args.size() >= 2) {
            int u1 = std::stoi(args[0]);
            int u2 = std::stoi(args[1]);
            bool ok = g_graph.addFriendship(u1, u2);
            res << "{\"added\":" << (ok ? "true" : "false") << ",\"u1\":" << u1 << ",\"u2\":" << u2 << "}";
        } else if (action == "graph_remove_friendship" && args.size() >= 2) {
            int u1 = std::stoi(args[0]);
            int u2 = std::stoi(args[1]);
            bool ok = g_graph.removeFriendship(u1, u2);
            res << "{\"removed\":" << (ok ? "true" : "false") << "}";
        } else if (action == "graph_bfs" && args.size() >= 1) {
            int start = std::stoi(args[0]);
            auto order = g_graph.bfs(start);
            res << "{\"start\":" << start << ",\"traversal\":[";
            for (size_t i = 0; i < order.size(); ++i) {
                if (i > 0) res << ",";
                res << order[i];
            }
            res << "]}";
        } else if (action == "graph_dfs" && args.size() >= 1) {
            int start = std::stoi(args[0]);
            auto order = g_graph.dfs(start);
            res << "{\"start\":" << start << ",\"traversal\":[";
            for (size_t i = 0; i < order.size(); ++i) {
                if (i > 0) res << ",";
                res << order[i];
            }
            res << "]}";
        } else if (action == "graph_mutual" && args.size() >= 2) {
            int u1 = std::stoi(args[0]);
            int u2 = std::stoi(args[1]);
            auto mutual = g_graph.getMutualFriends(u1, u2);
            res << "{\"mutual\":[";
            for (size_t i = 0; i < mutual.size(); ++i) {
                if (i > 0) res << ",";
                res << mutual[i];
            }
            res << "]}";
        } else if (action == "graph_suggest" && args.size() >= 1) {
            int uId = std::stoi(args[0]);
            auto sugg = g_graph.suggestFriends(uId);
            res << "{\"suggestions\":[";
            for (size_t i = 0; i < sugg.size(); ++i) {
                if (i > 0) res << ",";
                res << sugg[i];
            }
            res << "]}";
        }

        // --- MESSAGE QUEUE COMMANDS ---
        else if (action == "queue_get") {
            res << g_queue.toJson();
        } else if (action == "queue_enqueue" && args.size() >= 5) {
            int msgId = std::stoi(args[0]);
            int senderId = std::stoi(args[1]);
            int rcvId = std::stoi(args[2]);
            std::string content = args[3];
            std::string timestamp = args[4];
            std::string senderName = args.size() >= 6 ? args[5] : "User";
            g_queue.enqueue(Message(msgId, senderId, rcvId, content, timestamp, senderName));
            res << "{\"enqueued\":true,\"messageId\":" << msgId << ",\"size\":" << g_queue.size() << "}";
        } else if (action == "queue_dequeue") {
            if (g_queue.isEmpty()) {
                res << "{\"dequeued\":false,\"error\":\"Queue is empty\"}";
            } else {
                Message msg = g_queue.dequeue();
                res << "{\"dequeued\":true,\"message\":{\"messageId\":" << msg.messageId
                    << ",\"senderId\":" << msg.senderId
                    << ",\"receiverId\":" << msg.receiverId
                    << ",\"content\":\"" << msg.content << "\""
                    << ",\"timestamp\":\"" << msg.timestamp << "\""
                    << ",\"senderName\":\"" << msg.senderName << "\"}}";
            }
        } else if (action == "queue_peek") {
            if (g_queue.isEmpty()) {
                res << "{\"hasItem\":false}";
            } else {
                Message msg = g_queue.peek();
                res << "{\"hasItem\":true,\"message\":{\"messageId\":" << msg.messageId
                    << ",\"content\":\"" << msg.content << "\""
                    << ",\"senderName\":\"" << msg.senderName << "\"}}";
            }
        } else if (action == "queue_clear") {
            g_queue.clear();
            res << "{\"cleared\":true}";
        }

        // --- MAX HEAP COMMANDS ---
        else if (action == "heap_get") {
            res << g_heap.toJson();
        } else if (action == "heap_insert" && args.size() >= 5) {
            int id = std::stoi(args[0]);
            int uId = std::stoi(args[1]);
            int priority = std::stoi(args[2]);
            std::string type = args[3];
            std::string content = args[4];
            std::string timestamp = args.size() >= 6 ? args[5] : "2024-01-01 12:00:00";
            g_heap.insert(Notification(id, uId, priority, type, content, timestamp));
            res << "{\"inserted\":true,\"id\":" << id << ",\"priority\":" << priority << ",\"size\":" << g_heap.size() << "}";
        } else if (action == "heap_extract_max") {
            if (g_heap.isEmpty()) {
                res << "{\"extracted\":false,\"error\":\"Heap is empty\"}";
            } else {
                Notification n = g_heap.extractMax();
                res << "{\"extracted\":true,\"notification\":{\"id\":" << n.id
                    << ",\"priority\":" << n.priority
                    << ",\"type\":\"" << n.type << "\""
                    << ",\"content\":\"" << n.content << "\"}}";
            }
        } else if (action == "heap_peek_max") {
            if (g_heap.isEmpty()) {
                res << "{\"hasItem\":false}";
            } else {
                Notification n = g_heap.peekMax();
                res << "{\"hasItem\":true,\"notification\":{\"id\":" << n.id
                    << ",\"priority\":" << n.priority
                    << ",\"type\":\"" << n.type << "\""
                    << ",\"content\":\"" << n.content << "\"}}";
            }
        } else if (action == "heap_clear") {
            g_heap.clear();
            res << "{\"cleared\":true}";
        }

        // --- ALL DATA STRUCTURES SUMMARY ---
        else if (action == "all_get") {
            res << "{\"tree\":" << g_tree.toJson()
                << ",\"graph\":" << g_graph.toJson()
                << ",\"queue\":" << g_queue.toJson()
                << ",\"heap\":" << g_heap.toJson() << "}";
        } else {
            return "{\"success\":false,\"error\":\"Unknown action: " + action + "\"}";
        }

    } catch (const std::exception& ex) {
        return "{\"success\":false,\"error\":\"" + std::string(ex.what()) + "\"}";
    }

    res << "}";
    saveState();
    return res.str();
}

int main(int argc, char* argv[]) {
    loadInitialSampleData();

    // Mode 1: CLI arguments mode
    if (argc >= 2) {
        std::string action = argv[1];
        std::vector<std::string> args;
        for (int i = 2; i < argc; ++i) {
            args.push_back(argv[i]);
        }
        std::cout << handleCommand(action, args) << std::endl;
        return 0;
    }

    // Mode 2: Interactive Stdin/Stdout Daemon mode (for persistent Node.js child process)
    std::string line;
    while (std::getline(std::cin, line)) {
        if (line == "exit" || line == "quit") break;
        if (line.empty()) continue;

        std::istringstream iss(line);
        std::string action;
        iss >> action;
        std::vector<std::string> args;
        std::string arg;
        while (iss >> arg) {
            args.push_back(arg);
        }
        std::cout << handleCommand(action, args) << std::endl;
    }

    return 0;
}
