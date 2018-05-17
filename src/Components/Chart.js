import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

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

    render() {
        return (
            <div className="chart">
                <Line
                    data={this.state.chartData}
                />
            </div>
        )
    }
}

export default Chart;