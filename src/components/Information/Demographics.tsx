import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Select from 'react-select';

interface Props extends RouteComponentProps {
    name: string;
    username: string;
  }

interface State {
    languagePreference: string;
    languagePreferenceTemp: string;
    ethnicity: string;
    ethnicityTemp: string;
    race: string;
    raceTemp: string;
    citizenshipStatus: string;
    citizenshipStatusTemp: string;
    placeOfBirthTemp: string;
    placeOfBirth: string;
    editInfo: boolean;
}

class Demographics extends Component<Props, State, any> {
  constructor(props) {
    super(props);
    this.state = {
      languagePreference: '',
      languagePreferenceTemp: '',
      ethnicity: '',
      ethnicityTemp: '',
      race: '',
      raceTemp: '',
      citizenshipStatus: '',
      citizenshipStatusTemp: '',
      placeOfBirthTemp: '',
      placeOfBirth: '',
      editInfo: false,
    };
    this.handleChangePlaceofBirth = this.handleChangePlaceofBirth.bind(this);
    this.setDropDown = this.setDropDown.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.saveInfo = this.saveInfo.bind(this);
  }

    handleChangeLanguage = (value) => {
      this.setState({ languagePreferenceTemp: value.label });
    }

    handleChangeEthnicity = (value) => {
      this.setState({ ethnicityTemp: value.label });
    }

    handleChangeRace = (value) => {
      this.setState({ raceTemp: value.label });
    }

    handleChangeCitizenship = (value) => {
      this.setState({ citizenshipStatusTemp: value.label });
    }

    handleChangePlaceofBirth(event: any) {
      this.setState({
        placeOfBirthTemp: event.target.value,
      });
    }

    setDropDown = (data) => {
      if (data === '') {
        return 'Select...';
      }
      return data;
    }

    setData = (data) => {
      if (data === '') {
        return '';
      }
      return data;
    }

    toggleEdit(event: any) {
      const { editInfo } = this.state;
      this.setState({
        editInfo: !editInfo,
      });
    }

    saveInfo(event: any) {
      const {
        languagePreferenceTemp,
        ethnicityTemp,
        raceTemp,
        citizenshipStatusTemp,
        placeOfBirthTemp,
        editInfo,
      } = this.state;
      this.setState({
        languagePreference: languagePreferenceTemp,
        ethnicity: ethnicityTemp,
        race: raceTemp,
        citizenshipStatus: citizenshipStatusTemp,
        placeOfBirth: placeOfBirthTemp,
        editInfo: !editInfo,
      });
    }

