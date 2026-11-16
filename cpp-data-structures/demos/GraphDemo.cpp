// GraphDemo.cpp - Demonstrates Graph (Adjacency List) data structure
#include <iostream>
#include "Graph.h"

int main() {
    std::cout << "========================================\n";
    std::cout << " ConnectHub - Graph (Adjacency List) Demo\n";
    std::cout << "========================================\n\n";

    Graph graph;

    // Add users
    std::cout << "--- Adding Users ---\n";
    graph.addUser(1, "Alice");
    graph.addUser(2, "Bob");
    graph.addUser(3, "Charlie");
    graph.addUser(4, "Diana");
    graph.addUser(5, "Eve");
    graph.addUser(6, "Frank");
    std::cout << "Added 6 users\n\n";

    // Add friendships
    std::cout << "--- Adding Friendships ---\n";
    graph.addFriendship(1, 2); // Alice - Bob
    graph.addFriendship(1, 3); // Alice - Charlie
    graph.addFriendship(2, 3); // Bob - Charlie
    graph.addFriendship(2, 4); // Bob - Diana
    graph.addFriendship(3, 5); // Charlie - Eve
    graph.addFriendship(4, 5); // Diana - Eve
    graph.addFriendship(5, 6); // Eve - Frank
    std::cout << "Created 7 friendships\n\n";

    // Display friends
    std::cout << "--- Friends Lists ---\n";
    auto users = graph.getAllUsers();
    for (auto& u : users) {
        auto friends = graph.getFriends(u.id);
        std::cout << u.username << "'s friends: ";
        for (size_t i = 0; i < friends.size(); ++i) {
            if (i > 0) std::cout << ", ";
            std::cout << friends[i];
        }
        std::cout << " (count: " << graph.getFriendCount(u.id) << ")\n";
    }

    // BFS traversal
    std::cout << "\n--- BFS from Alice (1) ---\n";
    auto bfsResult = graph.bfs(1);
    std::cout << "Order: ";
    for (size_t i = 0; i < bfsResult.size(); ++i) {
        if (i > 0) std::cout << " -> ";
        std::cout << bfsResult[i];
    }
    std::cout << "\n";

    // DFS traversal
    std::cout << "\n--- DFS from Alice (1) ---\n";
    auto dfsResult = graph.dfs(1);
    std::cout << "Order: ";
    for (size_t i = 0; i < dfsResult.size(); ++i) {
        if (i > 0) std::cout << " -> ";
        std::cout << dfsResult[i];
    }
    std::cout << "\n";

    // Mutual friends
    std::cout << "\n--- Mutual Friends ---\n";
    auto mutual = graph.getMutualFriends(1, 4);
    std::cout << "Alice & Diana mutual friends: ";
    for (int id : mutual) std::cout << id << " ";
    std::cout << "\n";

    // Friend suggestions
    std::cout << "\n--- Friend Suggestions for Alice ---\n";
    auto suggestions = graph.suggestFriends(1);
    std::cout << "Suggestions: ";
    for (int id : suggestions) std::cout << id << " ";
    std::cout << "\n";

    // Remove friendship
    std::cout << "\n--- Removing Alice-Bob friendship ---\n";
    graph.removeFriendship(1, 2);
    std::cout << "Are Alice and Bob friends? " << (graph.areFriends(1, 2) ? "Yes" : "No") << "\n";

    std::cout << "\nVertices: " << graph.getVertexCount() << ", Edges: " << graph.getEdgeCount() << "\n";
    std::cout << "\n========== Demo Complete ==========\n";
    return 0;
}
