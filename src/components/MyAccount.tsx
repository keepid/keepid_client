import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

const editData = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
};

class MyAccount extends Component<{}, {}, {}> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.modalRender = this.modalRender.bind(this);
  }

  changePassword() {

  }

  modalRender() {
    const allModals: React.ReactFragment[] = [];
    for (const field in editData) {
      if ({}.hasOwnProperty.call(editData, field)) {
        // console.log(`${field}, ${editData[field]}`);
        allModals.push(
          <React.Fragment key={field}>
            <div className="modal fade" id={`${field}Modal`} role="dialog" aria-labelledby={`${field}Modal`} aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
  Edit
                      {editData[field]}
                    </h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-3 mt-3">
                      <div className="col card-text mt-2">
                        Enter New
                        {' '}
                        {editData[field]}
                      </div>
                      <div className="col-6 card-text">
                        <input type="text" className="form-control form-purple" id={`${field}Form`} placeholder={`Enter ${editData[field]} Here`} />
                      </div>
                    </div>
                    <div className="row mb-3 mt-3">
                      <div className="col card-text mt-2">
                        Enter Your Password
                      </div>
                      <div className="col-6 card-text">
                        <input type="text" className="form-control form-purple" id="passwordVerification" placeholder="Enter Password Here" />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>,
        );
      }
    }
    return (
      <div>
        {allModals}
      </div>
    );
  }

  render() {
    return (
      <div className="container">
        <Helmet>
          <title>My Account</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="card mt-3 mb-3">
          <div className="card-body">
            <h5 className="card-title pb-3">My Account Details</h5>

            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                First Name
              </div>
              <div className="col-6 card-text">
                <input type="text" className="form-control form-purple" id="firstName" placeholder="John" readOnly />
              </div>
              <button type="button" className="btn btn-outline-dark" data-toggle="modal" data-target="#firstNameModal">Edit</button>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Last Name
              </div>
              <div className="col-6 card-text">
                <input type="text" className="form-control form-purple" id="lastName" placeholder="Smith" readOnly />
              </div>
              <button type="button" className="btn btn-outline-dark" data-toggle="modal" data-target="#lastNameModal">Edit</button>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Email
              </div>
              <div className="col-6 card-text">
                <input type="text" className="form-control form-purple" id="inputOrgName" placeholder="my.email@example.com" readOnly />
              </div>
              <button type="button" className="btn btn-outline-dark" data-toggle="modal" data-target="#emailModal">Edit</button>
            </div>
          </div>
          {this.modalRender()}
        </div>
        <div className="card mt-3 mb-3">
          <div className="card-body">
            <h5 className="card-title pb-3">Change Password</h5>

            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Enter Old Password
              </div>
              <div className="col-6 card-text">
                <input type="password" className="form-control form-purple" id="newPassword" placeholder="*******" />
              </div>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Enter New Password
              </div>
              <div className="col-6 card-text">
                <input type="password" className="form-control form-purple" id="confirmNewPassword" placeholder="*******" />
              </div>
              <div className=" ml-0 pl-0 col-3 card-text mt-2 text-muted">
                At least 8 characters long
              </div>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Retype New Password
              </div>
              <div className="col-6 card-text">
                <input type="password" className="form-control form-purple" id="oldPassword" placeholder="*******" />
              </div>
              <button type="button" onSubmit={this.changePassword} className="btn btn-outline-success">Submit</button>
            </div>
          </div>
        </div>
        <div className="card mt-3 mb-3">
          <div className="card-body">
            <h5 className="card-title pb-3">Two Factor Authentication</h5>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Status:
              </div>
              <div className="col-3 card-text mt-2 text-danger">
                Not Set Up Yet
              </div>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Phone Number:
              </div>
              <div className="col-6 card-text">
                <input type="text" className="form-control form-purple" id="phoneNumber" placeholder="(123)-456-7890" />
              </div>
              <button type="button" className="btn btn-outline-success">Submit</button>
            </div>
          </div>
        </div>
        <div className="card mt-3 mb-3">
          <div className="card-body">
            <h5 className="card-title pb-3">Login History</h5>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Access Details:
              </div>
              <div className="col-9 card-text mt-2 text-success">
                Some Date and Time here, Some Address here (make this a list)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyAccount;
