# Video Backend (Local Version)

This version stores uploaded videos **locally** in `/uploads` folder instead of AWS S3.

## Setup

1) Install MongoDB (or use MongoDB Atlas free cluster)
2) Install dependencies:
   ```bash
   npm install
   cp .env.sample .env
   # edit .env with your Mongo URI & JWT secret
   npm run dev
   ```
3) Server runs at `http://localhost:4000`

## API

### Auth
- `POST /api/auth/instructors/signup`
- `POST /api/auth/instructors/login`
- `POST /api/auth/students/signup`
- `POST /api/auth/students/login`

### Videos
- `POST /api/videos` (instructor only, multipart form: `video`, `title`, `description`)
- `GET /api/videos` (list all videos)
- `POST /api/videos/:id/grant` (instructor grants student access)
- `GET /api/videos/:id/stream` (returns local file URL)
