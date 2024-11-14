import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface FinalPageProps {
  handlePrev: () => void;
  handleSaveOnly: () => void;
  handleSubmit: () => void;
}

export default function SelectApplicationFormFinalPage(props: FinalPageProps) {
  return (
    <>
      <Table className="tw-max-w-[600px] tw-self-center tw-mb-12 tw-shadow-[0px_0px_8px_4px_rgba(0,0,0,0.15)]">
        <tr className="odd:tw-bg-gray-50 even:tw-bg-gray-200">
          <td className="!tw-border-none">Address</td>
          <td className="!tw-border-none">Fake Address</td>
        </tr>
        <tr className="odd:tw-bg-gray-50 even:tw-bg-gray-200">
          <td>Application fee</td>
          <td>$0.00</td>
        </tr>
        <tr className="odd:tw-bg-gray-50 even:tw-bg-gray-200">
          <td>Direct mail service</td>
          <td>$12.00</td>
        </tr>
      </Table>
      <div className="tw-flex tw-justify-between tw-gap-4">
        <div className="tw-flex tw-gap-4">
          <Link to="/applications" className="btn btn-outline-danger">
            Cancel application
          </Link>
          <button type="button" className="btn btn-outline-info" onClick={props.handlePrev}>
            Go back and make changes
          </button>
        </div>
        <div className="tw-flex tw-gap-4">
          <button type="button" className="btn btn-outline-info" onClick={props.handleSaveOnly}>
            No, apply later save only
          </button>
          <button type="button" className="btn btn-success" onClick={props.handleSubmit}>
            Yes, agree and submit
          </button>
        </div>
      </div>
    </>
  );
}
