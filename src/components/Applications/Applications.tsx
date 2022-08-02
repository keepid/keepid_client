import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link, Route, Switch } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Close from '../../static/images/closebutton.png';
import View from '../../static/images/view-icon.png';
import PDFType from '../../static/PDFType';
import Table from '../BaseComponents/Table';
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
  documents: DocumentInformation[],
  applications: DocumentInformation[],
  openModal: Boolean | false,
  currentFileUrl: string,
}

class Applications extends Component<Props, State, {}> {
  ButtonFormatter = (cell, row) => (
    <div>
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary w-75 btn-sm p-2 m-1" onClick={(event) => this.handleApply(event, row)}> <b>Apply Now</b></button>
      </Link>
    </div>
  )

  DoubleButtonFormatter = (cell, row) => (
    <div className="side-by-side-buttons">
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary w-110 btn-sm p-2 m-1" onClick={(event) => this.handleDownload(event, row)}> <b>Download</b></button>
      </Link>
      <Link to="/applications/send">
        <button type="button" className="btn btn-primary-red w-110 btn-sm p-2 m-1" onClick={(event) => this.handleDelete(event, row)}> <b>Delete File</b></button>
      </Link>
    </div>
  )

  PreviewFormatter = (cell, row) => (
    <div>
      <button type="button" className="btn preview-button w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row, PDFType.FORM)}><img src={View} alt="description of image" /> <strong>Click to Preview the PDF</strong></button>
    </div>
  )

  ViewFormatter = (cell, row) => (
    <div>
      <button type="button" className="btn preview-button w-75 btn-sm p-2 m-1" onClick={(event) => this.handleViewDocument(event, row, PDFType.APPLICATION)}><img src={View} alt="description of image" /> <strong>Click to View</strong></button>
    </div>
  )

  OverflowFormatter = (cell) => (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      <small>{ cell }</small>
    </div>
  )

  availableTableCols = [
    {
      dataField: 'filename',
      text: 'Application Name',
      sort: true,
      formatter: this.OverflowFormatter, // OverflowFormatter handles long filenames
    },
    {
      dataField: 'apply',
      text: '',
      formatter: this.ButtonFormatter,
    }, {
      dataField: 'preview the form',
      text: 'Preview the Form',
      formatter: this.PreviewFormatter,
    }];

    completedTableCols = [
      {
        dataField: 'filename',
        text: 'Application Name',
        sort: true,
        formatter: this.OverflowFormatter, // OverflowFormatter handles long filenames
      }, {
        dataField: 'uploadDate',
        text: 'Date Uploaded',
        sort: true,
      },
      // {
      //   dataField: 'uploader',
      //   text: 'Uploaded By',
      //   sort: true,
      // },
      {
        dataField: 'view',
        text: 'View Application',
        formatter: this.ViewFormatter,
      }, {
        dataField: 'actions',
        text: 'Actions',
        formatter: this.DoubleButtonFormatter,
      }];

    constructor(props: Props) {
      super(props);
      this.state = {
        currentApplicationId: undefined,
        currentApplicationFilename: undefined,
        documents: [],
        applications: [],
        openModal: false,
        currentFileUrl: '',
      };
    }

  componentDidMount = () => {
    this.getDocument(PDFType.FORM);
    this.getDocument(PDFType.APPLICATION);
  }

