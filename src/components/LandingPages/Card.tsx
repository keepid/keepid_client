import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { createLiteralTypeNode } from 'typescript';

class Card extends Component {
  render() {
    const { client } = this.props;

    return (
      <div>
        {/* card #1 */}
        <div className="tw-flex tw-flex-col tw-gap-y-2.5 tw-pt-8 tw-pb-8 tw-px-3 tw-items-center tw-justify-center tw-border tw-border-l-gray-100 tw-shadow-gray-300 tw-shadow-md tw-rounded-lg">
          {/* name/pic/caseworkerName */}
          {/* profile pic */}
          <img
            src={client.photo ? client.photo : 'generalpfp.png'}
            alt="pfp exists"
            className="tw-rounded-full tw-w-36 tw-h-36"
          />
          {/* name/caseworker name */}
          <p className="tw-text-lg tw-text-center tw-font-bold tw-font-sans-serif">
            {client.firstName} {client.lastName}
            <p className="tw-text-sm tw-mt-1 tw-font-light tw-font-sans-serif tw-text-darkGray tw-text-center">
              {client.assignedWorkerUsernames}
            </p>
          </p>
          {/* app/doc/pf */}
          <div className="tw-flex tw-flex-row tw-gap-x-3 tw-h-16 ">
            <div className="hover:tw-bg-primaryLavender hover:tw-border-primaryPurple tw-py-2 tw-px-4 tw-w-30 tw-border tw-border-gray-300 tw-rounded-lg ">
              <Link
                to={{
                  pathname: '/applications',
                  state: { clientUsername: client.username },
                }}
              >
                <div className="tw-flex tw-gap-y-2 tw-items-center tw-justify-center">
                  <svg
                    className="text-center"
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.0003 1.66675H8.00033C7.54009 1.66675 7.16699 2.03984 7.16699 2.50008V4.16675C7.16699 4.62699 7.54009 5.00008 8.00033 5.00008H13.0003C13.4606 5.00008 13.8337 4.62699 13.8337 4.16675V2.50008C13.8337 2.03984 13.4606 1.66675 13.0003 1.66675Z"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.18301 10.5084C9.34552 10.3459 9.53845 10.217 9.75078 10.1291C9.96311 10.0411 10.1907 9.99585 10.4205 9.99585C10.6503 9.99585 10.8779 10.0411 11.0902 10.1291C11.3026 10.217 11.4955 10.3459 11.658 10.5084C11.8205 10.6709 11.9494 10.8639 12.0374 11.0762C12.1253 11.2885 12.1706 11.5161 12.1706 11.7459C12.1706 11.9758 12.1253 12.2033 12.0374 12.4157C11.9494 12.628 11.8205 12.8209 11.658 12.9834L7.12467 17.5001L3.83301 18.3334L4.65801 15.0418L9.18301 10.5084Z"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.8337 3.33325H15.5003C15.9424 3.33325 16.3663 3.50885 16.6788 3.82141C16.9914 4.13397 17.167 4.55789 17.167 4.99992V16.6666C17.167 17.1086 16.9914 17.5325 16.6788 17.8451C16.3663 18.1577 15.9424 18.3333 15.5003 18.3333H10.917"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.83301 11.2499V4.99992C3.83301 4.55789 4.0086 4.13397 4.32116 3.82141C4.63372 3.50885 5.05765 3.33325 5.49967 3.33325H7.16634"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="tw-text-center tw-text-black pt-2 pb-2">
                  Applications
                </p>
              </Link>
            </div>
            <div className="hover:tw-bg-primaryLavender hover:tw-border-primaryPurple tw-py-2 tw-px-4 tw-w-30 tw-border tw-border-gray-300 tw-rounded-lg ">
              <a href={`/my-documents/${client.username}`}>
                <div>
                  <div className="tw-flex tw-gap-y-2 tw-items-center tw-justify-center">
                    <svg
                      width="15"
                      height="18"
                      viewBox="0 0 15 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.00033 9H10.0003M5.00033 12.3333H10.0003M11.667 16.5H3.33366C2.41318 16.5 1.66699 15.7538 1.66699 14.8333V3.16667C1.66699 2.24619 2.41318 1.5 3.33366 1.5H7.98848C8.20949 1.5 8.42146 1.5878 8.57774 1.74408L13.0896 6.25592C13.2459 6.4122 13.3337 6.62416 13.3337 6.84518V14.8333C13.3337 15.7538 12.5875 16.5 11.667 16.5Z"
                        stroke="#111827"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="tw-text-black tw-text-center pt-2 pb-2">
                    Documents
                  </p>
                </div>
              </a>
            </div>
            <div className="hover:tw-bg-primaryLavender hover:tw-border-primaryPurple tw-py-2 tw-px-4 tw-w-30 tw-border tw-border-gray-300 tw-rounded-lg ">
              <a href={`/profile/${client.username}`}>
                <div className="tw-flex tw-gap-y-2 tw-items-center tw-justify-center">
                  <svg
                    width="17"
                    height="18"
                    viewBox="0 0 17 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.76753 13.8364C4.46056 12.8795 6.4165 12.3333 8.5 12.3333C10.5835 12.3333 12.5394 12.8795 14.2325 13.8364M11 7.33333C11 8.71405 9.88071 9.83333 8.5 9.83333C7.11929 9.83333 6 8.71405 6 7.33333C6 5.95262 7.11929 4.83333 8.5 4.83333C9.88071 4.83333 11 5.95262 11 7.33333ZM16 9C16 13.1421 12.6421 16.5 8.5 16.5C4.35786 16.5 1 13.1421 1 9C1 4.85786 4.35786 1.5 8.5 1.5C12.6421 1.5 16 4.85786 16 9Z"
                      stroke="#111827"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="tw-text-black tw-text-center pt-2 pb-2">
                  Profile
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Card;
