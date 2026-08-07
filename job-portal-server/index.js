const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000;
require('dotenv').config()

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173").split(',').map(origin => origin.trim()).filter(Boolean);

// Middleware
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain in production + explicit allowlist
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Hello Developer')
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@job-portal.7ieojkl.mongodb.net/?retryWrites=true&w=majority&appName=job-portal`;

const fallbackJobs = [
  {
    _id: 'fallback-1',
    jobTitle: 'Frontend Developer',
    companyName: 'JobJunction Labs',
    minPrice: '40',
    maxPrice: '70',
    salaryType: 'Yearly',
    jobLocation: 'Remote',
    postingDate: '2026-08-01',
    experienceLevel: 'Intermediate',
    employmentType: 'Full-Time',
    description: 'Build modern React interfaces for a fast-growing SaaS team.',
    postedBy: 'demo@example.com'
  },
  {
    _id: 'fallback-2',
    jobTitle: 'Backend Engineer',
    companyName: 'DataForge',
    minPrice: '60',
    maxPrice: '90',
    salaryType: 'Yearly',
    jobLocation: 'London',
    postingDate: '2026-08-02',
    experienceLevel: 'Senior',
    employmentType: 'Full-Time',
    description: 'Design and maintain scalable APIs and data pipelines.',
    postedBy: 'demo@example.com'
  }
];
let inMemoryJobs = [];

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let jobsCollections = null;
let applicationsCollection = null;
let usersCollection = null;
let inMemoryApplications = [];
let inMemoryUsers = [];
let dbReady = false;
let dbError = null;

const getCombinedJobs = () => [...fallbackJobs, ...inMemoryJobs];

async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db("mernJobPortal");
    jobsCollections = db.collection("demoJobs");
    applicationsCollection = db.collection("applications");
    usersCollection = db.collection("users");
    dbReady = true;
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    dbError = error;
    console.error("MongoDB connection failed:", error.message);
  }
}

async function run() {
  try {
    await connectToDatabase();

    // Posting a Job

    app.post("/post-job", async(req, res) => {
      const body = req.body;
      body.createAt = new Date();

      if (!dbReady || !jobsCollections) {
        const newJob = { ...body, _id: `memory-${Date.now()}` };
        inMemoryJobs.unshift(newJob);
        return res.status(200).json({ acknowledged: true, insertedId: newJob._id, message: "Saved locally while MongoDB is unavailable" });
      }

      // console.log(body)
      const result = await jobsCollections.insertOne(body);
      if(result.insertedId){
        return res.status(200).send(result);
        }else{
          return res.status(404).send({
            message: "Failed to post job! Try again later",
            status: false
          })
      }
    })

    // Get all jobs
    app.get("/all-jobs", async(req, res) => {
      if (!dbReady || !jobsCollections) {
        return res.status(200).json(getCombinedJobs());
      }

      const jobs = await jobsCollections.find({}).toArray()
      res.send(jobs);
    })

    // Get Single job using ID
    app.get("/all-jobs/:id", async(req, res) => {
      if (!dbReady || !jobsCollections) {
        const id = req.params.id;
        const job = getCombinedJobs().find((item) => String(item._id) === String(id));
        return res.status(job ? 200 : 404).json(job || null);
      }

      const id = req.params.id;
      const job = await jobsCollections.findOne({
        _id: new ObjectId(id)
      })
      res.send(job)
    })

    // Get Jobs by email

    app.get ("/myJobs/:email", async(req, res) => {
      if (!dbReady || !jobsCollections) {
        const jobs = getCombinedJobs().filter((job) => job.postedBy === req.params.email);
        return res.status(200).json(jobs);
      }

      // console.log(req.params.email)
      const jobs = await jobsCollections.find({postedBy : req.params.email}).toArray();
      res.send(jobs)
    })

    // Delete a Job
    app.delete("/job/:id", async(req, res) => {
      if (!dbReady || !jobsCollections) {
        inMemoryJobs = inMemoryJobs.filter((job) => String(job._id) !== String(req.params.id));
        return res.status(200).json({ acknowledged: true, deletedCount: 1 });
      }

      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result = await jobsCollections.deleteOne(filter);
      res.send(result)
    })

    //Update a Job
    app.patch("/update-job/:id", async(req, res) => {
      if (!dbReady || !jobsCollections) {
        inMemoryJobs = inMemoryJobs.map((job) => String(job._id) === String(req.params.id) ? { ...job, ...req.body } : job);
        return res.status(200).json({ acknowledged: true, modifiedCount: 1 });
      }

      const id = req.params.id;
      const jobData = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true};
      const updateDoc = {
        $set: {
          ...jobData
        },
    };

    const result = await jobsCollections.updateOne(filter, updateDoc, options);
    res.send(result)
  })

  // Admin check — returns { isAdmin: true/false } based on ADMIN_EMAIL env var
  app.get("/admin-check", (req, res) => {
    const { email } = req.query;
    const adminEmail = process.env.ADMIN_EMAIL;
    res.json({ isAdmin: Boolean(adminEmail && email === adminEmail) });
  });

  // Submit a job application
  app.post("/apply-job", async (req, res) => {
    const { jobId, applicantEmail, applicantName, resumeLink } = req.body;
    if (!jobId || !applicantEmail || !resumeLink) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const application = {
      jobId,
      applicantEmail,
      applicantName: applicantName || applicantEmail,
      resumeLink,
      appliedAt: new Date()
    };

    if (!dbReady || !applicationsCollection) {
      const saved = { ...application, _id: `app-${Date.now()}` };
      inMemoryApplications.push(saved);
      return res.status(200).json({ acknowledged: true, insertedId: saved._id });
    }

    try {
      const result = await applicationsCollection.insertOne(application);
      res.status(200).json({ acknowledged: true, insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: "Failed to save application" });
    }
  });

  // Get applications submitted by a user (by their email)
  app.get("/my-applications/:email", async (req, res) => {
    const { email } = req.params;
    if (!dbReady || !applicationsCollection) {
      return res.status(200).json(inMemoryApplications.filter(a => a.applicantEmail === email));
    }
    try {
      const apps = await applicationsCollection.find({ applicantEmail: email }).sort({ appliedAt: -1 }).toArray();
      // Enrich with job title/company from jobsCollections
      const enriched = await Promise.all(apps.map(async (app) => {
        try {
          const job = await jobsCollections.findOne({ _id: new ObjectId(app.jobId) });
          return { ...app, jobTitle: job?.jobTitle || "Unknown Job", companyName: job?.companyName || "", jobLocation: job?.jobLocation || "" };
        } catch { return { ...app, jobTitle: "Unknown Job", companyName: "" }; }
      }));
      res.json(enriched);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get all applicants for a specific job (admin only)
  app.get("/applications/:jobId", async (req, res) => {
    const { jobId } = req.params;
    const { email } = req.query;
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (!dbReady || !applicationsCollection) {
      return res.status(200).json(inMemoryApplications.filter(a => a.jobId === jobId));
    }
    try {
      const apps = await applicationsCollection.find({ jobId }).sort({ appliedAt: -1 }).toArray();
      res.json(apps);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Delete (withdraw/reject) a specific application
  app.delete("/application/:id", async (req, res) => {
    const { id } = req.params;
    if (!dbReady || !applicationsCollection) {
      inMemoryApplications = inMemoryApplications.filter(a => String(a._id) !== id);
      return res.status(200).json({ acknowledged: true, deletedCount: 1 });
    }
    try {
      const result = await applicationsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    } catch (err) {
      // If id is not an ObjectId, it might be an in-memory test id
      try {
        const result = await applicationsCollection.deleteOne({ _id: id });
        res.json(result);
      } catch {
        res.status(500).json({ message: "Failed to delete application" });
      }
    }
  });

  // Update application status and notes
  app.patch("/application/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    if (!dbReady || !applicationsCollection) {
      const idx = inMemoryApplications.findIndex(a => String(a._id) === id);
      if (idx >= 0) inMemoryApplications[idx] = { ...inMemoryApplications[idx], ...updateData };
      return res.status(200).json({ acknowledged: true });
    }

    try {
      let filter = { _id: new ObjectId(id) };
      try { new ObjectId(id); } catch { filter = { _id: id }; } // Fallback for memory ids
      
      const result = await applicationsCollection.updateOne(filter, { $set: updateData });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Get Talent Pool (users with resumes)
  app.get("/talent-pool", async (req, res) => {
    const { email } = req.query;
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    if (!dbReady || !usersCollection) {
      return res.status(200).json(inMemoryUsers.filter(u => u.resumeLink));
    }
    
    try {
      const users = await usersCollection.find({ resumeLink: { $exists: true, $ne: "" } }).toArray();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch talent pool" });
    }
  });

  // Upsert user profile
  app.post("/user-profile", async (req, res) => {
    const { email, displayName, phone, headline, bio, linkedinUrl, resumeLink, photoURL } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const profileData = { email, displayName, phone, headline, bio, linkedinUrl, resumeLink, photoURL, updatedAt: new Date() };
    Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);
    if (!dbReady || !usersCollection) {
      const idx = inMemoryUsers.findIndex(u => u.email === email);
      if (idx >= 0) inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...profileData };
      else inMemoryUsers.push({ ...profileData, _id: `user-${Date.now()}` });
      return res.status(200).json({ acknowledged: true });
    }

    try {
      const result = await usersCollection.updateOne(
        { email },
        { $set: profileData },
        { upsert: true }
      );
      res.json({ acknowledged: true, result });
    } catch (err) {
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // Get user profile by email
  app.get("/user-profile/:email", async (req, res) => {
    const { email } = req.params;
    if (!dbReady || !usersCollection) {
      const user = inMemoryUsers.find(u => u.email === email);
      return res.status(200).json(user || null);
    }
    try {
      const user = await usersCollection.findOne({ email });
      res.json(user || null);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;
