import React from 'react';
import axios from 'axios';
import $ from 'jquery';
export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      pass: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    var name = e.target.name;
    var value = e.target.value;
    this.setState({
      [name]: value,
    });
  }

  handleClick(e) {
    e.preventDefault();
    let {first_name, last_name, email, pass} = this.state;
    if (this.state.pass !== this.state.reEnterPW) {
      console.log('passwords do not match');
    } else {
      axios.post('/api/signup', { first_name, last_name, email, pass })
      .then(res => {
        this.props.history.push('/login');
      })
      .catch(err => {
        $('.error').text('Email is in use').css('color', 'red').show();
        this.props.history.push('/signup');
      });
      this.setState({
        first_name: '',
        last_name: '',
        email: '',
        pass: '',
        reEnterPW: '',
      });
    }
  }

  render() {
    return (
      <div className="ui column stackable center page grid">
        <h2>
           Register
        </h2>
        <h5>
          ...to get that raise you deserve
        </h5>
        <div className="error" hidden></div>
        <br />
        <form className="ui form">

          <div className="fields">
            <div className="field">
              <label>First Name</label>
              <input type="text" onChange={this.handleChange} value={this.state.first_name} name="first_name" placeholder="First Name" />
            </div>
            <div className="field">
              <label>Last Name</label>
              <input type="text" onChange={this.handleChange} value={this.state.last_name} name="last_name" placeholder="Last Name" />
            </div>
            <div className="field">
              <label>Email Address</label>
              <input type="text" onChange={this.handleChange} value={this.state.email} name="email" placeholder="Email Address" />
            </div>
          </div>
          <div className="fields">
            <div className="field">
              <label>Password</label>
              <input type="text" onChange={this.handleChange} value={this.state.pass} name="pass" placeholder="Password" />
            </div>
            <div className="field">
              <label>Re-enter Password</label>
              <input type="text" onChange={this.handleChange} value={this.state.reEnterPW} name="reEnterPW" placeholder="Re-enter Password" />
            </div>
          </div>

          <br />
          <button className="small teal basic ui button" tabIndex="0" type="submit" onClick={this.handleClick}>
            <a href='/login'>Login With Your New Account</a>
          </button>

        </form>
      </div>
    );
  }
}
