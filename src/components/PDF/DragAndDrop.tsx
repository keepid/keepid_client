/* eslint-disable */
// @ts-nocheck
import React, { useRef, useState, useEffect } from 'react';
import './DragAndDrop.css';
import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import PDFType from '../../static/PDFType';
import axios from 'axios';
import file2 from '../../static/images/file2.svg';
import cancel from '../../static/images/cancel.svg';

const DragAndDrop = (props) => {
  const fileInputRef = useRef();
  const modalImageRef = useRef();
  const modalRef = useRef();
  const progressRef = useRef();
  const uploadRef = useRef();
  const uploadModalRef = useRef();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validFiles, setValidFiles] = useState([]);
  const [unsupportedFiles, setUnsupportedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [buttonState] = useState('');
  const [pdfFiles] = useState(FileList | undefined,);
  const showUploadComponentProp = props.showUploadComponent;
  const [showUploadComponent, setShowUploadComponent] = useState(showUploadComponentProp);

  useEffect(() => {
    let filteredArr = selectedFiles.reduce((acc, current) => {
        const x = acc.find(item => item.name === current.name);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
    }, []);
    setValidFiles([...filteredArr]);
    
}, [selectedFiles]);

const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
}

const dragOver = (e) => {
    preventDefault(e);
}

const dragEnter = (e) => {
    preventDefault(e);
}

const dragLeave = (e) => {
    preventDefault(e);
}

const fileDrop = (e) => {
    preventDefault(e);
    const files = e.dataTransfer.files;
    if (files.length) {
        handleFiles(files);
    }
}

const filesSelected = () => {
    if (fileInputRef) {
		const length = fileInputRef?.current?.files.length
        handleFiles(fileInputRef?.current?.files);
    }
}

const fileInputClicked = () => {
    fileInputRef.current.click();
}

const handleFiles = (files) => {
    for(let i = 0; i < files.length; i++) {
        if (validateFile(files[i])) {
            setSelectedFiles(prevArray => [...prevArray, files[i]]);
        } else {
            files[i]['invalid'] = true;
            setSelectedFiles(prevArray => [...prevArray, files[i]]);
            setErrorMessage('File type not permitted');
            setUnsupportedFiles(prevArray => [...prevArray, files[i]]);
        }
    }
}

const validateFile = (file) => {
    const validTypes = ['application/pdf'];
    if (validTypes.indexOf(file.type) === -1) {
        console.log(validTypes);
        console.log(file.type)
        return false;
    }

    return true;
}

const fileSize = (size) => {
    if (size === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const fileType = (fileName) => {
    return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
}

const removeFile = (name) => {
    const index = validFiles.findIndex(e => e.name === name);
    const index2 = selectedFiles.findIndex(e => e.name === name);
    const index3 = unsupportedFiles.findIndex(e => e.name === name);
    validFiles.splice(index, 1);
    selectedFiles.splice(index2, 1);
    setValidFiles([...validFiles]);
    setSelectedFiles([...selectedFiles]);
    if (index3 !== -1) {
        unsupportedFiles.splice(index3, 1);
        setUnsupportedFiles([...unsupportedFiles]);
    }
}

const openImageModal = (file) => {
    const reader = new FileReader();
    modalRef.current.style.display = "block";
    reader.readAsDataURL(file);
    reader.onload = function(e) {
        modalImageRef.current.style.backgroundImage = `url(${e.target.result})`;
    }
}

const closeModal = () => {
    modalRef.current.style.display = "none";
    modalImageRef.current.style.backgroundImage = 'none';
}

const submitForm = (event: any) => {
    const {
      userRole,
    } = this.props;

    this.setState({ buttonState: 'running' });
    event.preventDefault();
    const {
      pdfFiles,
    } = this.state;

    const {
      alert,
    } = this.props;

    if (pdfFiles) {
      // upload each pdf file
      for (let i = 0; i < pdfFiles.length; i += 1) {
        const pdfFile = pdfFiles[i];
        const formData = new FormData();
        formData.append('file', pdfFile, pdfFile.name);
        if (userRole === Role.Client) {
          formData.append('pdfType', PDFType.IDENTIFICATION);
        }
        if (userRole === Role.Director || userRole === Role.Admin) {
          formData.append('pdfType', PDFType.APPLICATION);
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
              alert.show(`Successfully uploaded ${pdfFile.name}`);
              this.setState({
                buttonState: '',
                pdfFiles: undefined,
              }, () => this.getDocumentData());
            } else {
              alert.show(`Failure to upload ${pdfFile.name}`);
              this.setState({ buttonState: '' });
            }
          });
      }
    } else {
      alert.show('Please select a file');
      this.setState({ buttonState: '' });
    }
}

