import 'react-dropzone-uploader/dist/styles.css';
import '../../static/styles/UploadDocs.scss';

import { Steps } from 'antd';
import React, { useCallback, useState } from 'react';
import { withAlert } from 'react-alert';
import { Card, Col, Container, Row } from 'react-bootstrap';
import Dropzone from 'react-dropzone-uploader';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import DocumentViewer from './DocumentViewer';

interface Props {
  alert: any,
  userRole: Role,
}

interface State {
  pdfFiles: File[] | undefined,
  // buttonState: string,
  currentStep: number
}

interface PDFProps {
  pdfFile: File
}

const MAX_NUM_OF_FILES: number = 5;
const MAX_NUM_STEPS = 2;
const { Step } = Steps;

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
          {showResults ? 'Hide' : 'Preview'}
        </button>
      </div>
      {showResults ? <div className="row mt-3"><DocumentViewer pdfFile={pdfFile} /></div> : null}
    </div>
  );
}

class DropzoneTest extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pdfFiles: undefined,
      currentStep: 0,
    };
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(newCurrentStep: number) {
    if (newCurrentStep < 0) {
      this.setState({
        currentStep: 0,
        pdfFiles: undefined,
      });
    } else if (newCurrentStep > MAX_NUM_STEPS) {
      this.setState({ currentStep: MAX_NUM_STEPS });
    } else {
      this.setState({ currentStep: newCurrentStep });
    }
  }

  render() {
    const {
      alert,
    } = this.props;

    const {
      userRole,
    } = this.props;

    const {
      pdfFiles,
      currentStep,
    } = this.state;

    const MyUploader = () => {
      const fileList: File[] = [];
      const handleSubmit = (files, allFiles) => {
        if (files) {
          for (let i = 0; i < files.length; i += 1) {
            const pdfFile = files[i];
            const formData = new FormData();
            formData.append('file', pdfFile.file, pdfFile.name);
            if (userRole === Role.Client) {
              formData.append('pdfType', PDFType.IDENTIFICATION);
            }
            if (userRole === Role.Director || userRole === Role.Admin) {
              formData.append('pdfType', PDFType.FORM);
            }
            fileList.push(pdfFile.file);
            console.log('file type: ', typeof (formData));
            // fetch(`${getServerURL()}/upload`, {
            //   method: 'POST',
            //   credentials: 'include',
            //   body: formData,
            // }).then((response) => response.json())
            //   .then((responseJSON) => {
            //     const {
            //       status,
            //     } = responseJSON;
            //     if (status === 'SUCCESS') {
            //       alert.show(`Successfully uploaded ${pdfFile.file.name}`);
            //       const newStep = currentStep + 1;
            //       this.setState({ currentStep: newStep });
            //     } else {
            //       alert.show(`Failed to upload ${pdfFile.file.name}`);
            //     }
            //   })
            //   .finally(() => {
            //     allFiles.forEach((f) => f.remove());
            //   });
          }
          const nextStep = currentStep + 1;
          this.setState({
            pdfFiles: fileList,
            currentStep: nextStep });
        }
      };

      return (
            <Dropzone
              onSubmit={handleSubmit}
              maxFiles={MAX_NUM_OF_FILES}
              inputWithFilesContent={(files) => `${MAX_NUM_OF_FILES - files.length} more`}
              accept="image/*,.pdf,.png,.jpg"
              submitButtonContent="Upload"
            />
      );
    };

    return (
      <div className="container">
        <div>
          <Steps className="d-none d-md-flex" progressDot current={currentStep}>
            <Step title="Upload files" description="" />
            <Step title="Document Information" description="" />
            <Step title="Review & Submit" description="" />
          </Steps>
        </div>
        <div className="card-alignment mb-3 pt-5">
          {currentStep === 0 && (
            <div>
              <p className="lead pt-3">
                Select a PDF file to upload.
                The name of the PDF will appear when loaded.
                After confirming that you have chosen the correct file, click the &quot;Submit&quot; button to upload.
                Otherwise, choose a different file.
              </p>
              <MyUploader />
            </div>
          )}
          {currentStep === 1 && (
            <div>
              <p className="lead pt-3">
                Please review the documents below. Click the &quot;Continue&quot; button to submit.
              </p>
              <Container>
                {
                  pdfFiles && pdfFiles.length > 0 ? Array.from(pdfFiles).map((pdfFile) =>
                    (
                      <Row xs={1} md={3} className="g-4 row-padding">
                        <Col>
                          <Card style={{ width: '36rem' }}>
                            <Card.Body>
                              <Card.Title>{pdfFile.name}</Card.Title>
                              <Card.Text>
                                <p>Document Type: {pdfFile.type}</p>
                                <p>Document Size: {pdfFile.size}</p>
                              </Card.Text>
                              <RenderPDF
                                key={uuid()}
                                pdfFile={pdfFile}
                              />
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    )) : null
                }
              </Container>
            </div>
          )}
        </div>
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
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(DropzoneTest);
