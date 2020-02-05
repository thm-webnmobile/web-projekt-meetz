import React, { Component } from 'react';
import {
  View,
  FlatList,
  Text,
  Alert,
  Picker,
  StatusBar,
  TouchableOpacity,
  Image
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import {
  ListItem,
  ActionButton,
  Icon
} from 'react-native-material-ui'; // ActionButton UNSAFE_componentWillUpdate used
import Geolocation from '@react-native-community/geolocation';
import Slider from '@react-native-community/slider';
import firebase from 'react-native-firebase';
import Loader from '../Loader';

export default class List extends Component {
  /* eslint-disable no-undef */
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
     return {
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
            onPress={() => navigation.navigate('me')}
          >
            <View>
              <Icon name="person" size={28} color='#fff' />
            </View>
          </TouchableOpacity>
          <Picker
            selectedValue={params.filter}
            style={{ color: '#fff', height: 50, width: 120 }}
            pickerTextEllipsisLen={300}
            onValueChange={(itemValue) =>
              params.changeState(itemValue)
            }
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Public" value="0" />
            <Picker.Item label="Private" value="1" />
            <Picker.Item label="Friends only" value="2" />
          </Picker>
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
    };
  };

  /* eslint-enable no-undef */

  constructor(props) {
    super(props);
    this.state = {
      listings: '',
      radius: 20,
      loading: true,
      color: '#fff',
      filter: 0
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({
      changeState: (value) => this.changeState(value),
      filter: this.state.filter
    });

    this._navListener = this.props.navigation.addListener('didFocus', () => {
      this.setState({ filter: 'all' });
    });

    Geolocation.getCurrentPosition(obj => {
      const longitude = obj.coords.longitude;
      const latitude = obj.coords.latitude;
      this.setState({
        long: longitude,
        lat: latitude
      });
      // unneccessary call in produciton
      this.load(longitude, latitude, this.state.radius, this.state.filter);
      this._mounted = true;
    });
    this.checkPermission();
    this.messageListener();
  }

  /* eslint-disable no-undef */
  getFcmToken = async () => {
    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      //console.log('TOKEN: ', fcmToken);
      this.saveFCMTokenToDB(fcmToken);
    } else {
      this.showAlert('Failed', 'No token received');
    }
  };

  /* eslint-disable react/sort-comp */
  saveFCMTokenToDB = async (fcmToken) => {
    fetch(`${NODE_SERVER_ADRESS}/notifications/saveToken`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fcmToken: fcmToken })
    })
    .then(res => res.json());
    //.then(json => console.log(json));
  };
  /* eslint-enable react/sort-comp */

  checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
        const fcmToken = this.getFcmToken();
    } else {
        this.requestPermission();
    }
  };

  requestPermission = async () => {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
    } catch (error) {
        // User has rejected permissions
    }
  };

  messageListener = async () => {
    this.notificationListener = firebase.notifications().onNotification((notification) => {
        const { title, body } = notification;
        this.showAlert(title, body);
    });

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened(
      (notificationOpen) => {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
    });

    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
    }

    this.messageListener = firebase.messaging().onMessage((message) => {
      console.log(JSON.stringify(message));
    });
  }

  changeState(value) {
    this.setState({ filter: value, loading: true });
    this.props.navigation.setParams({
      filter: value
    });

    this.load(this.state.long, this.state.lat, this.state.radius, value);
  }

  showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

  load(longitude, latitude, radius, filter) {
    this.setState({ loading: true });
    fetch(`${NODE_SERVER_ADRESS}/listings`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        longitude: longitude,
        latitude: latitude,
        radius: radius,
        filter: filter
      })
    })
       // .then(() => console.log('done loading'))
    .then(res => res.json())
    .then(json => {
      json.forEach((listing) => {
        Object.assign(
            listing.user, { avatar: `data:${listing.user.avatar.image.contentType};base64,${
                                atob(this.bufferToBase64(listing.user.avatar.image.data.data))
                              }` }
        );
      }, this);
      return json;
    })
    .then(adjustedListings => this.setState({ listings: adjustedListings }))
    .then(() => this.setState({ loading: false }))
    .catch(err => {
      this.setState({ loading: false });
      console.log(err);
    });
  }

  bufferToBase64(buf) {
    const binstr = Array.prototype.map.call(buf, (ch) => String.fromCharCode(ch)).join('');
    return btoa(binstr);
  }

  receiveStatus(value) {
    switch (value) {
      case 0:
        return { color: '#90DD8F', text: 'PUBLIC' };
      case 1:
        return { color: '#DDBB8F', text: 'PRIVATE' };
      case 2:
        return { color: '#DD8F8F', text: 'FRIENDS' };
      default:
        break;
    }
  }

  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
      (Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      (Math.sin(dLon / 2) * Math.sin(dLon / 2)))
      ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  renderItem(item) {
    const date = new Date(item.item.date_time);
    let bgColor = '#fff';
    let disabled = false;
    if (item.item.type === 2) {
      bgColor = 'lightgrey';
      disabled = true; // TODO: check if users are friends
    }
    const status = this.receiveStatus(item.item.type);
    return (
      <ListItem
        divider
        style={{ container: { backgroundColor: bgColor } }}
        // CAUTION: prop 'disabled' added manually in react-native-material-ui
        disabled={disabled}
        onPress={() => this.props.navigation.navigate('detail', { item: item, origin: 'list' })}
        centerElement={{
          primaryText: item.item.activity,
          secondaryText: item.item.description,
          tertiaryText: `${date.toLocaleDateString()}  ${date.toLocaleTimeString(
                                                        [], { hour: '2-digit', minute: '2-digit' }
                                                       )}`
                        + `${'\n'} ${this.getDistanceFromLatLonInKm(
                            this.state.lat,
                            this.state.long,
                            item.item.location.coordinates[1],
                            item.item.location.coordinates[0]
                        ).toFixed(0)}km away`
        }}
        leftElement={
          <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 25
              }}
              source={{ uri: item.item.user.avatar }}
          />
        }
        rightElement={
          <View
              style={{
                backgroundColor: status.color,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 7,
                marginRight: 15,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,

                elevation: 3,
              }}
          >
            <Text>{status.text}</Text>
          </View>
        }
      />
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
      <StatusBar backgroundColor='#2196F3' />
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <Text>{this.state.radius} km </Text>
          <Slider
            style={{ width: 250, height: 40 }}
            minimumTrackTintColor='#2196F3'
            thumbTintColor='#2196F3'
            minimumValue={10}
            maximumValue={100}
            step={10}
            value={this.state.radius}
            onValueChange={(radius) => this.setState({ radius: radius, loading: true })}
            onSlidingComplete={
              (radius) => this.load(this.state.long, this.state.lat, radius, this.state.filter)
            }
          />

        </View>
        <NavigationEvents
          onDidFocus={
            () => {
              if (this._mounted) {
                this.load(this.state.long, this.state.lat, this.state.radius, this.state.filter);
              }
            }
          }
        />
        { this.state.loading === true ? <Loader /> :
          <FlatList
            data={this.state.listings}
            initialNumToRender={10}
            renderItem={this.renderItem.bind(this)}
            refreshing={this.state.loading}
            onRefresh={
              () => this.load(this.state.long, this.state.lat, this.state.radius, this.state.filter)
            }
            keyExtractor={(item, index) => index.toString()}
          />
        }
        <ActionButton
          onPress={() => this.props.navigation.navigate('createL')}
          style={{ container: { backgroundColor: '#e54b4d' } }}
        />
      </View>
    );
  }
}
