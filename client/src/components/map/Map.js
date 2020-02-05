import React, { Component } from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {Button, Icon} from 'react-native-material-ui';
import Mapbox from '@react-native-mapbox-gl/maps';
import Geolocation from '@react-native-community/geolocation';
//import RNReverseGeocode from '@kiwicom/react-native-reverse-geocode';
//import Geocoder from 'react-native-geocoding'; // requires Google Maps API Key (1 Year free trial)
import { MAPBOX_ACCESS_TOKEN } from 'react-native-dotenv';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const frankfurt = [
  8.682127, 50.110924
];

export default class Map extends Component {
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
      location: {
        coordinates: frankfurt,
        type: 'Point'
      }
    };
    this.getCoordinates();
  }

  /* eslint-disable no-undef */
  getCoordinates = () => {
    // RNReverseGeocode.searchForLocations(
    //   'mcfit hanau',
    //   {
    //     latitude: this.state.location[0],
    //     longitude: this.state.location[1],
    //     latitudeDelta: 0.01,
    //     longitudeDelta: 0.01
    //   },
    //   (err, res) => {
    //     console.log({
    //       error: err,
    //       addresses: res
    //     });
    //   }
    // );

    Geolocation.getCurrentPosition(coords => {
      this.setState({
        location: {
          coordinates: [coords.coords.longitude, coords.coords.latitude],
          type: 'Point'
        }
      });
    });
  };
  /* eslint-enable no-undef */

  setMarker(data) {
    const geometry = data.geometry;
    const coordinates = geometry.coordinates;
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${MAPBOX_ACCESS_TOKEN}`, {
      type: 'GET'
    })
      .then(res => res.json())
      .then(json => {
        const features = json.features;
        for (let i = 0; i < features.length; i++) {
          if (features[i].place_type[0] === 'address') {
            this.setState({ reverse_geoloc_data: features[i].place_name });
            break;
          } else if (features[i].place_type[0] === 'locality') {
            this.setState({ reverse_geoloc_data: features[i].place_name });
            break;
          }
        }
      });
    this.setState({ location: geometry });
  }

	renderAnnotations(coords) {
		return (
			<Mapbox.PointAnnotation
				key={`pointAnnotationAt${coords}`}
				id={`pointAnnotationAt${coords}`}
				coordinate={coords}
			>
				<View style={styles.annotationContainer}>
					<View style={styles.annotationFill} />
				</View>
				<Mapbox.Callout title="current location" />
			</Mapbox.PointAnnotation>
		);
	}

	render() {
		return (
			<View style={styles.container}>
        {this.state.reverse_geoloc_data &&
          <View style={styles.currentSelection}>
            <Text>
              currentSelection: {'\n'}
              {this.state.reverse_geoloc_data ? this.state.reverse_geoloc_data :
              'No information available'}
            </Text>
            <Button
              raised
              primary
              style={{ container: { marginTop: 5 } }}
              onPress={() => this.props.navigation.navigate('createL', this.state)}
              text="Select"
            />
          </View>
        }
				<Mapbox.MapView
					styleURL={Mapbox.StyleURL.Street}
					style={styles.container}
          onLongPress={this.setMarker.bind(this)}
				>
					{this.renderAnnotations(this.state.location.coordinates)}
          <Mapbox.Camera
             zoomLevel={15}
             centerCoordinate={this.state.location.coordinates}
          />
				</Mapbox.MapView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	map: {
		height: 400,
		marginTop: 80
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
  currentSelection: {
    flex: 1,
    position: 'absolute',
    bottom: 15,
    right: 15,
    zIndex: 99,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 20,
    borderRadius: 20
  }
});
