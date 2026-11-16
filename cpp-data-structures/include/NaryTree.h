#ifndef NARYTREE_H
#define NARYTREE_H

#include <string>
#include <vector>
#include <unordered_map>
#include <functional>
#include <sstream>

enum class NodeType {
    SERVER,
    CATEGORY,
    TEXT_CHANNEL,
    VOICE_CHANNEL
};

struct TreeNode {
    int id;
    std::string name;
    NodeType type;
    TreeNode* parent;
    std::vector<TreeNode*> children;

    TreeNode(int id, const std::string& name, NodeType type, TreeNode* parent = nullptr)
        : id(id), name(name), type(type), parent(parent) {}

    ~TreeNode() {
        for (auto* child : children) {
            delete child;
        }
    }

    std::string typeToString() const {
        switch (type) {
            case NodeType::SERVER: return "server";
            case NodeType::CATEGORY: return "category";
            case NodeType::TEXT_CHANNEL: return "text_channel";
            case NodeType::VOICE_CHANNEL: return "voice_channel";
            default: return "unknown";
        }
    }
};

class NaryTree {
private:
    std::unordered_map<int, TreeNode*> nodeMap;
    std::vector<TreeNode*> roots;
    int nextId;

    void collectSubtreeIds(TreeNode* node, std::vector<int>& ids) const;
    void toJsonHelper(TreeNode* node, std::ostringstream& oss) const;

public:
    NaryTree();
    ~NaryTree();

    int addServer(const std::string& name);
    int addCategory(int serverId, const std::string& name);
    int addChannel(int categoryId, const std::string& name, NodeType type);
    bool deleteNode(int nodeId);
    TreeNode* searchById(int nodeId) const;
    TreeNode* searchByName(const std::string& name) const;
    bool moveChannel(int channelId, int newCategoryId);

    std::vector<TreeNode*> getRoots() const { return roots; }
    std::vector<TreeNode*> getChildren(int nodeId) const;
    int getNodeCount() const { return static_cast<int>(nodeMap.size()); }

    std::string toJson() const;
    std::string getHierarchy() const;

    void clear();
    void setNextId(int id) { nextId = id; }
    int addNodeDirect(int id, const std::string& name, NodeType type, int parentId);
};

#endif