const uploadFiles = async () => {
    uploadModalRef.current.style.display = 'block';
    uploadRef.current.innerHTML = 'File(s) Uploading...';
    const {
      userRole,
      alert,
    } = props;

    for (let i = 0; i < validFiles.length; i++) {
        const pdfFile = validFiles[i];
        const formData = new FormData();
        formData.append('file', pdfFile, pdfFile.name);
        if (userRole === Role.Client) {
          formData.append('pdfType', PDFType.IDENTIFICATION);
        }
        if (userRole === Role.Director || userRole === Role.Admin) {
          formData.append('pdfType', PDFType.APPLICATION);
        }
        /*
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
              alert.show(`Successfully uploaded ${pdfFile.name}`);
              
              this.setState({
                buttonState: '',
                pdfFiles: undefined,
              }, () => this.getDocumentData());
            } else {
              alert.show(`Failure to upload ${pdfFile.name}`);
              this.setState({ buttonState: '' });
            }
          });*/ 
         
        axios.post(`${getServerURL()}/upload`, formData, { withCredentials: true },{
        headers: {
          'Content-Type': 'multipart/form-data'
        }
        },{
          onUploadProgress: (progressEvent) => {
            const uploadPercentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
            progressRef.current.innerHTML = `${uploadPercentage}%`;
            progressRef.current.style.width = `${uploadPercentage}%`;

            if (uploadPercentage === 100) {
                uploadRef.current.innerHTML = 'File(s) Uploaded';
                validFiles.length = 0;
                setValidFiles([...validFiles]);
                setSelectedFiles([...validFiles]);
                setUnsupportedFiles([...validFiles]);
            }
          }
          }).then((response) => {
              const {
                status,
              } = response.data;
              console.log(status)
              if (status === 'SUCCESS') {
                props.alert.show(`Successfully uploaded ${pdfFile.name}`);
              }
              else {
                props.alert.show(`Failure to upload ${pdfFile.name}`);
              }
          });
}}

const closeUploadModal = () => {
    uploadModalRef.current.style.display = 'none';
}

{/*        <div className="modal" ref={modalRef}>
            <div className="overlay"></div>
            <span className="close" onClick={(() => closeModal())}>X</span>
            <div className="modal-image" ref={modalImageRef}></div>
        </div>

        <div className="upload-modal" ref={uploadModalRef}>
            <div className="overlay"></div>
            <div className="close" onClick={(() => closeUploadModal())}>X</div>
            <div className="progress-container">
                <span ref={uploadRef}></span>
                <div className="progress">
                    <div className="progress-bar" ref={progressRef}></div>
                </div>
            </div>
        </div>*/}

return (
  <div>
  { showUploadComponent 
    ? (<div className="p-5" style={{ borderStyle: 'none', boxShadow: '0px 0px 10px lightgray', borderColor:'red' }}>
        <div className="d-flex flex-row">
          <button
            style={{
              background: 'none',
              border: 'none',
              height: 50,
              width: 50,
            }}
            type="button"
            className="btn-close ml-auto"
            aria-label="Close"
            onClick={() => setShowUploadComponent(false)}
          >
            <img
              alt="close upload file"
              src={cancel}
              width="25"
              height="25"
              className=""
            />
          </button>
        </div>
        <h3 className="mx-auto">
          Upload File
        </h3>
        <div className="container-DragDrop">
            {unsupportedFiles.length === 0 && validFiles.length ? <button className="file-upload-btn" onClick={() => uploadFiles()}>Upload Files</button> : ''} 
            {unsupportedFiles.length ? <p className="red-text">Please remove all unsupported files.</p> : ''}
            <div className="drop-container"
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={fileDrop}
                onClick={fileInputClicked}
            >
                <div className="drop-message">
                    <div className="upload-file-icon">                                  
                      <img
                        alt="file icon"
                        src={file2}
                        width="42"
                        height="42"
                        className="mr-1 mb-1"
                      />
                    </div>
                    Drag and drop or <span style={{color:"#445cec"}}>browse</span> your files
                    <div style = {{fontSize:16}}>
                      PDF files only
                      <br />
                      Supprts up to x MB
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    className="file-input"
                    type="file"
                    multiple
                    onChange={filesSelected}
                />
            </div>
            <div className="file-display-container">
                {
                    validFiles.map((data, i) => 
                        <div className="file-status-bar" key={i}>
                            <div onClick={!data.invalid ? () => openImageModal(data) : () => removeFile(data.name)}>
                                <div className="file-type-logo"></div>
                                <div className="file-type">{fileType(data.name)}</div>
                                <span className={`file-name ${data.invalid ? 'file-error' : ''}`}>{data.name}</span>
                                <span className="file-size">({fileSize(data.size)})</span> {data.invalid && <span className='file-error-message'>({errorMessage})</span>}
                            </div>
                            <div className="file-remove" onClick={() => removeFile(data.name)}>X</div>
                        </div>
                    )
                }
            </div>
        </div>
    </div> ): null } </div>
  );
}

export default DragAndDrop;
