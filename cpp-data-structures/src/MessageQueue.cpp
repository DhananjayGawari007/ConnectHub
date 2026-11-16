#include "MessageQueue.h"
#include <stdexcept>

MessageQueue::MessageQueue() : front(nullptr), rear(nullptr), count(0) {}

MessageQueue::~MessageQueue() {
    clear();
}

void MessageQueue::enqueue(const Message& msg) {
    Node* newNode = new Node(msg);
    if (rear) {
        rear->next = newNode;
    } else {
        front = newNode;
    }
    rear = newNode;
    count++;
}

Message MessageQueue::dequeue() {
    if (isEmpty()) {
        throw std::runtime_error("Queue is empty");
    }
    Node* temp = front;
    Message msg = temp->data;
    front = front->next;
    if (!front) {
        rear = nullptr;
    }
    delete temp;
    count--;
    return msg;
}

Message MessageQueue::peek() const {
    if (isEmpty()) {
        throw std::runtime_error("Queue is empty");
    }
    return front->data;
}

bool MessageQueue::isEmpty() const {
    return front == nullptr;
}

int MessageQueue::size() const {
    return count;
}

std::vector<Message> MessageQueue::getAllMessages() const {
    std::vector<Message> messages;
    Node* current = front;
    while (current) {
        messages.push_back(current->data);
        current = current->next;
    }
    return messages;
}

void MessageQueue::clear() {
    while (front) {
        Node* temp = front;
        front = front->next;
        delete temp;
    }
    rear = nullptr;
    count = 0;
}

static std::string escapeJson(const std::string& s) {
    std::string out;
    out.reserve(s.size() + 10);
    for (char c : s) {
        switch (c) {
            case '\"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default: out += c;
        }
    }
    return out;
}

std::string MessageQueue::toJson() const {
    std::ostringstream oss;
    oss << "{\"size\":" << count
        << ",\"isEmpty\":" << (isEmpty() ? "true" : "false")
        << ",\"messages\":[";
    Node* current = front;
    bool first = true;
    while (current) {
        if (!first) oss << ",";
        first = false;
        oss << "{\"messageId\":" << current->data.messageId
            << ",\"senderId\":" << current->data.senderId
            << ",\"receiverId\":" << current->data.receiverId
            << ",\"content\":\"" << escapeJson(current->data.content) << "\""
            << ",\"timestamp\":\"" << current->data.timestamp << "\""
            << ",\"senderName\":\"" << escapeJson(current->data.senderName) << "\""
            << "}";
        current = current->next;
    }
    oss << "]}";
    return oss.str();
}
