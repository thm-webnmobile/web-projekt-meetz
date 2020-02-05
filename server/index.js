const express = require('express');
const pino = require('express-pino-logger')();
const cookieParser = require('cookie-parser');

require('dotenv').config();

const userRouter = require('./routers/UserRouter');
const listingRouter = require('./routers/ListingRouter');
const profileRouter = require('./routers/ProfileRouter');
const requestRouter = require('./routers/RequestRouter');
const notificationRouter = require('./routers/NotificationRouter');

const PORT = process.env.PORT;

require('./db/db');

const app = express();
//app.use(bodyParser.urlencoded({ extended: false }));
// --> bodyParser causes error ?!
app.use(pino);
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use(userRouter);
app.use(listingRouter);
app.use(profileRouter);
app.use(requestRouter);
app.use(notificationRouter);

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);
