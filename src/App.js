import React, { Component } from 'react';
import mush_logo from './img/logo_mycotronics.png';
import './App.css';
import * as firebase from 'firebase';
import Chart from './Components/Chart';
import ReactChartkick, { LineChart } from 'react-chartkick'
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var dataHours = 2;
var boxName = "myco-prototype";
var timezone = " PDT"

const marks = {
	15: <strong>0°C</strong>,
	60: {
		style: {
			color: 'red'
		},
		label: <strong>60°C</strong>
	}
}

for (var i = 20; i < 60; i += 5)
{
  marks[i] = i + "°";
}

const marks_hum = {
	5: <strong>5% RH</strong>,
	95: {
		style: {
			color: 'red'
		},
		label: <strong>95%</strong>
	}
}

for (i = 10; i < 95; i += 10)
{
  marks_hum[i] = i + "%";
}

const marks_img = {
	0: "Present",
	120: "1 Hr Ago"
}

const marks_color = {
	0: "None",
	127: "Half",
	254: "Full"
}

let imageArray = [];
let tempData = {"name":"Temperature", "data":{}};
let humData = {"name":"Humidity", "data":{}};
let dataSet = [tempData, humData];

function myFunc(half_minutes) {
  if (half_minutes === 0)
    return "Present";
  else if (half_minutes === 1)
    return "30 Seconds Ago";
  else if (half_minutes === 2 || half_minutes === 3)
    return "1 Minute Ago";
  var minutes = Math.floor(half_minutes/2);
  if (minutes < 60)
    return minutes + " Minutes Ago";
  else
  {
    var hours = Math.floor(minutes / 60);
    minutes %= 60;
    var mstr = minutes + " Min ";
    if (minutes === 0)
      mstr = "";
    if (hours === 1)
       return hours + " Hr " + mstr + "Ago";
    return hours + " Hrs " + mstr + "Ago";
  }
}

class App extends Component {
  componentDidMount(){
    document.title = "MycoTronics"
  }
	constructor(props) {
		super(props);
		this.state = {
			database: null,
			pic: "https://upload.wikimedia.org/wikipedia/commons/a/a8/42_Silicon_Valley_Logo.svg",
			caption: "Present",
			tmp: 30,
			hum: 95,
			r_val: 0,
			g_val: 0,
			b_val: 0,
		}
		this.pic = {
			uri: "https://upload.wikimedia.org/wikipedia/commons/a/a8/42_Silicon_Valley_Logo.svg"
		}
	}

	componentWillMount() {
		this.initFirebase();
		this.getData();
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
			this.state.database.ref('configs/' + boxName + '/' + name).set(val); 
	}

	changeImg = (val) => {
		this.setState({
			pic: imageArray[imageArray.length - val - 1],
			caption: myFunc(val)
		})
	}

