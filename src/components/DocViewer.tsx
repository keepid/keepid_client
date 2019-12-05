import React, { Component } from 'react';

// Need to validate form to make sure inputs are good, address is good, etc.
// Google API for address checking

interface Props {
  pdfFile: File,
}

interface State {
  pdfFile: File,
}

class DocViewer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pdfFile: props.pdfFile,
    };
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    console.log(props.pdfFile);
    this.setState({ pdfFile: props.pdfFile });
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2 className="text-center">
                        Document Title Here
            </h2>
          </div>
        </div>
        <div className="row embed-responsive embed-responsive-16by9">
          <iframe className="embed-responsive-item" src={this.state.pdfFile.name} title="Document" />
        </div>
      </div>
    );
  }
}

export default DocViewer;
