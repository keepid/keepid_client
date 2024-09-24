import 'react-dropzone-uploader/dist/styles.css';
import '../../static/styles/UploadDocs.scss';

import React, { useCallback, useState } from 'react';
import { withAlert } from 'react-alert';
import Dropzone from 'react-dropzone-uploader';

import Role from '../../static/Role';
import FileType from "../../static/FileType";

function DropzoneUploader({ alert, userRole, updateFileList, updateStep, maxNumFiles, currentStep }) {
  const list: File[] = [];
  const [fileList, setFileList] = useState(list);
  const [step, setStep] = useState(currentStep + 1);
  function handleSubmit(files) {
    if (files) {
      for (let i = 0; i < files.length; i += 1) {
        const pdfFile = files[i];
        const formData = new FormData();
        formData.append('file', pdfFile.file, pdfFile.name);
        if (userRole === Role.Client) {
          formData.append('fileType', FileType.IDENTIFICATION_PDF);
        }
        if (userRole === Role.Director || userRole === Role.Admin) {
          formData.append('fileType', FileType.IDENTIFICATION_PDF);
        }
        list.push(pdfFile.file);
      }
      const newStep = step + 1;
      setStep(newStep);
      updateStep(step);
      setFileList(list);
      updateFileList(fileList);
    }
  }

  return (
      <Dropzone
        onSubmit={handleSubmit}
        maxFiles={maxNumFiles}
        inputWithFilesContent={(files) => `${maxNumFiles - files.length} more`}
        accept="application/pdf, image/*"
        submitButtonContent="Upload"
      />
  );
}

export default withAlert()(DropzoneUploader);
