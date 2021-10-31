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

    const {
      alert,
    } = this.props;

    const {
      userRole,
    } = this.props;

    console.log(`userRole: ${userRole}`);

    const MyUploader = () => {
      const handleChangeStatus = ({ meta, file }, status) => {
        console.log(status, meta, file);
      };

      // OPTION 2: we can upload all files at the end in the handleSubmit() instead of getUploadParams
      const handleSubmit = (files, allFiles) => {
        console.log('SUBMITTING FILES, LISTING ALL FILES');
        console.log(files.map((f) => f.meta));
        if (files) {
          for (let i = 0; i < files.length; i += 1) {
            const pdfFile = files[i];
            const formData = new FormData();
            formData.append('file', pdfFile.file, pdfFile.name);
            if (userRole === Role.Client) {
              console.log('client!');
              formData.append('pdfType', PDFType.IDENTIFICATION);
            }
            if (userRole === Role.Director || userRole === Role.Admin) {
              console.log('form!');
              formData.append('pdfType', PDFType.FORM);
            }
            console.log(...formData);
            console.log(`userRole: ${userRole}`);
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
                } else {
                  alert.show(`Failed to upload ${pdfFile.file.name}`);
                }
              })
              .finally(() => {
                console.log(files.map((f) => f.meta));
                allFiles.forEach((f) => f.remove());
              });
          }
        }
      };

      return (
            <Dropzone
              onChangeStatus={handleChangeStatus}
              onSubmit={handleSubmit}
              maxFiles={MAX_NUM_OF_FILES}
              inputWithFilesContent={(files) => `${MAX_NUM_OF_FILES - files.length} more`}
              accept="image/*,.pdf,.png,.jpg"
            />
      );
    };

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
