import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

var time = 0;

class Chart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartData: null
        }
    }

    componentWillMount() {
        this.setState({chartData: this.props.chartData})
    }

    static defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
        location: 'City'
    }

    renderLine = () => {
        if (!this.props.chartData.hasOwnProperty("datasets")) return null;
        let lineData = this.props.chartData.datasets.map(({ data }) => eval({
            x: time,
            y: eval(data)
        }))
        time++;
        if (time > 120)
            time = 0;
        //console.log(lineData)
        return <Line
            data={lineData}
            width={100}
            height={50}
            options={{
                title: {
                    display: true,
                    text:'Temperature',
                    fontSize: 20
                },
                legend: {
                    display: false,
                    position: 'bottom',
                }
            }}
        />
    }

    render() {
        return (
            <div className="chart">
                {this.renderLine()}
            </div>
        )
    }
}

export default Chart;