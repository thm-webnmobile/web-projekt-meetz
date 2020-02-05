const express = require('express');
const Listing = require('../models/ListingModel');
const auth = require('../middleware/auth');

const router = express.Router();

const kmToRadian = function(km) {
  const earthRadiusInKM = 6371;
  return km / earthRadiusInKM;
};

router.post('/listings', auth, async (req, res) => {
  const userID = req.user;
  const currentPos = [req.body.longitude, req.body.latitude];
  const radius = req.body.radius;
  let filter = { $in: [0,1,2] };

  if(req.body.filter) {
    if(req.body.filter != 'all') {
      filter = req.body.filter
    }
  }

  let query = {
    location: { $geoWithin: { $centerSphere : [ currentPos, kmToRadian(radius)] } },
    user: { $ne: userID },
    type: filter,
    //select: '-requests'
  };

  // receive listings
  try {
    Listing.find(query)
    .populate([{
        path: 'user',
        model: 'Profile',
        select: 'name avatar',
        populate: {
            path: 'avatar',
            model:'Image',
            select: 'image'
        }
    }])
    .exec((err, data) => {
        if (err) {
            console.log(err);
            return
        }
        res.status(200).json(data);
    })
  } catch (error) {
      res.status(400).send(error)
  }
});

router.post('/listings/create', auth, async (req, res) => {
    // Create a new listings

    const userID = req.user;
    req.body['user'] = userID;
    req.body['location'] = { type: 'Point', coordinates: [parseFloat(req.body.location.coordinates[0]), parseFloat(req.body.location.coordinates[1])] };
    try {
        const listing = new Listing(req.body);
        await listing.members.push(userID);
        await listing.save();
        res.status(201).send({ listing })
    } catch (error) {
        res.status(400).send(error)
    }
});

router.get('/listings/my', auth, async (req, res) => {
  // receive my Listings

  const userID = req.user;
  try {
    Listing.find({ user: userID }).populate('user', 'name').populate('members', 'name').exec((err, listings) => {
      if (err) res.status(400).send(err);
      console.log(listings);
      res.status(200).json(listings)
    })
  } catch (error) {
    res.status(400).send(error)
  }
});

module.exports = router;
