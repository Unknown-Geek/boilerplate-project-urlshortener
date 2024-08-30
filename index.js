require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require("dns");
const mongoose = require('mongoose');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://shravanpandala:LC1TxA5b9rQYHJXJ@cluster0.garka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });

// URL Schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', async function(req, res) {
  let originalUrl = req.body.url;
  try {
    const urlObj = new URL(originalUrl);
    dns.lookup(urlObj.hostname, async (err, address, family) => {
      if (err) {
        res.json({ error: 'invalid url' });
      } else {
        let url = await Url.findOne({ original_url: originalUrl });
        if (!url) {
          const count = await Url.countDocuments();
          url = new Url({ original_url: originalUrl, short_url: count + 1 });
          await url.save();
        }
        res.json({ original_url: url.original_url, short_url: url.short_url });
      }
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', async function(req, res) {
  let shortUrl = parseInt(req.params.short_url);
  try {
    let url = await Url.findOne({ short_url: shortUrl });
    if (url) {
      res.redirect(url.original_url);
    } else {
      res.json({ error: 'No short URL found for the given input' });
    }
  } catch (err) {
    res.json({ error: 'Server error' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