    render() {
      const { name, username, history } = this.props;
      const {
        languagePreference,
        ethnicity,
        race,
        citizenshipStatus,
        placeOfBirthTemp,
        placeOfBirth,
        editInfo,
      } = this.state;

      const languageOptions = [
        { value: 'english', label: 'English' },
        { value: 'spanish', label: 'Spanish' },
        { value: 'french', label: 'French' },
        { value: 'mandarin', label: 'Mandarin' },
        { value: 'tagalog', label: 'Tagalog' },
        { value: 'vietnamese', label: 'Vietnamese' },
        { value: 'other', label: 'Other' },
      ];

      const ethnicityOptions = [
        { value: 'hispanic', label: 'Hispanic/Latinx' },
        { value: 'nonhispanic', label: 'Non-Hispanic' },
        { value: 'multiracial', label: 'Multiracial' },
        { value: 'other', label: 'Other' },
      ];

      const raceOptions = [
        { value: 'white', label: 'White' },
        { value: 'black', label: 'Black or African American' },
        { value: 'asian', label: 'Asian' },
        { value: 'native', label: 'American Indian or Alaska Native' },
        { value: 'hawaiian', label: 'Native Hawaiian or Pacific Islander' },
        { value: 'other', label: 'Other' },
      ];

      const legalStatus = [
        { value: 'us citizen', label: 'U.S. Citizen' },
        { value: 'permanent resident', label: 'Permanent Resident' },
        { value: 'illegal immigrant', label: 'Illegal Immigrant' },
        { value: 'other', label: 'Other' },
      ];

      return (
            <div className="container pt-5">
                <Helmet>
                    <title>Demographics</title>
                    <meta name="description" content="Keep.id" />
                </Helmet>
                <div className="d-flex p-2">
                    <h1 id="welcome-title">Demographic Information</h1>
                </div>
                <div className="row justify-content-between mb-2">
                    <Link to={`/my-information/${username}/${name}`}>
                        <button type="button" className="btn btn-sm btn-secondary mr-2">
                            Return to My Information
                        </button>
                    </Link>
                    <div className="row">
                        <Link to={`/basic-info/${username}/${name}`}>
                            <button type="button" className="btn btn-sm btn-secondary mx-2">
                                Basic Information
                            </button>
                        </Link>
                        <Link to={`/family-info/${username}/${name}`}>
                            <button type="button" className="btn btn-sm btn-secondary mr-2">
                                Family Information
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
                                <div className="row justify-content-between">
                                    <p className="large-bold-text column py-2 mr-4">Language of <br />Preference:</p>
                                    {editInfo ? (
                                        <Select
                                          placeholder={this.setDropDown(this.state.languagePreferenceTemp)}
                                          aria-label="Select Language"
                                          options={languageOptions}
                                          closeMenuOnSelect
                                          onChange={this.handleChangeLanguage}
                                          value={this.state.languagePreferenceTemp}
                                          menuPlacement="bottom"
                                          className="dropdown-size"
                                        />
                                    ) : (
                                        <div className="container dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.languagePreference)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row mb-2 justify-content-between">
                                    <p className="large-bold-text column py-2">Ethnicity:</p>
                                    {editInfo ? (
                                        <Select
                                          placeholder={this.setDropDown(this.state.ethnicityTemp)}
                                          aria-label="Select Ethnicity"
                                          options={ethnicityOptions}
                                          closeMenuOnSelect
                                          onChange={this.handleChangeEthnicity}
                                          value={this.state.ethnicityTemp}
                                          menuPlacement="bottom"
                                          className="dropdown-size"
                                        />
                                    ) : (
                                        <div className="container dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.ethnicity)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row justify-content-between mb-5">
                                    <p className="large-bold-text column py-2">Race:</p>
                                    {editInfo ? (
                                        <Select
                                          placeholder={this.setDropDown(this.state.raceTemp)}
                                          aria-label="Select Race"
                                          options={raceOptions}
                                          closeMenuOnSelect
                                          onChange={this.handleChangeRace}
                                          value={this.state.raceTemp}
                                          menuPlacement="bottom"
                                          className="dropdown-size"
                                        />
                                    ) : (
                                        <div className="container dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.race)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="column" style={{ marginLeft: 200 }}>
                                <div className="row mb-2 justify-content-between">
                                    <p className="large-bold-text column py-2 mr-4">U.S. Legal Status:</p>
                                    {editInfo ? (
                                        <Select
                                          placeholder={this.setDropDown(this.state.citizenshipStatusTemp)}
                                          aria-label="Legal Status"
                                          options={legalStatus}
                                          closeMenuOnSelect
                                          onChange={this.handleChangeCitizenship}
                                          value={this.state.citizenshipStatusTemp}
                                          menuPlacement="bottom"
                                          className="dropdown-size"
                                        />
                                    ) : (
                                        <div className="container dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.citizenshipStatus)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="row justify-content-between">
                                    <p className="large-bold-text column py-2">Place of Birth:</p>
                                    {editInfo ? (
                                        <input
                                          type="text"
                                          className="form-control dropdown-size smaller-input"
                                          id="placeOfBirth"
                                          placeholder="Enter a City, State"
                                          onChange={this.handleChangePlaceofBirth}
                                          value={this.state.placeOfBirthTemp}
                                          aria-label="place of birth"
                                        />
                                    ) : (
                                        <div className="container dropdown-size">
                                            <div className="large-text py-2">{this.setData(this.state.placeOfBirth)}</div>
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

export default withRouter(Demographics);
