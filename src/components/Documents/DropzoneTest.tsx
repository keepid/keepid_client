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

const MAX_NUM_OF_FILES: number = 5;

class DropzoneTest extends React.Component<Props, State> {
  render() {
    const {
      alert,
    } = this.props;

    const {
      userRole,
    } = this.props;

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
          <MyUploader />
      </div>
    );
  }
}

export default withAlert()(DropzoneTest);
