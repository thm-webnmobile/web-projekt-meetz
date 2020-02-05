import React, { Component } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import {
    ListItem,
    ActionButton, Icon
} from 'react-native-material-ui'; // ActionButton UNSAFE_componentWillUpdate used
import Loader from '../Loader';

class MyListing extends Component {
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
      listings: '',
      loading: true,
      color: '#fff'
    };
  }

  componentDidMount() {
    this.load();
  }

  load() {
    fetch(`${NODE_SERVER_ADRESS}/listings/my`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(res => res.json())
    .then(json => this.setState({ listings: json }))
    .then(() => this.setState({ loading: false }))
    .catch(err => {
      this.setState({ loading: false });
      console.log(err);
    });
  }

  // receiveStatus(value) {
  //   switch (value) {
  //     case 0:
  //       return <Text style={{ color: 'green' }}>Open</Text>;
  //     case 1:
  //       return <Text style={{ color: 'orange' }}>Privat</Text>;
  //     case 2:
  //       return <Text style={{ color: 'red' }}>Friends only'</Text>;
  //     default:
  //       break;
  //   }
  // }

    calculateDaysTilEvent(date) {
        const difference = +new Date(date) - +new Date();
        const parts = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24)
        };
        return Object.keys(parts)
            .map((part) => {
                // eslint-disable-next-line array-callback-return
                if (!parts[part]) return;
                return `${parts[part]} ${part}`;
            })
            .join(' ');
    }

  renderItem(item) {
    const date = new Date(item.item.date_time);
    let bgColor = '#fff';
    let disabled = false;
    if (item.item.type === 2) {
      bgColor = 'lightgrey';
      disabled = true; // TODO: check if users are friends
    }
    const members = (
      <Text>
          {item.item.members.length} /
          {item.item.maxMembers === 8 ? ' 8+' : ` ${item.item.maxMembers}`}
      </Text>
    )
    const requests = item.item.requests.filter(el => {
      if (el.status == 0) return el
    }).length;
    return (
      <ListItem
        divider
        style={{ container: { backgroundColor: bgColor } }}
        // CAUTION: prop 'disabled' added manually in react-native-material-ui
        disabled={disabled}
        onPress={
          () => this.props.navigation.navigate('detail', { item: item, origin: 'myListings' })
        }
        centerElement={{
            primaryText: item.item.activity,
            secondaryText: `Meetz in ${this.calculateDaysTilEvent(date, new Date())}`
        }}
        rightElement={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ marginLeft: 5, marginRight: 5 }}>{members}</Text>
            {requests > 0 ? <Text
                style={{
                    height: 25,
                    width: 25,
                    backgroundColor: '#e54b4d',
                    borderRadius: 50,
                    paddingTop: 2,
                    textAlign: 'center',
                    marginLeft: 5,
                    marginRight: 5,
                    color: 'white'
                  }}
            >
              {requests}
            </Text> : <View style={{ width: 25, marginLeft: 5 }}/>}
          </View>
        }
        style={{ leftElementContainer: { width: 'auto' } }}
      />
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <NavigationEvents
          onDidFocus={() => this.load()}
        />
        { this.state.loading === true ? <Loader /> :
          <FlatList
            data={this.state.listings}
            initialNumToRender={10}
            renderItem={this.renderItem.bind(this)}
            keyExtractor={(item, index) => index.toString()}
          />
        }
        <ActionButton
            onPress={() => this.props.navigation.navigate('createL')}
        />
      </View>
    );
  }
}

export default MyListing;