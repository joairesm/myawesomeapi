const functions = require('firebase-functions');
const express = require ('express');
var libjs = require('./Models/model.json');

const sptf_my_client_id = libjs.sptf_my_client_id;
const sptf_my_client_secret = libjs.sptf_my_client_secret;
const sptf_redirect_uri = libjs.sptf_redirect_uri;
const inst_my_client_id = libjs.inst_my_client_id;
const inst_my_client_secret = libjs.inst_my_client_secret;
const inst_redirect_uri = libjs.inst_redirect_uri;
const sec_code = libjs.sec_code;
const sec_setup = libjs.sec_setup;
const spotifyToken = libjs.SptfrfToken;
const instaToken = libjs.InstToken;
const twttr_consumer_key = libjs.twttr_consumer_key;
const twttr_consumer_secret = libjs.twttr_consumer_secret;
const twttrToken = libjs.twttrToken;

var finalresponse;

app = express();
spotify_app = express();
instagram_app = express();
twitter_app = express();

spotify_app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

instagram_app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

twitter_app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/home', (req,res) => {
    res.send('hi! This is my personal API');
});

spotify_app.get('/spotify/setup', function(req, res) {
    var thecode = req.param('sec_setup');
    if(thecode != sec_setup){
        res.send('Stay away boy');
        return;
    }

    var scopes = 'user-read-recently-played';
    res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + sptf_my_client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(sptf_redirect_uri));
});

spotify_app.get('/spotify/code', function(req, res) {

    var thecode = req.param('code');
    var request = require("request");

    var options = { method: 'POST',
        url: 'https://accounts.spotify.com/api/token',
        headers: 
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { grant_type: 'authorization_code',
            code: thecode,
            redirect_uri: sptf_redirect_uri,
            client_id: sptf_my_client_id,
            client_secret: sptf_my_client_secret } };

    request(options, function (error, _response, body) {
        if (error) throw new Error(error);
        var parsed = JSON.parse(body);
        
        console.log(parsed.refresh_token);
        res.send('success!');
        
    });
});

spotify_app.get('/spotify/latest', function(req, res){
    var thecode = req.param('sec_code');
    if(thecode != sec_code){
        res.send('Stay away boy');
        return;
    }

    var b = new Buffer(sptf_my_client_id + ":" + sptf_my_client_secret);
    var s = b.toString('base64');

    var auth = "Basic " + s;

    var request = require("request");
    var options = { method: 'POST',
        url: 'https://accounts.spotify.com/api/token',
        headers: 
        { 'Authorization' :  auth },
        form: 
        {   grant_type: 'refresh_token',
            refresh_token : spotifyToken 
        } };

    request(options, function (error, _response, body) {
        if (error) throw new Error(error);
        var parsed = JSON.parse(body);
        
        console.log(parsed.access_token);
        
        var request = require("request");
        var options = { method: 'GET',
            url: 'https://api.spotify.com/v1/me/player/recently-played',
            qs: { 
                limit: '1'
            },
            headers: 
            { Authorization: 'Bearer ' + parsed.access_token,
                'Content-Type': 'application/json',
                Accept: 'application/json' } };
        
        request(options, function (error, _r, _b) {
            if (error) throw new Error(error);
            res.send(_b);

        });
    });
});

instagram_app.get('/instagram/setup', function(req, res) {
    var thecode = req.param('sec_setup');
    if(thecode != sec_setup){
        res.send('Stay away boy');
        return;
    }
    res.redirect('https://api.instagram.com/oauth/authorize/?client_id=' +
    inst_my_client_id +
    '&redirect_uri='+
    inst_redirect_uri+
    '&response_type=code');
});

instagram_app.get('/instagram/code', function(req, res) {

    var thecode = req.param('code');
    var request = require("request");

    var options = { method: 'POST',
        url: 'https://api.instagram.com/oauth/access_token',
        headers: 
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { grant_type: 'authorization_code',
            code: thecode,
            redirect_uri: inst_redirect_uri,
            client_id: inst_my_client_id,
            client_secret: inst_my_client_secret } };

    request(options, function (error, _response, body) {
        if (error) throw new Error(error);

        var parsed = JSON.parse(body);
        console.log(parsed.access_token);

        res.send('success!');
        
    });
});

instagram_app.get('/instagram/latest', function(req, res) {
        var thecode = req.param('sec_code');
        if(thecode != sec_code){
            res.send('Stay away boy');
            return;
        }
        
        var request = require("request");

        var options = { method: 'GET',
            url: 'https://api.instagram.com/v1/users/self/media/recent/',
            qs: { access_token: instaToken },
            headers: 
            { 'Content-Type': 'application/json',
                Accept: 'application/json' } };
        
        request(options, function (error, _response, body) {
            if (error) throw new Error(error);
        
            finalresponse = body;

            res.send(finalresponse);

        });
    
});

twitter_app.get('/twitter/setup', function(req, res) {
    var thecode = req.param('sec_setup');
    if(thecode != sec_setup){
        res.send('Stay away boy');
        return;
    }

    var request = require("request");

    var b = new Buffer(encodeURIComponent(twttr_consumer_key) + ":" + encodeURIComponent(twttr_consumer_secret));
    var s = b.toString('base64');

    var auth = "Basic " + s;
    var options = { method: 'POST',
        url: 'https://api.twitter.com/oauth2/token',
        headers: 
        { 'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': auth
        },
        form: 
        { grant_type: 'client_credentials'} };

    request(options, function (error, _response, body) {
        if (error) throw new Error(error);

        var parsed = JSON.parse(body);
        console.log(parsed.access_token);

        res.send('success!');
        
    });

    
});


twitter_app.get('/twitter/latest', function(req, res) {
        var thecode = req.param('sec_code');
        if(thecode != sec_code){
            res.send('Stay away boy');
            return;
        }
        
        var request = require("request");

        var options = { method: 'GET',
            url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=joairesm&count=1',
            
            headers: 
            { Authorization: 'Bearer ' + twttrToken,
            'Content-Type': 'application/json',
            Accept: 'application/json' } };
        
        request(options, function (error, _response, body) {
            if (error) throw new Error(error);
        
            finalresponse = body;

            res.send(finalresponse);

        });
});

exports.app = functions.https.onRequest(app)
exports.spotify_app = functions.https.onRequest(spotify_app)
exports.instagram_app = functions.https.onRequest(instagram_app)
exports.twitter_app = functions.https.onRequest(twitter_app)