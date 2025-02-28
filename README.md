# Perry - Mental Health Chatbot

Perry is a conversational AI assistant focused on mental health support. It provides a compassionate, understanding space for users to express their feelings and receive supportive responses.

## Features

- **User Authentication**: Secure login and signup with email/password
- **Personalized Experience**: Greets users by name for a more personal touch
- **Multiple Chat Sessions**: Users can maintain multiple conversation threads
- **Chat History**: All conversations are saved and can be accessed anytime
- **Responsive UI**: Clean, intuitive interface that works on any device
- **Privacy Focused**: Row Level Security ensures users only see their own data

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following:

```
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-anon-key
```

### 2. Supabase Database Setup

1. Log in to your Supabase project
2. Navigate to the SQL Editor
3. Run the SQL commands in `setup_database.sql` to create the necessary tables and security policies

### 3. Install Dependencies

```
npm install
```

### 4. Run the Development Server

```
npm run dev
```

## Technologies Used

- React with Vite
- Google Generative AI (Gemini)
- Supabase for authentication and database
- Material-UI for UI components
- date-fns for date formatting

## Database Schema

- **Users** (handled by Supabase Auth)
- **chat_sessions**: Stores chat sessions with title and timestamp
- **chats**: Stores individual messages linked to sessions and users
