# Car Rental 🚗

A full-stack **Car Rental Application** that allows users to browse, book, and manage rental cars. Built with a modern **React (Vite) frontend**, **Node.js/Express backend** deployed on **AWS Elastic Beanstalk**, and **Firebase authentication**.  

This project demonstrates **real-world web app development**, including environment management, cloud deployment, and secure authentication.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
- [Frontend Deployment](#frontend-deployment)  
- [Backend Deployment](#backend-deployment)  
- [Environment Variables](#environment-variables)

---

## Features

- User authentication using **Firebase Auth**  
- Browse available cars with search & filter functionality  
- Book cars and manage bookings  
- Admin/Owner dashboard for managing fleet and reservations  
- Real-time UI updates and responsive design  
- Deployed on **Vercel (frontend)** and **AWS Elastic Beanstalk (backend)**  

---

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS  
- **Backend:** Node.js, Express  
- **Database & Authentication:** Firebase  
- **Deployment:** Frontend → Vercel, Backend → AWS Elastic Beanstalk  
- **Version Control:** Git + GitHub  

---

## Getting Started

### Clone the Repository

Run the following commands:

```bash
git clone https://github.com/saharsh005/Car-Rental.git
cd Car-Rental
```
Install Dependencies
Frontend
```
cd car-rental
npm install
```
Backend
```
cd ../backend
npm install
```
Running Locally

Backend (AWS Elastic Beanstalk Local Run)
```
cd backend
npm run start
```
Make sure to configure .env for database and Firebase credentials if needed.

Frontend
```
cd car-rental
npm run dev
```
The frontend runs on http://localhost:5173 by default.

---
## Frontend Deployment

Connect the car-rental folder to your Vercel account.

Set the following Environment Variables in the Vercel dashboard:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx
VITE_API_URL=https://your-backend-url.com
```
Set Build Command: npm run build

Set Output Directory: dist

---
## Backend Deployment 
Zip the backend folder.

Upload to AWS Elastic Beanstalk (Node.js platform).

Configure environment variables (database URL, Firebase keys if needed).

Launch the environment and note the public URL.

Use this URL as VITE_API_URL in frontend .env or Vercel variables.

---
## Environment Variables
Frontend (.env.local):
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx
VITE_API_URL=https://your-backend-url.com
```
Backend (.env):
```
PORT=8080
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=xxxx
FIREBASE_PRIVATE_KEY=xxxx
```
⚠ Do not commit .env files to GitHub for security reasons.


Created with ❤️ by Saharsh Dudhyal
