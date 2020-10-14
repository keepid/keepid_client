import React from 'react';

interface Props {
  pdfFile: File,
}

export default class DocumentViewer extends React.Component<Props, {}> {
  render() {
    return (<a target="_blank" rel="noopener noreferrer" href={URL.createObjectURL(this.props.pdfFile)}> PDF </a>);
  }
}
