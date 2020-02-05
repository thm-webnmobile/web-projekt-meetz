import React, { Component } from 'react';
import {View, Text, Alert, FlatList, ScrollView, TouchableOpacity} from 'react-native';
import Mapbox from '@react-native-mapbox-gl/maps';
import { Icon, Button } from 'react-native-material-ui';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import Loader from '../Loader';

export default class Detail extends Component {
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
      data: props.navigation.state.params.item.item,
      origin: props.navigation.state.params.origin,
      myStatus: 'Empty',
      loading: true
    };
  }

  componentDidMount() {
    if (this.state.origin === 'myListings') this.loadRequests();
    if (this.state.origin === 'list') this.loadStatus();
  }

  loadRequests() {
    fetch(`${NODE_SERVER_ADRESS}/requests`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        listing: this.state.data._id
      })
    })
    .then(res => res.json())
    .then(json => this.setState({ myListingRequests: json }))
    .then(() => this.setState({ loading: false }))
  }

  loadStatus() {
    fetch(`${NODE_SERVER_ADRESS}/requests/myStatus`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        listing: this.state.data._id
      })
    })
    .then(res => res.json())
    .then(json => {
      this.setState({ myStatus: json.msg });
    })
    .then(() => this.setState({ loading: false }))
  }

  submitRequest() {
    fetch(`${NODE_SERVER_ADRESS}/requests/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        listing: this.state.data._id
      })
    })
    .then(res => res.json())
    .then(() => {
      let body = '';
      if (this.state.data.type === 0) {
        body = 'You successfully joined this Meetz!';
        const members = this.state.data.members;
        members.push('me');
        this.setState({ 'data.members': members });
      } else {
        body = 'A request has been sent to the creator.';
      }
      Alert.alert(
        //title
        'Alright!',
        //body
        body
      );
      this.loadStatus();
    });
  }

  handleRequestStatus(status, user) {
    fetch(`${NODE_SERVER_ADRESS}/requests/change`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: user._id,
        listing: this.state.data._id,
        status: status
      })
    })
    .then(res => res.json())
    .then(json => console.log(json))
    // .then(() => this.props.navigation.navigate('detail', {
    //    item: this.state.data, origin: this.state.origin
    //  }))
     .then(() => {
      this.loadRequests();
      if (status === 1) {
        const members = this.state.data.members;
        members.push(user);
        this.setState({ 'data.members': members })
      }
     })
  }

  renderAnnotations(coords) {
    return (
      <Mapbox.PointAnnotation
        key={`pointAnnotationAt${coords}`}
        id={`pointAnnotationAt${coords}`}
        coordinate={coords}
      >
        <View style={annotationContainer}>
          <View style={annotationFill} />
        </View>
        <Mapbox.Callout title="current location" />
      </Mapbox.PointAnnotation>
    );
  }

  renderMembers(item) {
    return (
      <View style={request}>
                <Icon name='person' style={icon} />
                <Text 
                  style={{ marginRight: 'auto' }}
                  onPress={() => this.props.navigation.navigate('profile', { id: this.state.data.members[item.item]._id })}
                >
                  {this.state.data.members[item.item].name}
                </Text>
      </View>
    );
  }

  renderRequests(item) {
    console.log(item);
    const user = this.state.myListingRequests[item.item].user;
    return (
      <View style={request}>
         <Icon name='person' style={icon} />
                <Text 
                  style={{ marginRight: 'auto' }}
                  onPress={() => this.props.navigation.navigate('profile', { id: user._id })}
                >
                  {user.name}
                </Text>
        <Button
          icon={'check'}
          onPress={() => this.handleRequestStatus(1, user)} // 1 -accepted
          text=""
        />
        <Button
          icon={'not-interested'}
          onPress={() => this.handleRequestStatus(2, user)} // 2- declined
          text=""
        />
      </View>
    );
  }

  render() {
    return (
      <ScrollView style={container}>
        { this.state.loading === true ? <Loader /> :
        <View style={container}>
          <View style={map}>
            <Mapbox.MapView
              styleURL={Mapbox.StyleURL.Street}
              style={container}
              zoomEnabled={false}
              scrollEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              {this.renderAnnotations(this.state.data.location.coordinates)}
              <Mapbox.Camera
                 zoomLevel={13}
                 centerCoordinate={this.state.data.location.coordinates}
              />
            </Mapbox.MapView>
          </View>
          <View style={content}>
            <Text style={title}>{this.state.data.activity}</Text>
            <View style={iconText}>
              <Icon name='description' style={icon} />
              <Text>{this.state.data.description}</Text>
            </View>
            <View style={iconText}>
              <Icon name='date-range' style={icon} />
              <Text>
                Date: {new Date(this.state.data.date_time).toLocaleDateString()} {'\n'}
                Time: {new Date(this.state.data.date_time).toLocaleTimeString([], {
                  hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            </View>
            <View style={iconText}>
              <Icon name='location-on' style={icon} />
              <Text>{this.state.data.location_name}</Text>
            </View>
            <View style={iconText}>
              <Icon name='group' style={icon} />
              <Text>
                ({this.state.data.members.length} /
                {this.state.data.maxMembers === 8 ? ' 8+' : ` ${this.state.data.maxMembers}`})
              </Text>
            </View>
            { this.state.origin == 'list'?
            <View style={iconText}>
                <Icon name='person' style={icon} />
                <Text onPress={() => this.props.navigation.navigate('profile', { id: this.state.data.user._id })} >{this.state.data.user.name}</Text>
              </View> : null 
            }
          </View>

          {
            this.state.origin === 'list' && this.state.myStatus === 'Empty' && 
            this.state.data.members.length < this.state.data.maxMembers &&
            <Button
              raised
              primary
              style={{ container: { alignSelf: 'center' } }}
              onPress={() => this.submitRequest()}
              text={this.state.data.type === 0 ? 'Join' : 'Request'}
            />
          }

          {
            this.state.origin === 'myListings' && this.state.data.members.length > 0 &&
            <View style={lists}>
              <Text>Already in:</Text>
              <FlatList
                data={Object.keys(this.state.data.members)}
                renderItem={this.renderMembers.bind(this)}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          }

          {
            this.state.origin === 'myListings' && this.state.myListingRequests.length > 0 &&
            this.state.data.members.length < this.state.data.maxMembers &&
            <View style={lists}>
              <Text>Requests:</Text>
              <FlatList
                data={Object.keys(this.state.myListingRequests)}
                renderItem={this.renderRequests.bind(this)}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          }
        </View>
        }
      </ScrollView>
    );
  }
}

const styles = {
  container: {
    flex: 1
  },
  map: {
    height: 250
  },
  annotationContainer: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15
  },
  annotationFill: {
    width: 15,
    height: 15,
    borderRadius: 15,
    backgroundColor: '#2196F3'
  },
  content: {
    padding: 25
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5
  },
  icon: {
    marginRight: 10
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginRight: 10
  },
  lists: {
    margin: 10
  },
  request: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 5,
    marginTop: 10,
    marginBottom: 10
  }
};

const {
  container, map, annotationContainer, annotationFill,
  content, title, iconText, icon, request, lists
} = styles;
