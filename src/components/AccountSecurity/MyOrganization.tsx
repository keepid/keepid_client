import React, { Component } from 'react';
import CheckSVG from '../../static/images/check.svg';

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
  }

onSubmit(e){

  if (this.state.personName!==""){
    let newMember = {
      name: this.state.personName,
      key: Date.now()
    };

  this.setState((prevState)=>{
    return{
      memberArr: prevState.memberArr.concat(newMember),
      personName: ""
    }
  });
  }

  console.log(this.state.memberArr);
  e.preventDefault();
}

renderTableContents(){
  return(
    <tbody>
      <tr>
        <td>{this.getNameCell()}</td>
        <td>{this.getEmailCell()}</td>
        <td>{this.editButtonToggle()}</td>
        <td>{this.getRoleDropDown()}</td>
        <td><button type="button" className="close" aria-label="Close">
        <span aria-hidden="true" className="mx-auto">&times;</span>
        </button>
        </td>
        </tr>
    </tbody>
  )
}

saveEdits() {
  this.setState({
    personEmail: this.state.editedPersonEmail,
    personName: this.state.editedPersonName,
    personRole: this.state.editedPersonRole,
  }, this.changeEditMode);
}

changeEditMode() {
  this.setState((prevState) => ({
    isInEditMode: !prevState.isInEditMode,
  }));
}

/*
  this.setState({
    isInEditMode: !this.state.isInEditMode
  });
*/

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

editButtonToggle = () => {
  if (this.state.isInEditMode) {
    return (
      <button type="button" onClick={this.saveEdits}>
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
    <button type="button" className="border-0 text-primary bg-transparent" onClick={this.changeEditMode}>Edit</button>
  );
}

getNameCell = () => {
  if (this.state.isInEditMode) {
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
    <div>{this.state.personName}</div>
  );
}

getEmailCell = () => {
  if (this.state.isInEditMode) {
    return (
      <input
        type="text"
        defaultValue={this.state.personEmail}
        onChange={this.handleChangeEmail}
        value={this.state.editedPersonEmail}
      />
    );
  }

  return (
    <div>
      {this.state.personEmail}
    </div>
  );
}

getRoleDropDown = () => {
  if (this.state.isInEditMode) {
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
    <div>{this.state.personRole}</div>
  );
}

render() {
  return (
    <div className="container">
      <h1 className="brand-text font-weight-bold">Invite New Team Members</h1>
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
            <button className="btn btn-primary mt-3" type="submit" onClick={(e) => this.onSubmit(e)}>Add Member</button>
          </div>
        </div>
      </form>
      <h2 className="brand-text font-weight-bold">Recently Invited</h2>
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
        {this.renderTableContents}
      </table>
    </div>
  );
}
}

export default MyOrganization;
