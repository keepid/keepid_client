import React from 'react';

import DocViewer from './DocViewer';

interface State {
	pdfFile: File | undefined
  pdfFileSource: string | ArrayBuffer | null,
}

class UploadDocs extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
    this.state = {
      pdfFile: undefined,
      pdfFileSource: null,
    };
    this.submitForm = this.submitForm.bind(this);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
  }

  submitForm(event: any) {
    event.preventDefault();
    fetch('https://localhost:7000/put-documents', {
      method: 'POST',
      body: this.state.pdfFile,
    }).then((response) => response.json())
      .then((responseJSON) => {

      });
  }

  handleChangeFileUpload(event: any) {
    event.preventDefault();
    const file : File = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = (() => {
      console.log(reader.result);
      this.setState({ pdfFile: file });
      this.setState({ pdfFileSource: reader.result });
    });
    reader.readAsDataURL(file);
  }

  render() {
    if (this.state.pdfFile) {
      return (
        <div>
          <DocViewer pdfFile={this.state.pdfFile} />
          <form onSubmit={this.submitForm}>
            <input type="file" accept="application/pdf" onChange={this.handleChangeFileUpload} />
            <button type="submit">Upload</button>
          </form>
        </div>
      );
    }
    return (
      <div>
        <form onSubmit={this.submitForm}>
          <input type="file" accept="application/pdf" onChange={this.handleChangeFileUpload} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default UploadDocs;
