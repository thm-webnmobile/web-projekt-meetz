import React, { Component } from 'react';
import { View, Image } from 'react-native';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import { Buffer } from 'buffer';
import ImagePicker from 'react-native-image-picker';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import styles from '../authentication/formStyles';


class CreateProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      birthday: '',
      bio: '',
      input: '',
      helper: 'YYYY-MM-DD'
   }
  }

  setAvatar() {
    const options = {
      title: 'Select Avatar',
      //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.uri };
        //const b64 = `data:image/*;base64,' ${response.data}`;
        const buffer = new Buffer(response.data);

        await this.setState({
          avatarURI: source,
          // avatarB64: b64,
          avatarBuffer: buffer,
          imageType: response.type
        });

        // only for testing
        //this.addImageToDB();
      }
    });
  }

  addImageToDB() {
    fetch(`${NODE_SERVER_ADRESS}/profile/image/add`, {
      method: 'POST',
      body: JSON.stringify({
        image: this.state.avatarBuffer,
        type: this.state.imageType
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
        .then(() => console.log('image added to db'))
        //.then(res => res.json())
        //.then(json => console.log('json: ', json))
        .catch(err => console.error('err: ', err));
  }

  handleBirthday() {
    const regEx = /^(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/;
    if (this.state.input.match(regEx)) {
      this.setState({ birthday: new Date(this.state.input) });
      console.log('Date created');
    } else {
      this.setState({ helper: 'Please enter a valid date' });
    }
  }

  handleSubmit() {
    this.setState({ loading: true });
    fetch(`${NODE_SERVER_ADRESS}/profile/create`, {
      method: 'POST',
      body: JSON.stringify({
        create: true,
        name: this.state.name,
        birthday: this.state.birthday,
        bio: this.state.bio }),
      headers: {
          'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        if (res.status !== 400) {
          //res.json().then(r => console.log(r));
          console.log('Profile creation successful');
          if (this.state.avatarBuffer) await this.addImageToDB();
          this.setState({ loading: false });
          this.props.navigation.navigate('list');
        }
      })
      .catch(err => {
        this.setState({ loading: false });
        console.log(err);
      });
  }


  render() {
    return (
      <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      >
        <View style={styles.form}>
          <Image
              style={{
                width: 150,
                height: 150,
                resizeMode: 'contain',
                alignSelf: 'center',
                marginBottom: 25,
                borderRadius: 4
              }}
              source={this.state.avatarURI}
          />
          <TextField
            label="Name"
            value={this.state.name}
            onChangeText={(name) => this.setState({ name: name })}
          />
          <TextField
            label="Birthday"
            title={this.state.helper}
            value={this.state.input}
            keyboardType="numeric"
            onChangeText={(input) => this.setState({ input: input })}
            onBlur={() => this.handleBirthday()}
            onFocus={() => this.setState({ helper: 'YYYY-MM-DD' })}
          />
          <TextField
            label="Bio"
            value={this.state.bio}
            onChangeText={(bio) => this.setState({ bio: bio })}
          />
          <Button
            primary
            raised
            style={{ container: styles.button }}
            onPress={this.setAvatar.bind(this)}
            text="Choose Avatar"
          />
          <View style={styles.formFooter}>
            <Button
              primary
              raised
              style={{ container: styles.button }}
              onPress={this.handleSubmit.bind(this)}
              text="Create"
            />
          </View>
        </View>
      </View>
    );
  }
}

export default CreateProfile;
