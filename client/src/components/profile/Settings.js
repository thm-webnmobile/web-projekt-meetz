import React, { Component } from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Button, Icon} from 'react-native-material-ui';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import Loader from '../Loader';


class Settings extends Component {
    /* eslint-disable no-undef */
    static navigationOptions = ({ navigation }) => ({
        headerLeft: null,
        headerTitle:
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <TouchableOpacity
                    style={{ width: 28, height: 28 }}
                    onPress={() => navigation.goBack()}
                >
                    <View>
                        <Icon name="arrow-back" size={28} color='#fff' />
                    </View>
                </TouchableOpacity>
            </View>,
        headerStyle: {
            backgroundColor: '#2196F3',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
        },
        headerTintColor: '#fff',
    });

	constructor(props) {
        super(props);
        this.state = {
            loading: false
      };
	}
	
	handleLogout = () => {
		this.setState({ loading: true });
		fetch(`${NODE_SERVER_ADRESS}/user/me/logout`, {
      method: 'GET',
      credentials: 'same-origin'
    })
    .then(res => {
      if (res.status === 201) {
        this.setState({ loading: false });
        console.log('Logged out');
        this.props.navigation.navigate('auth');
      } else {
				this.setState({ loading: false });
				console.log('Something went wrong');
			}
    })
    .catch(err => {
      this.setState({ loading: false });
      console.log(err);
    });
	};

	handleLogoutAll =() => {
    this.setState({ loading: true });
		fetch(`${NODE_SERVER_ADRESS}/user/me/logoutall`, {
      method: 'GET',
      credentials: 'same-origin'
    })
    .then(res => {
      if (res.status === 201) {
        this.setState({ loading: false });
        console.log('Logged out on all devices');
        this.props.navigation.navigate('auth');
      } else {
				this.setState({ loading: false });
				console.log('Something went wrong');
			}
    })
    .catch(err => {
      this.setState({ loading: false });
      console.log(err);
    });
	};

	render() {
    return (
        <View style={{ flex: 1 }}>
				{this.state.loading ? <Loader /> :
                    <View>
                        <Text style={{ textAlign: 'center', marginTop: 25 }}>
                            You can either logout from your current device,
                            or logout from all devices!
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-around',
                                marginTop: 35
                            }}
                        >
                            <Button
                                accent
                                raised
                                onPress={this.handleLogout.bind(this)}
                                text="Logout"
                            />
                            <Button
                                accent
                                raised
                                onPress={this.handleLogout.bind(this)}
                                text="Logout all"
                            />
                        </View>
                    </View>
                }
            </View>
		);
	}
}

export default Settings;
