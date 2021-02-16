const express = require('express');
const cors = require('cors');
const Token = require('./models/Token');
const axios = require('axios');
require('dotenv').config()


const connectDB = require('./config/db');
const app = express();

connectDB();

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
      const savedToken = await token.save();
      console.log('Saved token to the database: ', savedToken);
      return savedToken;
    } catch (err) {
      throw new err;
    }

  } catch (err) {
    console.log(err)
  }
}

const checkForToken = async (req, res, next) => {

  await Token.countDocuments(async function (err, count) {
    if (err) console.log(err);

    if (count !== 0) {
      // check if there are 1 or more tokens in the database
      next();
    } else if (count === 0) {
      console.log('count is 0 so we are here.')
      // create a new token
      const newToken = await createToken();
      res.send(newToken);
    }
  });
};
app.use(checkForToken);

const checkDate = async (req, res, next) => {

  await Token.find({}, function (err, token) {
    if (err) console.log(err);

    const currentDate = new Date();
    const expiryDate = token[token.length - 1].expires;

    if (Date.parse(expiryDate) > Date.parse(currentDate)) {
      // send the token back if it is still valid.
      res.send(token[token.length - 1]);
    } else {
      // create a new token
      const newToken = createToken();
      // having trouble with this bit. the only bit really. 
      res.send(newToken);
    }
  })
};
app.use(checkDate);

// ROUTE
app.get('/', async (req, res) => {
  res.send('...hello world...')
});

const PORT = process.env.PORT || 6000;

app.listen(PORT, () =>
  console.log(`Example app listening on port ${PORT}!`),
);