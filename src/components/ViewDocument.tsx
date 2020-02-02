import React, { Component } from 'react';

class ViewDocument extends Component<{}, {}, {}> {
  constructor(props: any) {
    super(props);
    console.log();
  }

  render() {
    return (
      <div>
        <div className="row mt-5">
          <p className="textPrintDesc pl-3">
            <span>End User License Agreement</span>
          </p>
          <div className="embed-responsive embed-responsive-16by9">
            <iframe className="embed-responsive-item" src="eula-template.pdf" title="EULA Agreement" />
          </div>
        </div>

        <button>
          <a href="/my-documents">
            Back
          </a>
        </button>
      </div>
    );
  }
}

export default ViewDocument;
