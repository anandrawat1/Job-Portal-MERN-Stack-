# 💼 **JobJunction – Advanced Job Portal Platform** 🌐

## 💡 **Description**

**JobJunction** is a powerful **MERN Stack** job portal that bridges the gap between job seekers and employers. 
Designed with a gorgeous, modern UI using **Tailwind CSS**, it goes beyond simple job boards by offering a full-fledged **Applicant Tracking System (ATS)** built right in. 

Candidates can browse jobs, manage their profiles, track their applications in real-time, and save jobs for later. Employers and admins can actively manage the hiring pipeline, view deep analytics, write private notes on candidates, close job listings, and highlight featured jobs.

## 🚀 **Key Features**

### 🧑‍💼 **For Job Seekers**
* **Interactive Job Dashboard:** Track the live status of all your applications with color-coded badges (`Reviewing`, `Shortlisted`, `Hired`, etc.).
* **🔖 Saved Jobs (Wishlist):** Bookmark jobs you are interested in and view them later in your dedicated Saved Jobs tab.
* **⭐ Company Reviews & Ratings:** Leave star ratings and reviews for companies after applying, and view average company ratings on the Companies page.
* **Profile Management:** Build a comprehensive profile including a professional headline, bio, and resume link.
* **Browse Companies:** Explore a dedicated directory of top companies hiring on the platform.
* **Get Noticed Faster:** Submit your resume directly to the Talent Pool without even applying for a specific job.
* **Smart Search & Filters:** Instantly filter jobs by role, location, salary range, and posting date using a responsive mobile-friendly UI.

### 🏢 **For Admins & Employers**
* **🔐 Multi-Admin Support:** Delegate hiring tasks to a team. The super admin can promote any user to an administrator role dynamically via a centralized management dashboard.
* **📊 Analytics Dashboard:** View interactive Recharts-powered graphs showing job posting trends, top hiring locations, and most demanded skills.
* **🏆 Job Badges & Featured Jobs:** Toggle badges like `⭐ Featured`, `⚡ Urgent`, and `✅ Verified` on jobs. Featured jobs are automatically promoted to a carousel on the home page.
* **Applicant Tracking Pipeline:** Move candidates through a seamless hiring pipeline using a built-in status dropdown.
* **Private Notes:** Jot down internal interview feedback and thoughts on candidates that automatically save and remain completely hidden from the applicant.
* **Talent Pool Database:** Access a searchable, centralized pool of all candidates who have submitted their resumes on the platform. 
* **Job Lifecycle Management:** Toggle job postings between `Active` and `Closed`. Closed jobs display a badge and no longer accept new applications.
* **Job Creation:** Post new opportunities with rich details, salary insights, and required skills.

### 🔒 **Core Platform Features**
* **Serverless Deployment:** Optimized for Vercel with serverless MongoDB connections.
* **Secure Authentication:** Passwordless Google Sign-In and secure Email/Password auth powered by Firebase.
* **Responsive Design:** A fully responsive, modern layout that looks stunning on mobile, tablet, and desktop.
* **Pagination:** Lightning-fast navigation through large job datasets.

## ⚙️ **Technologies Used**

**Frontend:**  
* ⚛️ **React.js** (Vite)
* 🎨 **Tailwind CSS** (Modern styling)
* 📊 **Recharts** (Interactive data visualization)
* 🔄 **React Router DOM**
* 🧩 **React Icons** & **SweetAlert2**

**Backend:**  
* 🖥️ **Node.js** & **Express.js** (Serverless architecture on Vercel)
* 🗄️ **MongoDB** (Native Driver / NoSQL, MongoDB Atlas)
* 🌐 **RESTful API Architecture**
* 🛡️ **CORS Dynamic Origins**

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
   - In `job-portal-server`, create a `.env` file with `MONGODB_URI` (must be `mongodb+srv`), `DB_USER`, `DB_PASSWORD`, `ADMIN_EMAIL`, and `CORS_ORIGIN`.
   - In `job-portal-client`, create a `.env.local` file with your Firebase configuration variables and `VITE_API_BASE_URL`.

6. **🚀 Start the application:**  
   - **Backend:** `npm start` (from the `job-portal-server` directory)
   - **Frontend:** `npm run dev` (from the `job-portal-client` directory)

7. **🌐 Open the application:**  
   Open the app in your browser at the localhost URL provided by Vite (usually `http://localhost:5173`).

---

**JobJunction** is built to empower both job seekers and employers to connect seamlessly, offering a state-of-the-art approach to modern hiring! 💼🚀
