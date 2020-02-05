const User = require('../models/UserModel.js')
const admin = require("firebase-admin");

const serviceAccount = require("../meetz-26943-firebase-adminsdk-4j4b1-901a4b000e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://meetz-26943.firebaseio.com"
});

class Notification {
  constructor() {
    console.log('notification')
  }

  sendNotification = (profileID, title, body) => {
    this.receiveRegistrationToken(profileID).then(registrationToken => {

      const payload = {
        notification: {
          title: title,
          body: body
        }
      };

      console.log(registrationToken, payload);

      admin.messaging().sendToDevice(registrationToken, payload)
      .then(function(response) {
        if (response.results.error) {
          console.log(response.results.error);
        }
        console.log("Successfully sent message:", response);
      })
      .catch(function(error) {
        console.log("Error sending message:", error);
      });
    })
  }

  receiveRegistrationToken = (id) => {
    return User.findOne({ profile: id }).then(user => user.fcmToken)
  }
}

module.exports = new Notification();
