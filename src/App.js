import React, { Component } from 'react';
import mush_logo from './img/logo_mycotronics.png';
import './App.css';
import * as firebase from 'firebase';
import Chart from './Components/Chart';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

var dataHours = 3;
var boxName="myco-prototype";

var img_style = {
	margin: 20,
	alignContent: 'center'
}

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
	255: "Full"
}

let imageArray = [];

function myFunc(half_minutes) {
  if (half_minutes === 0)
  {
    return "Present";
  }
  else if (half_minutes === 1)
  {
    return "30 Seconds Ago";
  }
  else if (half_minutes === 2 || half_minutes === 3)
  {
    return "1 Minute Ago";
  }
  var minutes = Math.floor(half_minutes/2);
  if (minutes < 60)
  {
    return minutes + " Minutes Ago";
  }
  else
  {
    var hours = Math.floor(minutes / 60);
    minutes %= 60;
    var mstr = minutes + " Min ";
    if (minutes === 0)
    {
      mstr = "";
    }
    if (hours === 1)
    {
       return hours + " Hr " + mstr + "Ago";
    }
    return hours + " Hrs " + mstr + "Ago";
  }
}

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			database: null,
			chartData: {},
			pic: null,
			caption: "Present",
			data: null,
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
 /*		this.getChartData(); */
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
			//console.log(curr_temp[key]);
			//console.log(data.key);
			this.setState({
				chartData: {
					labels: data.key,
					datasets: [
						{
							data: curr_temp[key].toFixed(2),
						}
					],
					backgroundColor: "rgba(255,0,144,0)",
				},
				tmp: curr_temp[key].toFixed(2),
				tmp_time: data.key
			});
		}

		const snapshot_hum = (data) => {
			curr_hum = data.val();
			var key = Object.keys(curr_hum);
			//console.log(curr_hum[key])
			//console.log(data.key);
			this.setState({
				chartData: {
					labels: data.key,
					datasets: [
						{
							data: curr_hum[key].toFixed(2),
						}
					],
					backgroundColor: "rgba(255,0,144,0)",
				},
				hum: curr_hum[key].toFixed(2),
				hum_time: data.key,
			});
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

		box_temp.limitToLast(120 * dataHours).on('child_added', snapshot_temp);
		box_humid.limitToLast(120 * dataHours).on('child_added', snapshot_hum);
		box_pic.limitToLast(120 * dataHours).on('child_added', snapshot_pic);
    box_r.limitToLast(1).on('value', snapshot_r);
    box_g.limitToLast(1).on('value', snapshot_g);
    box_b.limitToLast(1).on('value', snapshot_b);
	}
	/* getChartData() {
		//ajax call here
		this.setState({
			chartData: {
				labels: ['Iowa1', 'Taiwan', 'Bay area', 'Washington'],
				datasets:[
						{
								label: 'Population',
								data: [1222, 4444, 25325, 53252]
						}
				],
				backgroundColor: "rgba(255,0,144,0)",
				}
		});
	} */
 
	
	render() {
		//console.log(this.state.chartData)
		return (
			<div className="App">
				<header className="App-header">
					<img src={mush_logo} className="App-logo" alt="logo" />
					<h1 className="App-title">mycotronics</h1>
          <hr className="line"/>
          <div className="App-title">Smart Incubator</div>
				</header>
				


				<div>
				<img style={img_style} src={this.state.pic} alt="camera" />
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
    					max={255}
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
    					max={255}
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
    					max={255}
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
