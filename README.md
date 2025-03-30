# SKILL-HIVE
Overview

Skill Sharing Platform is a social media-based website where users can share their skills, post content, like, and comment on posts. This platform is built using React.js for the frontend and Spring Boot for the backend.

Features

📝 User Authentication – Sign up, log in, and manage user profiles.

📢 Post Creation – Users can create, edit, and delete posts to share skills.

❤️ Like & Comment – Engage with posts by liking and commenting.

🏷️ Categories & Tags – Organize posts with categories and tags.

🔎 Search & Filter – Easily find content using search and filtering options.

🔔 Notifications – Get notified about likes, comments, and new posts.

📊 Dashboard – Monitor user activity and engagement.

Tech Stack

Frontend:

React.js (TypeScript)

Tailwind CSS (for styling)

Axios (for API requests)

Backend:

Spring Boot (Java)

Spring Security (for authentication & authorization)

MongoDB Atlas (Cloud Database)

Spring Data MongoDB (for database interaction)

Lombok (for reducing boilerplate code)

Installation & Setup

Backend (Spring Boot)

Clone the repository:

git clone https://github.com/yourusername/skill-sharing-platform.git
cd skill-sharing-platform/backend

Configure the database in application.properties:

spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster0.mongodb.net/skillsharing?retryWrites=true&w=majority

Build and run the application:

mvn clean install
mvn spring-boot:run

Frontend (React.js)

Navigate to the frontend directory:

cd ../frontend

Install dependencies:

npm install

Start the development server:

npm run dev

API Endpoints

Authentication

POST /api/auth/register – Register a new user

POST /api/auth/login – Login user and return a JWT

Posts

GET /api/posts – Get all posts

POST /api/posts – Create a new post

PUT /api/posts/{id} – Update a post

DELETE /api/posts/{id} – Delete a post

Likes & Comments

POST /api/posts/{id}/like – Like a post

POST /api/posts/{id}/comment – Add a comment to a post
