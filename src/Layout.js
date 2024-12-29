import React from 'react';
import logo from './images/tree-logo.png';

const Layout = (props) => {
  return (
    <React.Fragment>
      <nav className="container bg-success text-white">
        <div className="row mb-4">
            <div className="col-sm-12 d-flex justify-content-sm-center align-items-sm-center gap-4 p-3">
              <img src={logo} alt="company logo" />
              <h2>Divisa Currency Converter</h2>
            </div>
        </div>
      </nav>
      <div className="container py-3">
        {props.children}
      </div>
      <footer className="container bg-dark text-white d-flex justify-content-sm-center pt-3">
        <p className="text-center">Copyright &copy; <a href="https://skiviloo.com" target="_blank">SKiviloo</a> 2024</p>
      </footer>
    </React.Fragment>
  );
}

export default Layout; 