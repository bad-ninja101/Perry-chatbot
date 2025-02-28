# Perry Chatbot Database Schema

## Tables

### auth.users (Supabase Auth)
- `id` (UUID, PK): User's unique identifier
- `email` (TEXT): User's email address
- `created_at` (TIMESTAMP): When the user was created
- Additional auth fields managed by Supabase

### chat_sessions
- `id` (UUID, PK): Session unique identifier
- `user_id` (UUID, FK): Reference to auth.users.id
- `title` (TEXT): Title of the chat session
- `created_at` (TIMESTAMP): When the session was created

### chats
- `id` (UUID, PK): Message unique identifier
- `user_id` (UUID, FK): Reference to auth.users.id
- `session_id` (UUID, FK): Reference to chat_sessions.id
- `message` (TEXT): The message content
- `is_bot` (BOOLEAN): Whether the message is from the bot
- `created_at` (TIMESTAMP): When the message was created

## Relationships

```
auth.users 1 --- * chat_sessions
chat_sessions 1 --- * chats
auth.users 1 --- * chats
```

## Row Level Security (RLS) Policies

1. Users can only view and modify their own chat sessions
2. Users can only view and modify their own chat messages

## Indexes

- `idx_chats_session_id`: Index on chats.session_id for faster queries when retrieving messages for a specific session
