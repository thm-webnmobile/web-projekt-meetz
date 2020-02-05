import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Landingpage from './src/components/authentication/landingpage/Landingpage';
import Register from './src/components/authentication/register/Register';
import Login from './src/components/authentication/login/Login';
import List from './src/components/list/List';
import CreateListing from './src/components/list/CreateListing';
import MyListings from './src/components/list/MyListings';
import Map from './src/components/map/Map';
import Profile from './src/components/profile/Profile';
import Detail from './src/components/list/Detail';
import CreateProfile from './src/components/profile/CreateProfile';
//import EditProfile from './profile/EditProfile';
import Me from './src/components/profile/Me';
// import About from "./About";
import Settings from './src/components/profile/Settings';

const AppNavigator = createStackNavigator({
   landingpage: {
     screen: Landingpage,
     navigationOptions: {
       header: null
     }
    },
   register: { screen: Register },
   login: { screen: Login },
   list: { screen: List },
});

const AppStack = createStackNavigator({
   list: {
     screen: List
   },
   createL: { screen: CreateListing },
   myListings: { screen: MyListings },
   map: {
     screen: Map,
     // navigationOptions: {
     //   header: null
     // }
   },
   profile: { screen: Profile },
   // about: { screen: About },
   // logout: { screen: Login },
   detail: { screen: Detail },
  //  editP: {
  //    screen: EditProfile,
  //    navigationOptions: {
  //      header: null
  //    }
  //   },
    me: { screen: Me },
    settings: { screen: Settings }
});

const AuthStack = createStackNavigator({
  landingpage: {
    screen: Landingpage,
    navigationOptions: {
      header: null
    }
   },
  register: {
    screen: Register,
    navigationOptions: {
      header: null
    }
  },
  login: {
    screen: Login,
    navigationOptions: {
      header: null
    }
  }
});

const AppContainer = createAppContainer(
  createSwitchNavigator({
    auth: { screen: AuthStack },
    createP: {
      screen: CreateProfile,
      navigationOptions: {
        header: null
      }
     },
     app: { screen: AppStack }
  },
  {
    initialRouteName: 'auth'
  })
);

export default class App extends Component {
  render() {
    return (
      <AppContainer />
    );
  }
}
