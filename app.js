const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

let posts = [];

// Routes

app.get('/', (req, res) => {
  res.render('index',{posts});
});
app.get('/post', (req, res) => {
  res.render('index', { posts });
});

app.get('/new', (req, res) => {
  res.render('new-post');
});


app.post('/new', upload.single('image'), (req, res) => {
  const { title, category, description } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;
  posts.push({ title, category, imageUrl, description });
  res.redirect('/post');
});

app.get('/edit/:id', (req, res) => {
  const post = posts[req.params.id];
  res.render('edit-post', { post, id: req.params.id });
});

app.post('/edit/:id', upload.single('image'), (req, res) => {
  const { title, category, description } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : posts[req.params.id].imageUrl;
  posts[req.params.id] = { title, category, imageUrl, description };
  res.redirect('/post');
});

app.post('/delete/:id', (req, res) => {
  posts.splice(req.params.id, 1);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
