import React, { Component } from 'react';
import { ImageBackground, View, Text } from 'react-native';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import { Button } from 'react-native-material-ui';
import Loader from '../../Loader';

const styles = {
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    darken: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: '#000',
      opacity: 0.35
    },
    button: {
      marginTop: 20,
      marginLeft: 15,
      marginRight: 15
    }
};

const { container, darken, button } = styles;

const imgLandingpage = require('../../../images/landingpage_blurred.jpg');

export default class Landingpage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewRef: null,
      loading: true
    };
  }

  componentDidMount() {
    this.getUserInformation();
  }

  getUserInformation() {
    fetch(`${NODE_SERVER_ADRESS}/user/me`, {
      method: 'GET',
      credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(response => {
      if (!response.error) {
        this.setState({ loading: false });
        console.log('logged in');
        response.done ? this.props.navigation.navigate('list') : this.props.navigation.navigate('createP');
      } else {
        this.setState({ loading: false });
        console.log('no token set');
        //this.props.navigation.navigate('register', { response });
      }
    })
    .catch(err => {
      this.setState({ loading: false });
      console.log(err);
    });
  }

  render() {
    return (
      <ImageBackground source={imgLandingpage} style={container}>
        <View style={darken} />
          { this.state.loading ? <Loader /> :
            <View>
              <Text style={{ color: '#fff', fontSize: 25, textAlign: 'center' }}>MEETZ</Text>
              <Button
                primary
                raised
                style={{ container: button }}
                onPress={() => this.props.navigation.navigate('login')}
                text="Login"
              />
              <Button
                primary
                raised
                style={{ container: button }}
                onPress={() => this.props.navigation.navigate('register')}
                text="Register"
              />
            </View>
          }
      </ImageBackground>
    );
  }
}
