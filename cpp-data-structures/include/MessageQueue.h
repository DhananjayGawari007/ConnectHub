#ifndef MESSAGEQUEUE_H
#define MESSAGEQUEUE_H

#include <string>
#include <vector>
#include <sstream>

struct Message {
    int messageId;
    int senderId;
    int receiverId;
    std::string content;
    std::string timestamp;
    std::string senderName;

    Message() : messageId(0), senderId(0), receiverId(0) {}
    Message(int msgId, int sndId, int rcvId, const std::string& content,
            const std::string& timestamp, const std::string& senderName = "")
        : messageId(msgId), senderId(sndId), receiverId(rcvId),
          content(content), timestamp(timestamp), senderName(senderName) {}
};

class MessageQueue {
private:
    struct Node {
        Message data;
        Node* next;
        Node(const Message& msg) : data(msg), next(nullptr) {}
    };

    Node* front;
    Node* rear;
    int count;

public:
    MessageQueue();
    ~MessageQueue();

    void enqueue(const Message& msg);
    Message dequeue();
    Message peek() const;

    bool isEmpty() const;
    int size() const;

    std::vector<Message> getAllMessages() const;
    void clear();
    std::string toJson() const;
};

#endif