	getData = async () => {
		var curr_temp = 0;
		var curr_hum = 0;
		var curr_pic = 0;
    var curr_r = 0;
    var curr_g = 0;
    var curr_b = 0;
		var database = await firebase.database();
		this.setState({ database });
		var box_temp = await database.ref("data/" + boxName + "/temperature");
		var box_humid = await database.ref("data/" + boxName + "/humidity");
		var box_pic = await database.ref("data/" + boxName + "/camera_bottom");
    var box_r = await database.ref("data/" + boxName + "/lightR");
    var box_g = await database.ref("data/" + boxName + "/lightG");
    var box_b = await database.ref("data/" + boxName + "/lightB");

		const snapshot_pic = (data) => {
			curr_pic = data.val();
			var key = Object.keys(curr_pic);
			imageArray.push(curr_pic[key]);
			if (imageArray.length % 120 === 0 && !(imageArray.length in marks_img))
			{
				marks_img[imageArray.length] = imageArray.length / 120 + " Hrs Ago";
			}
			this.setState({
				pic: curr_pic[key]
			})
		}

		const snapshot_temp = (data) => {
			curr_temp = data.val();
			var key = Object.keys(curr_temp);
      var dk = data.key.replace("_", " ") + timezone;
      var new_temp = curr_temp[key].toFixed(2);
			this.setState({
				tmp: new_temp,
				tmp_time: dk
			});
      tempData["data"][dk] = new_temp;
		}

		const snapshot_hum = (data) => {
			curr_hum = data.val();
			var key = Object.keys(curr_hum);
      var dk = data.key.replace("_", " ") + timezone;
      var new_hum = curr_hum[key].toFixed(2);
			this.setState({
				hum: new_hum,
				hum_time: dk
			});
      humData["data"][dk] = new_hum;
		}

    const snapshot_r = (data) => {
      curr_r = data.val();
      this.setState({
        r_val: curr_r
      });
    }

    const snapshot_g = (data) => {
      curr_g = data.val();
      this.setState({
        g_val: curr_g
      });
    }

    const snapshot_b = (data) => {
      curr_b = data.val();
      this.setState({
        b_val: curr_b
      });
    }

		box_temp.limitToLast(60).on('child_added', snapshot_temp);
		box_humid.limitToLast(60).on('child_added', snapshot_hum);
		box_pic.limitToLast(120 * dataHours).on('child_added', snapshot_pic);
    box_r.limitToLast(1).on('value', snapshot_r);
    box_g.limitToLast(1).on('value', snapshot_g);
    box_b.limitToLast(1).on('value', snapshot_b);
  }
	
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={mush_logo} className="App-logo" alt="logo" />
					<h1 className="brand">mycotronics</h1>
          <hr className="line"/>
          <div className="App-title">- Smart Incubator -</div>
				</header>
				<div>
          <img className="img_style" src={this.state.pic} alt="camera" />
				</div>
				<span>
					{this.state.caption}
				</span>

        <div id="controls">
          <div id="imgSliders">
    				<div className="img_slider center half_w_slider">
    					<Slider
              id="imgSlider" 
    					min={0}
    					max={imageArray.length - 1}
    					marks={marks_img}
    					defaultValue={0}
    					onChange={(val) => this.changeImg(val)}
    					/>
    				</div>
          </div>
          <div id="climateSliders">
            <div className="atmos_slider center half_w_slider">
              <Slider
              id="tSlider" 
              min={15}
              max={60}
              defaultValue={this.state.tmp}
              marks={marks}
              onChange={(val) => this.change_val(val, "setTemperature")}  
              />
            </div>
            <div className="atmos_slider center half_w_slider">
              <Slider
              id="hSlider" 
              min={5}
              max={95}
              defaultValue={this.state.hum}
              marks={marks_hum}
              onChange={(val) => this.change_val(val, "setHumidity")} 
              />
            </div>
          </div>
          <div id="colorSliders">
    				<div className="color_slider center half_w_slider">
              <Slider
              id="rSlider" 
    					min={0}
    					max={254}
    					marks={marks_color}
    					defaultValue={128}
    					onChange={(val) => this.change_val(val, "lightR")}
    					trackStyle={{ backgroundColor: 'red' }}
    					handleStyle={{
    						borderColor: 'red',
    						backgroundColor: 'red'
    					}}					
    					/>
            </div>
            <div className="color_slider center half_w_slider">
    					<Slider 
              id="gSlider" 
    					min={0}
    					max={254}
    					marks={marks_color}
    					defaultValue={128}
    					onChange={(val) => this.change_val(val, "lightG")}
    					trackStyle={{ backgroundColor: 'green' }}
    					handleStyle={{
    						borderColor: 'green',
    						backgroundColor: 'green'
    					}}
    					/>
            </div>
            <div className="color_slider center half_w_slider">
    					<Slider
              id="bSlider" 
    					min={0}
    					max={254}
    					marks={marks_color}
    					defaultValue={128}
    					onChange={(val) => this.change_val(val, "lightB")} 
    					trackStyle={{ backgroundColor: 'blue' }}
    					handleStyle={{
    						borderColor: 'blue',
    						backgroundColor: 'blue'
    					}}
    					/>
    				</div>
          </div>
        </div>

				<pre>Current Temperature: {this.state.tmp}°C        Current Humidity: {this.state.hum}%</pre>

        <LineChart 
          data={dataSet}
          refresh={2}
          min={0}
          max={100}
          height={300}
          colors={["#C10", "#08D"]}
        />
			</div>
		);
	}
}

export default App;
