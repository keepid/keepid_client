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
 numInvitesSent: number,
 numInEditMode: number,
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

  addMember = (e:React.MouseEvent<HTMLElement>):void => {
    const {
      personName,
      personEmail,
      personRole,
      isInEditMode,
    } = this.state;

    if (personName !== '' && personEmail !== '' && personRole !== '') {
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
      const { alert } = this.props;
      alert.show('missing field. name, email, and role are required');
    }
    e.preventDefault();
  }

  renderTableContents = ():JSX.Element => {
    const { memberArr } = this.state;
    if (memberArr.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="bg-white brand-text text-secondary py-5">No new members</td>
        </tr>
      );
    }
    const row = memberArr.map((member, i) => (

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
    const { memberArr } = this.state;
    const index = memberArr.findIndex((member) => member.dateID === dateID);
    const member = { ...memberArr[index] };
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

  editButtonToggle = (dateID: Date):JSX.Element => {
    const { memberArr } = this.state;
    const index = memberArr.findIndex((member) => member.dateID === dateID);
    const member = { ...memberArr[index] };
    const members = Object.assign([], memberArr);

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
          const { numInEditMode } = this.state;
          if (numInEditMode === 0) {
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

  getNameCell = (member):JSX.Element => {
    const { editedPersonName } = this.state;
    if (member.isInEditMode) {
      return (
        <input
          className="form-purple form-control input-sm"
          type="text"
          value={editedPersonName}
          onChange={(e) => this.setState({ editedPersonName: e.target.value })}
        />
      );
    }
    return (
      <div>{member.name}</div>
    );
  }

  getEmailCell = (member):JSX.Element => {
    const { editedPersonEmail } = this.state;
    if (member.isInEditMode) {
      return (
        <input
          className="form-purple form-control input-sm"
          type="text"
          value={editedPersonEmail}
          onChange={(e) => this.setState({ editedPersonEmail: e.target.value })}
        />
      );
    }
    return (<div>{member.email}</div>);
  }

  getRoleDropDown = (member):JSX.Element => {
    const { editedPersonRole } = this.state;
    if (member.isInEditMode) {
      return (
        <div>
          <select placeholder="Role" id="role" className="form-control form-purple" value={editedPersonRole} onChange={(e) => this.setState({ editedPersonRole: e.target.value })}>
            <option defaultValue="" disabled hidden aria-labelledby="role" />
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

  renderSuccessPopUp = (numInvitesSent:number):JSX.Element => (
    <div>
      <Alert variant="success" dismissible onClose={() => (this.setState({ showPopUp: false }))}>
        <p>
          Congrats! You successfully invited
          {' '}
          {numInvitesSent}
          {' '}
          new members to your team! Head to your Admin Panel to see them
        </p>
      </Alert>
    </div>
  )

  saveMembersBackend = (e:React.MouseEvent<HTMLElement>):void => {
    e.preventDefault();
    const {
      alert,
      name,
      organization,
    } = this.props;
    const { memberArr } = this.state;
    const members = Object.assign([], memberArr);
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
      alert.show(`Error Parsing Name : ${error}`);
    }

    this.setState({ buttonLoadingState: true });
    fetch(`${getServerURL()}/invite-user`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        senderName: name,
        organization,
        data: members,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = responseJSON;
        const { status } = responseObject;
        if (status === 'SUCCESS') {
          this.setState((prevState) => ({
            showPopUp: true,
            numInvitesSent: prevState.memberArr.length,
            memberArr: [],
            buttonLoadingState: false,
          }));
        } else if (status === 'EMPTY_FIELD') {
          alert.show('Missing field. Make sure to include first name, last name, email, AND role)');
          this.setState({ buttonLoadingState: false });
        }
      }).catch((error) => {
        alert.show(`Network Failure: ${error}`);
        this.setState({ buttonLoadingState: false });
      });
  }

  render() {
    const {
      showPopUp, numInvitesSent, personRole, personName, personEmail, buttonLoadingState,
    } = this.state;
    return (
      <div className="container">
        {showPopUp === true && this.renderSuccessPopUp(numInvitesSent)}
        <p className="font-weight-bold text-dark my-3 h3">Invite New Team Members</p>
        <form>
          <div className="form-row">
            <div className="form-group required col-xs">
              <label htmlFor="exampleName">
                Name
                <input
                  placeholder="Full Name Here"
                  type="name"
                  className="form-control form-purple"
                  id="exampleName"
                  value={personName}
                  onChange={(e) => this.setState({ personName: e.target.value })}
                />
              </label>
            </div>
            <div className="form-group required col-xs">
              <label htmlFor="exampleEmail">
                Email address
                <input
                  placeholder="Enter Valid Email"
                  type="email"
                  id="exampleEmail"
                  className="form-control form-purple"
                  value={personEmail}
                  onChange={(e) => this.setState({ personEmail: e.target.value })}
                />
              </label>
            </div>
            <div className="form-group required col-xs-4">
              <label htmlFor="exampleRole">
                Role
                <select placeholder="Role" id="exampleRole" className="form-control form-purple" value={personRole} onChange={(e) => this.setState({ personRole: e.target.value })}>
                  <option defaultValue="" disabled hidden aria-labelledby="exampleRole" />
                  <option>Admin</option>
                  <option>Worker</option>
                </select>
              </label>
            </div>
            <div className="col-xs mt-3">
              <button className="btn btn-primary mt-1" type="submit" onClick={(e) => this.addMember(e)}>Add Member</button>
            </div>
          </div>
        </form>
        <p className="font-weight-bold text-dark mb-2 h3">Recently Invited</p>
        <div className="scrollbar" style={{ maxHeight: '15.625rem', overflow: 'scroll', scrollbarColor: '#7B81FF' }}>
          <table className="table table-striped table-bordered">
            <thead className="position-sticky border" style={{ top: '0' }}>
              <tr>
                <th aria-label="Name Column" scope="col" style={{ top: '0' }} className="position-sticky bg-white border shadow-sm">Name</th>
                <th aria-label="Email Column" scope="col" style={{ top: '0' }} className="position-sticky bg-white border shadow-sm">Email</th>
                <th aria-label="Edit Button Column" scope="col" style={{ top: '0' }} className="position-sticky bg-white border shadow-sm">Edit</th>
                <th aria-label="Role Column" scope="col" style={{ top: '0' }} className="position-sticky bg-white border shadow-sm">Role</th>
                <th aria-label="Delete Button Column" scope="col" style={{ top: '0', zIndex: 999 }} className="position-sticky bg-white border shadow-sm" />
              </tr>
            </thead>
            <tbody className="table-striped">{this.renderTableContents()}</tbody>
          </table>
        </div>
        <button type="button" className="btn btn-primary mt-1 float-right" onClick={(e) => this.saveMembersBackend(e)}>{buttonLoadingState ? <div className="ld ld-ring ld-spin" /> : <div>Send Invites</div>}</button>
      </div>
    );
  }
}
export default withAlert()(MyOrganization);
