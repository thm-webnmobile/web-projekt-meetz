const express = require('express')
const Request = require('../models/RequestModel')
const Listing = require('../models/ListingModel')
const Notification = require('../services/Notification')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/requests/create', auth, async (req, res) => {
  // Create request if listing status privat
  const userID = req.user
  const listing = req.body.listing
    try {
      Listing.findOne({ _id: listing }).exec( async (err, listing) => {
        if(err) res.status(400).send(err);
        if (listing.type == 0) {
          if (listing.members.length < listing.maxMembers) {
            await listing.members.push(userID);
            await listing.save()
            Notification.sendNotification(listing.user, 'New Member!', req.username + ' joined your meetz!')
            if (listing.members.length == listing.maxMembers) Notification.sendNotification(listing.user, 'Full Meetz!', 'Your meetz ' + listing.activity + ' has filled up! :)');
            res.status(200).send({ message: 'Successfully added to members!'})
          } else {
            res.status(200).send({ message: 'Sorry, this Meetz is already full...'})
          }
        } else {
          await listing.requests.push({ user: userID });
          await listing.save()
          Notification.sendNotification(listing.user, 'Request received!', req.username + ' requested to join your meetz!')
          res.status(200).send({ message: 'Successfully requested to join!'})
        }
      })
    } catch (error) {
      res.status(400).send(error)
    }
  }
)

router.post('/requests', auth, (req, res) => {
  const listing = req.body.listing
  try {
    Listing.findOne({ _id: listing }, 'requests').map(listing => {
      const requests = listing.requests.map(request => {
        if (request.status == 0) return request
      })
      return requests.filter(el => {
        return el != null
      })
    })
    .populate('requests.user', 'name avatar').exec((err, requests) => {
      res.status(200).send(requests)
    })
  } catch (error) {
    res.status(404).send(error)
  }
})

router.post('/requests/myStatus', auth, (req, res) => {
  const userID = req.user
  const listing = req.body.listing
  try {
      Listing.findOne({ _id: listing }).then(listing => {
        if (listing.members.includes(userID)) {
          res.status(200).send({ msg: 'Joined' })
        } else if (listing.requests.some(request => request.user.toString() === userID.toString())) {
          res.status(200).send({ msg: 'Requested' })
        } else {
          res.status(200).send({ msg: 'Empty' })
        }
    })
  } catch (error) {
    res.status(404).send(error)
  }
})

router.post('/requests/change', auth, async (req, res) => {
  const user = req.body.user
  const listing = req.body.listing
  const status = req.body.status
  try {
    Listing.findOne({ _id: listing }, 'requests members maxMembers').exec( async (err, listing) => {
      if(err) res.status(400).send(err);
      if (listing.members.length >= listing.maxMembers) res.status(200).send({ message: 'Whoops, your meetz is full already.'});
      const updatedRequests = listing.requests.map(request => {
        if (request.user.toString() === user.toString()) {
          request.status = status
        }
        return request
      })
      listing.requests = updatedRequests
      if (status === 1 && listing.members.length < listing.maxMembers) {
        listing.members.push(user);
        Notification.sendNotification(user, 'Request accepted!', req.username + ' accepted your request and you were added to their meetz!')
      }
      if (status === 2) {
        Notification.sendNotification(user, 'Request declined!', req.username + ' sadly declined your request...')
      }
      await listing.save()
      res.status(200).send({ message: 'Successfully changed request status, with status: ' + status + '!'})
    })
  } catch (error) {
    res.status(404).send(error)
  }
})


/* DOESN'T WORK

TESTING CODE FOR MONGODB ATLAS CONSOLE

const mongodb = context.services.get("meets");
const requests = mongodb.db("meets").collection("requests");
const changeEvent = requests.updateOne({ _id: BSON.ObjectId("5dfe252ea8fe9f1f9cf45750") }, { $set: { status: 1 } }, function(err, res) { console.log('updated')});

exports(changeEvent);


FUNCTION

exports = async function (changeEvent) {
  // Destructure out fields from the change stream event object
  const { updateDescription, fullDocument } = changeEvent;

  if(updateDescription) {

    // Check if the shippingLocation field was updated
    const updatedFields = Object.keys(updateDescription.updatedFields);
    const isNewStatus = updatedFields.some(field =>
      field.match(/status/)
    );

    // If the location changed, text the customer the updated location.
    if (isNewStatus) {
      const { status, userB, listing } = fullDocument;
      if(status === 1) {
        const mongodb = context.services.get("meets");
        const listings = mongodb.db("meets").collection("listings");

        const query = { _id: BSON.ObjectId(listing) };
        const newValue = { $push: { members: BSON.ObjectId(userB) } };

        const updated = await listings.updateOne(query, newValue, (err, res) => {
          if (err) console.log('error: ', res);
          console.log('document updated: ', res);
        });

        return updated;
      }
    }
  }
}

return listings.findOne(query).exec(function(error, result) {
          result.members.push(BSON.ObjectId(userB));
          result.save();
        });

*/

module.exports = router
