import React, { Component } from 'react';
import CheckSVG from '../../static/images/check.svg';
import Alert from 'react-bootstrap/Alert';

interface Props {
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
      numInvitesSent: 0
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
  }

  onSubmit(e) {
    this.setState((prevState) => ({ id: prevState.id + 1 }));

    if (this.state.personName !== '') {
      const newMember = {
        name: this.state.personName,
        email: this.state.personEmail,
        role: this.state.personRole,
        editMode: this.state.isInEditMode,
        key: Date.now(),
        id: this.state.id,
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
    if(this.state.memberArr.length==0){
      return(
        <tbody>
          <tr>
            <td colSpan={5} className="bg-white brand-text text-secondary py-5">No new members</td>
          </tr>
        </tbody>
      )
    }
    const row = this.state.memberArr.map((member, i) => (
      <tbody>
        <tr key={member.key}>
          <td>{this.getNameCell(member)}</td>
          <td>{this.getEmailCell(member.id)}</td>
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
  const members = Object.assign([], this.state.memberArr);
  members.splice(i, 1);
  this.setState({ memberArr: members });
}

saveEdits(id) {
  const index = this.state.memberArr.findIndex((member) => member.id === id);
  const member = { ...this.state.memberArr[index] };
  const members = Object.assign([], this.state.memberArr);
  member.email = this.state.editedPersonEmail;
  member.name = this.state.editedPersonName;
  member.role = this.state.editedPersonRole;
  member.editMode = !member.editMode;
  members[index] = member;
  this.setState({
    memberArr: members,
  });
}

changeEditMode(id) {
  const index = this.state.memberArr.findIndex((member) => member.id === id);
  const member = { ...this.state.memberArr[index] };
  member.editMode = !member.editMode;
  const members = Object.assign([], this.state.memberArr);
  members[index] = member;
  this.setState({
    memberArr: members,
    editedPersonEmail: member.email,
    editedPersonName: member.name,
    editedPersonRole: member.role,
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
      <button type="button" onClick={() => this.saveEdits(id)}>
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
    <button type="button" className="border-0 text-primary bg-transparent" onClick={() => this.changeEditMode(id)}>Edit</button>
  );
}

getNameCell(member) {
  if (member.editMode) {
    return (
      <input
        type="text"
        defaultValue={this.state.personName}
        onChange={this.handleChangeName}
        value={this.state.editedPersonName}
      />
    );
  }

  return (
    <div>{member.name}</div>
  );
}

getEmailCell = (id) => {
  const index = this.state.memberArr.findIndex((member) => member.id === id);
  const member = { ...this.state.memberArr[index] };
  const members = { ...this.state.memberArr };
  // members[index] = member;
  // this.setState({memberArr:members})

  if (member.editMode) {
    console.log(`editing: ${id}MEBER:${member.email}`);
    return (
      <input
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

handleSendInvites(){
  this.setState({
    numInvitesSent: this.state.memberArr.length,
    memberArr:[], 
    showPopUp:true
  });
}

renderPopUp(){
  return(
    <div>
      <Alert variant="success" dismissible onClose={()=>(this.setState({showPopUp:false}))}>
        <p>Congrats! You successfully invited {this.state.numInvitesSent} new members to your team! Head to your Admin Panel to see them</p>
      </Alert>
    </div>
  );
}

render() {
  return (
    <div className="container">
      {this.state.showPopUp===true && this.renderPopUp()}
      <p className="font-weight-bold brand-text text-dark mb-2">Invite New Team Members</p>
      <form>
        <div className="form-row">
          <div className="form-group col required">
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
          <div className="form-group col required">
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
          <div className="col">
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
      <button className="btn btn-primary mt-1 float-right" onClick={this.handleSendInvites}>Send Invites</button>
    </div>
  );
}
}
export default MyOrganization;
