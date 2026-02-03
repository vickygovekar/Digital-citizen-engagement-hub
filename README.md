# Digital Citizen Engagement Hub

## Overview
Digital Citizen Engagement Hub is a full-stack web application developed as part of an internship project.  
The goal of the platform is to strengthen communication between citizens and government authorities by providing a digital space where issues can be reported, tracked, and discussed transparently.

The application follows a client–server architecture with a modern frontend and a REST-based backend connected to a database.

---

## Key Features
- Citizen issue reporting with image uploads
- Community feed to view and discuss reported issues
- Issue status tracking
- User authentication and validation
- Admin-ready backend structure for future role-based access
- Clean separation of frontend and backend code

---

## Tech Stack

### Frontend (Client)
- React (Vite)
- HTML5, CSS3
- JavaScript (ES6+)
- Component-based UI architecture

### Backend (Server)
- Node.js
- Express.js
- RESTful APIs
- File upload handling (images)
- SQL-based database integration

### Database
- MySQL
- Structured schema using SQL scripts

---

## Project Structure

Digital citizen engagement hub
│
├── client # Frontend application
│ ├── public
│ ├── src
│ │ ├── App.jsx
│ │ ├── Dashboard.jsx
│ │ ├── CommunityFeed.jsx
│ │ ├── IssueDetailsModal.jsx
│ │ └── Stylesheets
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
├── server # Backend application
│ ├── server.js
│ ├── check_users.js
│ ├── database_setup.sql
│ ├── uploads
│ ├── package.json
│ └── package-lock.json
│
└── README.md


---

## Application Flow
1. Users interact with the frontend built using React.
2. Requests are sent to the backend via REST APIs.
3. The backend processes requests, stores data in the database, and manages file uploads.
4. The frontend dynamically updates the UI based on server responses.

---

## Database Design
The database is initialized using the `civic_hub.sql` file and contains structured tables to store:
- User information
- Issue details
- Uploaded media references
- Status tracking data

---

## How to Run the Project

### Prerequisites
- Node.js
- MySQL
- npm

### Backend Setup
```bash
cd server
npm install
node server.js
Frontend Setup
cd client
npm install
npm run dev
Internship Context
This project was developed as part of an internship to gain hands-on experience in:

Full-stack web development

Client–server architecture

REST API design

Database integration

Real-world problem solving for civic engagement

Future Enhancements
Role-based access control (Admin / Citizen)

Real-time notifications

Analytics dashboard for authorities

Improved security and validation

Deployment to cloud platforms

Author
Vicky
Computer Engineering Student
Internship Project – Digital Citizen Engagement Hub
