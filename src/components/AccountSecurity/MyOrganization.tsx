import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import CheckSVG from '../../static/images/check.svg';
import getServerURL from '../../serverOverride';

interface Props {
  name: string,
  organization: string,
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
 id:any,
 showPopUp: boolean,
 numInvitesSent: any
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
      id: 0,
      showPopUp: false,
      numInvitesSent: 0,
    };
    this.editButtonToggle = this.editButtonToggle.bind(this);
    this.changeEditMode = this.changeEditMode.bind(this);
    this.getEmailCell = this.getEmailCell.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.getNameCell = this.getNameCell.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.getRoleDropDown = this.getRoleDropDown.bind(this);
    this.handleChangeRole = this.handleChangeRole.bind(this);
    this.saveEdits = this.saveEdits.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.deleteMember = this.deleteMember.bind(this);
    this.handleSendInvites = this.handleSendInvites.bind(this);
    this.renderPopUp = this.renderPopUp.bind(this);
    this.saveMembersBackend = this.saveMembersBackend.bind(this);
  }

  onSubmit(e) {
    this.setState((prevState) => ({ id: prevState.id + 1 }));

    if (this.state.personName !== '') {
      const newMember = {
        name: this.state.personName,
        email: this.state.personEmail,
        role: this.state.personRole,
        editMode: this.state.isInEditMode,
        id: Date.now(),
      };

      this.setState((prevState) => ({
        memberArr: prevState.memberArr.concat(newMember),
        personName: '',
        personEmail: '',
        personRole: '',
      }));
    }
    e.preventDefault();
  }

  renderTableContents() {
    if (this.state.memberArr < 1) {
      return (
        <tbody>
          <tr>
            <td colSpan={5} className="bg-white brand-text text-secondary py-5">No new members</td>
          </tr>
        </tbody>
      );
    }
    const row = this.state.memberArr.map((member, i) => (
      <tbody key={member.id}>
        <tr>
          <td>{this.getNameCell(member)}</td>
          <td>{this.getEmailCell(member)}</td>
          <td>{this.editButtonToggle(member.id)}</td>
          <td>{this.getRoleDropDown(member)}</td>
          <td>
            <button type="button" className="close" aria-label="Close" onClick={() => this.deleteMember(i)}>
              <span aria-hidden="true" className="mx-auto">&times;</span>
            </button>
          </td>
        </tr>
      </tbody>
    ));
    return row;
  }

deleteMember=(i) => {
  this.setState((prevState) => {
    const members = prevState.memberArr.slice();
    members.splice(i, 1);
    return { memberArr: members };
  });
}

saveEdits(id) {
  const index = this.state.memberArr.findIndex((member) => member.id === id);
  const member = { ...this.state.memberArr[index] };
  member.email = this.state.editedPersonEmail;
  member.name = this.state.editedPersonName;
  member.role = this.state.editedPersonRole;
  member.editMode = !member.editMode;
  this.setState((prevState) => {
    const members = prevState.memberArr.slice();
    members[index] = member;
    return { memberArr: members };
  });
}

changeEditMode(id) {
  const index = this.state.memberArr.findIndex((member) => member.id === id);
  const member = { ...this.state.memberArr[index] };
  member.editMode = !member.editMode;

  this.setState((prevState) => {
    const members = prevState.memberArr.slice();
    members[index] = member;
    return {
      memberArr: members,
      editedPersonEmail: member.email,
      editedPersonName: member.name,
      editedPersonRole: member.role,
    };
  });
}

handleChangeEmail(event:any) {
  this.setState({
    editedPersonEmail: event.target.value,
  });
}

handleChangeName(event:any) {
  this.setState({
    editedPersonName: event.target.value,
  });
}

handleChangeRole(event:any) {
  this.setState({
    personRole: event.target.value,
  });
}

updateMemberValuesForEditing(member) {
  this.setState({ editedPersonEmail: member.email });
}

editButtonToggle = (id) => {
  const index = this.state.memberArr.findIndex((member) => member.id === id);
  const member = { ...this.state.memberArr[index] };
  const members = Object.assign([], this.state.memberArr);

  if (member.editMode) {
    return (
      <button type="button" className="btn btn-sm m-0 p-1 btn-outline-*" onClick={() => this.saveEdits(id)}>
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
    <button type="button" className="btn btn-sm m-0 p-0 shadow-none text-primary bg-transparent" onClick={() => this.changeEditMode(id)}>Edit</button>
  );
}

getNameCell(member) {
  if (member.editMode) {
    return (
      <input
        className="form-purple form-control input-sm"
        type="text"
        onChange={this.handleChangeName}
        value={this.state.editedPersonName}
      />
    );
  }

  return (
    <div>{member.name}</div>
  );
}

getEmailCell = (member) => {
  if (member.editMode) {
    return (
      <input
        className="form-purple form-control input-sm"
        type="text"
        value={this.state.editedPersonEmail}
        onChange={this.handleChangeEmail}
      />
    );
  }
  return (<div>{member.email}</div>);
}

getRoleDropDown = (member) => {
  if (member.editMode) {
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

handleSendInvites() {
  this.saveMembersBackend();
  this.setState((prevState) => ({
    numInvitesSent: prevState.memberArr.length,
    memberArr: [],
    showPopUp: true,
  }));
}

renderPopUp() {
  return (
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
  );
}

saveMembersBackend() {
  const members = Object.assign([], this.state.memberArr);
  let x;
  Object.keys(members).forEach((key) => {
    const { name } = members[key];
    const firstname = name.substr(0, name.indexOf(' '));
    const lastname = name.substr(name.indexOf(' ') + 1);
    members[key].firstName = firstname;
    members[key].lastName = lastname;
    delete members[key].id;
    delete members[key].editMode;
    delete members[key].name;
  });
  fetch(`${getServerURL()}/invite-user`, {
    method: 'POST',
    body: JSON.stringify({
      senderName: this.props.name,
      organization: this.props.organization,
      data: members,
    }),
  });
}

render() {
  return (
    <div className="container">
      {this.state.showPopUp === true && this.renderPopUp()}
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
          <div className="col-xs">
            <button className="btn btn-primary mt-4" type="submit" onClick={(e) => this.onSubmit(e)}>Add Member</button>
          </div>
        </div>
      </form>
      <p className="brand-text font-weight-bold text-dark mb-2">Recently Invited</p>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Edit</th>
            <th scope="col">Role</th>
            <th scope="col" />
          </tr>
        </thead>
        {this.renderTableContents()}
      </table>
      <button type="button" className="btn btn-primary mt-1 float-right" onClick={this.handleSendInvites}>Send Invites</button>
    </div>
  );
}
}
export default MyOrganization;
