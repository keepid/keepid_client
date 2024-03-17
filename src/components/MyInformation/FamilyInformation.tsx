import React, { useState } from 'react';

import getServerURL from '../../serverOverride';

function FamilyInformation({ data, setData, setPostRequestMade }) {
  const [isEditing, setEditing] = useState(false);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    fetch(`${getServerURL()}/save-optional-info/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        if (status === 'success') {
          console.log("Successfully updated user's family information");
          setPostRequestMade(true);
        } else {
          console.log("Could not update user's family information.");
        }
      });
    setEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Family Information
          </p>
          <ul className="tw-list-none tw-mb-20">
            {data.parents.map((parent, id) => (
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                  <label
                    htmlFor={`parent-name-${id + 1}`}
                    className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                  >
                    Parent {id + 1} Full Name
                  </label>
                  <input
                    type="text"
                    name={`parent-name-${id + 1}`}
                    id={`parent-name-${id + 1}`}
                    value={parent.name}
                    onChange={(e) =>
                      setData({
                        ...data,
                        parents: data.parents.map((p, index) => {
                          if (index === id) {
                            return { ...p, name: e.target.value };
                          }
                          return p;
                        }),
                      })
                    }
                    className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                  />
                </div>
              </li>
            ))}
            <li className="odd:tw-bg-gray-100">
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="spouse"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Spouse Full Name
                </label>
                <input
                  type="text"
                  name="spouse"
                  id="spouse"
                  value={data.spouse.name}
                  onChange={(e) =>
                    setData({
                      ...data,
                      spouse: { name: e.target.value },
                    })
                  }
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <div className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2">
                  Number of children
                </div>
                <div>{data.children.length}</div>
              </div>
            </li>
            {data.children.map((child, id) => (
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                  <label
                    htmlFor={`child-name-${id + 1}`}
                    className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                  >
                    Child {id + 1} Full Name
                  </label>
                  <input
                    type="text"
                    name={`child-name-${id + 1}`}
                    id={`child-name-${id + 1}`}
                    value={child.name}
                    onChange={(e) =>
                      setData({
                        ...data,
                        children: data.children.map((c, index) => {
                          if (index === id) {
                            return { ...c, name: e.target.value };
                          }
                          return c;
                        }),
                      })
                    }
                    className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-between">
            <button
              type="button"
              onClick={() => setEditing(false)}
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
          <ul className="tw-list-none tw-mb-20">
            {data.parents.map((parent, id) => (
              <li className="odd:tw-bg-gray-100">
                <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                  <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                    Parent {id + 1} Full Name
                  </p>
                  <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                    {data.parents[id].name}
                  </p>
                </div>
              </li>
            ))}
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Spouse Full Name
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.spouse.name}
                </p>
              </div>
            </li>
            {data.children.map((child, id) => (
              <li className="odd:tw-bg-gray-100">
                <div className=" tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                  <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                    Child {id + 1} Full Name
                  </p>
                  <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                    {data.children[id].name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-end">
            <button
              type="button"
              onClick={() => setEditing(true)}
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
