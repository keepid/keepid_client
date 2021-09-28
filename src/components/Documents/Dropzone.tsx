import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import uuid from 'react-uuid';

import DocumentViewer from './DocumentViewer';

function DropzoneComponent() {
// class DropzoneComponent extends React.Component<Props, State> {

  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    console.log('FILE UPLOADED! :D');
    console.log(acceptedFiles);

    setFiles(acceptedFiles.map((file) => Object.assign(file, {
      preview: URL.createObjectURL(file),
    })));
  }, []);

  const {
    getRootProps,
    getInputProps,
  } = useDropzone({
    onDrop,
    accept: '.pdf,.png,.jpg',
  });

  const thumbs = files.map((file) => (
        <div key={uuid()}>
            <DocumentViewer pdfFile={file} />
        </div>
  ));

  return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div>Drag and drop files here</div>
            <aside>
                {thumbs}
            </aside>
        </div>
  );
}

export default DropzoneComponent;
