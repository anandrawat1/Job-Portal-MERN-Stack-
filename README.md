# 💼 **JobJunction – Advanced Job Portal Platform** 🌐

## 💡 **Description**

**JobJunction** is a powerful **MERN Stack** job portal that bridges the gap between job seekers and employers. 
Designed with a gorgeous, modern UI using **Tailwind CSS**, it goes beyond simple job boards by offering a full-fledged **Applicant Tracking System (ATS)** built right in. 

Candidates can browse jobs, manage their profiles, and track their applications in real-time. Employers and admins can actively manage the hiring pipeline, write private notes on candidates, close job listings, and headhunt directly from a centralized Talent Pool database.

## 🚀 **Key Features**

### 🧑‍💼 **For Job Seekers**
* **Interactive Job Dashboard:** Track the live status of all your applications with color-coded badges (`Reviewing`, `Shortlisted`, `Hired`, etc.).
* **Profile Management:** Build a comprehensive profile including a professional headline, bio, and resume link.
* **Browse Companies:** Explore a dedicated directory of top companies hiring on the platform.
* **Get Noticed Faster:** Submit your resume directly to the Talent Pool without even applying for a specific job.
* **Smart Search & Filters:** Instantly filter jobs by role, location, salary range, and posting date.

### 🏢 **For Admins & Employers**
* **Applicant Tracking Pipeline:** Move candidates through a seamless hiring pipeline using a built-in status dropdown.
* **Private Notes:** Jot down internal interview feedback and thoughts on candidates that automatically save and remain completely hidden from the applicant.
* **Talent Pool Database:** Access a searchable, centralized pool of all candidates who have submitted their resumes on the platform. 
* **Job Lifecycle Management:** Toggle job postings between `Active` and `Closed`. Closed jobs display a badge and no longer accept new applications.
* **Job Creation:** Post new opportunities with rich details, salary insights, and required skills.

### 🔒 **Core Platform Features**
* **Secure Authentication:** Passwordless Google Sign-In and secure Email/Password auth powered by Firebase.
* **Responsive Design:** A fully responsive, modern layout that looks stunning on mobile, tablet, and desktop.
* **Pagination:** Lightning-fast navigation through large job datasets.

## ⚙️ **Technologies Used**

**Frontend:**  
* ⚛️ **React.js** (Vite)
* 🎨 **Tailwind CSS** (Replaced Bootstrap for modern styling)
* 🔄 **React Router DOM**
* 🧩 **React Icons** & **SweetAlert2**

**Backend:**  
* 🖥️ **Node.js** & **Express.js**
* 🗄️ **MongoDB** (Native Driver / NoSQL)
* 🌐 **RESTful API Architecture**

**Authentication:**  
* 🔐 **Firebase Authentication**

## ⚙️ **How to Run Locally**

1. **📂 Clone the repository:**  
   `git clone <repository_url>`

2. **🖥️ Navigate to the directory:**  
   `cd JobJunction`

3. **🔧 Install backend dependencies:**  
   ```bash
   cd job-portal-server
   npm install
   ```

4. **🔧 Install frontend dependencies:**  
   ```bash
   cd ../job-portal-client
   npm install
   ```

5. **⚙️ Set up environment variables:**  
   - In `job-portal-server`, create a `.env` file with `DB_USER`, `DB_PASSWORD`, and `ADMIN_EMAIL`.
   - In `job-portal-client`, create a `.env` file with your Firebase configuration variables.

6. **🚀 Start the application:**  
   - **Backend:** `npm start` (from the `job-portal-server` directory)
   - **Frontend:** `npm run dev` (from the `job-portal-client` directory)

7. **🌐 Open the application:**  
   Open the app in your browser at the localhost URL provided by Vite (usually `http://localhost:5173`).

---

**JobJunction** is built to empower both job seekers and employers to connect seamlessly, offering a state-of-the-art approach to modern hiring! 💼🚀
