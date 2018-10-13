const functions = require('firebase-functions');
const express = require ('express');
var libjs = require('./Models/model.json');

const sptf_my_client_id = libjs.sptf_my_client_id;
const sptf_my_client_secret = libjs.sptf_my_client_secret;
const sptf_redirect_uri = libjs.sptf_redirect_uri_2;

const inst_my_client_id = libjs.inst_my_client_id;
const inst_my_client_secret = libjs.inst_my_client_secret;
const inst_redirect_uri = libjs.inst_redirect_uri_2;

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
      '&client_id=' + sptf_my_client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(sptf_redirect_uri));
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
            redirect_uri: sptf_redirect_uri,
            client_id: sptf_my_client_id,
            client_secret: sptf_my_client_secret } };

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

app.get('/instagram/latest', function(req, res) {
    res.redirect('https://api.instagram.com/oauth/authorize/?client_id=' +
    inst_my_client_id +
    '&redirect_uri='+
    inst_redirect_uri+
    '&response_type=code');
});

app.get('/instagram/code', function(req, res) {

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
        accesstoken = body;

        var parsed = JSON.parse(accesstoken);
        var request = require("request");

        var options = { method: 'GET',
            url: 'https://api.instagram.com/v1/users/self/media/recent/',
            qs: { access_token: parsed.access_token,
                   callback: '__ng_jsonp__.__req0.finished' },
            headers: 
            { 'Content-Type': 'application/json',
                Accept: 'application/json' } };
        
        request(options, function (error, _response, body) {
            if (error) throw new Error(error);
        
            finalresponse = body;

            res.send(finalresponse);

        });
    });
});

exports.app = functions.https.onRequest(app)