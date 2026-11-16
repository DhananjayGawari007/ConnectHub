#include "NaryTree.h"
#include <queue>
#include <algorithm>
#include <iostream>

NaryTree::NaryTree() : nextId(1) {}

NaryTree::~NaryTree() {
    for (auto* root : roots) {
        delete root;
    }
}

int NaryTree::addServer(const std::string& name) {
    int id = nextId++;
    TreeNode* node = new TreeNode(id, name, NodeType::SERVER);
    roots.push_back(node);
    nodeMap[id] = node;
    return id;
}

int NaryTree::addCategory(int serverId, const std::string& name) {
    auto it = nodeMap.find(serverId);
    if (it == nodeMap.end() || it->second->type != NodeType::SERVER) return -1;
    int id = nextId++;
    TreeNode* node = new TreeNode(id, name, NodeType::CATEGORY, it->second);
    it->second->children.push_back(node);
    nodeMap[id] = node;
    return id;
}

int NaryTree::addChannel(int categoryId, const std::string& name, NodeType type) {
    if (type != NodeType::TEXT_CHANNEL && type != NodeType::VOICE_CHANNEL) return -1;
    auto it = nodeMap.find(categoryId);
    if (it == nodeMap.end() || it->second->type != NodeType::CATEGORY) return -1;
    int id = nextId++;
    TreeNode* node = new TreeNode(id, name, type, it->second);
    it->second->children.push_back(node);
    nodeMap[id] = node;
    return id;
}

void NaryTree::collectSubtreeIds(TreeNode* node, std::vector<int>& ids) const {
    ids.push_back(node->id);
    for (auto* child : node->children) {
        collectSubtreeIds(child, ids);
    }
}

bool NaryTree::deleteNode(int nodeId) {
    auto it = nodeMap.find(nodeId);
    if (it == nodeMap.end()) return false;
    TreeNode* node = it->second;

    std::vector<int> subtreeIds;
    collectSubtreeIds(node, subtreeIds);

    if (node->parent) {
        auto& siblings = node->parent->children;
        siblings.erase(std::remove(siblings.begin(), siblings.end(), node), siblings.end());
    } else {
        roots.erase(std::remove(roots.begin(), roots.end(), node), roots.end());
    }

    for (int id : subtreeIds) {
        nodeMap.erase(id);
    }
    delete node;
    return true;
}

TreeNode* NaryTree::searchById(int nodeId) const {
    auto it = nodeMap.find(nodeId);
    return it != nodeMap.end() ? it->second : nullptr;
}

TreeNode* NaryTree::searchByName(const std::string& name) const {
    for (auto& [id, node] : nodeMap) {
        if (node->name == name) return node;
    }
    return nullptr;
}

bool NaryTree::moveChannel(int channelId, int newCategoryId) {
    auto chIt = nodeMap.find(channelId);
    auto catIt = nodeMap.find(newCategoryId);
    if (chIt == nodeMap.end() || catIt == nodeMap.end()) return false;

    TreeNode* channel = chIt->second;
    TreeNode* newCategory = catIt->second;

    if (channel->type != NodeType::TEXT_CHANNEL && channel->type != NodeType::VOICE_CHANNEL) return false;
    if (newCategory->type != NodeType::CATEGORY) return false;

    if (channel->parent) {
        auto& siblings = channel->parent->children;
        siblings.erase(std::remove(siblings.begin(), siblings.end(), channel), siblings.end());
    }

    channel->parent = newCategory;
    newCategory->children.push_back(channel);
    return true;
}

std::vector<TreeNode*> NaryTree::getChildren(int nodeId) const {
    auto it = nodeMap.find(nodeId);
    if (it != nodeMap.end()) return it->second->children;
    return {};
}

void NaryTree::toJsonHelper(TreeNode* node, std::ostringstream& oss) const {
    oss << "{\"id\":" << node->id
        << ",\"name\":\"" << node->name << "\""
        << ",\"type\":\"" << node->typeToString() << "\""
        << ",\"parentId\":" << (node->parent ? std::to_string(node->parent->id) : "null")
        << ",\"children\":[";
    for (size_t i = 0; i < node->children.size(); ++i) {
        if (i > 0) oss << ",";
        toJsonHelper(node->children[i], oss);
    }
    oss << "]}";
}

std::string NaryTree::toJson() const {
    std::ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < roots.size(); ++i) {
        if (i > 0) oss << ",";
        toJsonHelper(roots[i], oss);
    }
    oss << "]";
    return oss.str();
}

std::string NaryTree::getHierarchy() const {
    std::ostringstream oss;
    std::function<void(TreeNode*, int)> printNode = [&](TreeNode* node, int depth) {
        for (int i = 0; i < depth; ++i) oss << "  ";
        oss << "|-- [" << node->typeToString() << "] " << node->name << " (id:" << node->id << ")\n";
        for (auto* child : node->children) {
            printNode(child, depth + 1);
        }
    };
    for (auto* root : roots) {
        printNode(root, 0);
    }
    return oss.str();
}

void NaryTree::clear() {
    for (auto* root : roots) {
        delete root;
    }
    roots.clear();
    nodeMap.clear();
    nextId = 1;
}

int NaryTree::addNodeDirect(int id, const std::string& name, NodeType type, int parentId) {
    TreeNode* parent = nullptr;
    if (parentId > 0) {
        auto it = nodeMap.find(parentId);
        if (it == nodeMap.end()) return -1;
        parent = it->second;
    }
    TreeNode* node = new TreeNode(id, name, type, parent);
    if (parent) {
        parent->children.push_back(node);
    } else {
        roots.push_back(node);
    }
    nodeMap[id] = node;
    if (id >= nextId) nextId = id + 1;
    return id;
}
