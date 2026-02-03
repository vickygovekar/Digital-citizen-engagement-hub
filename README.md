# Digital Citizen Engagement Hub

## Project Description
Digital Citizen Engagement Hub is a full-stack web application developed as part of an internship project. The platform aims to improve communication between citizens and local authorities by providing a centralized digital space where citizens can report issues, track their status, and engage with community discussions.

The project follows a client–server architecture with a modern frontend and a RESTful backend connected to a relational database.

---

## Overview
Traditional grievance redressal systems are often slow and lack transparency. This project addresses that gap by offering a digital solution where citizens can actively participate in civic engagement and authorities can manage reported issues more efficiently.

The system is designed to be scalable, modular, and easy to extend with additional administrative and analytical features.

---

## Key Features
- Citizen issue reporting with image uploads
- Community feed to view reported civic issues
- Issue status tracking
- Structured backend APIs
- File upload handling for reported issues
- Clean separation of frontend and backend
- Database-driven data management

---

## Tech Stack

### Frontend (Client)
- React (Vite)
- HTML5
- CSS3
- JavaScript (ES6+)

### Backend (Server)
- Node.js
- Express.js
- RESTful API architecture

### Database
- MySQL
- SQL schema defined in `civic_hub.sql`

---

## Application Flow
1. Users interact with the frontend built using React.
2. The frontend sends HTTP requests to the backend APIs.
3. The backend processes requests, handles file uploads, and communicates with the database.
4. Data is stored and retrieved from MySQL using structured SQL queries.
5. The frontend updates dynamically based on server responses.

---

## Database Design
The database schema is defined in the `civic_hub.sql` file. It includes tables for:
- User details
- Civic issues reported by citizens
- Issue status and updates
- Image/file references for uploaded media

The schema ensures structured storage and easy retrieval of civic engagement data.

---

## How to Run the Project

### Prerequisites
- Node.js
- npm
- MySQL

---

### Backend Setup
1. Navigate to the server directory:
cd server

2. Install dependencies:
npm install

3. Import the database:
- Open MySQL
- Run the `civic_hub.sql` file to create the database and tables

4. Start the server:
node server.js


---

### Frontend Setup
1. Navigate to the client directory:
cd client

2. Install dependencies:
npm install

3. Start the development server:
npm run dev


---

## Internship Context
This project was developed as part of an internship to gain hands-on experience in:
- Full-stack web development
- Client–server architecture
- REST API development
- Database integration
- Real-world civic problem solving

---

## Future Enhancements
- Role-based access control (Admin and Citizen)
- Real-time issue status notifications
- Advanced admin dashboard
- Data analytics and reporting
- Cloud deployment

---

## Author
**Vicky**  
Computer Engineering Student  
Internship Project – Digital Citizen Engagement Hub
