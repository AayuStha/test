const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { db, storage } = require('./firebase'); // Import Firebase setup

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/products-data', async (req, res) => {
  try {
    const productsRef = db.ref('products');
    productsRef.once('value', (snapshot) => {
      res.json(snapshot.val());
    });
  } catch (error) {
    console.error('Error fetching products data:', error);
    res.status(500).send('Error fetching products.');
  }
});

app.post('/add-product', upload.single('image'), (req, res) => {
  const file = req.file;
  const fileName = `${Date.now()}-${file.originalname}`;
  const bucket = storage.bucket();

  // Upload the image to Firebase Storage
  const blob = bucket.file(`images/${fileName}`);
  const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
          contentType: file.mimetype,
      },
  });

  blobStream.on('error', (err) => {
      console.error('Error uploading to Firebase Storage:', err);
      res.status(500).send('Error uploading image.');
  });

  blobStream.on('finish', async () => {
      try {
          // Construct the public URL for the uploaded file
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/images/${fileName}`;
          console.log('Generated Image URL:', publicUrl);

          // Add product to the Firebase Realtime Database
          const productsRef = db.ref('products');
          const newProductRef = productsRef.push();
          await newProductRef.set({
              name: req.body.name,
              price: req.body.price,
              description: req.body.description,
              imageUrl: publicUrl,
          });

          res.redirect('/admin');
      } catch (error) {
          console.error('Error adding product to database:', error);
          res.status(500).send('Error adding product.');
      }
  });

  blobStream.end(file.buffer);
});






const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
