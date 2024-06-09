import 'react-day-picker/dist/style.css';

import { format } from 'date-fns';
import React, { useCallback, useState } from 'react';
import { useAlert } from 'react-alert';
import { DayPicker } from 'react-day-picker';

import getServerURL from '../../serverOverride';

function FamilyInformation({ data, setData, setPostRequestMade, username }) {
  const [isEditing, setEditing] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState('');
  const [originalData, setOriginalData] = useState(data); // create copy of original data
  const alert = useAlert();

  const addRelation = (relation) => {
    setData({
      ...data,
      [relation]: [
        ...data[relation],
        { firstName: '', middleName: '', lastName: '', ssn: '', birthDate: '' },
      ],
    });
  };

  const removeRelation = (relation, index) => {
    setData((prevData) => {
      const newRelation = [...prevData[relation]];
      newRelation.splice(index, 1);
      return { ...prevData, [relation]: newRelation };
    });
  };

  const handleInputChange = useCallback(
    (relation, field, id, value) => {
      setData((prevData) => ({
        ...prevData,
        [relation]: prevData[relation].map((p, index) =>
          index === id ? { ...p, [field]: value } : p),
      }));
    },
    [setData],
  );

  const RenderRelationList = ({ relation }) => {
    const name = relation === 'parents' ? 'Parent' : 'Child';
    return (
      <div>
        <div className="tw-pl-10 tw-my-5 tw-text-2xl tw-font-semibold">
          My {name} Information
        </div>
        <ul className="tw-list-none tw-mb-10">
          {data[relation].map((type, id) => (
            <div>
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                  <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                    {name} {id + 1} first name
                  </p>
                  <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                    {data[relation][id].firstName}
                  </p>
                </div>
              </li>
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                  <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                    {name} {id + 1} middle name
                  </p>
                  <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                    {data[relation][id].middleName}
                  </p>
                </div>
              </li>
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                  <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                    {name} {id + 1} last name
                  </p>
                  <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                    {data[relation][id].lastName}
                  </p>
                </div>
              </li>
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                  <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                    {name} {id + 1} social security number
                  </p>
                  <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                    {data[relation][id].ssn}
                  </p>
                </div>
              </li>
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                  <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                    {name} {id + 1} date of birth
                  </p>
                  <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                    {data[relation][id].birthDate}
                  </p>
                </div>
              </li>
              <hr />
            </div>
          ))}
        </ul>
      </div>
    );
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    fetch(`${getServerURL()}/change-optional-info/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        if (status === 'SUCCESS') {
          alert.show('Successfully updated family information.');
          setPostRequestMade(true);
        } else {
          alert.show('Could not update family information.');
        }
      });
    setEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <div>
            {['parents', 'children'].map((relation) => {
              const name = relation === 'parents' ? 'Parent' : 'Child';

              return (
                <div>
                  <div className="tw-flex tw-flex-row tw-justify-between">
                    <div className="tw-pl-10 tw-my-5 tw-text-2xl tw-font-semibold">
                      My {name} Information
                    </div>
                    <button
                      type="button"
                      className="tw-w-auto tw-h-10 tw-my-4 tw-rounded-md tw-bg-indigo-400 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
                      onClick={() => addRelation(relation)}
                    >
                      Add New {name}
                    </button>
                  </div>
                  <ul className="tw-list-none tw-mb-10 tw-my-4">
                    {data[relation].map((type, id) => (
                      <div>
                        <li className="odd:tw-bg-gray-100">
                          <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                            <label
                              htmlFor={`${relation}-name-${id + 1}`}
                              className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                            >
                              {name} {id + 1} first name
                            </label>
                            <input
                              type="text"
                              name={`${relation}-first-name-${id + 1}`}
                              id={`${relation}-first-name-${id + 1}`}
                              value={type.firstName}
                              onChange={(e) =>
                                handleInputChange(
                                  relation,
                                  'firstName',
                                  id,
                                  e.target.value,
                                )
                              }
                              className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                            />
                          </div>
                        </li>
                        <li className="odd:tw-bg-gray-100">
                          <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                            <label
                              htmlFor={`${relation}-middle-name-${id + 1}`}
                              className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                            >
                              {name} {id + 1} middle name
                            </label>
                            <input
                              type="text"
                              name={`${relation}-middle-name-${id + 1}`}
                              id={`${relation}-middle-name-${id + 1}`}
                              value={type.middleName}
                              onChange={(e) =>
                                handleInputChange(
                                  relation,
                                  'middleName',
                                  id,
                                  e.target.value,
                                )
                              }
                              className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                            />
                          </div>
                        </li>
                        <li className="odd:tw-bg-gray-100">
                          <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                            <label
                              htmlFor={`${relation}-last-name-${id + 1}`}
                              className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                            >
                              {name} {id + 1} last name
                            </label>
                            <input
                              type="text"
                              name={`${relation}-last-name-${id + 1}`}
                              id={`${relation}-last-name-${id + 1}`}
                              value={type.lastName}
                              onChange={(e) =>
                                handleInputChange(
                                  relation,
                                  'lastName',
                                  id,
                                  e.target.value,
                                )
                              }
                              className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                            />
                          </div>
                        </li>
                        <li className="odd:tw-bg-gray-100">
                          <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                            <label
                              htmlFor={`${relation}-ssn-${id + 1}`}
                              className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                            >
                              {name} {id + 1} social security number
                            </label>
                            <input
                              type="text"
                              name={`${relation}-ssn-${id + 1}`}
                              id={`${relation}-ssn-${id + 1}`}
                              value={type.ssn}
                              onChange={(e) =>
                                handleInputChange(
                                  relation,
                                  'ssn',
                                  id,
                                  e.target.value,
                                )
                              }
                              className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                            />
                          </div>
                        </li>
                        <li className="odd:tw-bg-gray-100">
                          <div className="tw-relative tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                            <label
                              htmlFor={`${relation}-birthday-${id + 1}`}
                              className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                            >
                              {name} {id + 1} date of birth
                            </label>
                            <input
                              type="text"
                              name={`${relation}-birthday-${id + 1}`}
                              id={`${relation}-birthday-${id + 1}`}
                              value={type.birthDate}
                              onClick={() =>
                                setActiveCalendar(
                                  `${relation}-birthday-${id + 1}`,
                                )
                              }
                              className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                            />

                            {activeCalendar ===
                              `${relation}-birthday-${id + 1}` && (
                              <div className="tw-absolute tw-bg-gray-300 tw-bottom-full tw-left-1/4">
                                <DayPicker
                                  captionLayout="dropdown"
                                  fromYear={1940}
                                  toYear={2025}
                                  mode="single"
                                  onSelect={(date) => {
                                    if (date) {
                                      const formattedDate = format(
                                        date,
                                        'yyyy MM dd',
                                      );
                                      handleInputChange(
                                        relation,
                                        'birthDate',
                                        id,
                                        formattedDate,
                                      );
                                    }
                                    setActiveCalendar('');
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </li>
                        <div className="tw-flex tw-flex-row tw-justify-end">
                          <button
                            type="button"
                            className="tw-w-auto tw-h-10 tw-mt-4 tw-rounded-md tw-bg-gray-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-gray-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
                            onClick={() => removeRelation(relation, id)}
                          >
                            Remove {`${name} ${id + 1}`}
                          </button>
                        </div>
                        <hr />
                      </div>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="tw-pt-6 tw-pl-10 tw-flex tw-flex-row tw-justify-between">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setData(originalData);
              }}
              className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div>
          {['parents', 'children'].map((relation) => (
            <RenderRelationList key={relation} relation={relation} />
          ))}
          <div className="tw-pt-4 tw-pl-10 tw-flex tw-flex-row tw-justify-end">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setOriginalData(data);
              }}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyInformation;
