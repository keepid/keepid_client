import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import USStates from '../../static/data/states_titlecase.json';

interface Props {
  username: string,
  password: string,
  firstname: string,
  lastname: string,
  birthDate: Date,
  address: string,
  city: string,
  state: string,
  zipcode: string,
  phonenumber: string,
  email: string,
  orgName: string,
  orgWebsite: string,
  ein: string,
  orgAddress: string,
  orgCity: string,
  orgState: string,
  orgZipcode: string,
  orgPhoneNumber: string,
  orgEmail: string,
  handleSubmit: () => void,
  handlePrevious: ()=> void,
  handleFormJumpTo:(stageNumber: number)=> void,
  alert: any,
  buttonState: string
}

interface State {}

class ReviewSubmit extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
  }

  handleStepPrevious = (e) => {
    e.preventDefault();
    this.props.handlePrevious();
  }

  handleStepComplete = async (e) => {
    e.preventDefault();
  }

  passwordHider = (password: string) => '*'.repeat(password.length - 1)

  render() {
    const {
      username,
      password,
      firstname,
      lastname,
      birthDate,
      address,
      city,
      state,
      zipcode,
      phonenumber,
      email,
      orgName,
      orgWebsite,
      ein,
      orgAddress,
      orgCity,
      orgState,
      orgZipcode,
      orgPhoneNumber,
      orgEmail,
      handleSubmit,
      handlePrevious,
      handleFormJumpTo,
      buttonState,
    } = this.props;
    return (
      <div>
        <Helmet>
          <title>
            Sign Up- Organization Info
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex justify-content-center pt-5">
          <div className="col-md-10">
            <div className="text-center pb-4 mb-2">
              <h2><b>Verify all information is correct before submitting.</b></h2>
            </div>
            <table className="table mb-4">
              <thead className="thead-light">
                <tr>
                  <th className="w-25" scope="col">Account Setup</th>
                  <th className="w-75" scope="col" />
                  <th scope="col" onClick={() => handleFormJumpTo(0)}><a href="#">Edit</a></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Username</th>
                  <td>{username}</td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Password</th>
                  <td>{password}</td>
                  <td />
                </tr>
              </tbody>
            </table>
            <table className="table mb-4">
              <thead className="thead-light">
                <tr>
                  <th className="w-25" scope="col">Personal Information</th>
                  <th className="w-75" scope="col" />
                  <th scope="col" onClick={() => handleFormJumpTo(1)}><a href="#">Edit</a></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Name</th>
                  <td>
                    {firstname}
                    {' '}
                    {lastname}
                  </td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Birthdate</th>
                  <td>{birthDate.toLocaleDateString('en-US')}</td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Mailing address</th>
                  <td>
                    {address}
                    {' '}
                    {city}
                    ,
                    {' '}
                    {state}
                    {' '}
                    {zipcode}
                  </td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Phone number</th>
                  <td>{phonenumber}</td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Email Address</th>
                  <td>{email}</td>
                  <td />
                </tr>
              </tbody>
            </table>
            <table className="table mb-4">
              <thead className="thead-light">
                <tr>
                  <th className="w-25" scope="col">Organization Information</th>
                  <th className="w-75" scope="col" />
                  <th scope="col" onClick={() => handleFormJumpTo(2)}><a href="#">Edit</a></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Organization name</th>
                  <td>{orgName}</td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Organization website</th>
                  <td>{orgWebsite}</td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Organization address</th>
                  <td>
                    {orgAddress}
                    {' '}
                    {orgCity}
                    ,
                    {' '}
                    {orgState}
                    {' '}
                    {orgZipcode}
                  </td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Organization EIN</th>
                  <td>{ein}</td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Organization phone number</th>
                  <td>{orgPhoneNumber}</td>
                  <td />
                </tr>
                <tr>
                  <th scope="row">Organization email address</th>
                  <td>{orgEmail}</td>
                  <td />
                </tr>
              </tbody>
            </table>
            <div className="d-flex">
              <button type="button" className="btn btn-outline-danger mt-5" onClick={this.handleStepPrevious}>Previous Step</button>
              <button type="submit" onClick={handleSubmit} className={`mt-5 ml-auto btn btn-primary ld-ext-right ${buttonState}`}>
                Submit
                <div className="ld ld-ring ld-spin" />
              </button>
              {/* <button type="button" className="ml-auto btn btn-primary mt-5" onClick={handleSubmit}>Submit</button> */}
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(ReviewSubmit);
