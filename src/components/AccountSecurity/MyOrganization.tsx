import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import { withAlert } from 'react-alert';
import CheckSVG from '../../static/images/check.svg';
import getServerURL from '../../serverOverride';

interface Props {
  name: string,
  organization: string,
  alert: any
}

interface State {
 personName: string,
 personEmail: any,
 personRole: any,
 isInEditMode: boolean,
 editedPersonEmail: string,
 editedPersonName: string,
 editedPersonRole: any,
 memberArr: any,
 showPopUp: boolean,
 numInvitesSent: any,
 numInEditMode: any,
 buttonLoadingState: boolean,
}

class MyOrganization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      personName: '',
      personEmail: '',
      personRole: '',
      isInEditMode: false,
      editedPersonEmail: '',
      editedPersonName: '',
      editedPersonRole: '',
      memberArr: [],
      showPopUp: false,
      numInvitesSent: 0,
      numInEditMode: 0,
      buttonLoadingState: false,
    };
    this.editButtonToggle = this.editButtonToggle.bind(this);
    this.getEmailCell = this.getEmailCell.bind(this);
    this.getNameCell = this.getNameCell.bind(this);
    this.getRoleDropDown = this.getRoleDropDown.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
    this.addMember = this.addMember.bind(this);
    this.deleteMember = this.deleteMember.bind(this);
    this.renderSuccessPopUp = this.renderSuccessPopUp.bind(this);
    this.saveMembersBackend = this.saveMembersBackend.bind(this);
  }

  addMember = (e):void => {
    if (this.state.personName !== '' && this.state.personEmail !== '' && this.state.personRole !== '') {
      const {
        personName,
        personEmail,
        personRole,
        isInEditMode,
      } = this.state;

      const dateID = Date.now();
      const newMember = {
        name: personName, email: personEmail, role: personRole, isInEditMode, dateID,
      };

      this.setState((prevState) => ({
        memberArr: prevState.memberArr.concat(newMember),
        personName: '',
        personEmail: '',
        personRole: '',
      }));
    } else {
      this.props.alert.show('missing field. name, email, and role are required');
    }
    e.preventDefault();
  }

  renderTableContents = () => {
    if (this.state.memberArr.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="bg-white brand-text text-secondary py-5">No new members</td>
        </tr>
      );
    }
    const row = this.state.memberArr.map((member, i) => (

      <tr key={member.dateID}>
        <td>{this.getNameCell(member)}</td>
        <td>{this.getEmailCell(member)}</td>
        <td>{this.editButtonToggle(member.dateID)}</td>
        <td>{this.getRoleDropDown(member)}</td>
        <td>
          <button type="button" className="close float-left" aria-label="Close" onClick={() => this.deleteMember(i)}>
            <span aria-hidden="true" className="mx-auto">&times;</span>
          </button>
        </td>
      </tr>

    ));
    return row;
  }

  deleteMember = (userIndex: number):void => {
    this.setState((prevState) => {
      const members = prevState.memberArr.slice();
      members.splice(userIndex, 1);
      return { memberArr: members };
    });
  }

  saveEdits = (dateID: Date):void => {
    const index = this.state.memberArr.findIndex((member) => member.dateID === dateID);
    const member = { ...this.state.memberArr[index] };
    const {
      editedPersonEmail,
      editedPersonName,
      editedPersonRole,
    } = this.state;
    member.email = editedPersonEmail;
    member.name = editedPersonName;
    member.role = editedPersonRole;
    member.isInEditMode = !member.isInEditMode;
    this.setState((prevState) => {
      const members = prevState.memberArr.slice();
      members[index] = member;
      return {
        memberArr: members,
        numInEditMode: prevState.numInEditMode - 1,
      };
    });
  }

  editButtonToggle = (dateID: Date) => {
    const index = this.state.memberArr.findIndex((member) => member.dateID === dateID);
    const member = { ...this.state.memberArr[index] };
    const members = Object.assign([], this.state.memberArr);

    if (member.isInEditMode) {
      return (
        <button type="button" className="btn btn-sm m-0 p-1 btn-outline-*" onClick={() => this.saveEdits(dateID)}>
          <img
            alt="search"
            src={CheckSVG}
            width="22"
            height="22"
            className="d-inline-block align-middle ml-1"
          />
        </button>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-sm m-0 p-0 shadow-none text-primary bg-transparent"
        onClick={() => {
          if (this.state.numInEditMode === 0) {
            member.isInEditMode = !member.isInEditMode;
            members[index] = member;
            this.setState((prevState) => ({
              numInEditMode: prevState.numInEditMode + 1,
              memberArr: members,
              editedPersonEmail: member.email,
              editedPersonName: member.name,
              editedPersonRole: member.role,
            }));
          }
        }}
      >
        Edit
      </button>
    );
  }

  getNameCell = (member) => {
    if (member.isInEditMode) {
      return (
        <input
          className="form-purple form-control input-sm"
          type="text"
          value={this.state.editedPersonName}
          onChange={(e) => this.setState({ editedPersonName: e.target.value })}
        />
      );
    }
    return (
      <div>{member.name}</div>
    );
  }

  getEmailCell = (member) => {
    if (member.isInEditMode) {
      return (
        <input
          className="form-purple form-control input-sm"
          type="text"
          value={this.state.editedPersonEmail}
          onChange={(e) => this.setState({ editedPersonEmail: e.target.value })}
        />
      );
    }
    return (<div>{member.email}</div>);
  }

  getRoleDropDown = (member) => {
    if (member.isInEditMode) {
      return (
        <div>
          <select placeholder="Role" id="role2" className="form-control form-purple" value={this.state.editedPersonRole} onChange={(e) => this.setState({ editedPersonRole: e.target.value })}>
            <option defaultValue="" disabled hidden aria-labelledby="role2" />
            <option value="Admin">Admin</option>
            <option value="Worker">Worker</option>
          </select>
        </div>
      );
    }
    return (
      <div>{member.role}</div>
    );
  }

  renderSuccessPopUp = ():JSX.Element => (
    <div>
      <Alert variant="success" dismissible onClose={() => (this.setState({ showPopUp: false }))}>
        <p>
          Congrats! You successfully invited
          {' '}
          {this.state.numInvitesSent}
          {' '}
          new members to your team! Head to your Admin Panel to see them
        </p>
      </Alert>
    </div>
  )

  saveMembersBackend = (e):void => {
    e.preventDefault();
    const members = Object.assign([], this.state.memberArr);
    try {
      Object.keys(members).forEach((key) => {
        const fullName = members[key].name;
        const firstname = fullName.substr(0, fullName.indexOf(' '));
        let lastname = fullName.substr(fullName.indexOf(' ') + 1);
        lastname = lastname.trim();
        members[key].firstName = firstname;
        members[key].lastName = lastname;
      });
    } catch (error) {
      console.log(error);
    }
    this.setState({ buttonLoadingState: true });
    fetch(`${getServerURL()}/invite-user`, {
      method: 'POST',
      body: JSON.stringify({
        senderName: this.props.name,
        organization: this.props.organization,
        data: members,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        const { status } = responseObject;
        if (status === 'SUCCESS') {
          this.setState((prevState) => ({
            showPopUp: true,
            numInvitesSent: prevState.memberArr.length,
            memberArr: [],
            buttonLoadingState: false,
          }));
        } else if (status === 'EMPTY_FIELD') {
          this.props.alert.show('Missing field. Make sure to include first name, last name, email, AND role)');
          this.setState({ buttonLoadingState: false });
        }
      }).catch((error) => {
        this.props.alert.show('Network Failure: Check Server Connection.');
        this.setState({ buttonLoadingState: false });
      });
  }

  render() {
    return (
      <div className="container">
        {this.state.showPopUp === true && this.renderSuccessPopUp()}
        <p className="font-weight-bold brand-text text-dark mb-2">Invite New Team Members</p>
        <form>
          <div className="form-row">
            <div className="form-group col-xs required">
              <label>Name</label>
              <input
                placeholder="Full Name Here"
                type="name"
                className="form-control form-purple"
                id="exampleName"
                value={this.state.personName}
                onChange={(e) => this.setState({ personName: e.target.value })}
              />
            </div>
            <div className="form-group col-xs required">
              <label>Email address</label>
              <input
                placeholder="Enter Valid Email Address"
                type="email"
                className="form-control form-purple"
                value={this.state.personEmail}
                onChange={(e) => this.setState({ personEmail: e.target.value })}
              />
            </div>
            <div className="form-group col-xs-4 required">
              <label>Role</label>
              <select placeholder="Role" id="role1" className="form-control form-purple" value={this.state.personRole} onChange={(e) => this.setState({ personRole: e.target.value })}>
                <option defaultValue="" disabled hidden aria-labelledby="role1" />
                <option>Admin</option>
                <option>Worker</option>
              </select>
            </div>
            <div className="col-xs mt-4">
              <button className="btn btn-primary mt-1" type="submit" onClick={(e) => this.addMember(e)}>Add Member</button>
            </div>
          </div>
        </form>
        <p className="brand-text font-weight-bold text-dark mb-2">Recently Invited</p>
        <div className="scrollbar" style={{ maxHeight: '15.625rem', overflow: 'scroll', scrollbarColor: '#7B81FF' }}>
          <table className="table table-striped table-bordered">
            <thead className="position-sticky border" style={{ top: '0' }}>
              <tr>
                <th scope="col" style={{ top: '0' }} className="position-sticky bg-white border shadow-sm">Name</th>
                <th scope="col" style={{ top: '0' }} className="position-sticky bg-white border shadow-sm">Email</th>
                <th scope="col" style={{ top: '0' }} className="position-sticky bg-white border shadow-sm">Edit</th>
                <th scope="col" style={{ top: '0' }} className="position-sticky bg-white border shadow-sm">Role</th>
                <th scope="col" style={{ top: '0', zIndex: 999 }} className="position-sticky bg-white border shadow-sm" />
              </tr>
            </thead>
            <tbody className="table-striped">{this.renderTableContents()}</tbody>
          </table>
        </div>
        <button type="button" className="btn btn-primary mt-1 float-right" onClick={(e) => this.saveMembersBackend(e)}>{this.state.buttonLoadingState ? <div className="ld ld-ring ld-spin" /> : <div>Send Invites</div>}</button>
      </div>
    );
  }
}
export default withAlert()(MyOrganization);