  getDocument = (docType: PDFType) => {
    fetch(`${getServerURL()}/get-documents `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType: docType,
        annotated: true,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        const {
          status,
          documents,
        } = responseJSON;
        if (status === 'SUCCESS') {
          const numElements = documents.length;
          const newDocuments: DocumentInformation[] = [];
          for (let i = 0; i < numElements; i += 1) {
            const row = documents[i];
            row.index = i;
            newDocuments.push(row);
          }
          if (docType === PDFType.APPLICATION) {
            this.setApplications(newDocuments);
          } else if (docType === PDFType.FORM) {
            this.setDocuments(newDocuments);
          }
        }
      });
  }

  setDocuments = (newDocuments: DocumentInformation[]) => {
    this.setState({
      documents: newDocuments,
    });
  }

  setApplications = (newDocuments: DocumentInformation[]) => {
    this.setState({
      applications: newDocuments,
    });
  }

  handleViewDocument = (event: any, row: any, docType: PDFType) => {
    const {
      id,
      filename,
    } = row;
    let url;
    fetch(`${getServerURL()}/download`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: JSON.stringify({
        pdfType: docType,
        fileId: id,
      }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        // create blob link
        url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      });
    this.setState(
      {
        currentApplicationId: id,
        currentApplicationFilename: filename,
        openModal: true,
        currentFileUrl: url,
      },
    );
  }

  handleApply= (event: any, row: any) => {
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

  handleDelete= (event: any, row: any) => {
    const {
      id,
    } = row;
    fetch(`${getServerURL()}/delete-document/`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType: PDFType.FORM,
        fileId: id,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
        } = responseJSON;
        if (status === 'SUCCESS') {
          // TODO:show alert
          // alert.show('Successfully Deleted PDF Application');
        } else if (status === 'USER_NOT_FOUND') {
          // show alert
        } else if (status === 'CROSS_ORG_ACTION_DENIED') {
          // show alert
        }
      });
  }

  handleDownload= (event: any, row: any) => {
    const {
      id,
    } = row;
    fetch(`${getServerURL()}/download`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: JSON.stringify({
        pdfType: PDFType.FORM,
        fileId: id,
      }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        // create blob link to download
        const downloadURL = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = 'CompletedApplication.pdf';
        document.body.append(link);
        link.click(); // start download
        // link.parentNode.removeChild(link); //clean up and remove link
      });
  }

  openModalFunc = () => this.setState({ openModal: true });

  closeModal = () => this.setState({ openModal: false });

  render() {
    const {
      currentApplicationFilename,
      currentApplicationId,
      documents,
      applications,
      openModal,
      currentFileUrl,
    } = this.state;

    return (
      <Switch>
        <Route exact path="/applications">
          <div className="modal custom">
          <Modal show={openModal} onHide={this.closeModal} data-backdrop="static" size="xl">
            <Modal.Header>
              <Button className="transparent-button" variant="secondary" onClick={this.closeModal}>
              <img src={Close} alt="description of image" />
              </Button>
            </Modal.Header>
            <Modal.Body>
               <iframe src={currentFileUrl} title="temp pdf" width="100%" height="600" frameBorder="none" />
            </Modal.Body>
          </Modal>
          </div>
          <div className="container-fluid">
            <Helmet>
              <title>Applications</title>
              <meta name="description" content="Keep.id" />
            </Helmet>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4" style={{ fontWeight: 'bold' }}>My Available Applications</h1>
                <p className="lead subheader">Here are all the applications that are available to you. <br />Please click the “Apply Now” button to start applying.</p>
              </div>
            </div>
            <div className="container">
              <div className="d-flex flex-row bd-highlight mb-3 pt-1">
                <div className="w-100 pd-3">
                  <Table
                    columns={this.availableTableCols}
                    data={documents}
                    emptyInfo={{ description: 'No Applications Present' }}
                  />
                </div>
              </div>
            </div>
            <div className="jumbotron jumbotron-fluid bg-white pb-0">
              <div className="container">
                <h1 className="display-4" style={{ fontWeight: 'bold' }}>My Completed Applications</h1>
                <p className="lead subheader">Here are all your completed applications. <br />Check or manage your applications here.</p>
              </div>
            </div>
            <div className="container">
              <div className="d-flex flex-row bd-highlight mb-3 pt-1">
                <div className="w-100 pd-3">
                  <Table
                    columns={this.completedTableCols}
                    data={applications}
                    emptyInfo={{ description: 'No Applications Present' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Route>
        <Route path="/applications/send">
          <ApplicationForm applicationFilename={currentApplicationFilename} applicationId={currentApplicationId} />
        </Route>
      </Switch>
    );
  }
}

export default Applications;
