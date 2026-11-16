// NaryTreeDemo.cpp - Demonstrates N-ary Tree data structure
#include <iostream>
#include "NaryTree.h"

int main() {
    std::cout << "========================================\n";
    std::cout << " ConnectHub - N-ary Tree Demo\n";
    std::cout << "========================================\n\n";

    NaryTree tree;

    // Create servers
    std::cout << "--- Creating Servers ---\n";
    int server1 = tree.addServer("ConnectHub Official");
    int server2 = tree.addServer("Gaming Hub");
    std::cout << "Created server 'ConnectHub Official' (id:" << server1 << ")\n";
    std::cout << "Created server 'Gaming Hub' (id:" << server2 << ")\n\n";

    // Add categories
    std::cout << "--- Adding Categories ---\n";
    int cat1 = tree.addCategory(server1, "General");
    int cat2 = tree.addCategory(server1, "Development");
    int cat3 = tree.addCategory(server2, "Games");
    std::cout << "Added category 'General' (id:" << cat1 << ") to server1\n";
    std::cout << "Added category 'Development' (id:" << cat2 << ") to server1\n";
    std::cout << "Added category 'Games' (id:" << cat3 << ") to server2\n\n";

    // Add channels
    std::cout << "--- Adding Channels ---\n";
    int ch1 = tree.addChannel(cat1, "welcome", NodeType::TEXT_CHANNEL);
    int ch2 = tree.addChannel(cat1, "announcements", NodeType::TEXT_CHANNEL);
    int ch3 = tree.addChannel(cat1, "voice-chat", NodeType::VOICE_CHANNEL);
    int ch4 = tree.addChannel(cat2, "cpp-help", NodeType::TEXT_CHANNEL);
    int ch5 = tree.addChannel(cat2, "code-review", NodeType::TEXT_CHANNEL);
    int ch6 = tree.addChannel(cat3, "minecraft", NodeType::TEXT_CHANNEL);
    int ch7 = tree.addChannel(cat3, "gaming-voice", NodeType::VOICE_CHANNEL);
    std::cout << "Added channels with ids: " << ch1 << ", " << ch2 << ", " << ch3 << ", "
              << ch4 << ", " << ch5 << ", " << ch6 << ", " << ch7 << "\n\n";

    // Display hierarchy
    std::cout << "--- Complete Hierarchy ---\n";
    std::cout << tree.getHierarchy() << "\n";

    // Search
    std::cout << "--- Search Operations ---\n";
    TreeNode* found = tree.searchByName("cpp-help");
    if (found) {
        std::cout << "Found 'cpp-help': id=" <<found->id << ", type=" << found->typeToString() << "\n";
    }

    // Move channel
    std::cout << "\n--- Moving 'cpp-help' from Development to General ---\n";
    tree.moveChannel(ch4, cat1);
    std::cout << tree.getHierarchy() << "\n";

    // Delete
    std::cout << "--- Deleting 'Development' category ---\n";
    tree.deleteNode(cat2);
    std::cout << tree.getHierarchy() << "\n";

    std::cout << "Node count: " << tree.getNodeCount() << "\n";
    std::cout << "\nJSON output:\n" << tree.toJson() << "\n";

    std::cout << "\n========== Demo Complete ==========\n";
    return 0;
}
