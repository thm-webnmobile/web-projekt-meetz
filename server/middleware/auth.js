const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

//Bridge between the database and the application
//For the case of this project, we want to ensure that when a request is sent to the server,
//some code(middleware) is run before the request hits the server and returns a response.
//We want to check if a person who is trying to access a specific resource is authorized to access it.

const auth = async (req, res, next) => {
    // use first line for the token when testing with postman, second for regular use
    //const token = req.header('Authorization').replace('Bearer ', '')
    const token = req.cookies.token;

    if (!token) {
      res.status(401).send({ error: 'No token set: not authorized' });
      return
    }
    console.log(req.body);
        try {
            const data = jwt.verify(token, process.env.JWT_KEY);
            let user;
            if (req.body.create) {
              user = await User.findOne({ _id: data._id, 'tokens.token': token }, 'profile done');
              req.user = user.profile;
            } else {
              user = await User.findOne({ _id: data._id, 'tokens.token': token }, 'profile done').populate('profile', 'name');
              req.user = user.profile._id;
              req.username = user.profile.name;
            }
            if (!user) {
                throw new Error()
            }
            req.done = user.done;
            req.token = token;
            next()
        } catch (error) {
            res.status(401).send({ error: req.body });//'Not authorized to access this resource' })
        }
};

module.exports = auth;
