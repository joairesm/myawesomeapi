const functions = require('firebase-functions');
const express = require ('express');
var libjs = require('./Models/model.json');

const my_client_id = libjs.my_client_id;
const my_client_secret = libjs.my_client_secret;
const redirect_uri = libjs.redirect_uri_2;

console.log(redirect_uri);

var accesstoken;
var finalresponse;

app = express();

app.get('/home', (req,res) => {
    res.send('hi! This is my personal API');
});

app.get('/spotify/latest', function(req, res) {
    var scopes = 'user-read-recently-played';
    res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + my_client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

app.get('/spotify/code', function(req, res) {

    var thecode = req.param('code');
    var request = require("request");

    var options = { method: 'POST',
        url: 'https://accounts.spotify.com/api/token',
        headers: 
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { grant_type: 'authorization_code',
            code: thecode,
            redirect_uri: redirect_uri,
            client_id: my_client_id,
            client_secret: my_client_secret } };

    request(options, function (error, _response, body) {
        if (error) throw new Error(error);
        accesstoken = body;

        var parsed = JSON.parse(accesstoken);
        var request = require("request");

        var options = { method: 'GET',
            url: 'https://api.spotify.com/v1/me/player/recently-played',
            qs: { limit: '3' },
            headers: 
            { Authorization: 'Bearer ' + parsed.access_token,
                'Content-Type': 'application/json',
                Accept: 'application/json' } };
        
        request(options, function (error, _response, body) {
            if (error) throw new Error(error);
        
            finalresponse = body;

            res.send(finalresponse);

        });
    });
});

exports.app = functions.https.onRequest(app)
