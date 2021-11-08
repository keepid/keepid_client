import 'react-dropzone-uploader/dist/styles.css';

import { Steps } from 'antd';
import React, { useCallback, useState } from 'react';
import { withAlert } from 'react-alert';
import Dropzone from 'react-dropzone-uploader';
import Stepper from 'react-stepper-horizontal';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';

interface Props {
  alert: any,
  userRole: Role,
}

interface State {
  currentStep: number
}

const MAX_NUM_OF_FILES: number = 5;
const { Step } = Steps;

class DropzoneTest extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentStep: 0,
    };
  }

  render() {
    const {
      alert,
    } = this.props;

    const {
      userRole,
    } = this.props;

    const {
      currentStep,
    } = this.state;

    const MyUploader = () => {
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
                  alert.show(`Successfully uploaded ${pdfFile.file.name}`);
                  const newStep = currentStep + 1;
                  this.setState({ currentStep: newStep });
                } else {
                  alert.show(`Failed to upload ${pdfFile.file.name}`);
                }
              })
              .finally(() => {
                allFiles.forEach((f) => f.remove());
              });
          }
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
          {/* <Stepper
            steps={[{ title: 'Upload' }, { title: 'Review & Submit' }]}
            activeStep={currentStep}
          /> */}
          <Steps className="d-none d-md-flex" progressDot current={currentStep}>
            <Step title="Upload files" description="" />
            <Step title="Document Information" description="" />
            <Step title="Review & Submit" description="" />
          </Steps>
        </div>
        <div className="d-flex flex-row bd-highlight mb-3 pt-5">
          <MyUploader />
        </div>
      </div>
    );
  }
}

export default withAlert()(DropzoneTest);
