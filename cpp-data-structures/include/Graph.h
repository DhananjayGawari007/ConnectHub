#ifndef GRAPH_H
#define GRAPH_H

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <sstream>

struct UserVertex {
    int id;
    std::string username;
    UserVertex() : id(0), username("") {}
    UserVertex(int id, const std::string& username) : id(id), username(username) {}
};

class Graph {
private:
    std::unordered_map<int, UserVertex> vertices;
    std::unordered_map<int, std::unordered_set<int>> adjacencyList;

public:
    Graph();
    ~Graph();

    bool addUser(int userId, const std::string& username);
    bool removeUser(int userId);
    bool userExists(int userId) const;

    bool addFriendship(int userId1, int userId2);
    bool removeFriendship(int userId1, int userId2);
    bool areFriends(int userId1, int userId2) const;

    std::vector<int> getFriends(int userId) const;
    int getFriendCount(int userId) const;

    std::vector<int> bfs(int startUserId) const;
    std::vector<int> dfs(int startUserId) const;
    std::vector<int> getMutualFriends(int userId1, int userId2) const;
    std::vector<int> suggestFriends(int userId) const;

    std::string toJson() const;
    int getVertexCount() const { return static_cast<int>(vertices.size()); }
    int getEdgeCount() const;
    std::vector<UserVertex> getAllUsers() const;
    void clear();
};

#endif
