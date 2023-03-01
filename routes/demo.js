const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('../data/database');

const router = express.Router();

router.get('/', function (req, res) {
  res.render('welcome');
});

router.get('/signup', function (req, res) {
  res.render('signup');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/signup', async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredConfirmEmail = userData['confirm-email'];
  const enteredPassword = userData.password;


  if (!enteredConfirmEmail ||
     !enteredPassword || 
     !enteredEmail || 
     enteredEmail !== enteredConfirmEmail || 
     enteredPassword < 6 ||
    !enteredPassword.includes('@')) {
      console.log('data is wrong!');
      return res.redirect('/signup');
  }

  const existingUser = await db.getDb().collection('users').findOne({ email: enteredEmail });

  if(existingUser) {
    console.log('User is already existing');
    return res.redirect('/signup');
  }

  const hashedPassword = await bcrypt.hash(enteredPassword, 12);



  const user = {
    email: enteredEmail,
    password: hashedPassword
  };

  db.getDb().collection('users').insertOne(user);

  res.redirect('/login');

});

router.post('/login', async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredPassword = userData.password;

  const existingUser = await db.getDb().collection('users').findOne({ email: enteredEmail });

  if (!existingUser) {
    console.log('Could not Login - email wrong');
    return res.redirect('/login');
  }

  isEqualPassword = await bcrypt.compare(enteredPassword, existingUser.password);

  if (!isEqualPassword) {
    console.log('Could not Log in - password wrong');
    return res.redirect('/login');
  }

  console.log('User is authenticated');
  res.redirect('/admin');


});

router.get('/admin', function (req, res) {
  res.render('admin');
});

router.post('/logout', function (req, res) { });

module.exports = router;
