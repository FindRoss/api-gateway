const express = require('express');
const cors = require('cors');
const Token = require('./models/Token');
const axios = require('axios');
require('dotenv').config()


const connectDB = require('./config/db');
const app = express();

connectDB();

// git init. 
// host on github
// try to upload to heroku.
// .... try to hit the endpoint. 

app.use(cors());
app.use(express.json({ extended: false }))

const createToken = async () => {
  try {
    // request a new app access token from twitch
    const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials&scope=user:read:email`);
    const data = response.data;

    // create the expiry date of the new token
    const expiresIn = data.expires_in;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + expiresIn * 1000);

    // create schema for databse entry 
    const token = new Token({
      access: data.access_token,
      expires: expiryDate
    });

    // save it to the database. 
    try {
      console.log('saving token to the databse')
      const savedToken = await token.save();
      return savedToken;
    } catch (err) {
      console.log(err)
    }

  } catch (err) {
    console.log(err)
  }
}

const checkForToken = async (req, res, next) => {
  console.log('checkForToken function...')
  await Token.countDocuments(async function (err, count) {
    console.log('count', count)
    if (err) {
      console.log(err);
    }

    if (count !== 0) {
      next();
    } else if (count === 0) {
      console.log('count is 0 so we are here.')
      // CREATE TOKEN
      const newToken = await createToken();
      console.log('trying to console log newToken', newToken);
      res.send(newToken);
    }
  });
};
app.use(checkForToken);

const checkDate = async (req, res, next) => {
  console.log('checkDate function...')
  await Token.find({}, function (err, token) {
    if (err) {
      console.log(err);
    }
    const currentDate = new Date();
    const expiryDate = token[0].expires;

    if (Date.parse(expiryDate) > Date.parse(currentDate)) {
      console.log(`expiryDate is later than currentDate`);
      // CURRENT TOKEN IS FINE
      // SEND BACK TOKEN
      console.log('checkDate... send back token')
      res.send(token);
    } else {
      // CREATE TOKEN
      console.log('checkDate... creating new token')
      const newToken = createToken();
      res.send(newToken);
    }
  })
};
app.use(checkDate);

// ROUTE
app.get('/', async (req, res) => {
  res.send('...hello world...')
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Example app listening on port ${PORT}!`),
);