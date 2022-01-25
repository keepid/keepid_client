import React, { Component, useState } from 'react';
import { withAlert } from 'react-alert';
import Alert from 'react-bootstrap/Alert';

import getServerURL from '../../serverOverride';
import CheckSVG from '../../static/images/check.svg';

interface Props {
  name: string;
  organization: string;
  alert: any;
}

interface State {
  personName: string;
  personEmail: any;
  personRole: any;
  isInEditMode: boolean;
  editedPersonEmail: string;
  editedPersonName: string;
  editedPersonRole: any;
  memberArr: any;
  showPopUp: boolean;
  numInvitesSent: number;
  numInEditMode: number;
  buttonLoadingState: boolean;
}

const MyOrganization = (props: Props) => {
  const [personName, setPersonName] = useState<State['personName']>('');
  const [personEmail, setPersonEmail] = useState<State['personEmail']>('');
  const [personRole, setPersonRole] = useState<State['personRole']>('');
  const [isInEditMode, setIsInEditMode] = useState<State['isInEditMode']>(false);
  const [editedPersonEmail, setEditedPersonEmail] = useState<State['editedPersonEmail']>('');
  const [editedPersonName, setEditedPersonName] = useState<State['editedPersonName']>('');
  const [editedPersonRole, setEditedPersonRole] = useState<State['editedPersonRole']>('');
  const [memberArr, setMemberArr] = useState<State['memberArr']>([]);
  const [showPopUp, setShowPopUp] = useState<State['showPopUp']>(false);
  const [numInvitesSent, setNumInvitesSent] = useState<State['numInvitesSent']>(0);
  const [numInEditMode, setNumInEditMode] = useState<State['numInEditMode']>(0);
  const [buttonLoadingState, setButtonLoadingState] = useState<State['buttonLoadingState']>(false);

  const addMember = (e: React.MouseEvent<HTMLElement>): void => {
    if (personName !== '' && personEmail !== '' && personRole !== '') {
      const dateID = Date.now();
      const newMember = {
        name: personName,
        email: personEmail,
        role: personRole,
        isInEditMode,
        dateID,
      };

      setMemberArr((prevMember) => [...memberArr, newMember]);
      setPersonEmail('');
      setPersonName('');
      setPersonRole('');
    } else {
      const { alert } = props;
      alert.show('missing field. name, email, and role are required');
    }
    e.preventDefault();
  };

  const deleteMember = (userIndex: number): void => {
    setMemberArr((prevArr) => {
      const members = prevArr.slice();
      members.splice(userIndex, 1);
      return { memberArr: members };
    });
  };

  const saveEdits = (dateID: Date): void => {
    const index = memberArr.findIndex((member) => member.dateID === dateID);
    const member = { ...memberArr[index] };
    member.email = editedPersonEmail;
    member.name = editedPersonName;
    member.role = editedPersonRole;
    member.isInEditMode = !member.isInEditMode;
    setMemberArr((prevArr) => {
      const members = prevArr.slice();
      members[index] = member;
      return {
        memberArr: members,
      };
    });
    setNumInEditMode((prevNum) => prevNum - 1);
  };

  const editButtonToggle = (dateID: Date): JSX.Element => {
    const index = memberArr.findIndex((member) => member.dateID === dateID);
    const member = { ...memberArr[index] };
    const members = Object.assign([], memberArr);

    if (member.isInEditMode) {
      return (
        <button
          type="button"
          className="btn btn-sm m-0 p-1 btn-outline-*"
          onClick={() => saveEdits(dateID)}
        >
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
          if (numInEditMode === 0) {
            member.isInEditMode = !member.isInEditMode;
            members[index] = member;
            setNumInEditMode((prevNum) => prevNum + 1);
            setMemberArr(members);
            setEditedPersonEmail(member.email);
            setEditedPersonName(member.name);
            setEditedPersonRole(member.role);
          }
        }}
      >
        Edit
      </button>
    );
  };

  const getNameCell = (member): JSX.Element => {
    if (member.isInEditMode) {
      return (
        <input
          className="form-purple form-control input-sm"
          type="text"
          value={editedPersonName}
          onChange={(e) => setEditedPersonName(e.target.value)}
        />
      );
    }
    return <div>{member.name}</div>;
  };

  const getEmailCell = (member): JSX.Element => {
    if (member.isInEditMode) {
      return (
        <input
          className="form-purple form-control input-sm"
          type="text"
          value={editedPersonEmail}
          onChange={(e) => setEditedPersonEmail(e.target.value)}
        />
      );
    }
    return <div>{member.email}</div>;
  };

  const getRoleDropDown = (member): JSX.Element => {
    if (member.isInEditMode) {
      return (
        <div>
          <select
            placeholder="Role"
            id="role"
            className="form-control form-purple"
            value={editedPersonRole}
            onChange={(e) =>
              setEditedPersonRole(e.target.value)
            }
          >
            <option defaultValue="" disabled hidden aria-labelledby="role" />
            <option value="Admin">Admin</option>
            <option value="Worker">Worker</option>
            <option value="Client">Client</option>
          </select>
        </div>
      );
    }
    return <div>{member.role}</div>;
  };

  const renderSuccessPopUp = (numInvitesSent: number): JSX.Element => (
    <div>
      <Alert
        className="mt-2"
        variant="success"
        dismissible
        onClose={() => setShowPopUp(false)}
      >
        <p className="mb-0">
          Congrats! You successfully invited
          {numInvitesSent}
          new members to your team! Head to your Admin Panel to see them.
        </p>
      </Alert>
    </div>
  );

  const renderTableContents = (): JSX.Element => {
    if (memberArr.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="bg-white brand-text text-secondary py-5">
            No new members
          </td>
        </tr>
      );
    }
    const row = memberArr.map((member, i) => (
      <tr key={member.dateID}>
        <td>{getNameCell(member)}</td>
        <td>{getEmailCell(member)}</td>
        <td>{editButtonToggle(member.dateID)}</td>
        <td>{getRoleDropDown(member)}</td>
        <td>
          <button
            type="button"
            className="close float-left"
            aria-label="Close"
            onClick={() => deleteMember(i)}
          >
            <span aria-hidden="true" className="mx-auto">
              &times;
            </span>
          </button>
        </td>
      </tr>
    ));
    return row;
  };

  const saveMembersBackend = (e: React.MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    const { alert, name, organization } = props;
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
    setButtonLoadingState(true);
    fetch(`${getServerURL()}/invite-user`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        senderName: name,
        organization,
        data: members,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;

        if (status === 'SUCCESS') {
          setNumInvitesSent(memberArr.length);
          setShowPopUp(true);
          setMemberArr([]);
          setButtonLoadingState(false);
        } else if (status === 'EMPTY_FIELD') {
          alert.show(
            'Missing field. Make sure to include first name, last name, email, AND role)',
          );
          setButtonLoadingState(false);
        }
      })
      .catch((error) => {
        alert.show(
          `Network Failure: ${error}. Logout and try again or report this issue to Keep.id`,
        );
        setButtonLoadingState(false);
      });
  };

  return (
    <div className="container">
      {showPopUp === true && renderSuccessPopUp(numInvitesSent)}
      <p className="font-weight-bold text-dark my-3 h3">
        Invite New Team Members
      </p>
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
                onChange={(e) =>
                  setPersonName(e.target.value)
                }
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
                onChange={(e) =>
                  setPersonEmail(e.target.value)
                }
              />
            </label>
          </div>
          <div className="form-group required col-xs-4">
            <label htmlFor="exampleRole">
              Role
              <select
                placeholder="Role"
                id="exampleRole"
                className="form-control form-purple"
                value={personRole}
                onChange={(e) =>
                  setPersonRole(e.target.value)
                }
              >
                <option
                  defaultValue=""
                  disabled
                  hidden
                  aria-labelledby="exampleRole"
                />
                <option>Admin</option>
                <option>Worker</option>
                <option>Client</option>
              </select>
            </label>
          </div>
          <div className="col-xs mt-3">
            <button
              className="btn btn-primary mt-1"
              type="submit"
              onClick={(e) => addMember(e)}
            >
              Add Member
            </button>
          </div>
        </div>
      </form>
      <p className="font-weight-bold text-dark mb-2 h3">Recently Invited</p>
      <div
        className="scrollbar"
        style={{
          maxHeight: '15.625rem',
          overflow: 'scroll',
          scrollbarColor: '#7B81FF',
        }}
      >
        <table className="table table-striped table-bordered">
          <thead className="position-sticky border" style={{ top: '0' }}>
            <tr>
              <th
                aria-label="Name Column"
                scope="col"
                style={{ top: '0' }}
                className="position-sticky bg-white border shadow-sm"
              >
                Name
              </th>
              <th
                aria-label="Email Column"
                scope="col"
                style={{ top: '0' }}
                className="position-sticky bg-white border shadow-sm"
              >
                Email
              </th>
              <th
                aria-label="Edit Button Column"
                scope="col"
                style={{ top: '0' }}
                className="position-sticky bg-white border shadow-sm"
              >
                Edit
              </th>
              <th
                aria-label="Role Column"
                scope="col"
                style={{ top: '0' }}
                className="position-sticky bg-white border shadow-sm"
              >
                Role
              </th>
              <th
                aria-label="Delete Button Column"
                scope="col"
                style={{ top: '0', zIndex: 999 }}
                className="position-sticky bg-white border shadow-sm"
              />
            </tr>
          </thead>
          <tbody className="table-striped">
            {renderTableContents()}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="btn btn-primary mt-1 float-right"
        onClick={(e) => saveMembersBackend(e)}
      >
        {buttonLoadingState ? (
          <div className="ld ld-ring ld-spin" />
        ) : (
          <div>Send Invites</div>
        )}
      </button>
    </div>
  );
};
export default withAlert()(MyOrganization);
