const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// ...existing code...

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, 'post-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb('Error: Images only!');
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// ...existing code...