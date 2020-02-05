import React, { Component } from 'react';
import { View, Text, Alert } from 'react-native';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import Loader from '../../Loader';
import styles from '../formStyles';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      eValid: false,
      password: '',
      pValid: false,
      message: '',
      loading: false
    };
  }

  handleNav() {
    this.props.navigation.navigate('register');
  }

  isValid() {
    if (this.state.eValid /*&& this.state.pValid*/) { return true }
    else { return false }
  }

  handleEmail() {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.state.email.match(regEx)) {
      this.setState({ eValid: true })
    }
  }

  handlePassword() {
    if (input.length >= 8) {
      this.setState({ pValid: true })
    } else {
      this.setState({ pValid: false })
    }
  }

  async handleSubmit() {
    if (this.isValid()) {
    this.setState({ loading: true });
    let status = 0;
    await fetch(`${NODE_SERVER_ADRESS}/user/login`, {
      method: 'POST',
      body: JSON.stringify({ email: this.state.email, password: this.state.password }),
      headers: {
          'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log(res.status);
        status = res.status;
        if (status !== 400) {
          console.log('Login successful');
          fetch(`${NODE_SERVER_ADRESS}/user/me`, {
            method: 'GET',
            credentials: 'same-origin'
          })
          .then(me => me.json())
          .then(response => {
            if (!response.error) {
              response.done ? this.props.navigation.navigate('list') : this.props.navigation.navigate('createP');
            } else {
              console.log('no profile found');
              this.props.navigation.navigate('createP');
            }
            this.setState({ loading: false });
          })
          .catch(err => {
            console.log(err);
            this.setState({ loading: false });
          });
        } else {
          this.setState({ loading: false, message: 'Wrong login credentials!' });
        }
      })
      .catch(err => console.error(err))}
      else {
        Alert.alert('Incorrect input', 'Please review your input.')
      }
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
        { this.state.loading ? <Loader /> :
          <View style={styles.container}>
            <Button
              style={{ container: styles.topButton }}
              onPress={this.handleNav.bind(this)}
              text="Register"
            />
            <View style={styles.form}>
              <TextField
                label="Email"
                keyboardType="email-address"
                onChangeText={(email) => this.setState({ email: email })}
                onBlur={() => this.handleEmail()}
              />
              <TextField
                label="Password"
                secureTextEntry
                onChangeText={(password) => this.setState({ password: password })}
                //onBlur={() => this.handlePassword()}
              />
              <Text style={styles.message}>{this.state.message}</Text>
              <View style={styles.formFooter}>
                <Button
                  primary
                  raised
                  style={{ container: styles.button }}
                  onPress={this.handleSubmit.bind(this)}
                  text="Login"
                />
              </View>
            </View>
          </View> }
        </View>
    );
  }
}

export default Login;
