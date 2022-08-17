import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Select from 'react-select';

import {
  validateEmail,
  validatePhonenumber,
  validateZipcode,
} from './Information.validators';
import * as validators from './Information.validators';

interface Props extends RouteComponentProps {
    name: string;
    username: string;
  }

interface State {
    firstName: string;
    firstNameTemp: string;
    middleName: string;
    middleNameTemp: string;
    lastName: string;
    lastNameTemp: string;
    suffix: string;
    suffixTemp: string;
    gender: string;
    genderTemp: string;
    email: string;
    emailTemp: string;
    street: string;
    streetTemp: string;
    state: string;
    stateTemp: string;
    zipcode: string;
    zipcodeTemp: string;
    ssn: string;
    ssnTemp: string;
    phoneNumber: string;
    phoneNumberTemp: string;
    editInfo: boolean;
}

class BasicInfo extends Component<Props, State, any> {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      firstNameTemp: '',
      middleName: '',
      middleNameTemp: '',
      lastName: '',
      lastNameTemp: '',
      suffix: '',
      suffixTemp: '',
      gender: '',
      genderTemp: '',
      email: '',
      emailTemp: '',
      street: '',
      streetTemp: '',
      state: '',
      stateTemp: '',
      zipcode: '',
      zipcodeTemp: '',
      ssn: '',
      ssnTemp: '',
      phoneNumber: '',
      phoneNumberTemp: '',
      editInfo: false,
    };
    this.handleChangeSSN = this.handleChangeSSN.bind(this);
    this.handleChangeFirstName = this.handleChangeFirstName.bind(this);
    this.handleChangeMiddleName = this.handleChangeMiddleName.bind(this);
    this.handleChangeLastName = this.handleChangeLastName.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.handleChangeSSN = this.handleChangeSSN.bind(this);
    this.handleChangePhoneNumber = this.handleChangePhoneNumber.bind(this);
    this.handleChangeStreet = this.handleChangeStreet.bind(this);
    this.handleChangeState = this.handleChangeState.bind(this);
    this.handleChangeZipcode = this.handleChangeZipcode.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.saveInfo = this.saveInfo.bind(this);
  }

  handleChangePhoneNumber(event: any) {
    this.setState({
      phoneNumberTemp: event.target.value,
    });
  }

  handleChangeStreet(event: any) {
    this.setState({
      streetTemp: event.target.value,
    });
  }

  handleChangeZipcode(event: any) {
    this.setState({
      zipcodeTemp: event.target.value,
    });
  }

  handleChangeFirstName(event: any) {
    this.setState({
      firstNameTemp: event.target.value,
    });
  }

  handleChangeMiddleName(event: any) {
    this.setState({
      middleNameTemp: event.target.value,
    });
  }

  handleChangeLastName(event: any) {
    this.setState({
      lastNameTemp: event.target.value,
    });
  }

  handleChangeEmail(event: any) {
    this.setState({
      emailTemp: event.target.value,
    });
  }

  handleChangeSSN(event: any) {
    this.setState({
      ssnTemp: event.target.value,
    });
  }

    handleChangeSuffix = (value) => {
      this.setState({ suffixTemp: value.label });
    }

    handleChangeGender = (value) => {
      this.setState({ genderTemp: value.label });
    }

    handleChangeState = (value) => {
      this.setState({ stateTemp: value.label });
    }

    setDropDown = (data) => {
      if (data === '') {
        return 'Select...';
      }
      return data;
    }

    setDropDownState = (data) => {
      if (data === '') {
        return 'State';
      }
      return data;
    }

    setData = (data) => {
      if (data === '') {
        return '';
      }
      return data;
    }

    setAddress = (street, state, zip) => {
      if (street === '' || state === '' || zip === '') {
        return '';
      }
      return (`${street}, ${state} ${zip}`);
    }

    toggleEdit(event: any) {
      const { editInfo } = this.state;
      this.setState({
        editInfo: !editInfo,
      });
    }

    saveInfo(event: any) {
      const {
        firstNameTemp,
        middleNameTemp,
        lastNameTemp,
        suffixTemp,
        genderTemp,
        emailTemp,
        streetTemp,
        stateTemp,
        zipcodeTemp,
        ssnTemp,
        phoneNumberTemp,
        editInfo,
      } = this.state;
      this.setState({
        firstName: firstNameTemp,
        middleName: middleNameTemp,
        lastName: lastNameTemp,
        suffix: suffixTemp,
        gender: genderTemp,
        email: emailTemp,
        street: streetTemp,
        state: stateTemp,
        zipcode: zipcodeTemp,
        ssn: ssnTemp,
        phoneNumber: phoneNumberTemp,
        editInfo: !editInfo,
      });
    }

    render() {
      const { name, username, history } = this.props;
      const {
        firstName,
        middleName,
        lastName,
        suffix,
        gender,
        email,
        street,
        state,
        zipcode,
        ssn,
        phoneNumber,
        editInfo,
      } = this.state;

      const suffixes = [
        { value: 'ii', label: 'II' },
        { value: 'iii', label: 'III' },
        { value: 'iv', label: 'IV' },
        { value: 'jr', label: 'Jr.' },
        { value: 'sr', label: 'Sr.' },
        { value: 'prefer not to say', label: 'Prefer Not to Say' },
        { value: 'none', label: 'None' },
      ];

      const genders = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'nonbinary', label: 'Nonbinary' },
        { value: 'prefer not to say', label: 'Prefer Not to Say' },
        { value: 'other', label: 'Other' },
      ];

      const states = [
        { value: 'alabama', label: 'AL' },
        { value: 'alaska', label: 'AK' },
        { value: 'arizona', label: 'AZ' },
        { value: 'arkansas', label: 'AR' },
        { value: 'california', label: 'CA' },
        { value: 'canal zone', label: 'CZ' },
        { value: 'colorado', label: 'CO' },
        { value: 'connecticut', label: 'CT' },
        { value: 'delaware', label: 'DE' },
        { value: 'district of columbia', label: 'DC' },
        { value: 'florida', label: 'FL' },
        { value: 'georgia', label: 'GA' },
        { value: 'guam', label: 'GU' },
        { value: 'hawaii', label: 'HI' },
        { value: 'idaho', label: 'ID' },
        { value: 'illinois', label: 'IL' },
        { value: 'indiana', label: 'IN' },
        { value: 'iowa', label: 'IA' },
        { value: 'kansas', label: 'KS' },
        { value: 'kentucky', label: 'KY' },
        { value: 'louisiana', label: 'LA' },
        { value: 'maine', label: 'ME' },
        { value: 'maryland', label: 'MD' },
        { value: 'massachusetts', label: 'MA' },
        { value: 'michigan', label: 'MI' },
        { value: 'minnesota', label: 'MS' },
        { value: 'missouri', label: 'MO' },
        { value: 'montana', label: 'MT' },
        { value: 'nebraska', label: 'NE' },
        { value: 'nevada', label: 'NV' },
        { value: 'new hampshire', label: 'NH' },
        { value: 'new jersey', label: 'NJ' },
        { value: 'new mexico', label: 'NM' },
        { value: 'new york', label: 'NY' },
        { value: 'north carolina', label: 'NC' },
        { value: 'north dakota', label: 'ND' },
        { value: 'ohio', label: 'OH' },
        { value: 'oklahoma', label: 'OK' },
        { value: 'oregon', label: 'OR' },
        { value: 'pennsylvania', label: 'PA' },
        { value: 'rhode island', label: 'RI' },
        { value: 'south carolina', label: 'SC' },
        { value: 'south dakota', label: 'SD' },
        { value: 'tennessee', label: 'TN' },
        { value: 'teax', label: 'TX' },
        { value: 'utah', label: 'UT' },
        { value: 'vermont', label: 'VT' },
        { value: 'virgin islands', label: 'VI' },
        { value: 'virginia', label: 'VA' },
        { value: 'washington', label: 'WA' },
        { value: 'west virginia', label: 'WV' },
        { value: 'wisconsin', label: 'WI' },
        { value: 'wyoming', label: 'WY' },
      ];

      return (
            <div className="container pt-5">
                <Helmet>
                    <title>Basic Info</title>
                    <meta name="description" content="Keep.id" />
                </Helmet>
                <div className="d-flex p-2">
                    <h1 id="welcome-title">Basic Information</h1>
                </div>
                <div className="row justify-content-between mb-2">
                    <Link to={`/my-information/${username}/${name}`}>
                        <button type="button" className="btn btn-sm btn-secondary mr-2">
                            Return to My Information
                        </button>
                    </Link>
                    <div className="row">
                        <Link to={`/family-info/${username}/${name}`}>
                            <button type="button" className="btn btn-sm btn-secondary mx-2">
                                Family Information
                            </button>
                        </Link>
                        <Link to={`/demographics/${username}/${name}`}>
                            <button type="button" className="btn btn-sm btn-secondary mr-2">
                                Demographics
                            </button>
                        </Link>
                        <Link to={`/veteran-status/${username}/${name}`}>
                            <button type="button" className="btn btn-sm btn-secondary">
                                Veteran Status Information
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="card my-3 px-2 primary-border">
                    <div className="card-body">
                        <div className="row mb-4">
                            <div className="column">
                                <div className="row justify-content-between mb-2">
                                    <p className="large-bold-text column py-2">First Name:</p>
                                    {editInfo ? (
                                        <button type="button" className="transparent-button large-dropdown-size p-0">
                                            <input
                                              type="text"
                                              className="form-control dropdown-size smaller-input"
                                              id="firstName"
                                              placeholder="First Name"
                                              onChange={this.handleChangeFirstName}
                                              value={this.state.firstNameTemp}
                                              aria-label="first name"
                                            />
                                        </button>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.firstName)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row mb-2 justify-content-between">
                                    <p className="large-bold-text column py-2 mr-4">Middle Name:</p>
                                    {editInfo ? (
                                        <div className="container large-dropdown-size p-0">
                                            <input
                                              type="text"
                                              className="form-control dropdown-size smaller-input"
                                              id="middleName"
                                              placeholder="Middle Name"
                                              onChange={this.handleChangeMiddleName}
                                              value={this.state.middleNameTemp}
                                              aria-label="middle name"
                                            />
                                        </div>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.middleName)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row mb-4 justify-content-between">
                                    <p className="large-bold-text column py-2">Last Name:</p>
                                    {editInfo ? (
                                        <button type="button" className="transparent-button large-dropdown-size p-0">
                                            <input
                                              type="text"
                                              className="form-control dropdown-size smaller-input"
                                              id="lastName"
                                              placeholder="Last Name"
                                              onChange={this.handleChangeLastName}
                                              value={this.state.lastNameTemp}
                                              aria-label="last name"
                                            />
                                        </button>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.lastName)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row mb-2 justify-content-between">
                                    <p className="large-bold-text column py-2">Email:</p>
                                    {editInfo ? (
                                        <input
                                          type="text"
                                          className="form-control large-dropdown-size smaller-input"
                                          id="email"
                                          placeholder="Email"
                                          onChange={this.handleChangeEmail}
                                          value={this.state.emailTemp}
                                          aria-label="email"
                                        />
                                    ) : (
                                        <div className="container larger-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.email)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row mb-5 justify-content-between">
                                    <p className="large-bold-text column py-2">Mailing <br />Address:</p>
                                    {editInfo ? (
                                        <div>
                                            <input
                                              type="text"
                                              className="form-control large-dropdown-size smaller-input mb-2"
                                              id="street"
                                              placeholder="Street"
                                              onChange={this.handleChangeStreet}
                                              value={this.state.streetTemp}
                                              aria-label="street"
                                            />
                                            <div className="row justify-content-between">
                                                <Select
                                                  placeholder={this.setDropDownState(this.state.stateTemp)}
                                                  aria-label="states"
                                                  options={states}
                                                  closeMenuOnSelect
                                                  onChange={this.handleChangeState}
                                                  value={this.state.stateTemp}
                                                  menuPlacement="bottom"
                                                  className="small-dropdown-size"
                                                />
                                                <input
                                                  type="text"
                                                  className="form-control medium-dropdown-size smaller-input"
                                                  id="zip"
                                                  placeholder="Zipcode"
                                                  onChange={this.handleChangeZipcode}
                                                  value={this.state.zipcodeTemp}
                                                  aria-label="zipcode"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setAddress(this.state.street, this.state.state, this.state.zipcode)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="column" style={{ marginLeft: 200 }}>
                                <div className="row mb-2 justify-content-between">
                                    <p className="large-bold-text column py-2 mr-4">Suffix:</p>
                                    {editInfo ? (
                                        <Select
                                          placeholder={this.setDropDown(this.state.suffixTemp)}
                                          aria-label="Suffix"
                                          options={suffixes}
                                          closeMenuOnSelect
                                          onChange={this.handleChangeSuffix}
                                          value={this.state.suffixTemp}
                                          menuPlacement="bottom"
                                          className="dropdown-size"
                                        />
                                    ) : (
                                        <div className="container dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.suffix)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row mb-2 justify-content-between">
                                    <p className="large-bold-text column py-2">Gender:</p>
                                    {editInfo ? (
                                        <Select
                                          placeholder={this.setDropDown(this.state.genderTemp)}
                                          aria-label="Legal Status"
                                          options={genders}
                                          closeMenuOnSelect
                                          onChange={this.handleChangeGender}
                                          value={this.state.genderTemp}
                                          menuPlacement="bottom"
                                          className="dropdown-size"
                                        />
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.gender)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row justify-content-between">
                                    <p className="large-bold-text column py-2 mr-4">Social Security <br />Number:</p>
                                    {editInfo ? (
                                        <input
                                          type="text"
                                          className="form-control dropdown-size smaller-input"
                                          id="ssn"
                                          placeholder="Social Security"
                                          onChange={this.handleChangeSSN}
                                          value={this.state.ssnTemp}
                                          aria-label="social security number"
                                        />
                                    ) : (
                                        <div className="container large-dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.ssn)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row justify-content-between">
                                    <p className="large-bold-text column py-2 mr-4">Phone Number:</p>
                                    {editInfo ? (
                                        <input
                                          type="text"
                                          className="form-control dropdown-size smaller-input"
                                          id="phoneNumber"
                                          placeholder="Phone Number"
                                          onChange={this.handleChangePhoneNumber}
                                          value={this.state.phoneNumberTemp}
                                          aria-label="phoneNumber"
                                        />
                                    ) : (
                                        <div className="container dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.phoneNumber)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!editInfo ? (
                                <button
                                  type="button"
                                  className="btn btn-primary dropdown-size large-bold-text lock-bottom-left mt-4"
                                  onClick={this.toggleEdit}
                                >
                                Edit Information
                                </button>
                        ) : (null)
                        }
                        {editInfo ? (
                            <div className="row lock-bottom-right mt-4">
                                <div className="column mr-4">
                                    <button
                                      type="button"
                                      className="btn btn-secondary"
                                      onClick={this.toggleEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <div className="column">
                                    <button
                                      type="button"
                                      className="btn btn-success"
                                      onClick={this.saveInfo}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (null)
                        }
                    </div>
                </div>
            </div>
      );
    }
}

export default withRouter(BasicInfo);
