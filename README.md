# Gen-Notes

Gen-Notes is a modern, secure, and lightning-fast note-taking web application built with a React frontend and a Node.js/Express/MongoDB backend.

[![Watch Demo](https://img.youtube.com/vi/fh83O6oRxoA/maxresdefault.jpg)](https://youtu.be/fh83O6oRxoA?si=rPfVUEL4utsB9B7P)

## Features

- User authentication (sign up, log in, log out)
- Create, read, update, and delete notes
- Notes are private to each user
- Rate limiting for security
- Responsive UI with Tailwind CSS and DaisyUI
- RESTful API

## Project Structure

```
Backend/
  app.js
  startServer.js
  config/
  controllers/
  database/
  middlewares/
  models/
  routes/
Frontend/
  index.html
  src/
    components/
    context/
    lib/
    pages/
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB

### Backend Setup

1. Install dependencies:
   ```sh
   cd Backend
   npm install
   ```
2. Create environment files:
   - `.env.development.local`
   - `.env.production.local`
   - Add your MongoDB URI, JWT secret, and other config variables.

3. Start the backend server:
   ```sh
   npm run dev
   ```
   The backend will run on `http://localhost:3000`.

### Frontend Setup

1. Install dependencies:
   ```sh
   cd Frontend
   npm install
   ```
2. Start the frontend dev server:
   ```sh
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## API Endpoints

- `POST /api/v1/auth/sign-up` - Register a new user
- `POST /api/v1/auth/sign-in` - Log in
- `POST /api/v1/auth/sign-out` - Log out
- `GET /api/v1/notes` - Get all notes (authenticated)
- `POST /api/v1/notes` - Create a note (authenticated)
- `GET /api/v1/notes/:id` - Get a note by ID (authenticated)
- `PUT /api/v1/notes/:id` - Update a note (authenticated)
- `DELETE /api/v1/notes/:id` - Delete a note (authenticated)



Made with ❤️ for learning 
