import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Route, Switch } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import SearchBar from '../BaseComponents/SearchBar';
import Table from '../BaseComponents/Table';
import Logo from '../static/images/logo.svg';
import ApplicationForm from './ApplicationForm';

interface DocumentInformation {

  uploader: string,
  organizationName: string,
  id: string,
  uploadDate: string,
  filename: string,
  view: string,
  checkbox: boolean,
  actions: string
}

interface Props {
  username: string,
  name: string,
  organization: string,
}

interface State {
  currentApplicationId: string | undefined,
  currentApplicationFilename: string | undefined,
  documents: DocumentInformation[]
}

class Applications extends Component<Props, State, {}> {
  ButtonFormatter = (cell, row) => (
    <div>
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row)}>View Application</button>
      </Link>
    </div>
  )

  OverflowFormatter = (cell) => (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      <small>{ cell }</small>
    </div>
  )

  tableCols = [
  //   {
  //   dataField: 'checkbox',
  //   text: '',
  // },
    {
      dataField: 'filename',
      text: 'Application Name',
      sort: true,
      formatter: this.OverflowFormatter, // OverflowFormatter handles long filenames
    }, {
      dataField: 'uploadDate',
      text: 'Date Uploaded',
      sort: true,
    }, {
      dataField: 'uploader',
      text: 'Uploaded By',
      sort: true,
    }, {
      dataField: 'view',
      text: '',
      formatter: this.ButtonFormatter,
    }, {
      dataField: 'actions',
      text: '',
      formatter: this.ButtonFormatter,
    }];

  constructor(props: Props) {
    super(props);
    this.state = {
      currentApplicationId: undefined,
      currentApplicationFilename: undefined,
      documents: [],
    };
  }

  componentDidMount = () => {
    fetch(`${getServerURL()}/get-documents `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType: PDFType.FORM,
        annotated: true,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        const {
          status,
          documents,
        } = responseJSON;
        const numElements = documents.length;
        if (status === 'SUCCESS') {
          const newDocuments: DocumentInformation[] = [];
          for (let i = 0; i < numElements; i += 1) {
            const row = documents[i];
            row.index = i;
            newDocuments.push(row);
          }
          this.setState({
            documents: newDocuments,
          });
        }
      });
  }

  handleViewDocument = (event: any, row: any) => {
    const {
      id,
      filename,
    } = row;
    this.setState(
      {
        currentApplicationId: id,
        currentApplicationFilename: filename,
      },
    );
  }

  render() {
    const {
      currentApplicationFilename,
      currentApplicationId,
      documents,
    } = this.state;

    return (
      <Switch>
        <Route exact path="/applications">
          <div className="container-fluid">
            <Helmet>
              <title>Applications</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4" style={{ fontWeight: 'bold' }}>My Available Applications</h1>
                <p className="lead">Here are all the applications that are available to you. Please click the “Apply Now” button to start applying.</p>
              </div>
            </div>
            <div className="search-bar-upload-file">
              <div className="search-bar">
                <SearchBar
                  searchOnClick={() => { }}
                  searchLoading
                />
              </div>
              {/* <div className="upload-file">
                <button type="button" className="btn btn-secondary btn-blue-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="none" d="M0 0h24v24H0z" /><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4l6 6v10c0 1.1-.9 2-2 2H7.99C6.89 23 6 22.1 6 21l.01-14c0-1.1.89-2 1.99-2h7zm-1 7h5.5L14 6.5V12z" />
                  </svg>
                  Upload File
                </button>
              </div> */}
            </div>
            {/* <div className="three-buttons-plus-files-selected">
              <div className="download-button">
                <button type="button" className="btn btn-secondary btn-white-blue-custom"><img src="https://api.iconify.design/ic-baseline-face.svg?height=24" aria-hidden="true" alt="description of image" /> Download</button>
              </div>
              <div className="print-button">
                <button type="button" className="btn btn-secondary btn-white-blue-custom">
                  <svg x="0px" y="0px" width="25px" height="18px" viewBox="0 0 74 66" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M62.3333 18.3333H11C4.91333 18.3333 0 23.2467 0 29.3333V51.3333H14.6667V66H58.6667V51.3333H73.3333V29.3333C73.3333 23.2467 68.42 18.3333 62.3333 18.3333ZM51.3333 58.6667H22V40.3333H51.3333V58.6667ZM62.3333 33C60.3167 33 58.6667 31.35 58.6667 29.3333C58.6667 27.3167 60.3167 25.6667 62.3333 25.6667C64.35 25.6667 66 27.3167 66 29.3333C66 31.35 64.35 33 62.3333 33ZM58.6667 0H14.6667V14.6667H58.6667V0Z" fill="#2f48c4" />
                  </svg>
                  Print
                </button>
              </div>
              <div className="delete-button">
                <button type="button" className="btn btn-secondary btn-white-red-custom">
                  <svg width="15" height="18" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.54171 0.666667H7.20837L6.54171 0H3.20837L2.54171 0.666667H0.208374V2H9.54171V0.666667ZM0.875041 10.6667C0.875041 11.0203 1.01552 11.3594 1.26556 11.6095C1.51561 11.8595 1.85475 12 2.20837 12H7.54171C7.89533 12 8.23447 11.8595 8.48452 11.6095C8.73456 11.3594 8.87504 11.0203 8.87504 10.6667V2.66667H0.875041V10.6667Z" fill="#C00303" />
                  </svg>
                  Delete
                </button>
              </div>
              <div className="files-selected">
                <p>2 files selected</p>
              </div>
            </div> */}
            <div className="container">
              <div className="d-flex flex-row bd-highlight mb-3 pt-5">
                <div className="w-100 pd-3">
                  <Table
                    columns={this.tableCols}
                    data={documents}
                    emptyInfo={{ description: 'No Applications Present' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Route>
        <Route path="/applications/send">
          {currentApplicationId && currentApplicationFilename
            ? <ApplicationForm applicationFilename={currentApplicationFilename} applicationId={currentApplicationId} />
            : <div />}
        </Route>
      </Switch>
    );
  }
}

export default Applications;
