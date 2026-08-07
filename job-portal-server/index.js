const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 3000;
const { MongoClient, ObjectId } = require('mongodb');

// ─── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));

// ─── MONGO LAZY CONNECTION ─────────────────────────────────────────────────────
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI ||
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@job-portal.oogp5gl.mongodb.net/mernJobPortal?retryWrites=true&w=majority`;

let client = null;
let db = null;
let jobsCollections = null;
let applicationsCollection = null;
let usersCollection = null;
let adminsCollection = null;
let dbReady = false;
let dbConnecting = false;

async function getDb() {
  if (dbReady) return true;
  if (dbConnecting) {
    // Wait up to 8s for connection in progress
    for (let i = 0; i < 80; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (dbReady) return true;
    }
    return false;
  }
  dbConnecting = true;
  try {
    client = new MongoClient(mongoUri, {
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db("mernJobPortal");
    jobsCollections = db.collection("demoJobs");
    applicationsCollection = db.collection("applications");
    usersCollection = db.collection("users");
    adminsCollection = db.collection("admins");
    dbReady = true;
    console.log("✅ Connected to MongoDB!");
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    dbReady = false;
    dbConnecting = false;
    return false;
  }
}

// Kick off connection immediately on startup
getDb();

// Helper to check if email is an admin
async function checkAdmin(email) {
  if (!email) return false;
  const superAdmin = process.env.ADMIN_EMAIL;
  if (superAdmin && email === superAdmin) return true;
  
  const connected = await getDb();
  if (connected && adminsCollection) {
    const adminDoc = await adminsCollection.findOne({ email });
    if (adminDoc) return true;
  }
  return false;
}

// ─── FALLBACK / IN-MEMORY ──────────────────────────────────────────────────────
const fallbackJobs = [
  { _id: 'fallback-1', jobTitle: 'Frontend Developer', companyName: 'JobJunction Labs', minPrice: '40', maxPrice: '70', salaryType: 'Yearly', jobLocation: 'Remote', postingDate: '2026-08-01', experienceLevel: 'Intermediate', employmentType: 'Full-Time', description: 'Build modern React interfaces for a fast-growing SaaS team.', postedBy: 'demo@example.com' },
  { _id: 'fallback-2', jobTitle: 'Backend Engineer', companyName: 'DataForge', minPrice: '60', maxPrice: '90', salaryType: 'Yearly', jobLocation: 'London', postingDate: '2026-08-02', experienceLevel: 'Senior', employmentType: 'Full-Time', description: 'Design and maintain scalable APIs and data pipelines.', postedBy: 'demo@example.com' }
];
let inMemoryJobs = [];
let inMemoryApplications = [];
let inMemoryUsers = [];

const getCombinedJobs = () => [...inMemoryJobs, ...fallbackJobs];

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', message: 'JobJunction API is running' }));

app.get('/healthcheck', async (req, res) => {
  const connected = await getDb();
  res.json({
    dbReady,
    mongoUri: mongoUri ? mongoUri.replace(/:([^@]+)@/, ':***@') : 'NOT SET',
    adminEmail: process.env.ADMIN_EMAIL || 'NOT SET',
    corsOrigin: process.env.CORS_ORIGIN || 'NOT SET',
    connected
  });
});

// ─── JOB ROUTES ───────────────────────────────────────────────────────────────
app.post("/post-job", async (req, res) => {
  const body = req.body;
  body.createAt = new Date();
  const connected = await getDb();
  if (!connected || !jobsCollections) {
    const newJob = { ...body, _id: `memory-${Date.now()}` };
    inMemoryJobs.unshift(newJob);
    return res.status(200).json({ acknowledged: true, insertedId: newJob._id });
  }
  try {
    const result = await jobsCollections.insertOne(body);
    return result.insertedId ? res.status(200).send(result) : res.status(404).send({ message: "Failed to post job", status: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/all-jobs", async (req, res) => {
  const connected = await getDb();
  if (!connected || !jobsCollections) return res.status(200).json(getCombinedJobs());
  try {
    const jobs = await jobsCollections.find({}).toArray();
    res.send(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/all-jobs/:id", async (req, res) => {
  const connected = await getDb();
  if (!connected || !jobsCollections) {
    const job = getCombinedJobs().find(item => String(item._id) === String(req.params.id));
    return res.status(job ? 200 : 404).json(job || null);
  }
  try {
    const job = await jobsCollections.findOne({ _id: new ObjectId(req.params.id) });
    res.send(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/myJobs/:email", async (req, res) => {
  const connected = await getDb();
  if (!connected || !jobsCollections) {
    return res.status(200).json(getCombinedJobs().filter(j => j.postedBy === req.params.email));
  }
  try {
    const jobs = await jobsCollections.find({ postedBy: req.params.email }).toArray();
    res.send(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/job/:id", async (req, res) => {
  const connected = await getDb();
  if (!connected || !jobsCollections) {
    inMemoryJobs = inMemoryJobs.filter(j => String(j._id) !== String(req.params.id));
    return res.status(200).json({ acknowledged: true, deletedCount: 1 });
  }
  try {
    const result = await jobsCollections.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/update-job/:id", async (req, res) => {
  const connected = await getDb();
  if (!connected || !jobsCollections) {
    inMemoryJobs = inMemoryJobs.map(j => String(j._id) === String(req.params.id) ? { ...j, ...req.body } : j);
    return res.status(200).json({ acknowledged: true, modifiedCount: 1 });
  }
  try {
    const result = await jobsCollections.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────
app.get("/admin-check", async (req, res) => {
  const { email } = req.query;
  const isAdmin = await checkAdmin(email);
  res.json({ isAdmin });
});

app.get("/admins", async (req, res) => {
  const { email } = req.query;
  if (!(await checkAdmin(email))) return res.status(403).json({ message: "Unauthorized" });
  
  const superAdmin = process.env.ADMIN_EMAIL;
  let adminsList = superAdmin ? [{ email: superAdmin, addedBy: 'System', isSuperAdmin: true }] : [];
  
  const connected = await getDb();
  if (connected && adminsCollection) {
    const dbAdmins = await adminsCollection.find().toArray();
    adminsList = [...adminsList, ...dbAdmins.map(a => ({ email: a.email, addedBy: a.addedBy, addedAt: a.addedAt }))];
  }
  res.json(adminsList);
});

app.post("/add-admin", async (req, res) => {
  const { email, newAdminEmail } = req.body;
  if (!(await checkAdmin(email))) return res.status(403).json({ message: "Unauthorized" });
  if (!newAdminEmail) return res.status(400).json({ message: "New admin email is required" });
  
  const superAdmin = process.env.ADMIN_EMAIL;
  if (newAdminEmail === superAdmin) return res.status(400).json({ message: "Already a super admin" });

  const connected = await getDb();
  if (!connected || !adminsCollection) return res.status(500).json({ message: "Database not connected" });
  
  const existing = await adminsCollection.findOne({ email: newAdminEmail });
  if (existing) return res.status(400).json({ message: "User is already an admin" });
  
  const result = await adminsCollection.insertOne({
    email: newAdminEmail,
    addedBy: email,
    addedAt: new Date()
  });
  res.json({ acknowledged: true, insertedId: result.insertedId });
});

app.delete("/remove-admin/:targetEmail", async (req, res) => {
  const { targetEmail } = req.params;
  const { email } = req.query;
  if (!(await checkAdmin(email))) return res.status(403).json({ message: "Unauthorized" });
  
  if (targetEmail === email) return res.status(400).json({ message: "You cannot revoke your own admin access" });
  
  const superAdmin = process.env.ADMIN_EMAIL;
  if (targetEmail === superAdmin) return res.status(403).json({ message: "Cannot remove super admin" });

  const connected = await getDb();
  if (!connected || !adminsCollection) return res.status(500).json({ message: "Database not connected" });
  
  const result = await adminsCollection.deleteOne({ email: targetEmail });
  res.json(result);
});

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
app.post("/apply-job", async (req, res) => {
  const { jobId, applicantEmail, applicantName, resumeLink } = req.body;
  if (!jobId || !applicantEmail || !resumeLink) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const application = { jobId, applicantEmail, applicantName: applicantName || applicantEmail, resumeLink, appliedAt: new Date() };
  const connected = await getDb();
  if (!connected || !applicationsCollection) {
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

app.get("/my-applications/:email", async (req, res) => {
  const { email } = req.params;
  const connected = await getDb();
  if (!connected || !applicationsCollection) {
    return res.status(200).json(inMemoryApplications.filter(a => a.applicantEmail === email));
  }
  try {
    const apps = await applicationsCollection.find({ applicantEmail: email }).sort({ appliedAt: -1 }).toArray();
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

app.get("/applications/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const { email } = req.query;
  if (!(await checkAdmin(email))) return res.status(403).json({ message: "Unauthorized" });
  const connected = await getDb();
  if (!connected || !applicationsCollection) {
    return res.status(200).json(inMemoryApplications.filter(a => a.jobId === jobId));
  }
  try {
    const apps = await applicationsCollection.find({ jobId }).sort({ appliedAt: -1 }).toArray();
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

app.delete("/application/:id", async (req, res) => {
  const { id } = req.params;
  const connected = await getDb();
  if (!connected || !applicationsCollection) {
    inMemoryApplications = inMemoryApplications.filter(a => String(a._id) !== id);
    return res.status(200).json({ acknowledged: true, deletedCount: 1 });
  }
  try {
    const result = await applicationsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch {
    try {
      const result = await applicationsCollection.deleteOne({ _id: id });
      res.json(result);
    } catch {
      res.status(500).json({ message: "Failed to delete application" });
    }
  }
});

app.patch("/application/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const connected = await getDb();
  if (!connected || !applicationsCollection) {
    const idx = inMemoryApplications.findIndex(a => String(a._id) === id);
    if (idx >= 0) inMemoryApplications[idx] = { ...inMemoryApplications[idx], ...updateData };
    return res.status(200).json({ acknowledged: true });
  }
  try {
    let filter;
    try { filter = { _id: new ObjectId(id) }; } catch { filter = { _id: id }; }
    const result = await applicationsCollection.updateOne(filter, { $set: updateData });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to update application" });
  }
});

// ─── TALENT POOL ──────────────────────────────────────────────────────────────
app.get("/talent-pool", async (req, res) => {
  const { email } = req.query;
  if (!(await checkAdmin(email))) return res.status(403).json({ message: "Unauthorized" });
  const connected = await getDb();
  if (!connected || !usersCollection) {
    return res.status(200).json(inMemoryUsers.filter(u => u.resumeLink));
  }
  try {
    const users = await usersCollection.find({ resumeLink: { $exists: true, $ne: "" } }).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch talent pool" });
  }
});

app.delete("/talent-pool/:targetEmail", async (req, res) => {
  const { targetEmail } = req.params;
  const { email } = req.query;
  if (!(await checkAdmin(email))) return res.status(403).json({ message: "Unauthorized" });

  const connected = await getDb();
  if (!connected || !usersCollection) {
    return res.status(500).json({ message: "Database not connected" });
  }
  try {
    // Remove resume link so they no longer appear in the talent pool
    const result = await usersCollection.updateOne(
      { email: decodeURIComponent(targetEmail) },
      { $unset: { resumeLink: "" } }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from talent pool" });
  }
});

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
app.post("/user-profile", async (req, res) => {
  const { email, displayName, phone, headline, bio, linkedinUrl, resumeLink, photoURL } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  const profileData = { email, displayName, phone, headline, bio, linkedinUrl, resumeLink, photoURL, updatedAt: new Date() };
  Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);

  const connected = await getDb();
  if (!connected || !usersCollection) {
    const idx = inMemoryUsers.findIndex(u => u.email === email);
    if (idx >= 0) inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...profileData };
    else inMemoryUsers.push({ ...profileData, _id: `user-${Date.now()}` });
    return res.status(200).json({ acknowledged: true });
  }
  try {
    const result = await usersCollection.updateOne({ email }, { $set: profileData }, { upsert: true });
    res.json({ acknowledged: true, result });
  } catch (err) {
    res.status(500).json({ message: "Failed to save profile" });
  }
});

app.get("/user-profile/:email", async (req, res) => {
  const { email } = req.params;
  const connected = await getDb();
  if (!connected || !usersCollection) {
    return res.status(200).json(inMemoryUsers.find(u => u.email === email) || null);
  }
  try {
    const user = await usersCollection.findOne({ email });
    res.json(user || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ─── SAVED JOBS (WISHLIST) ────────────────────────────────────────────────────
app.post("/saved-jobs", async (req, res) => {
  const { email, jobId } = req.body;
  if (!email || !jobId) return res.status(400).json({ message: "email and jobId required" });
  const connected = await getDb();
  if (!connected || !usersCollection) {
    const idx = inMemoryUsers.findIndex(u => u.email === email);
    if (idx >= 0) {
      const saved = new Set(inMemoryUsers[idx].savedJobs || []);
      saved.add(jobId);
      inMemoryUsers[idx].savedJobs = [...saved];
    }
    return res.json({ acknowledged: true });
  }
  try {
    await usersCollection.updateOne({ email }, { $addToSet: { savedJobs: jobId } }, { upsert: true });
    res.json({ acknowledged: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to save job" });
  }
});

app.delete("/saved-jobs/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "email required" });
  const connected = await getDb();
  if (!connected || !usersCollection) {
    const idx = inMemoryUsers.findIndex(u => u.email === email);
    if (idx >= 0) inMemoryUsers[idx].savedJobs = (inMemoryUsers[idx].savedJobs || []).filter(id => id !== jobId);
    return res.json({ acknowledged: true });
  }
  try {
    await usersCollection.updateOne({ email }, { $pull: { savedJobs: jobId } });
    res.json({ acknowledged: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove saved job" });
  }
});

app.get("/saved-jobs/:email", async (req, res) => {
  const { email } = req.params;
  const connected = await getDb();
  let savedIds = [];
  if (!connected || !usersCollection) {
    const user = inMemoryUsers.find(u => u.email === email);
    savedIds = user?.savedJobs || [];
  } else {
    try {
      const user = await usersCollection.findOne({ email });
      savedIds = user?.savedJobs || [];
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch saved jobs" });
    }
  }
  // Enrich with job data
  const enriched = await Promise.all(savedIds.map(async (id) => {
    try {
      if (connected && jobsCollections) {
        const job = await jobsCollections.findOne({ _id: new ObjectId(id) });
        return job;
      }
      return getCombinedJobs().find(j => String(j._id) === id) || null;
    } catch { return null; }
  }));
  res.json(enriched.filter(Boolean));
});

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
app.get("/analytics", async (req, res) => {
  const { email } = req.query;
  if (!(await checkAdmin(email))) return res.status(403).json({ message: "Unauthorized" });
  const connected = await getDb();
  if (!connected || !jobsCollections) {
    return res.json({ jobsByMonth: [], applicationsByJob: [], topLocations: [], topSkills: [] });
  }
  try {
    const [allJobs, allApps] = await Promise.all([
      jobsCollections.find({}).toArray(),
      applicationsCollection.find({}).toArray()
    ]);

    // Jobs by month (last 6 months)
    const monthMap = {};
    allJobs.forEach(job => {
      const d = new Date(job.createAt || job.postingDate);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const jobsByMonth = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));

    // Applications per job (top 10)
    const appMap = {};
    allApps.forEach(app => { appMap[app.jobId] = (appMap[app.jobId] || 0) + 1; });
    const applicationsByJob = await Promise.all(
      Object.entries(appMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(async ([jobId, count]) => {
          try {
            const job = await jobsCollections.findOne({ _id: new ObjectId(jobId) });
            return { name: job?.jobTitle || jobId, count };
          } catch { return { name: jobId, count }; }
        })
    );

    // Top locations
    const locMap = {};
    allJobs.forEach(job => { if (job.jobLocation) locMap[job.jobLocation] = (locMap[job.jobLocation] || 0) + 1; });
    const topLocations = Object.entries(locMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    // Top skills
    const skillMap = {};
    allJobs.forEach(job => {
      const skills = Array.isArray(job.skills) ? job.skills : typeof job.skills === 'string' ? [job.skills] : [];
      skills.forEach(s => {
        const name = typeof s === 'object' ? s.label || s.value : s;
        if (name) skillMap[name] = (skillMap[name] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    res.json({ jobsByMonth, applicationsByJob, topLocations, topSkills, totalJobs: allJobs.length, totalApps: allApps.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── REVIEWS & RATINGS ────────────────────────────────────────────────────────
app.post("/reviews", async (req, res) => {
  const { companyName, reviewerEmail, rating, comment } = req.body;
  if (!companyName || !reviewerEmail || !rating) return res.status(400).json({ message: "Missing required fields" });
  const review = { companyName, reviewerEmail, rating: Number(rating), comment: comment || "", createdAt: new Date() };
  const connected = await getDb();
  if (!connected || !db) return res.status(200).json({ acknowledged: true, inMemory: true });
  try {
    const reviewsCol = db.collection("reviews");
    const result = await reviewsCol.insertOne(review);
    res.json({ acknowledged: true, insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: "Failed to save review" });
  }
});

app.get("/reviews/:companyName", async (req, res) => {
  const { companyName } = req.params;
  const connected = await getDb();
  if (!connected || !db) return res.json({ reviews: [], avgRating: 0, count: 0 });
  try {
    const reviewsCol = db.collection("reviews");
    const reviews = await reviewsCol.find({ companyName }).sort({ createdAt: -1 }).toArray();
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;

