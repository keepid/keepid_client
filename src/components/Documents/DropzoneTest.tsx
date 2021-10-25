import 'react-dropzone-uploader/dist/styles.css';

import React, { useCallback, useState } from 'react';
import { withAlert } from 'react-alert';
import Dropzone from 'react-dropzone-uploader';
import { Helmet } from 'react-helmet';

import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';

interface Props {
  alert: any,
  userRole: Role,
}

interface State {
  pdfFiles: FileList | undefined,
  buttonState: string
}

interface PDFProps {
  pdfFile: File
}

const MAX_NUM_OF_FILES: number = 5;

const MyUploader = () => {
  // OPTION 1: we can upload files in getUploadParams() one by one
  const getUploadParams = (file) => {
    const formData = new FormData();
    formData.append('fileField', file);
    formData.append('file', file);
    // formData had issues adding new field types -> pdfType is not showing up in backend
    formData.append('pdfType', PDFType.IDENTIFICATION);

    const config = {
      method: 'POST',
      credentials: 'include',
      body: formData,
    };

    // return { url: 'https://httpbin.org/post', formData, config };
    return { url: `${getServerURL()}/upload`, formData, config };
  };

  const handleChangeStatus = ({ meta, file }, status) => {
    console.log(status, meta, file);
  };

  // OPTION 2: we can upload all files at the end in the handleSubmit() instead of getUploadParams
  const handleSubmit = (files, allFiles) => {
    if (files) {
      for (let i = 0; i < files.length; i += 1) {
        const pdfFile = files[i];
        const formData = new FormData();
        formData.append('file', pdfFile);
        // formData had issues adding new field types -> pdfType is not showing up in backend
        formData.append('pdfType', PDFType.IDENTIFICATION);
        fetch(`${getServerURL()}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      }
    }
    console.log(files.map((f) => f.meta));
    // will add more logic here later here once above pdfType is fixed
    allFiles.forEach((f) => f.remove());
  };

  return (
        <Dropzone
          // getUploadParams={getUploadParams}
          onChangeStatus={handleChangeStatus}
          onSubmit={handleSubmit}
          maxFiles={MAX_NUM_OF_FILES}
          accept="image/*,.pdf,.png,.jpg"
        />
  );
};

class DropzoneTest extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pdfFiles: undefined,
      buttonState: '',
    };
  }

  render() {
    const {
      pdfFiles,
      buttonState,
    } = this.state;

    return (
      <div className="container">
        <Helmet>
          <title>Upload Documents</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron-fluid mt-5">
          <h1 className="display-4">
            Upload Documents
            {/* {location.state ? ` for "${location.state.clientUsername}"` : null} */}
          </h1>
          <p className="lead pt-3">
            Click the &quot;Choose file&quot; button to select a PDF file to upload.
            The name and a preview of the PDF will appear below the buttons.
            After confirming that you have chosen the correct file, click the &quot;Upload&quot; button to upload.
            Otherwise, choose a different file.
          </p>

          <MyUploader />

        </div>
      </div>
    );
  }
}

export default withAlert()(DropzoneTest);
