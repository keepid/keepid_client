import React, { Component } from 'react';
import CheckSVG from '../../static/images/check.svg';

interface Props {
}

interface State {
 personName: string,
 personEmail: string,
 personRole: any,
 allowEdit: boolean,
}

class MyOrganization extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      personName: '',
      personEmail: '',
      personRole: '',
      allowEdit: false
    };

    this.edit = this.edit.bind(this);
  }

onSubmit = (e) => {
  e.preventDefault();
  //console.log(this.state);
}

/*
return(
    <img
    alt="search"
    src={SearchSVG}
    width="22"
    height="22"
    className="d-inline-block align-middle ml-1"
    />
  )
*/

allowEdit = () =>{
  this.setState({
    allowEdit:!this.state.allowEdit
  })
}

edit(){
  if (this.state.allowEdit){
    return(
      <img
      alt="search"
      src={CheckSVG}
      width="22"
      height="22"
      className="d-inline-block align-middle ml-1"
      onClick={this.allowEdit}
      />
    )
  }
  else{
    return(
      <button className="border-0 text-primary bg-transparent" onClick={this.allowEdit}>Edit</button>
    )
  }
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
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Mark Otto</td>
          <td>@mdo</td>
          <td>
            {this.edit()}
          </td>
          <td>
            <select placeholder="Role" id="role1" className="form-control form-purple">
            <option defaultValue="" disabled hidden aria-labelledby="role1" />
            <option>Admin</option>
            <option>Worker</option>
          </select>
          </td>
          <td>
            <button type="button" className="close" aria-label="Close">
            <span aria-hidden="true" className="mx-auto">&times;</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  );
}
}

export default MyOrganization;
