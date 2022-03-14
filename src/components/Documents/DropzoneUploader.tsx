import 'react-dropzone-uploader/dist/styles.css';
import '../../static/styles/UploadDocs.scss';

import React, { useCallback, useState } from 'react';
import { withAlert } from 'react-alert';
import Dropzone from 'react-dropzone-uploader';

import PDFType from '../../static/PDFType';
import Role from '../../static/Role';

const DropzoneUploader = ({
  alert,
  userRole,
  updateFileList,
  updateStep,
  maxNumFiles,
  currentStep,
}) => {
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
          formData.append('pdfType', PDFType.IDENTIFICATION);
        }
        if (userRole === Role.Director || userRole === Role.Admin) {
          formData.append('pdfType', PDFType.FORM);
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
      accept=".pdf"
      submitButtonContent="Upload"
    />
  );
};

export default withAlert()(DropzoneUploader);
