import React from 'react';
import currencies from './utilities/currencies';
import { checkStatus, json } from './utilities/fetchUtils';//to get the fetch data
import CurrencyTable from './CurrencyTable';


class Home extends React.Component {
  constructor () {
    super();
    this.state = {  //initial state
      base: 'USD',
      rates: null,
      loading: true, //loading state to disable select element while fetch is processing
    }
  } 

  //call the getRatesData function when component mounts
  componentDidMount() {
    this.getRatesData(this.state.base); //get the rates data taking the base currency
  }

  changeBase = (event) => {
    this.setState({ base: event.target.value }); //changes the values relative to the new base
    this.getRatesData(event.target.value); //to fetch new data when base currency is changed
  }

  //function to fetch and store the data
  getRatesData = (base) => {
    this.setState({ loading: true }); //
    fetch(`https://api.frankfurter.app/latest?from=${base}`)
      .then(checkStatus) //see if response is ok
      .then(json) //convert to usable format - an object but not an array yet
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }

        console.log(data); //check for data object (for testing)

        //restructure data to an array of objects in order to map and use it

        const rates = Object.keys(data.rates) //define new rates variable as the keys of the Object (ie. the acronyms)
        .filter(acronym => acronym !== base) //and filter out current base currency acronym from table, return an array
        .map(acronym => ({ //then map it
          acronym,
          rate: data.rates[acronym],
          name: currencies[acronym].name,
          symbol: currencies[acronym].symbol,
        }))
        this.setState({ rates, loading: false }); //then set the state when loading has finished
      })
      .catch(error => console.error(error.message)); //log error msg if data doesn't come through
  }

  render () {
    const { base, rates, loading } = this.state;

    return (
      <React.Fragment>
        <form className="p-3 bg-info form-inline justify-content-center">
          <h3 className="mb-2">Base currency: <b className="mr-2">1</b></h3>

          <select value={base} onChange={this.changeBase} className="form-control form-control-lg mb-2" disabled={loading}>
          {Object.keys(currencies).map(currencyAcronym => <option key={currencyAcronym} value={currencyAcronym}>{currencyAcronym}</option>)}
          </select>

        </form>

        <CurrencyTable base={base} rates={rates} />

      </React.Fragment>
    )
  }
}

export default Home;