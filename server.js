import 'dotenv/config';
import qs from 'querystring';
import express from 'express';
import request from 'request';

const app = express();
const port = process.env.PORT || 8888;
const redirectUri = process.env.REDIRECT_URI;

app.get('/login', (req, res) => {
  res.redirect(
    `https://accounts.spotify.com/authorize?${qs.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope:
        'user-read-private user-read-email playlist-read-private playlist-read-collaborative',
      redirect_uri: redirectUri,
    })}`
  );
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    json: true,
  };
  request.post(authOptions, (error, response, body) => {
    const uri = process.env.FRONTEND_URI;
    const accessToken = body.access_token;
    const refreshToken = body.refresh_token;

    res.redirect(
      `${uri}?access_token=${accessToken}&refresh_token=${refreshToken}`
    );
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
