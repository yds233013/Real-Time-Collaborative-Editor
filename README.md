# Real-Time Collaborative Text Editor

A real-time collaborative text editor that allows multiple users to edit documents simultaneously. The application features rich text editing capabilities, user authentication, and real-time collaboration with cursor tracking.

## Features

- Real-time collaborative editing
- Rich text formatting (bold, italic, underline, text color)
- Document version history
- User authentication and authorization
- Document sharing and access control
- Real-time cursor tracking for multiple users
- Document list management
- Responsive Material UI design

## Technologies Used

### Frontend
- React with TypeScript
- Vite for build tooling
- Material UI (MUI) for components and styling
- Slate.js for rich text editing
- Socket.io-client for real-time communication
- React Router for navigation
- Axios for HTTP requests

### Backend
- Node.js with Express
- TypeScript
- MongoDB for database
- Socket.io for WebSocket communication
- JWT for authentication
- Express middleware for request handling
- Mongoose for MongoDB object modeling

### Development Tools
- Git for version control
- npm for package management
- nodemon for development server
- TypeScript compiler
- ESLint for code linting

## 🌟 Key Features

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously
- **Conflict-Free Resolution**: Uses CRDT (Conflict-free Replicated Data Type) for seamless concurrent editing
- **Rich Text Editing**: Full support for formatting, styles, and text decorations
- **User Authentication**: Secure access with JWT and OAuth (Google/GitHub) integration
- **Automatic Saving**: Never lose your work with automatic document persistence
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript for robust UI development
- **Slate.js** for rich text editing capabilities
- **Socket.IO** client for real-time communication
- **TailwindCSS** for modern, responsive styling
- **Zustand** for efficient state management

### Backend
- **Node.js** & Express for API server
- **Socket.IO** for WebSocket connections
- **MongoDB** for document storage
- **Redis** for session management and caching
- **JWT** for secure authentication

### DevOps
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **AWS/Heroku** for deployment

## 🏗️ System Architecture

The system is built on a modern stack with emphasis on:
- Real-time data synchronization using WebSockets
- CRDT implementation for conflict resolution
- Microservices architecture for scalability
- Caching layer for performance optimization
- Secure user authentication and authorization




