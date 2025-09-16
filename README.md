# ConfigCraft

A visual network configuration tool that allows users to design network topologies and generate configurations automatically. Built with React Flow for the frontend and FastAPI for the backend.

## Features

- Interactive diagram editor
- Support for Network Elements, Cards and Ports
- Real-time configuration updates
- Bidirectional and unidirectional connection support 
- OSPF, Card, Fiber Connectivity and Data Link configuration generation
- Dark theme UI with smooth animations

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm/yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yagrawal-rbbn/config_tool.git
cd config_tool
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
python -m uvicorn main:app --reload --port 8080
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

1. Drawing Network Elements:
   - Click "Draw Network Element" button
   - Click and drag on canvas to create NE
   - Press ESC to exit drawing mode

2. Adding Components:
   - Cards can only be drawn inside Network Elements
   - Ports can only be drawn inside Cards
   - Click and drag to set component size

3. Configuration:
   - Select any component to edit its properties
   - For Network Elements: Set IP and Role
   - For Cards: Set Name, Slot Number and Service Card flag
   - For Ports: Set Port Number, Type and Interface Index

4. Connections:
   - Connect ports by dragging between port handles
   - Configure connection type (bidirectional/unidirectional)

5. Generate Configuration:
   - Click "Generate Configuration" to create config files
   - Copy generated config using the Copy button
   - Clear diagram using "Clear Diagram" button

