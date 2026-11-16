// PriorityQueueDemo.cpp - Demonstrates Max Heap data structure
#include <iostream>
#include "MaxHeap.h"

int main() {
    std::cout << "==========================================\n";
    std::cout << " ConnectHub - Max Heap (Priority Queue) Demo\n";
    std::cout << "==========================================\n\n";

    MaxHeap heap;

    // Insert notifications with different priorities
    std::cout << "--- Inserting Notifications ---\n";
    heap.insert(Notification(1, 1, 1, "general", "Server updated", "2024-01-01 10:00:00"));
    std::cout << "Inserted: [P1] general - 'Server updated'\n";
    heap.insert(Notification(2, 1, 3, "friend_request", "Bob sent you a friend request", "2024-01-01 10:01:00"));
    std::cout << "Inserted: [P3] friend_request - 'Bob sent you a friend request'\n";
    heap.insert(Notification(3, 1, 5, "mention", "@Alice you were mentioned in #general", "2024-01-01 10:02:00"));
    std::cout << "Inserted: [P5] mention - '@Alice you were mentioned'\n";
    heap.insert(Notification(4, 1, 4, "dm", "New DM from Charlie", "2024-01-01 10:03:00"));
    std::cout << "Inserted: [P4] dm - 'New DM from Charlie'\n";
    heap.insert(Notification(5, 1, 2, "announcement", "New server rules posted", "2024-01-01 10:04:00"));
    std::cout << "Inserted: [P2] announcement - 'New server rules posted'\n";
    heap.insert(Notification(6, 1, 5, "mention", "@Alice check this out", "2024-01-01 10:05:00"));
    std::cout << "Inserted: [P5] mention - '@Alice check this out'\n";
    heap.insert(Notification(7, 1, 4, "dm", "New DM from Eve", "2024-01-01 10:06:00"));
    std::cout << "Inserted: [P4] dm - 'New DM from Eve'\n";

    std::cout << "\nHeap size: " << heap.size() << "\n";

    // Peek max
    std::cout << "\n--- Peek (Highest Priority) ---\n";
    Notification top = heap.peekMax();
    std::cout << "Highest priority: [P" << top.priority << "] " << top.type << " - " << top.content << "\n";

    // Extract all in priority order
    std::cout << "\n--- Extracting All (Priority Order) ---\n";
    std::cout << "Priority | Type            | Content\n";
    std::cout << "---------|-----------------|----------------------------------\n";
    while (!heap.isEmpty()) {
        Notification n = heap.extractMax();
        std::cout << "   " << n.priority << "     | " << n.type;
        // Pad type
        for (size_t i = n.type.length(); i < 15; ++i) std::cout << " ";
        std::cout << " | " << n.content << "\n";
    }

    std::cout << "\nHeap size after extraction: " << heap.size() << "\n";
    std::cout << "Is empty: " << (heap.isEmpty() ? "Yes" : "No") << "\n";

    // Build heap demo
    std::cout << "\n--- Build Heap from Array ---\n";
    std::vector<Notification> notifs = {
        Notification(10, 1, 2, "announcement", "Maintenance scheduled", "2024-01-01 12:00:00"),
        Notification(11, 1, 5, "mention", "Urgent: @everyone", "2024-01-01 12:01:00"),
        Notification(12, 1, 1, "general", "New emoji added", "2024-01-01 12:02:00"),
        Notification(13, 1, 3, "friend_request", "Diana wants to be friends", "2024-01-01 12:03:00"),
    };
    heap.buildHeap(notifs);
    std::cout << "Built heap with " << heap.size() << " elements\n";
    std::cout << "Top priority: [P" << heap.peekMax().priority << "] " << heap.peekMax().content << "\n";

    std::cout << "\nJSON output:\n" << heap.toJson() << "\n";

    std::cout << "\n========== Demo Complete ==========\n";
    return 0;
}
