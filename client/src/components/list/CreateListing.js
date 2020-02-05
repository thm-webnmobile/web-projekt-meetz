import React, { Component } from 'react';
import {View, Text, Alert, Picker, TouchableOpacity} from 'react-native';
import { NODE_SERVER_ADRESS } from 'react-native-dotenv';
import {Button, Icon} from 'react-native-material-ui';
import { TextField } from 'react-native-material-textfield';
import DateTimePicker from '@react-native-community/datetimepicker';

class CreateListing extends Component {
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
      activity: '',
      date_time: new Date(),
      location: '',
      location_name: '',
      description: '',
      type: 0,
      maxMembers: 2,
      mode: 'date',
      show: false,
      errors: {}
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setLocation() {
    this.setState({ location: this.props.navigation.state.params.location });
    this.setState({ location_name: this.props.navigation.state.params.reverse_geoloc_data });
  }

  /* eslint-disable no-undef */
  /* eslint-disable no-unneeded-ternary */
  setDateTime = (event, value) => {
    if (this.state.mode === 'date') {
      console.log('mode: date');
      this.setState({
        show: Platform.OS === 'ios' ? true : false,
        date_time: value
      });
    } else if (this.state.mode === 'time') {
      console.log('mode: time');
      this.setState({
        show: Platform.OS === 'ios' ? true : false
      });
      this.state.date_time.setHours(value.getHours(), value.getMinutes(), value.getSeconds());
    }
    console.log('current state: ', this.state.date_time);
  }

  show = mode => {
    this.setState({
      show: true,
      mode,
    });
  }

  datepicker = () => {
    this.show('date');
  }

  timepicker = () => {
    this.show('time');
  }

  handleSubmit = async () => {
    await this.setLocation();

    if (this.state.activity === '') {
      this.setState({ errors: { activity: 'Activity should not be empty!' } });
      return;
    } else if (this.state.description === '') {
      this.setState({ errors: { description: 'Description should not be empty!' } });
      return;
    } else if (this.state.location === '') {
      this.setState({ errors: { location: 'Location should not be empty!' } });
      return;
    } else if (this.state.location_name === '') {
      this.setState({ errors: { location_name: 'Location_name should not be empty!' } });
      return;
    }

    console.log(this.state);
    fetch(`${NODE_SERVER_ADRESS}/listings/create`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(this.state),
      headers: {
          'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 401) console.error('not authenticated', res);
        if (res.status === 400) console.error('something went wrong', res);
        res.json();
      })
      .then(() => {
        Alert.alert(
          //title
          'Great!',
          //body
          'Meetz successfully created!'
        );
      })
      .then(() => this.props.navigation.navigate('list'))
      .catch(err => {
        this.setState({ loading: false });
        console.error(err);
      });
  }

  /* eslint-enable no-undef */
  /* eslint-enable no-unneeded-ternary */

  render() {
    const { errors = {} } = this.state;
    return (
      <View style={container}>
        <View style={form} onSubmit={this.handleSubmit}>
            <TextField
              label="Activity"
              onChangeText={(activity) => this.setState({ activity: activity })}
              error={errors.activity}
            />
            <View style={buttonGroup}>
              <Button
                raised
                icon={'calendar-plus'}
                iconSet={'MaterialCommunityIcons'}
                style={{ container: formButton }}
                onPress={() => this.show('date')}
                text="Add Date"
              />
              <Button
                raised
                icon={'clock'}
                iconSet={'MaterialCommunityIcons'}
                style={{ container: formButton }}
                onPress={() => this.show('time')}
                text="Add Time"
              />
            </View>
            <Text style={{ textAlign: 'center', margin: 5 }}>
              Date: {this.state.date_time.toLocaleDateString()} {'\n'}
              Time: {this.state.date_time.toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit'
              })}
            </Text>
            { this.state.show &&
              <DateTimePicker
                value={this.state.date_time}
                minimumDate={new Date()}
                mode={this.state.mode}
                is24Hour
                display="default"
                onChange={this.setDateTime}
              />
            }
          <Button
            raised
            icon={'location-on'}
            iconSet={'MaterialIcons'}
            style={{ container: formButton }}
            onPress={() => this.props.navigation.navigate('map')}
            text="Add Location"
          />
          {this.props.navigation.state.params && <Text>
             Location: {'\n'}
             {this.props.navigation.state.params.reverse_geoloc_data}
          </Text>}
          <Text>{errors.location || errors.location_name}</Text>
          <TextField
            label="Description"
            onChangeText={(description) => this.setState({ description: description })}
            error={errors.description}
          />
          <View style={picker}>
            <Text style={pickerLabel}>Type</Text>
            <Picker
              selectedValue={this.state.type}
              style={{ flex: 1 }}
              onValueChange={itemValue => this.setState({ type: itemValue })}
            >
              <Picker.Item label="open" value={0} />
              <Picker.Item label="private" value={1} />
              <Picker.Item label="friends only" value={2} />
            </Picker>
          </View>
          <View style={picker}>
            <Text style={pickerLabel}>Maximum number{'\n'}of participants</Text>
            <Picker
              selectedValue={this.state.maxMembers}
              style={{ flex: 1 }}
              onValueChange={itemValue => this.setState({ maxMembers: itemValue })}
            >
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="6" value="6" />
              <Picker.Item label="7" value="7" />
              <Picker.Item label="8+" value="8" />
            </Picker>
          </View>
          <Text style={msg}>
            {errors.activity || errors.description || errors.date_time}
          </Text>
          <View style={[buttonGroup, { marginTop: 50 }]}>
            <Button
              primary
              raised
              style={{ container: formButton }}
              onPress={this.handleSubmit.bind(this)}
              text="Create"
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center'
  },
  form: {
    flex: 1,
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pickerLabel: {
    width: '55%',
    paddingRight: 25
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  formButton: {
    margin: 5,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center'
  },
  msg: {
    color: 'rgb(213, 0, 0)',
    textAlign: 'center',
    marginTop: 15
  }
};

const { container, form, picker, pickerLabel, buttonGroup, formButton, msg } = styles;

export default CreateListing;
