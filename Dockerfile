# ConnectHub Multi-Stage Production Dockerfile
# Integrates: Native C++17 Engine + Node.js Backend + Socket.IO + React Frontend

FROM node:20-bookworm-slim

# Install C++17 build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    cmake \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Copy and compile C++ Data Structures Engine
COPY cpp-data-structures/ ./cpp-data-structures/
RUN mkdir -p cpp-data-structures/build && \
    g++ -std=c++17 -O3 \
    cpp-data-structures/src/NaryTree.cpp \
    cpp-data-structures/src/Graph.cpp \
    cpp-data-structures/src/MessageQueue.cpp \
    cpp-data-structures/src/MaxHeap.cpp \
    cpp-data-structures/src/ConnectHubEngine.cpp \
    -Icpp-data-structures/include \
    -o cpp-data-structures/build/ConnectHubEngine && \
    chmod +x cpp-data-structures/build/ConnectHubEngine

# 2. Build React Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# 3. Setup Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production
COPY backend/ ./backend/

# Copy root scripts and schema
COPY database/ ./database/
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=5000
ENV CPP_ENGINE_PATH=/app/cpp-data-structures/build/ConnectHubEngine

EXPOSE 5000

CMD ["node", "backend/server.js"]
