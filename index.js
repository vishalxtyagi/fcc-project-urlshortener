require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const fs = require('fs');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const filename = 'shorturl.txt';

app.use(express.urlencoded({ extended:false }));
app.use(express.json());
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.get('/api/shorturl/:url', function(req, res) {
  var index = req.params.url;

  fs.readFile(filename, 'utf-8', function(err, data) {
    if (err) console.log(err);
    try {
      var lines = data.trim().split('\n');
      res.redirect(lines[index]);
    } catch (err) {
      res.json({ error: 'invalid url' });
    }
  });
});


app.post('/api/shorturl', function(req, res) {
  try {
    var url = new URL(req.body.url);
    dns.lookup(url.host, (err, address)=>{
      if(err) console.log(err);
  
      if (fs.existsSync(filename)) {
        var array = fs.readFileSync(filename).toString().split("\n");
        (array.indexOf(url.href) === -1) ? fs.appendFileSync(filename, url.href + '\n', 'utf-8', err => {
          if(err) console.log(err);
        }) : null;
      } else {
        fs.writeFileSync(filename, url.href + '\n', 'utf-8', err => {
          if(err) console.log(err);
        });
      }
  
      var array = fs.readFileSync(filename).toString().split("\n");
      res.json({original_url: url.href, short_url: array.indexOf(url.href)});
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
