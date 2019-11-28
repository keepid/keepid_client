import React, { Component } from 'react';
import {
  Navbar, Button, Col, Row, Form, InputGroup,
} from 'react-bootstrap';
import Logo from '../static/images/logo.svg';
import UsernameSVG from '../static/images/username.svg';
import PasswordSVG from '../static/images/password.svg';

interface Props {
  logIn: () => void,
  logOut: () => void,
  isLoggedIn: boolean
}

interface State {
  isLoggedIn: boolean,
  incorrectCredentials: boolean,
  username: string,
  password: string
}

class Header extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    console.log(`${process.env.SERVER}/login`);
    this.state = {
      isLoggedIn: false,
      incorrectCredentials: false,
      username: '',
      password: '', // Ensure proper length, combination of words and numbers (have a mapping for people to remember)
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
  }

  handleSubmit(event: any) {
    event.preventDefault();
    fetch('http://localhost:7000/login', {
      method: 'POST',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON === "AUTH_SUCCESS") {
          this.props.logIn();
        } else if (responseJSON === "AUTH_FAILURE") {
          alert("Incorrect Password");
          this.setState({ incorrectCredentials: true });
        } else if (responseJSON === "USER_NOT_FOUND") {
          alert("Incorrect Username");
          this.setState({ incorrectCredentials: true });
        } else {
          alert("Server Failure: Please Try Again");
        }
        console.log(responseJSON);
      });
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    this.setState({ isLoggedIn: props.isLoggedIn });
  }

  handleChangePassword(event: any) {
    this.setState({ password: event.target.value });
  }

  handleChangeUsername(event: any) {
    this.setState({ username: event.target.value });
  }

  render() {
    if (this.state.isLoggedIn) {
      return (<Button onClick={this.props.logOut}>Log Out</Button>);
    }
    return (
      <div>
        <Navbar bg="primary-theme" variant="dark" sticky="top">
          <Form id="loginForm" onSubmit={this.handleSubmit}>
            <Row className="d-flex justify-content-end">
              <Col sm={2}>
                <Navbar.Brand href="/">
                  <img
                    alt=""
                    src={Logo}
                    width="48"
                    height="48"
                    className="d-inline-block align-top"
                  />
                      keep.id
                </Navbar.Brand>
              </Col>
              <Col sm={4}>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroupPrepend">
                      <img
                        alt=""
                        src={UsernameSVG}
                        width="22px"
                        height="22px"
                        className="d-inline-block align-middle"
                      />
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="text"
                    onChange={this.handleChangeUsername}
                    value={this.state.username}
                    placeholder="First-Last-MM-DD-YYYY"
                    aria-describedby="Username Login"
                    required
                  />
                  {/* <Form.Control.Feedback type="invalid">
                        Please choose a username.
                      </Form.Control.Feedback> */}
                </InputGroup>
              </Col>
              <Col sm={4}>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroupPrepend">
                      <img
                        alt=""
                        src={PasswordSVG}
                        width="22px"
                        height="22px"
                        className="d-inline-block align-middle"
                      />
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="password"
                    onChange={this.handleChangePassword}
                    value={this.state.password}
                    placeholder="Password"
                    aria-describedby="Password Login"
                    required
                  />
                  {/* <Form.Control.Feedback type="invalid">
                        Please choose a username.
                      </Form.Control.Feedback> */}
                </InputGroup>
              </Col>
              <Col sm={2}>
                <Button variant="outline-light" type="submit">
                  <b>Login</b>
                </Button>
              </Col>
            </Row>
          </Form>
        </Navbar>
      </div>
    );
  }
}

export default Header;
