/* eslint-disable prettier/prettier */
import dotenv from 'dotenv';
import express from 'express';
import twilio from 'twilio';
import ngrok from 'ngrok';

dotenv.config({ path: '.env' });

const { AccessToken } = twilio.jwt;
const { VideoGrant } = AccessToken;

const app = express();
const PORT = 3000;


app.get('/getToken', (req, res, next) => {
    if (!req.query || !req.query.username) {
        return res.status(400).send('Username field is required!');
    }
    console.log("username: ", req.query.username);


    const accessToken = new AccessToken(
        process.env.ACCOUNT_SID,
        process.env.API_KEY_SID,
        process.env.API_KEY_SECRET,
    );

    accessToken.identity = req?.query?.username;

    var grant = new VideoGrant();
    accessToken.addGrant(grant);

    // convert accessToken into jwt so that can be used in front-end
    var jwt = accessToken.toJwt();
    return res.send(jwt);
});

app.listen(PORT, () => (console.log("server is running at port: ",PORT)));

ngrok.connect(PORT).then((url) => {
    console.log(`Server forwarded to public url ${url}`);
});