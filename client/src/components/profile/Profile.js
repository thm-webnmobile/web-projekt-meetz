import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-material-ui';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import Loader from '../Loader';


class Profile extends Component {
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
		  backgroundColor: '#2196F3'
		}
	  });


	constructor(props) {
		super(props);
		this.state = {
			id: props.navigation.state.params.id,
			loading: true,
			profile: {
				profile: {},
				avatar: {},
				avatarB64: ''
		}
    	};
	}

	componentDidMount() {
		this.fetchProfile();
	}

	bufferToBase64(buf) {
		const binstr = Array.prototype.map.call(buf, (ch) => String.fromCharCode(ch)).join('');
		return btoa(binstr);
	}

	/* eslint-disable no-undef */
	getAge = (birthDate) => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10);

  	fetchProfile = () => {
			fetch(`${NODE_SERVER_ADRESS}/profile/get`, {
				method: 'POST',
				headers: {
          'Content-Type': 'application/json'
      	},
				body: JSON.stringify({ id: this.state.id }),
				credentials: 'same-origin'
			})
			.then(res => res.json())
			.then(response => {
				if (!response.error) {
					Object.assign(
							response, { avatar: `data:${response.type};base64,${
											atob(this.bufferToBase64(response.avatar.data))
									}` }
					);
					return response;
			}
		})
    .then(adjustedData => this.setState({ profile: adjustedData, loading: false }))
		.catch(err => {
			this.setState({ loading: false });
				console.log(err);
			});
  };

	render() {
		return (
			<View style={{ flex: 1 }}>
				{this.state.loading === true ? <Loader /> :
					<View style={{ flex: 1 }}>
						<View
							style={{
								backgroundColor: '#F5F5F5',
								shadowColor: '#000',
								shadowOffset: {
									width: 0,
									height: 3,
								},
								shadowOpacity: 0.27,
								shadowRadius: 4.65,

								elevation: 6
							}}
						>
							<Image
								style={{
									width: '100%',
									height: 250,
									resizeMode: 'contain'
								}}
								source={{ uri: this.state.profile.avatar }}
							/>
						</View>
						<View style={{ padding: 25 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
								<Text style={{ fontSize: 25, fontWeight: 'bold', marginRight: 10 }}>
									{this.state.profile.profile.name}
								</Text>
								<Text style={{ fontSize: 20, fontWeight: 'bold' }}>
									({this.getAge(this.state.profile.profile.birthday)} yrs.)
								</Text>
							</View>
							<Text>{this.state.profile.profile.bio}</Text>
						</View>
					</View>
				}
			</View>
		);
	}
}

export default Profile;
