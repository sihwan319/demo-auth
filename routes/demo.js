const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('../data/database');

const router = express.Router();

router.get('/', function (req, res) {
  res.render('welcome');
});

router.get('/signup', function (req, res) {

  let sessionInputData = req.session.inputData;

  if(!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: '',
      confirmEmail: '',
      password: ''
    };
  }

  req.session.inputData = null;

  res.render('signup', { inputData: sessionInputData });
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

    req.session.inputData = {
      hasError: true,
      message: 'Invalid data input - Please check your data.',
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword
    };

    req.session.save(function() {
      res.redirect('/signup');
    });
    return;
  }


  const existingUser = await db.getDb().collection('users').findOne({ email: enteredEmail });

  if (existingUser) {
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

  req.session.user = {
    id: existingUser._id,
    email: existingUser.email
  };
  req.session.isAuthenticated = true;
  req.session.save(function () {   //session 정보가 저장된 후에 redirect가 이뤄질 수 있도록 하는 콜백함수.   
    res.redirect('/admin');
  });
});

router.get('/admin', function (req, res) {
  if (!req.session.isAuthenticated) {
    res.status(401).render('401');
  }
  res.render('admin');
});

router.post('/logout', function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;

  res.redirect('/');
});

module.exports = router;