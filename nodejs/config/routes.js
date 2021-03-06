/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var _ = require('underscore');
var auth = require('./middlewares/authorization');

var home = require('home');
var users = require('users');
var dht = require('dht');
var tags = require('tags');
var comments = require('comments');

// Auth Vars

var authOptions = {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: 'Invalid email or password.'
};

var dhtAuth = [auth.requiresLogin, auth.dht.hasAuthorization];
var commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

/**
 * Expose
 */

module.exports = function (app, passport) {

  app.get('/', dht.index);

  // dht routes
  app.param('id', dht.load);
  app.get('/dht', dht.index);
  app.get('/dht/new', auth.requiresLogin, dht.new);
  app.get('/dht/:id', dht.show);
  app.get('/dht/:id/edit', dhtAuth, dht.edit);

  app.get('/api/dht', dht.all);
  app.get('/api/dht/latest', dht.latest);
  app.post('/api/dht', dht.create);
  app.delete('/api/dht/:id', dhtAuth, dht.destroy);

  // comment routes
  app.param('commentId', comments.load);
  app.post('/dht/:id/comments', auth.requiresLogin, comments.create);
  app.get('/dht/:id/comments', auth.requiresLogin, comments.create);
  app.delete('/dht/:id/comments/:commentId', commentAuth, comments.destroy);

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.get('/users/:userId', users.show);

  app.get('/api/loggedin', users.loggedin);

  app.post('/users', users.create);
  app.post('/users/session',
    passport.authenticate('local', authOptions), users.session);

  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: [ 'email', 'user_about_me'],
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), users.authCallback);
  app.get('/auth/github',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }), users.authCallback);
  app.get('/auth/twitter',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.authCallback);
  app.get('/auth/google',
    passport.authenticate('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin);
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login'
    }), users.authCallback);
  app.get('/auth/linkedin',
    passport.authenticate('linkedin', {
      failureRedirect: '/login',
      scope: [
        'r_emailaddress'
      ]
    }), users.signin);
  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
      failureRedirect: '/login'
    }), users.authCallback);

  app.param('userId', users.load);

  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
