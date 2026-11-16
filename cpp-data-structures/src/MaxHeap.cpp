#include "MaxHeap.h"
#include <stdexcept>
#include <algorithm>

MaxHeap::MaxHeap() {}
MaxHeap::~MaxHeap() {}

void MaxHeap::swap(int i, int j) {
    std::swap(heap[i], heap[j]);
}

void MaxHeap::heapifyUp(int index) {
    while (index > 0 && heap[parent(index)].priority < heap[index].priority) {
        swap(index, parent(index));
        index = parent(index);
    }
}

void MaxHeap::heapifyDown(int index) {
    int maxIndex = index;
    int n = static_cast<int>(heap.size());

    int left = leftChild(index);
    if (left < n && heap[left].priority > heap[maxIndex].priority) {
        maxIndex = left;
    }

    int right = rightChild(index);
    if (right < n && heap[right].priority > heap[maxIndex].priority) {
        maxIndex = right;
    }

    if (maxIndex != index) {
        swap(index, maxIndex);
        heapifyDown(maxIndex);
    }
}

void MaxHeap::insert(const Notification& notification) {
    heap.push_back(notification);
    heapifyUp(static_cast<int>(heap.size()) - 1);
}

Notification MaxHeap::extractMax() {
    if (isEmpty()) {
        throw std::runtime_error("Heap is empty");
    }
    Notification max = heap[0];
    heap[0] = heap.back();
    heap.pop_back();
    if (!isEmpty()) {
        heapifyDown(0);
    }
    return max;
}

Notification MaxHeap::peekMax() const {
    if (isEmpty()) {
        throw std::runtime_error("Heap is empty");
    }
    return heap[0];
}

bool MaxHeap::isEmpty() const {
    return heap.empty();
}

int MaxHeap::size() const {
    return static_cast<int>(heap.size());
}

std::vector<Notification> MaxHeap::getAllNotifications() const {
    return heap;
}

void MaxHeap::clear() {
    heap.clear();
}

void MaxHeap::buildHeap(const std::vector<Notification>& notifications) {
    heap = notifications;
    for (int i = static_cast<int>(heap.size()) / 2 - 1; i >= 0; --i) {
        heapifyDown(i);
    }
}

static std::string escapeJsonStr(const std::string& s) {
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

std::string MaxHeap::toJson() const {
    std::ostringstream oss;
    oss << "{\"size\":" << size()
        << ",\"isEmpty\":" << (isEmpty() ? "true" : "false")
        << ",\"heap\":[";
    for (size_t i = 0; i < heap.size(); ++i) {
        if (i > 0) oss << ",";
        oss << "{\"id\":" << heap[i].id
            << ",\"userId\":" << heap[i].userId
            << ",\"priority\":" << heap[i].priority
            << ",\"type\":\"" << heap[i].type << "\""
            << ",\"content\":\"" << escapeJsonStr(heap[i].content) << "\""
            << ",\"timestamp\":\"" << heap[i].timestamp << "\""
            << ",\"isRead\":" << (heap[i].isRead ? "true" : "false")
            << ",\"index\":" << i
            << ",\"parentIndex\":" << (i > 0 ? std::to_string((i-1)/2) : "null")
            << ",\"leftChildIndex\":" << (2*i+1 < heap.size() ? std::to_string(2*i+1) : "null")
            << ",\"rightChildIndex\":" << (2*i+2 < heap.size() ? std::to_string(2*i+2) : "null")
            << "}";
    }
    oss << "]}";
    return oss.str();
}
