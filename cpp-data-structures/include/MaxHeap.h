#ifndef MAXHEAP_H
#define MAXHEAP_H

#include <string>
#include <vector>
#include <sstream>

struct Notification {
    int id;
    int userId;
    int priority;
    std::string type;
    std::string content;
    std::string timestamp;
    bool isRead;

    Notification() : id(0), userId(0), priority(0), isRead(false) {}
    Notification(int id, int userId, int priority, const std::string& type,
                 const std::string& content, const std::string& timestamp)
        : id(id), userId(userId), priority(priority), type(type),
          content(content), timestamp(timestamp), isRead(false) {}
};

class MaxHeap {
private:
    std::vector<Notification> heap;

    int parent(int i) const { return (i - 1) / 2; }
    int leftChild(int i) const { return 2 * i + 1; }
    int rightChild(int i) const { return 2 * i + 2; }

    void heapifyUp(int index);
    void heapifyDown(int index);
    void swap(int i, int j);

public:
    MaxHeap();
    ~MaxHeap();

    void insert(const Notification& notification);
    Notification extractMax();
    Notification peekMax() const;

    bool isEmpty() const;
    int size() const;

    std::vector<Notification> getAllNotifications() const;
    void clear();
    void buildHeap(const std::vector<Notification>& notifications);
    std::string toJson() const;
};

#endif
