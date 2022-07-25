import 'react-dropzone-uploader/dist/styles.css';
import '../../static/styles/UploadDocs.scss';

import React, { useState } from 'react';
import { withAlert } from 'react-alert';
import { Card, Col, Container, Dropdown, DropdownButton, Row, Spinner } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Link, useHistory } from 'react-router-dom';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import DropzoneUploader from '../Documents/DropzoneUploader';
import DocumentViewer from './DocumentViewer';

interface PDFProps {
    pdfFile: File
}

const MAX_NUM_OF_FILES: number = 5;
const MAX_NUM_STEPS = 2;

function RenderPDF(props) {
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

function UploadDocs(props: any) {
  const [pdfFiles, setPdfFiles] = useState(undefined);
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userRole] = useState(props.userRole);
  const [loading, setLoading] = useState(false);
  const [clientUsername] = useState(props.username);

  const updateFileList = (pdfFiles) => {
    setDocumentTypeList(pdfFiles);
  };

  const updateStep = (currentStep) => {
    setCurrentStep(currentStep);
  };

  const uploadFiles = () => {
    setLoading(true);
    if (pdfFiles) {
      for (let i = 0; i < pdfFiles.length; i += 1) {
        const pdfFile = pdfFiles[i];
        const formData = new FormData();
        const prevStep = currentStep;
        formData.append('file', pdfFile, pdfFile.name);
        // formData.append('documentType', documentType);
        if (userRole === Role.Client) {
          formData.append('pdfType', PDFType.IDENTIFICATION_DOCUMENT);
        }
        if (userRole === Role.Director || userRole === Role.Admin || userRole === Role.Worker) {
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
              props.alert.show(`Successfully uploaded ${pdfFile.name}`);
            } else {
              alert(`Failed to upload ${pdfFile.name}`);
            }
          })
          .finally(() => {
            setLoading(false);
            setCurrentStep(prevStep + 1);
            // allFiles.forEach((f) => f.remove());
          });
      }
    }
  };

  const handleOnClick = (newCurrentStep: number) => {
    let error = false;
    if (newCurrentStep === 0) {
      setCurrentStep(0);
      setDocumentTypeList([]);
      setPdfFiles(undefined);
    } else if (newCurrentStep === 1) {
      setCurrentStep(newCurrentStep);
    } else if (newCurrentStep === MAX_NUM_STEPS) {
      if (!pdfFiles) {
        props.alert('Please upload documents');
        error = true;
      } else if (documentTypeList && documentTypeList.length < pdfFiles.length) {
        props.alert.show('Please categorize each document');
        error = true;
      } else {
        for (let i = 0; i < documentTypeList.length; i += 1) {
          if (documentTypeList[i] === undefined) {
            props.alert.show('Please categorize each document');
            error = true;
          }
        }
      }
      if (error === false) {
        uploadFiles();
      }
    }
  };

  const handleOnClickCard = (id: number, category: string) => {
    const test = documentTypeList;
    test[id] = category;
    setDocumentTypeList(test);
  };

  const setTitle = (id: number) => {
    if (documentTypeList && documentTypeList.length > id) {
      if (documentTypeList[id] !== undefined) {
        return documentTypeList[id];
      }
    }
    return 'Category';
  };

  const setLink = () => {
    if (props.userRole !== Role.Client) {
      return '/my-documents/';
    }
    return `/my-documents/${props.username}`;
  };

  const history = useHistory();

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
                                After confirming that you have chosen the correct file, click
                                the &quot;Submit&quot; button to upload.
                                Otherwise, choose a different file.
                            </p>
                            <DropzoneUploader
                              pdfFiles={pdfFiles}
                              maxNumFiles={MAX_NUM_OF_FILES}
                              currentStep={currentStep}
                              updateStep={updateStep}
                              updateFileList={updateFileList}
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
                                                              title={setTitle(index)}
                                                            >
                                                                <Dropdown.Item
                                                                  eventKey="License"
                                                                  onClick={(event) => handleOnClickCard(index, 'Driver License')}
                                                                >Driver&apos;s
                                                                    License
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                  onClick={(event) => handleOnClickCard(index, 'Social Security Card')}
                                                                >Social
                                                                    Security Card
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                  onClick={(event) => handleOnClickCard(index, 'Birth Certificate')}
                                                                >Birth
                                                                    Certificate
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                  onClick={(event) => handleOnClickCard(index, 'Vaccine Card')}
                                                                >Vaccine
                                                                    Card
                                                                </Dropdown.Item>
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
                                      onClick={(event) => handleOnClick(currentStep - 1)}
                                    >
                                        Previous
                                    </button>
                                    <button
                                      className="float-right btn btn-outline-primary btn-md mr-3"
                                      type="button"
                                      onClick={(event) => handleOnClick(currentStep + 1)}
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
                                    <Link className="nav-link" to={setLink()}>
                                        <button
                                          type="button"
                                          className="float-right btn btn-outline-primary btn-sm mr-3"
                                        >
                                            Return to Documents
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )
                }
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                    </div>
                )}
            </div>
            <button
              type="button"
              className="mr-auto btn btn-outline-primary mt-5"
              onClick={history.goBack}
            >
                Previous
            </button>
        </div>
  );
}

export default withAlert()(UploadDocs);
