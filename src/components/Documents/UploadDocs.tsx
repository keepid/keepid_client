import React, { useState } from 'react';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';

// import { Steps } from 'antd';
import Role from '../../static/Role';
import DropzoneTest from './DropzoneTest';

interface Props {
  alert: any,
  userRole: Role,
}

interface State {
  pdfFiles: FileList | undefined,
  buttonState: string,
  // currentStep: number
}

// const { Step } = Steps;

class UploadDocs extends React.Component<Props, State> {
  // constructor(props: Props) {
  //   super(props);
  //   this.state = {
  //     currentStep: 0
  //   };
  // }

  static maxFilesExceeded(files, maxNumFiles) {
    return files.length > maxNumFiles;
  }

  static fileNamesUnique(files) {
    const fileNames: string[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const fileName = files[i].name;
      fileNames.push(fileName);
    }

    return fileNames.length === new Set(fileNames).size;
  }

  render() {
    const {
      userRole,
    } = this.props;

    // const {
    //   currentStep,
    // } = this.state;

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

          <DropzoneTest userRole={userRole} />
        </div>
      </div>
    );
  }
}

export default withAlert()(UploadDocs);
