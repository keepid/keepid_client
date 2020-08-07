import React, { Component } from 'react';

interface Props {
}

interface State {
 personName: string,
 personEmail: string,
 personRole: any,
}

class MyOrganization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      personName: '',
      personEmail: '',
      personRole: '',
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

onSubmit = (e) => {
  e.preventDefault();
  //console.log(this.state);
}

render() {
  return (
    <div>
      <h1 className="brand-text">Invite New Team Members</h1>

      <form>
      <div className="form-row">
        <div className="form-group col">
          <label>Name</label>
          <input
            placeholder="Full Name Here"
            type="name"
            className="form-control"
            id="exampleName"
            value={this.state.personName}
            onChange={(e) => this.setState({ personName: e.target.value })}
          />
          </div>
        <div className="form-group col">
          <label>Email address</label>
          <input
            placeholder="Enter Valid Email Address"
            type="email"
            className="form-control"
            value={this.state.personEmail}
            onChange={(e) => this.setState({ personEmail: e.target.value })}
          />
        </div>
        <div className="form-group col-xs-4">
          <label>Role</label>
          <select placeholder="Role" id="role1" className="form-control" value={this.state.personRole} onChange={(e) => this.setState({ personRole: e.target.value })}>
            <option defaultValue="" disabled hidden aria-labelledby="role1" />
            <option>Admin</option>
            <option>Worker</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" type="submit" onClick={(e) => this.onSubmit(e)}>Add Member</button>
        </div>
      </form>
    </div>
  );
}
}

export default MyOrganization;
