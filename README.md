![](https://img.shields.io/static/v1?label=CommunityConnect+BY&message=Francis,+Jiril,+Jaykumar&color=blue)

# CommunityConnect

> A comprehensive community engagement platform built with the MERN stack that facilitates seamless interaction, event management, and resource sharing among community members.

---

## 🏗️ Built With

### Core Technologies
- **MongoDB** - NoSQL database for flexible data management
- **Express.js** - Backend web application framework
- **React** - Frontend library for building user interfaces
- **Node.js** - JavaScript runtime environment
- **Docker** - Containerization platform

### Frontend Technologies
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI** - React component library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **Chart.js** - Data visualization
- **Stripe** - Payment processing

### Backend Technologies
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image and file storage
- **Nodemailer** - Email service integration
- **Joi** - Data validation
- **Helmet** - Security middleware
- **Winston** - Logging library

---

## 🚀 Overview

**CommunityConnect** is a scalable full-stack web application designed to strengthen community bonds through digital interaction. The platform offers real-time messaging, event coordination, payment integration, and administrative tools to manage community activities efficiently.

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js (>= 18.x)](https://nodejs.org/)
- [npm (>= 9.x)](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/) (optional for containerized setup)
- [Git](https://git-scm.com/)

You should also be familiar with:
- JavaScript (ES6+)
- Understanding of MERN stack development
- Familiarity with REST APIs and real-time web sockets
- Redux Toolkit
- RESTful API concepts
- Environment variables configuration
- Basic knowledge of Docker and containerization



---

## ⚙️ Environment Variables

### **Server `.env`**

```bash
NODE_ENV=development
MONGO_URI_DEV=
MONGO_URI_TEST=
JWT_SECRET=
PORT=
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
```

### **Frontend `.env`**

```bash
VITE_API_URL=
VITE_API_URL_TEST=
```

> 🧠 **Tips:**  
> Generate a secure JWT secret using:
> ```bash
> node server/src/utils/generateSecret.js
> ```

> Create the initial admin user using:
> ```bash
> node server/src/utils/seedAdmin.js
> ```

---

## 💻 Running the Project Locally (Without Docker)

### 1. Clone the repository

```bash
git clone https://github.com/Gambit142/Community_Connect.git
cd Community_Connect
```

### 2. Install dependencies

#### Backend:
```bash
cd server
npm install
```

#### Frontend:
```bash
cd ../frontend
npm install
```

### 3. Configure environment variables
Create `.env` files in both `server/` and `frontend/` directories as shown above.

### 4. Start MongoDB
If running locally:
```bash
mongod
```

### 5. Start the development servers

#### Backend:
```bash
npm run dev
```

#### Frontend:
```bash
npm run dev
```

### 6. Access the app
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🐳 Running the Project With Docker

### 1. Build and start containers

For **development**:
```bash
docker-compose up --build
```

For **production**:
```bash
docker-compose -f docker-compose-prod.yaml up --build
```

### 2. Environment setup
Ensure both `.env` files exist before building. Docker Compose will automatically load environment variables and link containers.

### 3. Access the application
Once containers are running:
```
http://localhost:5173
```

To stop all containers:
```bash
docker-compose down
```

---

## 🧪 Running Tests

To run backend tests:
```bash
cd server
npm test
```

---

## 🧠 Technologies & Tools

| Category | Technologies |
|-----------|---------------|
| **Frontend** | React, Vite, Tailwind CSS, Redux Toolkit, Chart.js |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB |
| **Containerization** | Docker, Docker Compose |
| **Authentication** | JWT |
| **Media Storage** | Cloudinary |
| **Payments** | Stripe |
| **Email Service** | Nodemailer |
| **Real-time Events** | Socket.io |
| **Testing** | Jest, Supertest |
| **Utilities** | Winston Logger, Joi Validation |

---

## 🧩 Features

- Secure Authentication (JWT-based)
- Admin Dashboard
- Community Management (posts, events, users)
- Real-time Messaging
- Media Upload via Cloudinary
- Payment Integration (Stripe)
- Email Notifications
- In-App Notifications
- Fully Responsive UI (Tailwind CSS)
- Dockerized for portability

---

## 🌱 Future Enhancements

- **Progressive Web App (PWA)** support for offline access.  
- **Multi-language support** for broader accessibility.    
- **Event calendar synchronization** with Google Calendar and Outlook.  
- **AI-based community recommendations** for personalized experiences.  

---

## 👨‍💻 Authors

👤 **Francis Ugorji**  
- GitHub: [@Gambit142](https://github.com/Gambit142)  
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/francis-ugorji/)

👤 **Jiril Zala**  
- GitHub: [@JirilZala](https://github.com/MrAlexanderSupertramp)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/jiril-zala/)

👤 **Jaykumar Trivedi**  
- GitHub: [@JaykumarTrivedi](https://github.com/Jaykumar11)
- LinkedIn: [LinkedIn](https://www.linkedin.com/in/jaykumar-trivedi/)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to open a pull request or check the [issues page](../../issues/).

---

## 🌟 Show your support

Give a ⭐️ if you like this project and found it helpful!

---


## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.


---

## 🙏 Acknowledgments

Special thanks to:
- The open-source community for the tools and frameworks used.
- All contributors for their collaboration and valuable insights.
- Event and Post Pictures from pexels
- Vot's Design Template themewagon for admin dashboard
- Calendar Design template by Alex Oliver
---
