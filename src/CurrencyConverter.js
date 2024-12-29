import React from 'react';
import Chart from 'chart.js/auto';
import currencies from './utilities/currencies';
import { checkStatus, json } from './utilities/fetchUtils';

class CurrencyConverter extends React.Component {
  constructor(props) {
    super(props);

    //console.log(props.location.search); //check for search params (string) in CurrencyConverter
    const params = new URLSearchParams(props.location.search); //use URLSearchParams instead, to convert string to object
    console.log(params.get('base'), params.get('quote')); //use get method to check params
    

    this.state = { //initial state using arbitrary values for testing without data...then adjust to recieving data
      //rate: 109.55,
      baseAcronym: params.get('base') || 'USD', //use USD and JPY as defaults if base and quote are unavailable
      baseValue: 0,
      quoteAcronym: params.get('quote') || 'CDN',
      quoteValue: 0, //1 * 109.55,
      loading: false, //temporarily false as we don't have data yet
    };

    this.chartRef = React.createRef(); //for historical chart
  }

  //add fetch request for default rate and call it when component mounts
  componentDidMount() {
    const { baseAcronym, quoteAcronym } = this.state;
    this.getRate(baseAcronym, quoteAcronym);
    this.getHistoricalRates(baseAcronym, quoteAcronym); //call the getHistoricalRates method
  }

  getRate = (base, quote) => {
    this.setState({ loading: true });
    fetch(`https://api.frankfurter.app/latest?from=${base}&to=${quote}`)
      .then(checkStatus)
      .then(json)
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        const rate = data.rates[quote];
        this.setState({
          rate,
          baseValue: 1,
          quoteValue: Number((1 * rate).toFixed(3)),
          loading: false,
        });
      })
      .catch(error => console.error(error.message));
  }

  getHistoricalRates = (base, quote) => {  //to fetch with API
    const endDate = new Date().toISOString().split('T')[0]; //turn date into format API can use
    const startDate = new Date((new Date).getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; //calculate 30 days ago
    fetch(`https://api.frankfurter.app/${startDate}..${endDate}?from=${base}&to=${quote}`)
      .then(checkStatus)
      .then(json)
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        const chartLabels = Object.keys(data.rates); //an array to store the dates info
        const chartData = Object.values(data.rates).map(rate => rate[quote]); //an array to store the rates info
        const chartLabel = `${base}/${quote}`;
        this.buildChart(chartLabels, chartData, chartLabel); //to create a dynamic label for the chart
      })
      .catch(error => console.error(error.message));
  }

  buildChart = (labels, data, label) => { //for historical rates
    const chartRef = this.chartRef.current.getContext("2d");
    if (typeof this.chart !== "undefined") {
      this.chart.destroy();
    }
    this.chart = new Chart(this.chartRef.current.getContext("2d"), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: label,
            data,
            fill: false,
            tension: 0,
          }
        ]
      },
      options: {
        responsive: true,
      }
    })
  }
 
  //currency conversion functions for when user changes the value in an input field
  toBase(amount, rate) {
    return amount * (1 / rate);
  }

  toQuote(amount, rate) {
    return amount * rate;
  }

  convert(amount, rate, equation) {
    const input = parseFloat(amount); //change amount to a floating point number and call it input
    if (Number.isNaN(input)) { //check if it's not a number but don't convert it
      return ''; //if so, return empty string
    }
    return equation(input, rate).toFixed(3); //else return the equation to 3 decimal places
  }
 
  //updating functions that use the currency conversions to calculate the value that has not been changed, then update both into state
  changeBaseValue = (event) => {
    const quoteValue = this.convert(event.target.value, this.state.rate, this.toQuote);
    this.setState({
      baseValue: event.target.value,
      quoteValue,
    });
  }

  changeQuoteValue = (event) => {
    const baseValue = this.convert(event.target.value, this.state.rate, this.toBase);
    this.setState({
      quoteValue: event.target.value,
      baseValue,
    });
  }

  //updating functions that update the currency selection acronym
  changeBaseAcronym = (event) => {
    //this.setState({ baseAcronym: event.target.value }); //change to
    const baseAcronym = event.target.value;
    this.setState({ baseAcronym });
    this.getRate(baseAcronym, this.state.quoteAcronym);
    this.getHistoricalRates(baseAcronym, this.state.quoteAcronym);
  }

  changeQuoteAcronym = (event) => {
    //this.setState({ quoteAcronym: event.target.value });
    const quoteAcronym = event.target.value;
    this.setState({ quoteAcronym });
    this.getRate(this.state.baseAcronym, quoteAcronym);
    this.getHistoricalRates(this.state.baseAcronym, quoteAcronym);
  }

  
  
  render() {
    const { rate, baseAcronym, baseValue, quoteAcronym, quoteValue, loading } = this.state;
    const currencyOptions = Object.keys(currencies).map(currencyAcronym => <option key={currencyAcronym} value={currencyAcronym}>{currencyAcronym}</option>);
    return (
      <React.Fragment>
        <div className="text-center p-3">
          <h4>1 {currencies[baseAcronym].name}  = {rate} {currencies[quoteAcronym].name}</h4>
        </div>
        <form className="form-row p-3 bg-info justify-content-center">
          <div className="form-group col-md-5 mb-0">
            <select value={baseAcronym} onChange={this.changeBaseAcronym} className="form-control form-control-lg mb-2" disabled={loading}>
              {currencyOptions}
            </select>
            <div className="input-group">
              <div className="input-group-prepend">
                <div className="input-group-text">{currencies[baseAcronym].symbol}</div>
              </div>
              <input id="base" className="form-control form-control-lg" value={baseValue} onChange={this.changeBaseValue} type="number" />
            </div>
            <small className="text-secondary">{currencies[baseAcronym].name}</small>
          </div>
          <div className="col-md-2 py-3 d-flex justify-content-center align-items-center">
            <h3>=</h3>
          </div>
          <div className="form-group col-md-5 mb-0">
            <select value={quoteAcronym} onChange={this.changeQuoteAcronym} className="form-control form-control-lg mb-2" disabled={loading}>
              {currencyOptions}
            </select>
            <div className="input-group">
              <div className="input-group-prepend">
                <div className="input-group-text">{currencies[quoteAcronym].symbol}</div>
              </div>
              <input id="quote" className="form-control form-control-lg" value={quoteValue} onChange={this.changeQuoteValue} type="number" />
            </div>
            <small className="text-secondary">{currencies[quoteAcronym].name}</small>
          </div>
        </form>
        <div className="text-center p-3 mt-4">
          <h4>Historical Rates</h4>
        </div>
        <canvas ref={this.chartRef} />
      </React.Fragment>
    )
  }
}

export default CurrencyConverter;