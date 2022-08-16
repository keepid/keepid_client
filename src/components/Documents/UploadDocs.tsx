import 'react-dropzone-uploader/dist/styles.css';
import '../../static/styles/UploadDocs.scss';

import React, { useState } from 'react';
import { withAlert } from 'react-alert';
import { Card, Col, Container, Dropdown, DropdownButton, Row, Spinner } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import DropzoneUploader from '../Documents/DropzoneUploader';
import DocumentViewer from './DocumentViewer';

interface Props {
  alert: any,
  userRole: Role,
  username: any,
}

interface State {
  pdfFiles: File[] | undefined,
  documentTypeList: string[]
  currentStep: number,
  userRole: Role | undefined
  loading: boolean
  clientUsername: string
}

interface PDFProps {
  pdfFile: File
}

const MAX_NUM_OF_FILES: number = 5;
const MAX_NUM_STEPS = 2;

function RenderPDF(props: PDFProps): React.ReactElement {
  const [showResults, setShowResults] = useState(false);
  const { pdfFile } = props;
  return (
    <div>
      <div className="row">
        <button
          className="btn btn-outline-primary btn-sm mr-3"
          type="button"
          onClick={() => setShowResults(!showResults)}
        >
          {showResults ? 'Hide' : 'View'}
        </button>
      </div>
      {showResults ? <div className="row mt-3"><DocumentViewer pdfFile={pdfFile} /></div> : null}
    </div>
  );
}

