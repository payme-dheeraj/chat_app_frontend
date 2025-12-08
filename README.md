# ChatApp - Cross-Platform Chat Application

A full-stack chat application built with React (frontend) and Django (backend).

## Features

- **Anonymous Posting**: Generate random ID and start posting immediately (Feed only)
- **User Authentication**: Login/Signup with username, password, and mobile OTP verification
- **Public Feed**: Post images, polls, and 10-second videos
- **Real-time Chat**: Private messaging with WebSocket support (registered users only)
- **Profile Management**: Edit profile, change password (registered users only)
- **Cross-Platform**: Works on Web, Android, and iOS

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Lucide React for icons
- WebSocket for real-time chat

### Backend
- Django 4.2
- Django REST Framework
- Django Channels (WebSocket)
- SQLite (development) / PostgreSQL (production)
- python-dotenv for environment management

## Project Structure

```
test_chat_web_app/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Screen components
│   │   ├── context/       # Auth context
│   │   └── services/      # API services
│   ├── .env               # Environment variables
│   ├── .env.example       # Example env file
│   └── package.json
├── backend/               # Django application
│   ├── chatapp/           # Main Django project
│   ├── users/             # User authentication app
│   ├── posts/             # Posts/Feed app
│   ├── chat/              # Chat/Messages app
│   ├── .env               # Environment variables
│   ├── .env.example       # Example env file
│   ├── requirements.txt
│   └── README.md          # Backend documentation
└── README.md
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

python manage.py migrate
python manage.py runserver 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

npm run dev
```

### 3. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## User Types

| Feature | Anonymous | Registered |
|---------|-----------|------------|
| View Feed | ✅ | ✅ |
| Create Posts | ✅ | ✅ |
| Like/Comment | ✅ | ✅ |
| Vote on Polls | ✅ | ✅ |
| Chat | ❌ | ✅ |
| Profile | ❌ | ✅ |
| Change Password | ❌ | ✅ |

## API Documentation

See [backend/README.md](./backend/README.md) for detailed API documentation.

### Quick Reference

- `POST /api/users/anonymous/` - Generate anonymous user
- `POST /api/users/login/` - User login
- `POST /api/users/signup/` - User signup (sends OTP)
- `POST /api/users/verify-otp/` - Verify OTP
- `GET /api/posts/` - Get all posts
- `POST /api/posts/create/` - Create new post
- `GET /api/chat/conversations/` - Get user conversations
- `WS /ws/chat/<conversation_id>/` - WebSocket for real-time chat

## License

MIT
