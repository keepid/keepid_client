import React, { Component, useState } from 'react';
import { Helmet } from 'react-helmet';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Select from 'react-select';
import { withAlert } from 'react-alert';
import TablePageSelector from '../Base/TablePageSelector';
import getServerURL from '../../serverOverride';
import PDFType from '../../static/PDFType';
import Role from '../../static/Role';

interface Props {
  alert: any,
  userRole: Role,
  username: string,
  name: string,
  organization: string,
}

interface State {
  currentApplicationId: string | undefined,
  currentApplicationFilename: string | undefined,
  documents: any,
  currentUser: any,
  currentPage: number,
  itemsPerPageSelected: any,
  numElements: number,
  searchName: string,
  username: string,
  adminName: string,
  organization: string,
}

const listOptions = [
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

interface State {
  pdfFiles: FileList | undefined,
}

class DeveloperLanding extends Component<Props, State, {}> {
  ButtonFormatter = (cell, row, rowIndex, formatExtraData) => (
    <div>
      <label className="btn btn-filestack btn-widget ml-5 mr-5">
        Re-Upload
        <input type="file" accept="application/pdf" id="potentialPdf" multiple onChange={(event) => this.handleChangeFileUpload(event, rowIndex)} hidden />
      </label>
      <label className="btn btn-filestack btn-widget ml-5 mr-5">
        Download
        <button type="button" onClick={(event) => this.handleChangeFileDownload(event, rowIndex)} hidden />
      </label>
    </div>
  )

  tableCols = [{
    dataField: 'filename',
    text: 'Application Name',
    sort: true,
  }, {
    dataField: 'category',
    text: 'Category',
    sort: true,
  }, {
    text: 'Actions',
    formatter: this.ButtonFormatter,
  }];

  constructor(props: Props) {
    super(props);
    this.handleChangeFileUpload = this.handleChangeFileUpload.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleChangeFileDownload = this.handleChangeFileDownload.bind(this);
    this.handleFileDownload = this.handleFileDownload.bind(this);
    this.state = {
      pdfFiles: undefined,
      currentApplicationId: undefined,
      currentApplicationFilename: undefined,
      currentUser: undefined,
      currentPage: 0,
      itemsPerPageSelected: listOptions[0],
      numElements: 0,
      username: props.username,
      searchName: '',
      adminName: props.name,
      organization: props.organization,
      documents: [],
    };
    this.onClickWorker = this.onClickWorker.bind(this);
    this.handleChangeSearchName = this.handleChangeSearchName.bind(this);
    this.handleChangeItemsPerPage = this.handleChangeItemsPerPage.bind(this);
    this.changeCurrentPage = this.changeCurrentPage.bind(this);
    this.getDocuments = this.getDocuments.bind(this);
    this.onChangeViewPermission = this.onChangeViewPermission.bind(this);
    this.ButtonFormatter = this.ButtonFormatter.bind(this);
  }

  componentDidMount() {
    this.getDocuments();
  }

  onClickWorker(event: any) {
    this.setState({ currentUser: event });
  }

  handleChangeSearchName(event: any) {
    this.setState({
      searchName: event.target.value,
      currentPage: 0,
    });
  }

  handleChangeItemsPerPage(itemsPerPageSelected: any) {
    this.setState({
      currentPage: 0,
    });
  }

  handleViewDocument(event: any, rowIndex: number) {
    const {
      documents,
    } = this.state;

    const index = rowIndex;
    const form = documents[index];
    const {
      id,
      filename,
    } = form;
    this.setState(
      {
        currentApplicationId: id,
        currentApplicationFilename: filename,
      },
    );
  }

  changeCurrentPage(newCurrentPage: number) {
    this.setState({ currentPage: newCurrentPage }, this.getDocuments);
  }

  onChangeViewPermission(event: any) {
    const {
      currentUser,
    } = this.state;
    currentUser.viewPermission = event.target.ischecked;
    this.setState({ currentUser }, this.getDocuments);
  }

  getDocuments() {
    const {
      searchName,
      currentPage,
      itemsPerPageSelected,
    } = this.state;
    const itemsPerPage = Number(itemsPerPageSelected.value);
    fetch(`${getServerURL()}/get-documents `, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        pdfType: PDFType.FORM,
        annotated: false,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
          documents,
        } = responseJSON;
        if (status === 'SUCCESS') {
          this.setState({
            documents,
          });
        }
      });
  }

  handleChangeFileUpload(event: any, rowIndex: number) {
    event.preventDefault();
    const {
      alert,
    } = this.props;
    const { files } = event.target;

    this.setState({
      pdfFiles: files,
    }, () => this.handleFileChange(rowIndex));
  }

  handleFileChange(rowIndex: number) {
    const {
      alert,
    } = this.props;

    if (this.state.pdfFiles === undefined) throw new Error('Must upload a file');
    const pdfFile = this.state.pdfFiles[0];
    if (pdfFile === null) throw new Error('Must upload a file');

    const formData = new FormData();
    formData.append('file', pdfFile, pdfFile.name);
    formData.append('fileId', this.state.documents[rowIndex].id);

    fetch(`${getServerURL()}/upload-annotated`, {
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
            pdfFiles: undefined,
          }, () => this.getDocuments());
        } else {
          alert.show(`Failure to upload ${pdfFile.name}`);
        }
      });
  }

  handleChangeFileDownload(event: any, rowIndex: number) {
    event.preventDefault();
    const {
      alert,
    } = this.props;
    const { files } = event.target;

    this.setState({
      pdfFiles: files,
    }, () => this.handleFileDownload(rowIndex));
  }

  handleFileDownload(rowIndex: number) {
    const {
      userRole,
    } = this.props;

    const documentId = this.state.documents[rowIndex].id;
    const documentName = this.state.documents[rowIndex].filename;

    let pdfType;
    if (userRole === Role.Worker || userRole === Role.Admin || userRole === Role.Director) {
      pdfType = PDFType.FORM;
    } else if (userRole === Role.Client) {
      pdfType = PDFType.IDENTIFICATION;
    } else {
      pdfType = undefined;
    }

    fetch(`${getServerURL()}/download`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        fileId: documentId,
        pdfType,
      }),
    }).then((response) => response.blob())
      .then((response) => {
        const pdfFile = new File([response], documentName, { type: 'application/pdf' });
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }).catch((error) => {
        alert('Error Fetching File');
      });
  }

  render() {
    const {
      currentApplicationFilename,
      currentApplicationId,
      currentUser,
      currentPage,
      itemsPerPageSelected,
      numElements,
      username,
      adminName,
      organization,
      documents,
    } = this.state;

    const itemsPerPage = Number(itemsPerPageSelected.value);
    const tablePageSelector = TablePageSelector({
      currentPage,
      itemsPerPage,
      numElements,
      changeCurrentPage: this.changeCurrentPage,
    });

    return (
      <div className="container-fluid">
        <Helmet>
          <title>Developer Panel</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="jumbotron jumbotron-fluid bg-white pb-0">
          <div className="container">
            <h1 className="display-4">My Un-Annotated Forms</h1>
            <p className="lead">See all of your un-annotated forms. Check the category of each of your forms here (TBI).</p>
          </div>
        </div>
        <div className="container">
          <form className="form-inline my-2 my-lg-0">
            <input
              className="form-control mr-sm-2 w-50"
              type="search"
              placeholder="Search"
              aria-label="Search"
              onChange={this.handleChangeSearchName}
            />
          </form>
          <div className="row ml-1 mt-2 mb-2">
            {numElements === 0 ? <div /> : tablePageSelector }
            {numElements === 0 ? <div />
              : (
                <div className="w-25">
                  <div className="card card-body mt-0 mb-4 border-0 p-0">
                    <h5 className="card-text h6"># Items per page</h5>
                    <Select
                      options={listOptions}
                      autoFocus
                      closeMenuOnSelect={false}
                      onChange={this.handleChangeItemsPerPage}
                      value={itemsPerPageSelected}
                    />
                  </div>
                </div>
              )}
          </div>
          <div className="d-flex flex-row bd-highlight mb-3 pt-5">
            <div className="w-100 pd-3">
              <BootstrapTable
                bootstrap4
                keyField="id"
                data={documents}
                hover
                striped
                noDataIndication="No Forms Present"
                columns={this.tableCols}
                pagination={paginationFactory()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(DeveloperLanding);
