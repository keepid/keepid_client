import {
  Accordion,
  AccordionBody,
  AccordionHeader,
} from '@material-tailwind/react';
import React, { useCallback, useState } from 'react';

import getServerURL from '../../serverOverride';

function FamilyInformation({ data, setData, setPostRequestMade, username }) {
  const [isEditing, setEditing] = useState(false);
  const [originalData, setOriginalData] = useState(data); // create copy of original data
  const [open, setOpen] = useState(0); // for accordion
  const [numChildren, setNumChildren] = useState(data.children.length);
  const [numParents, setNumParents] = useState(data.parents.length);
  const [numSiblings, setNumSiblings] = useState(data.siblings.length);

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

  const RenderEditRelationList = ({ relation }) => {
    const name = relation === 'parents' ? 'Parent' : 'Child';

    const handleInputChange = useCallback(
      (field, id, value) => {
        setData((prevData) => ({
          ...prevData,
          [relation]: prevData[relation].map((p, index) =>
            index === id ? { ...p, [field]: value } : p),
        }));
      },
      [setData],
    );

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
                      handleInputChange('firstName', id, e.target.value)
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
                      handleInputChange('middleName', id, e.target.value)
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
                      handleInputChange('lastName', id, e.target.value)
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
                      handleInputChange('ssn', id, e.target.value)
                    }
                    className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                  />
                </div>
              </li>
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
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
                    onChange={(e) =>
                      handleInputChange('birthDate', id, e.target.value)
                    }
                    className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                  />
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
  };

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

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

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
          console.log("Successfully updated user's family information");
          setPostRequestMade(true);
        } else {
          console.error("Could not update user's family information.");
        }
      });
    setEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <div>
            {['parents', 'children'].map((relation) => (
              <RenderEditRelationList relation={relation} />
            ))}
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
              onSubmit={handleSaveEdit}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div>
          {['parents', 'children'].map((relation) => (
            <RenderRelationList relation={relation} />
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

      {/* {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Family Information
          </p>
          <Accordion
            open={open === 1}
            nonce=""
            onResize={() => {}}
            onResizeCapture={() => {}}
          >
            <div className="tw-ml-10">
              <AccordionHeader
                nonce=""
                onResize={() => {}}
                onResizeCapture={() => {}}
                onClick={() => handleOpen(1)}
                className="tw-bg-gray-100 tw-flex tw-flex-row tw-w-full"
              >
                <div className="tw-pl-5 tw-font-medium">
                  Edit Parent/Guardian Information
                </div>
              </AccordionHeader>
            </div>
            <AccordionBody>
              <ul className="tw-list-none tw-mb-10">
                {data.parents.map((parent, id) => (
                  <>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`parent-name-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Parent {id + 1} first name
                        </label>
                        <input
                          type="text"
                          name={`parent-first-name-${id + 1}`}
                          id={`parent-first-name-${id + 1}`}
                          value={parent.firstName}
                          onChange={(e) =>
                            setData({
                              ...data,
                              parents: data.parents.map((p, index) => {
                                if (index === id) {
                                  return { ...p, firstName: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`parent-middle-name-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Parent {id + 1} middle name
                        </label>
                        <input
                          type="text"
                          name={`parent-middle-name-${id + 1}`}
                          id={`parent-middle-name-${id + 1}`}
                          value={parent.middleName}
                          onChange={(e) =>
                            setData({
                              ...data,
                              parents: data.parents.map((p, index) => {
                                if (index === id) {
                                  return { ...p, middleName: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`parent-last-name-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Parent {id + 1} last name
                        </label>
                        <input
                          type="text"
                          name={`parent-last-name-${id + 1}`}
                          id={`parent-last-name-${id + 1}`}
                          value={parent.lastName}
                          onChange={(e) =>
                            setData({
                              ...data,
                              parents: data.parents.map((p, index) => {
                                if (index === id) {
                                  return { ...p, lastName: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`parent-ssn-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Parent {id + 1} social security number
                        </label>
                        <input
                          type="text"
                          name={`parent-ssn-${id + 1}`}
                          id={`parent-ssn-${id + 1}`}
                          value={parent.ssn}
                          onChange={(e) =>
                            setData({
                              ...data,
                              parents: data.parents.map((p, index) => {
                                if (index === id) {
                                  return { ...p, ssn: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`parent-birthday-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Parent {id + 1} date of birth
                        </label>
                        <input
                          type="text"
                          name={`parent-birthday-${id + 1}`}
                          id={`parent-birthday-${id + 1}`}
                          value={parent.birthDate}
                          onChange={(e) =>
                            setData({
                              ...data,
                              parents: data.parents.map((p, index) => {
                                if (index === id) {
                                  return { ...p, birthDate: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                  </>
                ))}
              </ul>
            </AccordionBody>
          </Accordion>
          <Accordion
            open={open === 2}
            nonce=""
            onResize={() => {}}
            onResizeCapture={() => {}}
          >
            <div className="tw-ml-10 tw-py-5">
              <AccordionHeader
                nonce=""
                onResize={() => {}}
                onResizeCapture={() => {}}
                onClick={() => handleOpen(2)}
                className="tw-bg-gray-100 tw-flex tw-flex-row tw-w-full"
              >
                <div className="tw-pl-5 tw-font-medium">
                  Edit Spouse Information
                </div>
              </AccordionHeader>
            </div>
            <AccordionBody>
              <ul className="tw-list-none tw-mb-10">
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                    <label
                      htmlFor="spouse-first-name"
                      className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                    >
                      Spouse first name
                    </label>
                    <input
                      type="text"
                      name="spouse-first-name"
                      id="spouse-first-name"
                      value={data.spouse.firstName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          spouse: { ...data.spouse, firstName: e.target.value },
                        })
                      }
                      className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                    />
                  </div>
                </li>
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                    <label
                      htmlFor="spouse-middle-name"
                      className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                    >
                      Spouse middle name
                    </label>
                    <input
                      type="text"
                      name="spouse-middle-name"
                      id="spouse-middle-name"
                      value={data.spouse.middleName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          spouse: {
                            ...data.spouse,
                            middleName: e.target.value,
                          },
                        })
                      }
                      className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                    />
                  </div>
                </li>
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                    <label
                      htmlFor="spouse-last-name"
                      className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                    >
                      Spouse last name
                    </label>
                    <input
                      type="text"
                      name="spouse-last-name"
                      id="spouse-last-name"
                      value={data.spouse.lastName}
                      onChange={(e) =>
                        setData({
                          ...data,
                          spouse: { ...data.spouse, lastName: e.target.value },
                        })
                      }
                      className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                    />
                  </div>
                </li>
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                    <label
                      htmlFor="spouse-ssn"
                      className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                    >
                      Spouse social security number
                    </label>
                    <input
                      type="text"
                      name="spouse-ssn"
                      id="spouse-ssn"
                      value={data.spouse.ssn}
                      onChange={(e) =>
                        setData({
                          ...data,
                          spouse: { ...data.spouse, ssn: e.target.value },
                        })
                      }
                      className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                    />
                  </div>
                </li>
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                    <label
                      htmlFor="spouse-birthday"
                      className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                    >
                      Spouse date of birth
                    </label>
                    <input
                      type="text"
                      name="spouse-birthday"
                      id="spouse-birthday"
                      value={data.spouse.birthDate}
                      onChange={(e) =>
                        setData({
                          ...data,
                          spouse: { ...data.spouse, birthDate: e.target.value },
                        })
                      }
                      className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                    />
                  </div>
                </li>
              </ul>
            </AccordionBody>
          </Accordion>
          <Accordion
            open={open === 3}
            nonce=""
            onResize={() => {}}
            onResizeCapture={() => {}}
          >
            <div className="tw-ml-10">
              <AccordionHeader
                nonce=""
                onResize={() => {}}
                onResizeCapture={() => {}}
                onClick={() => handleOpen(3)}
                className="tw-bg-gray-100 tw-flex tw-flex-row tw-w-full"
              >
                <div className="tw-pl-5 tw-font-medium">
                  Edit Children Information
                </div>
              </AccordionHeader>
            </div>
            <AccordionBody>
              <ul className="tw-list-none tw-mb-10">
                {data.children.map((child, id) => (
                  <>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`child-name-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Child {id + 1} first name
                        </label>
                        <input
                          type="text"
                          name={`child-first-name-${id + 1}`}
                          id={`child-first-name-${id + 1}`}
                          value={child.firstName}
                          onChange={(e) =>
                            setData({
                              ...data,
                              children: data.children.map((p, index) => {
                                if (index === id) {
                                  return { ...p, firstName: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`child-middle-name-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Child {id + 1} middle name
                        </label>
                        <input
                          type="text"
                          name={`child-middle-name-${id + 1}`}
                          id={`child-middle-name-${id + 1}`}
                          value={child.middleName}
                          onChange={(e) =>
                            setData({
                              ...data,
                              children: data.children.map((p, index) => {
                                if (index === id) {
                                  return { ...p, middleName: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`child-last-name-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Child {id + 1} last name
                        </label>
                        <input
                          type="text"
                          name={`child-last-name-${id + 1}`}
                          id={`child-last-name-${id + 1}`}
                          value={child.lastName}
                          onChange={(e) =>
                            setData({
                              ...data,
                              children: data.children.map((p, index) => {
                                if (index === id) {
                                  return { ...p, lastName: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`child-ssn-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Child {id + 1} social security number
                        </label>
                        <input
                          type="text"
                          name={`child-ssn-${id + 1}`}
                          id={`child-ssn-${id + 1}`}
                          value={child.ssn}
                          onChange={(e) =>
                            setData({
                              ...data,
                              children: data.children.map((p, index) => {
                                if (index === id) {
                                  return { ...p, ssn: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor={`child-birthday-${id + 1}`}
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Child {id + 1} date of birth
                        </label>
                        <input
                          type="text"
                          name={`child-birthday-${id + 1}`}
                          id={`child-birthday-${id + 1}`}
                          value={child.birthDate}
                          onChange={(e) =>
                            setData({
                              ...data,
                              children: data.children.map((p, index) => {
                                if (index === id) {
                                  return { ...p, birthDate: e.target.value };
                                }
                                return p;
                              }),
                            })
                          }
                          className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                        />
                      </div>
                    </li>
                  </>
                ))}
              </ul>
            </AccordionBody>
          </Accordion>
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
              onSubmit={handleSaveEdit}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Family Information
          </p>
          <Accordion
            open={open === 1}
            nonce=""
            onResize={() => {}}
            onResizeCapture={() => {}}
          >
            <div className="tw-ml-10 tw-py-1">
              <AccordionHeader
                nonce=""
                onResize={() => {}}
                onResizeCapture={() => {}}
                onClick={() => handleOpen(1)}
                className="tw-bg-gray-100 tw-flex tw-flex-row tw-w-full"
              >
                <div className="tw-pl-5 tw-font-medium">
                  Parent/Guardian Information
                </div>
              </AccordionHeader>
            </div>
            <AccordionBody>
              <ul className="tw-list-none tw-mb-10">
                {data.parents.map((parent, id: number) => (
                  <>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Parent {id + 1} first name
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.parents[id].firstName}
                        </p>
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Parent {id + 1} middle name
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.parents[id].middleName}
                        </p>
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Parent {id + 1} last name
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.parents[id].lastName}
                        </p>
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Parent {id + 1} social security number
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.parents[id].ssn}
                        </p>
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Parent {id + 1} date of birth
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.parents[id].birthDate}
                        </p>
                      </div>
                    </li>
                  </>
                ))}
              </ul>
            </AccordionBody>
          </Accordion>
          <Accordion
            open={open === 2}
            nonce=""
            onResize={() => {}}
            onResizeCapture={() => {}}
          >
            <div className="tw-ml-10 tw-py-4">
              <AccordionHeader
                nonce=""
                onResize={() => {}}
                onResizeCapture={() => {}}
                onClick={() => handleOpen(2)}
                className="tw-bg-gray-100 tw-flex tw-flex-row tw-w-full"
              >
                <div className="tw-pl-5 tw-font-medium">Spouse Information</div>
              </AccordionHeader>
            </div>
            <AccordionBody>
              <ul className="tw-list-none tw-mb-10">
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                    <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                      Spouse first name
                    </p>
                    <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                      {data.spouse.firstName}
                    </p>
                  </div>
                </li>
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                    <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                      Spouse middle name
                    </p>
                    <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                      {data.spouse.middleName}
                    </p>
                  </div>
                </li>
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                    <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                      Spouse last name
                    </p>
                    <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                      {data.spouse.lastName}
                    </p>
                  </div>
                </li>
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                    <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                      Spouse social security number
                    </p>
                    <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                      {data.spouse.ssn}
                    </p>
                  </div>
                </li>
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                    <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                      Spouse date of birth
                    </p>
                    <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                      {data.spouse.birthDate}
                    </p>
                  </div>
                </li>
              </ul>
            </AccordionBody>
          </Accordion>
          <Accordion
            open={open === 3}
            nonce=""
            onResize={() => {}}
            onResizeCapture={() => {}}
          >
            <div className="tw-ml-10 tw-py-1">
              <AccordionHeader
                nonce=""
                onResize={() => {}}
                onResizeCapture={() => {}}
                onClick={() => handleOpen(3)}
                className="tw-bg-gray-100 tw-flex tw-flex-row tw-w-full"
              >
                <div className="tw-pl-5 tw-font-medium">
                  Children Information
                </div>
              </AccordionHeader>
            </div>
            <AccordionBody>
              <ul className="tw-list-none tw-mb-10">
                <li className="odd:tw-bg-gray-100">
                  <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                    <div className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2">
                      Number of children
                    </div>
                    <div className="tw-pl-5">{data.children.length}</div>
                  </div>
                </li>
                {data.children.map((child, id) => (
                  <>
                    <li className="odd:tw-bg-gray-100">
                      <div className=" tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Child {id + 1} first name
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.children[id].firstName}
                        </p>
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className=" tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Child {id + 1} middle name
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.children[id].middleName}
                        </p>
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className=" tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Child {id + 1} last name
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.children[id].lastName}
                        </p>
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className=" tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Child {id + 1} social security number
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.children[id].ssn}
                        </p>
                      </div>
                    </li>
                    <li className="odd:tw-bg-gray-100">
                      <div className=" tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                        <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                          Child {id + 1} date of birth
                        </p>
                        <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                          {data.children[id].birthDate}
                        </p>
                      </div>
                    </li>
                  </>
                ))}
              </ul>
            </AccordionBody>
          </Accordion>
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
      )} */}
    </div>
  );
}

export default FamilyInformation;
