// QueueDemo.cpp - Demonstrates FIFO Message Queue data structure
#include <iostream>
#include "MessageQueue.h"

int main() {
    std::cout << "========================================\n";
    std::cout << " ConnectHub - Message Queue (FIFO) Demo\n";
    std::cout << "========================================\n\n";

    MessageQueue queue;

    // Enqueue messages
    std::cout << "--- Enqueuing Messages ---\n";
    queue.enqueue(Message(1, 1, 100, "Hello everyone!", "2024-01-01 10:00:00", "Alice"));
    std::cout << "Enqueued: 'Hello everyone!' from Alice\n";
    queue.enqueue(Message(2, 2, 100, "Hey Alice!", "2024-01-01 10:01:00", "Bob"));
    std::cout << "Enqueued: 'Hey Alice!' from Bob\n";
    queue.enqueue(Message(3, 3, 100, "Good morning!", "2024-01-01 10:02:00", "Charlie"));
    std::cout << "Enqueued: 'Good morning!' from Charlie\n";
    queue.enqueue(Message(4, 1, 100, "How is everyone?", "2024-01-01 10:03:00", "Alice"));
    std::cout << "Enqueued: 'How is everyone?' from Alice\n";
    queue.enqueue(Message(5, 4, 100, "Doing great!", "2024-01-01 10:04:00", "Diana"));
    std::cout << "Enqueued: 'Doing great!' from Diana\n";

    std::cout << "\nQueue size: " << queue.size() << "\n";
    std::cout << "Is empty: " << (queue.isEmpty() ? "Yes" : "No") << "\n";

    // Peek
    std::cout << "\n--- Peek (Front of Queue) ---\n";
    Message front = queue.peek();
    std::cout << "Front: [" << front.senderName << "] " << front.content << " at " << front.timestamp << "\n";

    // Dequeue messages (FIFO order)
    std::cout << "\n--- Dequeuing Messages (FIFO Order) ---\n";
    while (!queue.isEmpty()) {
        Message msg = queue.dequeue();
        std::cout << "Dequeued: [" << msg.senderName << "] " << msg.content << " (id:" << msg.messageId << ")\n";
    }

    std::cout << "\nQueue size after dequeue all: " << queue.size() << "\n";
    std::cout << "Is empty: " << (queue.isEmpty() ? "Yes" : "No") << "\n";

    // Re-enqueue for JSON demo
    std::cout << "\n--- JSON Serialization Demo ---\n";
    queue.enqueue(Message(6, 1, 200, "DM: Hi Bob", "2024-01-01 11:00:00", "Alice"));
    queue.enqueue(Message(7, 2, 200, "DM: Hi Alice", "2024-01-01 11:01:00", "Bob"));
    std::cout << queue.toJson() << "\n";

    std::cout << "\n========== Demo Complete ==========\n";
    return 0;
}
