import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import { Button } from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import styles from '../formStyles';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      eValid: false,
      password: '',
      pValid: false,
      helperP1: 'At least 8 characters',
      helperP2: '',
      helperE: '',
      match: false,
      error: false
    }
  }

  handleNav() {
    this.props.navigation.navigate('login');
  }

  isValid() {
    if (this.state.eValid && this.state.pValid && this.state.match) { return true }
    else { return false }
  }

  handleEmail() {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!this.state.email.match(regEx)) {
      this.setState({ helperE: 'Please enter a valid email' })
    } else {
      this.setState({ eValid: true })
    }
  }

  handlePassword(input) {
    this.setState({ password: input, match: false })
    if (input.length >= 8) {
      this.setState({ pValid: true })
    } else {
      this.setState({ pValid: false })
    }
  }

  handlePasswordRepeat(input) {
    this.setState({ error: false })
    if (input == '') {
      this.setState({ match: false, helperP2: '' })
    } else if (this.state.password !== input) {
      this.setState({ match: false, helperP2: 'Passwords do not match' });
    } else if (this.state.password === input) {
      this.setState({ match: true, helperP2: '' });
    }
  }

  handleSubmit() {
    if (this.isValid()) {
    fetch(`${NODE_SERVER_ADRESS}/user/create`, {
      method: 'POST',
      body: JSON.stringify({ email: this.state.email, password: this.state.password }),
      headers: {
          'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 400) {
          console.error(res);
        }
        res.text();
      })
      .then(() => {
        console.log('Registration successful');
        this.props.navigation.navigate('createP');
      })
      .catch(err => {
        console.log(err)
      })}
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
        <View style={styles.container}>
          <Button
            style={{ container: styles.topButton }}
            onPress={this.handleNav.bind(this)}
            text="Login"
          />
          <View style={styles.form}>
            <TextField
              label="Email"
              keyboardType="email-address"
              title={this.state.helperE}
              value={this.state.email}
              onChangeText={(email) => this.setState({ email: email })}
              onBlur={() => this.handleEmail()}
              onFocus={() => this.setState({ helperE: '' })}
            />
            <TextField
              label="Password"
              secureTextEntry
              title={this.state.helperP1}
              value={this.state.password}
              onChangeText={(password) => this.handlePassword(password)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              secureTextEntry
              title={this.state.helperP2}
              //error={this.state.error}
              onChangeText={(password) => this.handlePasswordRepeat(password)}
            />
            <View style={styles.formFooter}>
              <Button
                primary
                raised
                style={{ container: styles.button }}
                onPress={this.handleSubmit.bind(this)}
                text="Register"
              />
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Register;
