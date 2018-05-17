import React, { Component } from 'react';
import mush_logo from './img/logo_mycotronics.png';
import './App.css';
import * as firebase from 'firebase';
import Chart from './Components/Chart';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var time = 0;

var color_sliders = {
  background: "#fff",
  padding: 10,
  marginLeft: 30,
  width: 200,
  alignItem: 'center'
}

var img_style = {
  margin: 20,
  alignContent: 'center'
}

const marks = {
  5: <strong>5°C</strong>,
  10: '10°C',
  20: '20°C',
  30: '30°C',
  40: '40°C',
  50: '50°C',
  60: {
    style: {
      color: 'red',
    },
    label: <strong>60°C</strong>,
  },
};

const marks_hum = {
  5: <strong>5%</strong>,
  20: '20%',
  40: '40%',
  60: '60%',
  80: '80%',
  95: {
    style: {
      color: 'red',
    },
    label: <strong>95%</strong>,
  },
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      database: null,
      chartData: {},
      pic: null,
      data: null,
      tmp_time: 0,
      hum_time: 0,
      tmp: 0,
      hum: 0,
      r_val: 0,
      g_val: 0,
      b_val: 0,
    }
  }

  componentWillMount() {
 /*    this.getChartData(); */
    this.initFirebase();
    this.getData();
    this.getChartData();
  }

  async initFirebase() {
    var config = {
      apiKey: "AIzaSyBNM8ll5KyDln9H5z7NCBPT71DgbLHuMi4",
      authDomain: "stanford-boxes.firebaseapp.com",
      databaseURL: "https://stanford-boxes.firebaseio.com",
      projectId: "stanford-boxes",
      storageBucket: "stanford-boxes.appspot.com",
      messagingSenderId: "39698682805"
    };
    firebase.initializeApp(config);
    const database = await firebase.database();
    this.setState({ database })
    console.log('initialized firebase')
  }

  change_val = (val, name) => {
    if (this.state.database)
      this.state.database.ref(`configs/default/${name}`).set(val); 
  }

  getData = async () => {
    var curr_temp = 0;
    var curr_hum = 0;
    var curr_pic = 0;
    var database = await firebase.database();
    this.setState({ database })
    var box_temp = await database.ref("data/myco-prototype/temperature");
    var box_humid = await database.ref("data/myco-prototype/humidity");
    var box_pic = await database.ref("data/myco-prototype/camera_bottom");

    const snapshot_pic = (data) => {
      curr_pic = data.val();
      var key = Object.keys(curr_pic);
      this.setState({
        pic: curr_pic[key],
      })
    };

    const snapshot_temp = (data) => {
      curr_temp = data.val();
      var key = Object.keys(curr_temp);
      this.setState({
        tmp: curr_temp[key].toFixed(2),
        tmp_time: data.key
      });
    }

    const snapshot_hum = (data) => {
      curr_hum = data.val();
      var key = Object.keys(curr_hum);
      this.setState({
        hum: curr_hum[key].toFixed(2),
        hum_time: data.key,
      });
    }
    box_temp.limitToLast(1).on('child_added', snapshot_temp);
    box_humid.limitToLast(1).on('child_added', snapshot_hum);
    box_pic.limitToLast(1).on('child_added', snapshot_pic);
  }

  getChartData = async () => {
    //ajax call here
    console.log(this.state.tmp)
    this.setState({
      chartData: {
        labels: ['1', '2'],
        datasets:[
            {
                data: [this.state.tmp]
            }
        ],
        backgroundColor: "rgba(255,0,144,0)",
        }
    });
  }
 
  
  render() {
    //console.log(this.state.chartData)
    console.log(this.state.tmp);
    return (
      <div className="App">
        <header className="App-header">
          <img src={mush_logo} className="App-logo" alt="logo" />
          <div className="brand">mycotronics</div>
          <hr className="line" />
          <h1 className="App-title">- Smart Incubator -</h1>
        </header>
        <div className="atmos_sliders">
        <div style={{alignContent: 'left'}} >SET TEMPERATURE</div>
          <Slider
          min={5}
          max={60}
          defaultValue={30}
          marks={marks}
          onChange={(val) => this.change_val(val, "setTemperature")}  
          />
        </div>
        <div className="atmos_sliders">
        SET HUMIDITY
          <Slider
          min={5}
          max={95}
          defaultValue={70}
          marks={marks_hum}
          onChange={(val) => this.change_val(val, "setHumidity")}  
          />
        </div>
        <div>
        <img style={img_style} src={this.state.pic} alt="camera" />
        </div>
        <div style={color_sliders}>
          <Slider
          min={0}
          max={255}
          defaultValue={200}
          onChange={(val) => this.change_val(val, "lightR")}
          trackStyle={{ backgroundColor: 'red' }}
          handleStyle={{
            borderColor: 'red',
            backgroundColor: 'red'
          }}          
          />
        </div>
        <div style={color_sliders}>
          <Slider 
          min={0}
          max={255}
          defaultValue={200}
          onChange={(val) => this.change_val(val, "lightG")}
          trackStyle={{ backgroundColor: 'green' }}
          handleStyle={{
            borderColor: 'green',
            backgroundColor: 'green'
          }}
          />
        </div>
        <div style={color_sliders}>
          <Slider
          min={0}
          max={255}
          defaultValue={200}
          onChange={(val) => this.change_val(val, "lightB")} 
          trackStyle={{ backgroundColor: 'blue' }}
          handleStyle={{
            borderColor: 'blue',
            backgroundColor: 'blue'
          }}
          />
        </div>
        <div style={{margin: 10, padding: 10}}>
        Current Temperature: {this.state.tmp}°C / Current Humidity: {this.state.hum}%
        </div>
        <Chart chartData={this.state.chartData} />
        <Chart chartData={this.state.chartData} />
      </div>
  
    );
  }
}

export default App;
