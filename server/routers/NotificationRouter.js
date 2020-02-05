const express = require('express')
const User = require('../models/UserModel.js')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/notifications/saveToken', auth, async (req, res) => {
    // save fcmToken to database

    const userID = req.user;
    const fcmToken = req.body.fcmToken;
    try {
        await User.updateOne({ profile: userID }, { $set: { fcmToken: fcmToken }}, (err) => {
  				if (err) {
  					console.log(err)
  					return
          }
        })
        res.status(201).send({ message: 'token successfully added to the db!' })
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router
