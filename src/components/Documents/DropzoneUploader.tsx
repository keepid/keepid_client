import 'react-dropzone-uploader/dist/styles.css';
import '../../static/styles/UploadDocs.scss';

import { tsConstructorType } from '@babel/types';
import { Steps } from 'antd';
import React, { useCallback, useState } from 'react';
import { withAlert } from 'react-alert';
import { Card, Col, Container, Dropdown, DropdownButton, Row, Spinner } from 'react-bootstrap';
import Dropzone from 'react-dropzone-uploader';
import { Link } from 'react-router-dom';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';
import DocumentViewer from './DocumentViewer';

interface Props {
    alert: any,
    userRole: Role,
    pdfFiles: File[] | undefined,
    updateFileList,
    updateStep
  }

  interface State {
    pdfFiles: File[] | undefined,
    currentStep: number,
    maxNumFiles: number
  }

class DropzoneUploader extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      pdfFiles: undefined,
      currentStep: 0,
      maxNumFiles: 5,
    };
    this.handleFileStateChange = this.handleFileStateChange.bind(this);
    this.handleCurrentStepChange = this.handleCurrentStepChange.bind(this);
  }

  handleFileStateChange(fileList) {
    this.setState({ pdfFiles: fileList });
    this.props.updateFileList(fileList);
  }

  handleCurrentStepChange(newStep) {
    this.setState({ currentStep: newStep });
    this.props.updateStep(newStep);
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
      maxNumFiles,
    } = this.state;

    const MyUploader = () => {
      const fileList: File[] = [];
      const handleSubmit = (files, allFiles) => {
        if (files) {
          for (let i = 0; i < files.length; i += 1) {
            const pdfFile = files[i];
            console.log('file ', pdfFile.file);
            const formData = new FormData();
            formData.append('file', pdfFile.file, pdfFile.name);
            if (this.props.userRole === Role.Client) {
              formData.append('pdfType', PDFType.IDENTIFICATION);
            }
            if (this.props.userRole === Role.Director || this.props.userRole === Role.Admin) {
              formData.append('pdfType', PDFType.FORM);
            }
            fileList.push(pdfFile.file);
          }
          const nextStep = currentStep + 1;
          this.handleCurrentStepChange(nextStep);
          this.handleFileStateChange(fileList);
          console.log('file list size: ', fileList.length);
        }
      };
      return (
                    <Dropzone
                      onSubmit={handleSubmit}
                      maxFiles={maxNumFiles}
                      inputWithFilesContent={(files) => `${maxNumFiles - files.length} more`}
                      accept=".pdf"
                      submitButtonContent="Upload"
                    />
      );
    };

    return (
            <div className="container">
                <div className="card-alignment mb-3 pt-5">
                    <MyUploader />
                </div>
            </div>
    );
  }
}

export default withAlert()(DropzoneUploader);
