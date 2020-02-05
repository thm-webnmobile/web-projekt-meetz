const express = require('express');
const fs = require('fs');
const Profile = require('../models/ProfileModel');
const User = require('../models/UserModel');
const Image = require('../models/ImageModel');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/profile/edit', auth, async (req, res) => {
	// Edit a profile
	// receive cookie/token
	const userID = req.user;
	const updatedBio = req.body.bio;
	console.log(userID, req.body);
	try {
			await Profile.updateOne({ _id: userID }, { bio: updatedBio }, (err) => {
				if (err) {
					console.log(err);
					return
		  		}
				res.status(201).send('Bio updated')
			})
	} catch (error) {
			res.status(400).send(error)
	}
});

router.post('/profile/create', auth, async (req, res) => {
	// Create a new profile
	// receive cookie/token
	const userID = req.user;
	console.log(userID, req.body);
	try {
			const profile = new Profile(req.body);
			profile._id = userID;
			await profile.save();
			await User.updateOne({ profile: userID }, { done: true }, (err) => {
				if (err) {
					console.log(err);
					return
		  		}
				res.status(201).send(profile + '\n User is done')
			})
	} catch (error) {
			res.status(400).send(error)
	}
});

router.get('/profile/me', auth, async(req, res) => {
	// View my user profile
	const userID = req.user;
	try {
		await Profile.findOne({ _id: userID }, async (err, data) => {
			if (err) {
				console.log(err);
				return
			}
			if (data.avatar) {
				await Image.findOne({ _id: data.avatar }, async (err, avatar) => {
					if (err) {
						console.log(err);
						return
					}
					res.status(200).json({
						profile: data,
						avatar: avatar.image.data,
						type: avatar.image.contentType
					});
				});
			} else {
				res.status(200).json(data);
			}
		})
	} catch (error) {
		res.status(400).send(error)
	}
});

router.post('/profile/get', auth, async(req, res) => {
	//Get name of user ID
	const userID = req.body.id;
try {
	await Profile.findOne({ _id: userID }, async (err, data) => {
		if (err) {
			console.log(err);
			return
		}
		if (data.avatar) {
			await Image.findOne({ _id: data.avatar }, async (err, avatar) => {
				if (err) {
					console.log(err);
					return
				}
				res.status(200).json({
					profile: data,
					avatar: avatar.image.data,
					type: avatar.image.contentType
				});
			});
		} else {
			res.status(200).json(data);
		}
	})
	} catch (error) {
		res.status(400).send(error)
	}
});

router.post('/profile/image/add', auth, async(req, res) => {
	const userID =  req.user;
	const buffer = req.body.image;
	const type = req.body.type;

	try {
		const img = new Image;
		img.image.data = buffer;
		img.image.contentType = type;
		await img.save();
		await Profile.findOne({ _id: userID }, (err, profile) => {
			if (err) {
				console.log(err);
				return
			}
			if (!profile.avatar) {
				profile.avatar = img._id
			}
			profile.images.push(img._id);
			profile.save();
			res.status(200).send(img);
		})
	} catch (error) {
		res.status(400).send(error)
	}
});

router.post('/profile/image/remove', auth, async(req, res) => {
  //TODO
  user.profile = mongoose.Types.ObjectId()
});

router.post('/profile/image/avatar', auth, async(req, res) => {
	const userID = req.user;
	const index = req.body.index;
	let image;
	try {
		await Profile.findOne({ _id: userID }, 'images', (err, data) => {
			if (err) {
				console.log(err);
				return
			}
			image = data[index];
			console.log(image)
		});
		await Profile.updateOne({ _id: userID }, { avatar: image }, (err) => {
			if (err) {
				console.log(err);
				return
			}
			res.status(200).send()
		})
	} catch (error) {
		res.status(400).send(error)
	}
});

module.exports = router;