class UploadDocs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pdfFiles: undefined,
      documentTypeList: [],
      currentStep: 0,
      userRole: this.props.userRole,
      loading: false,
      clientUsername: this.props.username,
    };
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleOnClickCard = this.handleOnClickCard.bind(this);
    this.setTitle = this.setTitle.bind(this);
  }

  updateFileList = (pdfFiles) => {
    this.setState({
      pdfFiles,
    });
  }

  updateStep = (currentStep) => {
    this.setState({
      currentStep,
    });
  }

  uploadFiles() {
    this.setState({
      loading: true,
    });
    if (this.state.pdfFiles) {
      for (let i = 0; i < this.state.pdfFiles.length; i += 1) {
        const pdfFile = this.state.pdfFiles[i];
        const formData = new FormData();
        const documentType = this.state.documentTypeList[i];
        const prevStep = this.state.currentStep;
        const { clientUsername } = this.state;
        formData.append('file', pdfFile, pdfFile.name);
        formData.append('idCategory', documentType);
        if (this.state.userRole === Role.Client) {
          formData.append('pdfType', PDFType.IDENTIFICATION_DOCUMENT);
        }
        if (this.state.userRole === Role.Director || this.state.userRole === Role.Admin || this.state.userRole === Role.Worker) {
          formData.append('pdfType', PDFType.BLANK_FORM);
        }
        formData.append('targetUser', clientUsername);
        fetch(`${getServerURL()}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }).then((response) => response.json())
          .then((responseJSON) => {
            const {
              status,
            } = responseJSON;
            if (status === 'SUCCESS') {
              this.props.alert.show(`Successfully uploaded ${pdfFile.name}`);
            } else {
              alert(`Failed to upload ${pdfFile.name}`);
            }
          })
          .finally(() => {
            this.setState((prevState) => ({
              loading: false,
              currentStep: prevStep + 1,
            }));
            // allFiles.forEach((f) => f.remove());
          });
      }
    }
  }

  handleOnClick(newCurrentStep: number) {
    let error = false;
    if (newCurrentStep === 0) {
      this.setState({
        currentStep: 0,
        documentTypeList: [],
        pdfFiles: undefined,
      });
    } else if (newCurrentStep === 1) {
      this.setState({ currentStep: newCurrentStep });
    } else if (newCurrentStep === MAX_NUM_STEPS) {
      if (!this.state.pdfFiles) {
        this.props.alert('Please upload documents');
        error = true;
      } else if (this.state.documentTypeList && this.state.documentTypeList.length < this.state.pdfFiles.length) {
        this.props.alert.show('Please categorize each document');
        error = true;
      } else {
        for (let i = 0; i < this.state.documentTypeList.length; i += 1) {
          if (this.state.documentTypeList[i] === undefined) {
            this.props.alert.show('Please categorize each document');
            error = true;
          }
        }
      }
      if (error === false) {
        this.uploadFiles();
      }
    }
  }

  handleOnClickCard(id: number, category: string) {
    const test = this.state.documentTypeList;
    test[id] = category;
    this.setState(() => ({
      documentTypeList: test,
    }));
  }

  setTitle(id: number) {
    if (this.state.documentTypeList && this.state.documentTypeList.length > id) {
      if (this.state.documentTypeList[id] !== undefined) {
        return this.state.documentTypeList[id];
      }
    }
    return 'Category';
  }

  setLink() {
    if (this.props.userRole !== Role.Client) {
      return '/my-documents/';
    }
    return `/my-documents/${this.props.username}`;
  }

  render() {
    const {
      alert,
    } = this.props;

    const {
      userRole,
    } = this.props;

    const {
      username,
    } = this.props;

    const {
      pdfFiles,
      documentTypeList,
      currentStep,
    } = this.state;

    console.log(this.props);

    return (
      <div className="container">
        <Helmet>
          <title>Upload Documents</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-4">
            Upload Documents
          </h1>
        <div className="card-alignment mb-3 pt-5">
          {currentStep === 0 && (
            <div>
              <p className="lead pt-3">
                Select a PDF file to upload.
                The name of the PDF will appear when loaded.
                After confirming that you have chosen the correct file, click the &quot;Submit&quot; button to upload.
                Otherwise, choose a different file.
              </p>
              <DropzoneUploader
                pdfFiles={this.state.pdfFiles}
                maxNumFiles={MAX_NUM_OF_FILES}
                currentStep={this.state.currentStep}
                updateStep={this.updateStep}
                updateFileList={this.updateFileList}
              />
            </div>
          )}
          {currentStep === 1 && (
            <div className="container">
              <p className="lead pt-3">
                Please review the documents below. Click the &quot;Continue&quot; button to submit.
              </p>
              <Container>
                {
                  pdfFiles && pdfFiles.length > 0 ? Array.from(pdfFiles).map((pdfFile, index) =>
                    (
                      <div className="container mb-3 card-alignment">
                        <Card style={{ width: '48rem' }}>
                          <Row className="row-padding g-4 md-3">
                              <Col sm={8}>
                                      <Col sm={10}>
                                        <Card.Title>{pdfFile.name}</Card.Title>
                                        <RenderPDF
                                          key={uuid()}
                                          pdfFile={pdfFile}
                                        />
                                      </Col>
                              </Col>
                            <Col sm={4}>
                              <DropdownButton
                                title={this.setTitle(index)}
                              >
                                <Dropdown.Item eventKey="License" onClick={(event) => this.handleOnClickCard(index, 'Driver License')}>Driver&apos;s License</Dropdown.Item>
                                <Dropdown.Item onClick={(event) => this.handleOnClickCard(index, 'Social Security Card')}>Social Security Card</Dropdown.Item>
                                <Dropdown.Item onClick={(event) => this.handleOnClickCard(index, 'Birth Certificate')}>Birth Certificate</Dropdown.Item>
                                <Dropdown.Item onClick={(event) => this.handleOnClickCard(index, 'Vaccine Card')}>Vaccine Card</Dropdown.Item>
                                <Dropdown.Item onClick={(event) => this.handleOnClickCard(index, 'Medicaid Card')}>Medicaid Card</Dropdown.Item>
                                <Dropdown.Item onClick={(event) => this.handleOnClickCard(index, 'Veteran ID Card')}>Veteran ID Card</Dropdown.Item>
                                <Dropdown.Item onClick={(event) => this.handleOnClickCard(index, 'Other')}>Other</Dropdown.Item>
                              </DropdownButton>
                            </Col>
                          </Row>
                        </Card>
                      </div>
                    )) : null
                }
              </Container>
            </div>
          )}
        </div>
        {
          (currentStep === 1) && (
            <div>
              <div className="row pt-4">
                <div className="col pl2 pt-3">
                  <button
                    className="float-left btn btn-outline-primary btn-md mr-3"
                    type="button"
                    onClick={(event) => this.handleOnClick(currentStep - 1)}
                  >
                    Previous
                  </button>
                  <button
                    className="float-right btn btn-outline-primary btn-md mr-3"
                    type="button"
                    onClick={(event) => this.handleOnClick(currentStep + 1)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )
        }
        {
          currentStep === 2 && (
            <div>
              <p className="lead pt-3">
                Your documents have been successfully uploaded!
              </p>
              <div className="row pt-4">
                <div className="col pl2 pt-3">
                <Link className="nav-link" to={this.setLink()}>
                  <button type="button" className="float-right btn btn-outline-primary btn-sm mr-3">
                    Return to Documents
                  </button>
                </Link>
                </div>
              </div>
            </div>
          )
        }
        { this.state.loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}
        </div>
      </div>
    );
  }
}

export default withAlert()(UploadDocs);
