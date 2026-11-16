#include "Graph.h"
#include <queue>
#include <stack>
#include <algorithm>

Graph::Graph() {}
Graph::~Graph() {}

bool Graph::addUser(int userId, const std::string& username) {
    if (vertices.count(userId)) return false;
    vertices[userId] = UserVertex(userId, username);
    adjacencyList[userId] = std::unordered_set<int>();
    return true;
}

bool Graph::removeUser(int userId) {
    if (!vertices.count(userId)) return false;
    for (int friendId : adjacencyList[userId]) {
        adjacencyList[friendId].erase(userId);
    }
    adjacencyList.erase(userId);
    vertices.erase(userId);
    return true;
}

bool Graph::userExists(int userId) const {
    return vertices.count(userId) > 0;
}

bool Graph::addFriendship(int userId1, int userId2) {
    if (userId1 == userId2) return false;
    if (!vertices.count(userId1) || !vertices.count(userId2)) return false;
    if (adjacencyList[userId1].count(userId2)) return false;
    adjacencyList[userId1].insert(userId2);
    adjacencyList[userId2].insert(userId1);
    return true;
}

bool Graph::removeFriendship(int userId1, int userId2) {
    if (!vertices.count(userId1) || !vertices.count(userId2)) return false;
    if (!adjacencyList[userId1].count(userId2)) return false;
    adjacencyList[userId1].erase(userId2);
    adjacencyList[userId2].erase(userId1);
    return true;
}

bool Graph::areFriends(int userId1, int userId2) const {
    auto it = adjacencyList.find(userId1);
    if (it == adjacencyList.end()) return false;
    return it->second.count(userId2) > 0;
}

std::vector<int> Graph::getFriends(int userId) const {
    std::vector<int> friends;
    auto it = adjacencyList.find(userId);
    if (it != adjacencyList.end()) {
        friends.assign(it->second.begin(), it->second.end());
        std::sort(friends.begin(), friends.end());
    }
    return friends;
}

int Graph::getFriendCount(int userId) const {
    auto it = adjacencyList.find(userId);
    return it != adjacencyList.end() ? static_cast<int>(it->second.size()) : 0;
}

std::vector<int> Graph::bfs(int startUserId) const {
    std::vector<int> result;
    if (!vertices.count(startUserId)) return result;

    std::unordered_set<int> visited;
    std::queue<int> q;
    q.push(startUserId);
    visited.insert(startUserId);

    while (!q.empty()) {
        int current = q.front();
        q.pop();
        result.push_back(current);

        auto it = adjacencyList.find(current);
        if (it != adjacencyList.end()) {
            std::vector<int> neighbors(it->second.begin(), it->second.end());
            std::sort(neighbors.begin(), neighbors.end());
            for (int neighbor : neighbors) {
                if (!visited.count(neighbor)) {
                    visited.insert(neighbor);
                    q.push(neighbor);
                }
            }
        }
    }
    return result;
}

std::vector<int> Graph::dfs(int startUserId) const {
    std::vector<int> result;
    if (!vertices.count(startUserId)) return result;

    std::unordered_set<int> visited;
    std::stack<int> s;
    s.push(startUserId);

    while (!s.empty()) {
        int current = s.top();
        s.pop();
        if (visited.count(current)) continue;
        visited.insert(current);
        result.push_back(current);

        auto it = adjacencyList.find(current);
        if (it != adjacencyList.end()) {
            std::vector<int> neighbors(it->second.begin(), it->second.end());
            std::sort(neighbors.rbegin(), neighbors.rend());
            for (int neighbor : neighbors) {
                if (!visited.count(neighbor)) {
                    s.push(neighbor);
                }
            }
        }
    }
    return result;
}

std::vector<int> Graph::getMutualFriends(int userId1, int userId2) const {
    std::vector<int> mutual;
    auto it1 = adjacencyList.find(userId1);
    auto it2 = adjacencyList.find(userId2);
    if (it1 == adjacencyList.end() || it2 == adjacencyList.end()) return mutual;

    for (int friendId : it1->second) {
        if (it2->second.count(friendId)) {
            mutual.push_back(friendId);
        }
    }
    std::sort(mutual.begin(), mutual.end());
    return mutual;
}

std::vector<int> Graph::suggestFriends(int userId) const {
    std::unordered_map<int, int> suggestionScore;
    auto it = adjacencyList.find(userId);
    if (it == adjacencyList.end()) return {};

    for (int friendId : it->second) {
        auto fIt = adjacencyList.find(friendId);
        if (fIt == adjacencyList.end()) continue;
        for (int fof : fIt->second) {
            if (fof != userId && !it->second.count(fof)) {
                suggestionScore[fof]++;
            }
        }
    }

    std::vector<std::pair<int, int>> scored(suggestionScore.begin(), suggestionScore.end());
    std::sort(scored.begin(), scored.end(), [](const auto& a, const auto& b) {
        return a.second > b.second;
    });

    std::vector<int> suggestions;
    for (auto& [id, score] : scored) {
        suggestions.push_back(id);
    }
    return suggestions;
}

int Graph::getEdgeCount() const {
    int count = 0;
    for (auto& [id, neighbors] : adjacencyList) {
        count += static_cast<int>(neighbors.size());
    }
    return count / 2;
}

std::vector<UserVertex> Graph::getAllUsers() const {
    std::vector<UserVertex> users;
    for (auto& [id, vertex] : vertices) {
        users.push_back(vertex);
    }
    std::sort(users.begin(), users.end(), [](const UserVertex& a, const UserVertex& b) {
        return a.id < b.id;
    });
    return users;
}

std::string Graph::toJson() const {
    std::ostringstream oss;
    oss << "{\"vertices\":[";
    auto allUsers = getAllUsers();
    for (size_t i = 0; i < allUsers.size(); ++i) {
        if (i > 0) oss << ",";
        oss << "{\"id\":" << allUsers[i].id << ",\"username\":\"" << allUsers[i].username << "\"}";
    }
    oss << "],\"edges\":[";
    bool first = true;
    std::unordered_set<long long> printed;
    for (auto& [userId, neighbors] : adjacencyList) {
        for (int neighborId : neighbors) {
            long long key = std::min(userId, neighborId) * 100000LL + std::max(userId, neighborId);
            if (printed.count(key)) continue;
            printed.insert(key);
            if (!first) oss << ",";
            first = false;
            oss << "{\"from\":" << userId << ",\"to\":" << neighborId << "}";
        }
    }
    oss << "],\"adjacencyList\":{";
    first = true;
    for (auto& [userId, neighbors] : adjacencyList) {
        if (!first) oss << ",";
        first = false;
        oss << "\"" << userId << "\":[";
        std::vector<int> sorted_n(neighbors.begin(), neighbors.end());
        std::sort(sorted_n.begin(), sorted_n.end());
        for (size_t i = 0; i < sorted_n.size(); ++i) {
            if (i > 0) oss << ",";
            oss << sorted_n[i];
        }
        oss << "]";
    }
    oss << "}}";
    return oss.str();
}

void Graph::clear() {
    vertices.clear();
    adjacencyList.clear();
}
