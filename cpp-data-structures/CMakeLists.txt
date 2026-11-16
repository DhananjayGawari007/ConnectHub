cmake_minimum_required(VERSION 3.16)
project(ConnectHubDataStructures LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(${CMAKE_SOURCE_DIR}/include)

# Library of all data structures
add_library(datastructures STATIC
    src/NaryTree.cpp
    src/Graph.cpp
    src/MessageQueue.cpp
    src/MaxHeap.cpp
)

# Demo executables
add_executable(NaryTreeDemo demos/NaryTreeDemo.cpp)
target_link_libraries(NaryTreeDemo datastructures)

add_executable(GraphDemo demos/GraphDemo.cpp)
target_link_libraries(GraphDemo datastructures)

add_executable(QueueDemo demos/QueueDemo.cpp)
target_link_libraries(QueueDemo datastructures)

add_executable(PriorityQueueDemo demos/PriorityQueueDemo.cpp)
target_link_libraries(PriorityQueueDemo datastructures)

# Test executable
add_executable(TestAll tests/TestAll.cpp)
target_link_libraries(TestAll datastructures)

# Backend IPC Engine executable
add_executable(ConnectHubEngine src/ConnectHubEngine.cpp)
target_link_libraries(ConnectHubEngine datastructures)
