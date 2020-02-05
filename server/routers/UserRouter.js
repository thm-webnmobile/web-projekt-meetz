const express = require('express');
const User = require('../models/UserModel');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/user/create', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.cookie('token', token, { maxAge: 900000000, httpOnly: true }).send();
    } catch (error) {
        res.status(400).send(error)
    }
});

router.post('/user/login', async (req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken();
        res.cookie('token', token, { maxAge: 900000000, httpOnly: true }).send({ message: 'login successful' })
    } catch (error) {
        res.status(400).send(error)
    }

});

router.get('/user/me', auth, async(req, res) => {
    const user = req.user;
    const done = req.done;
    res.send({ user, done })
});

router.post('/user/password', auth, async (req, res) => {
    const userID = req.user;
    const { password_o, password_n } = req.body;
    let this_user = {};
    try {
        await User.findOne({ profile: userID }, (err, user) => {
            if (err) {
                console.log(err);
                return
            }
            if (!user) {
                res.status(400).send('Invalid user')
            }
            this_user = user;
        });
        const isPasswordMatch = await bcrypt.compare(password_o, this_user.password);
        if (isPasswordMatch) {
            this_user.password = password_n;
            await this_user.save()
        } else {
            res.status(400).send('Invalid password')
        }
        res.status(200).send('Password changed')
    } catch (error) {
        res.status(500).send(error)
    }
});

router.get('/user/me/logout', auth, async (req, res) => {
    // Log user out of the application
    const userID = req.user;
    try {
        await User.findOne({ profile: userID }, (err, data) => {
            if (err) {
                console.log(err);
                return
            }
            data.tokens = data.tokens.filter((token) => {
                return token.token !== req.token
            });
            data.save();
            res.status(201).send("Logged out successfully")
        })
    } catch (error) {
        res.status(500).send(error)
    }
});

router.get('/user/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    const userID = req.user;
    try {
        await User.updateOne({ profile: userID }, { tokens: [] }, (err) => {
            if (err) {
                console.log(err);
                return
              }
            res.status(201).send('Logged out on all devices')
        })
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router;
