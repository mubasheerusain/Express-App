const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { check, validationResult } = require('express-validator');

const router = express.Router();

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.send('User not found')
            }
            bcrypt
                .compare(password, user.password)
                .then(matched => {
                    if (matched) {
                        res.send('success')
                    }
                    else {
                        res.send('Incorrect Password')
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err)
        });
});

router.post('/signup', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                res.send('User already exist');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const newUser = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    })
                    return newUser.save();
                });
        })
        .then(result => {
            res.send('user added successfully');
        })
        .catch(err => {
            console.log(err)
        });
});

router.get('/logout', (req, res, next) => {
    req.session.destroy(error => {
        req.session = null;
        console.log(error);
        res.send('user successfully logged out.');
    });
});

router.post('/setCookie', (req, res) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save((err) => {
                console.log(err);
                res.send('Cookie have been saved successfully');
            });
        })
        .catch((err) => {
            console.log(err)
        });
});

router.get('/get-cookie', (req, res) => {
    let cookie = req.session.isLoggedIn;
    res.send(cookie);
});

module.exports = router;