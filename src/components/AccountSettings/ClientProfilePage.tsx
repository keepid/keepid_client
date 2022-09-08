import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import Image from 'react-bootstrap/Image';
import Cropper from 'react-easy-crop';

import getServerURL from '../../serverOverride';
import GenericProfilePicture from '../../static/images/generalprofilepic.png';
import ActivityCard from '../BaseComponents/BaseActivityCard';

interface Props {
  username: any;
  alert: any;
}

interface State {
  activitiesArr: Array<any> | null;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  email: string;
  organization: string;
  phone: string;
  zipcode: string;
  file: File | undefined | null | any;
  photoAvailable: boolean;
  photo: any;
  crop: any;
  zoom: number;
  aspect: any;
  showCropper: boolean;
  fileSelected: any;
  inputKey: any;
  croppedAreaPixels: number;
  loading: boolean;
  fileName: string;
  backgroundColor: string;
  color: string;
}

const maxZoom = 2;
const zoomIncrement = 0.1;
const minZoom = 1;

class ClientProfilePage extends Component<Props, State> {
  private hiddenFileInput: React.RefObject<HTMLInputElement>;

  private controllerRef: React.MutableRefObject<AbortController | null>;

  constructor(props: Props) {
    super(props);
    this.hiddenFileInput = React.createRef();
    this.controllerRef = React.createRef();

    this.state = {
      firstName: '',
      lastName: '',
      birthDate: '',
      address: '',
      city: '',
      state: '',
      email: '',
      organization: '',
      phone: '',
      zipcode: '',
      activitiesArr: null,
      file: undefined,
      photoAvailable: false,
      photo: null,
      crop: { x: 0, y: 0 },
      zoom: 1,
      aspect: 1 / 1,
      showCropper: false,
      fileSelected: null,
      inputKey: 0,
      croppedAreaPixels: 0,
      loading: false,
      fileName: '',
      backgroundColor: '#7B81FF',
      color: '#FFFFFF',
    };

    this.photoUploadHandler = this.photoUploadHandler.bind(this);
    this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
    this.loadProfilePhoto = this.loadProfilePhoto.bind(this);
    this.readFile = this.readFile.bind(this);
    this.getCroppedImg = this.getCroppedImg.bind(this);
    this.dataURItoBlob = this.dataURItoBlob.bind(this);
    this.cropAndSave = this.cropAndSave.bind(this);
  }

  componentDidMount() {
    if (this.controllerRef.current) {
      this.controllerRef.current.abort();
    }

    const { username } = this.props;
    const abortController = new AbortController();
    this.controllerRef.current = abortController;
    const signal = this.controllerRef.current?.signal;

    fetch(`${getServerURL()}/get-user-info`, {
      signal,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = responseJSON;
        const {
          firstName,
          lastName,
          birthDate,
          address,
          city,
          state,
          zipcode,
          email,
          organization,
          phone,
        } = responseObject;

        this.setState({
          firstName,
          lastName,
          birthDate,
          address,
          city,
          state,
          zipcode,
          email,
          organization,
          phone,
        });
      })
      .then(() => this.loadProfilePhoto())
      .then(() => {
        fetch(`${getServerURL()}/get-all-activities`, {
          signal,
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ username }),
        })
          .then((response) => response.json())
          .then((responseJSON) => {
            console.log(responseJSON, 'activities here');
            const activitiesArr = responseJSON.activities;
            this.setState({
              activitiesArr,
            });
          })
          .catch((error) => {
            if (
              error.toString() !== 'AbortError: The user aborted a request.'
            ) {
              const { alert } = this.props;
              alert.show(
                `Could Not Retrieve Activities. Try again or report this network failure to team keep: ${error}`,
              );
            }
          });
      });
  }

  componentWillUnmount() {
    if (this.controllerRef.current) {
      this.controllerRef.current.abort();
    }
  }

  loadProfilePhoto = (): void => {
    const { username } = this.props;
    const signal = this.controllerRef.current?.signal;

    fetch(`${getServerURL()}/load-pfp`, {
      signal,
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        username,
      }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const { size } = blob;
        if (size > 72) {
          const url = (URL || window.webkitURL).createObjectURL(blob);
          if (url) {
            this.setState({
              photoAvailable: true,
              photo: url,
            });
          }
        }
      })
      .catch((error) => {
        if (error.toString() !== 'AbortError: The user aborted a request.') {
          const { alert } = this.props;
          alert.show(
            `Could Not Retrieve Activities. Try again or report this network failure to team keep: ${error}`,
          );
        }
      });
  };

  fileSelectedHandler = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<any> => {
    try {
      if (event.target.files != null) {
        const file = event.target.files[0];
        const imageDataUrl = await this.readFile(file);
        this.setState({
          fileName: file.name,
          fileSelected: imageDataUrl,
          showCropper: true,
        });
      }
    } catch (e) {
      const { alert } = this.props;
      alert.show(
        `Trouble Selecting File. Try Again or Report This Error To Keep.id: ${e}`,
      );
    }
  };

  readFile = (file: File) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });

  onZoomChange = (zoom: number): void => {
    this.setState({ zoom });
  };

  zoomIn = () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ zoom: Math.min(maxZoom, this.state.zoom + zoomIncrement) });
  };

  zoomOut = () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ zoom: Math.max(minZoom, this.state.zoom - zoomIncrement) });
  };

  onCropChange = (crop: any): void => {
    this.setState({ crop });
  };

  onCropComplete = (croppedArea: any, croppedAreaPixels: any): void => {
    this.setState({
      croppedAreaPixels,
    });
  };

  cropAndSave = async (): Promise<any> => {
    try {
      const { fileSelected, croppedAreaPixels } = this.state;
      const croppedImage = await this.getCroppedImg(
        fileSelected,
        croppedAreaPixels,
      );
      this.setState(
        {
          file: croppedImage,
        },
        () => {
          this.photoUploadHandler();
        },
      );
    } catch (e) {
      const { alert } = this.props;
      alert.show(`Could Not Crop Photo. Report This Error To Keep.id: ${e}`);
    }
  };

  getCroppedImg = (imageSrc: any, pixelCrop: any): Blob => {
    const image = new (window as any).Image();
    image.src = imageSrc;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.id = 'croppedPhoto';
    canvas.width = safeArea;
    canvas.height = safeArea;

    if (ctx) {
      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5,
      );

      const data = ctx.getImageData(0, 0, safeArea, safeArea);
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
      );
    }

    const dataURL = canvas.toDataURL('image/jpg');
    const file = this.dataURItoBlob(dataURL);
    return file;
  };

  dataURItoBlob = (dataURI: any): Blob => {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
    else byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  };

  photoUploadHandler = (): void => {
    const { file, fileName } = this.state;
    const { username } = this.props;
    const formData = new FormData();
    const signal = this.controllerRef.current?.signal;

    if (file !== undefined) {
      formData.append('file', file);
      formData.append('username', username);
      formData.append('fileName', fileName);
    }

    // to see contents use ....
    // console.info(formData.getAll("file"));

    fetch(`${getServerURL()}/upload-pfp`, {
      signal,
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        if (status.toString() === 'SUCCESS') {
          this.loadProfilePhoto();
        }
        this.setState({ loading: false });
      })
      .catch((error) => {
        const { alert } = this.props;
        alert.show(
          `Could Not Upload Photo. Report This Error To Keep.id: ${error}`,
        );
      });
  };

  renderActivitiesCard = (activities) => {
    if (activities.length > 0) {
      // eslint-disable-next-line no-underscore-dangle
      return activities
        .slice(0, 5) // only get the first number of elements
        .map((activity) => (
          <ActivityCard key={activity._id} activity={activity} />
        ));
    }
    return <div>No activities found</div>;
  };

  // renderActivities = (
  //   activitiesArr: Array<any>
  // ): JSX.Element[] | JSX.Element => {
  //   if (activitiesArr.length === 0) {
  //     return <div className="row w-125 p-2 text-dark">No activities</div>;
  //   }
  //   const row = activitiesArr.map((activity, i) => {
  //     console.
  //     const name = `${activity.firstName} ${activity.lastName}`;
  //     const unparsedTime = info.occuredAt.$date;
  //     const date = new Date(unparsedTime);
  //     const months = [
  //       'Jan',
  //       'Feb',
  //       'Mar',
  //       'Apr',
  //       'May',
  //       'Jun',
  //       'Jul',
  //       'Aug',
  //       'Sep',
  //       'Oct',
  //       'Nov',
  //       'Dec',
  //     ];
  //     const year = date.getFullYear();
  //     const month = months[date.getMonth()];
  //     const day = date.getDate();
  //     const hour = date.getHours();
  //     const min = date.getMinutes();
  //     const time = `${day} ${month} ${year} ${hour}:${min}`;
  //     if (i === activitiesArr.length - 1) {
  //       return (
  //         <div className="row w-125 p-2 text-dark" key={activity.toString()}>
  //           <div className="row">
  //             <div className="col text-left ml-3 font-weight-bold">
  //               {activity.type}
  //             </div>
  //             <div className="col text-right mr-3">{name}</div>
  //           </div>
  //           <div className="row">
  //             <div className="col text-left ml-3">{time}</div>
  //             <div className="col text-right mr-3" />
  //           </div>
  //         </div>
  //       );
  //     }

  //     return (
  //       <div
  //         className="row w-125 p-2 text-dark"
  //         key={Math.random()}
  //         style={{
  //           borderColor: '#7B81FF',
  //           borderWidth: 1,
  //           borderStyle: 'solid',
  //           borderTop: 0,
  //           borderRight: 0,
  //           borderLeft: 0,
  //         }}
  //       >
  //         <div className="row">
  //           <div className="col text-left ml-3 font-weight-bold">
  //             {activity.type}
  //           </div>
  //           <div className="col text-right mr-3">{name}</div>
  //         </div>
  //         <div className="row">
  //           <div className="col text-left ml-3">{time}</div>
  //           <div className="col text-right mr-3" />
  //         </div>
  //       </div>
  //     );
  //   });
  //   return row;
  // };

  render() {
    const {
      firstName,
      lastName,
      birthDate,
      address,
      city,
      state,
      zipcode,
      email,
      organization,
      phone,
      activitiesArr,
      photoAvailable,
      photo,
      showCropper,
      fileSelected,
      inputKey,
      loading,
      crop,
      zoom,
      aspect,
      backgroundColor,
      color,
    } = this.state;
    const { username } = this.props;

    return (
      <div className="container">
        <div
          className="modal fade"
          id="exampleModal"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <h3
                className="modal-title text-center mt-3 mb-2"
                id="ChangeProfilePhoto"
              >
                Change Profile Photo
              </h3>
              <button
                type="button"
                className="btn mb-3 mx-4 font-weight-bold btn-primary"
                data-testid="select-photo"
                onClick={() => this.hiddenFileInput.current!.click()}
              >
                Select Photo
              </button>
              <input
                style={{ display: 'none' }}
                type="file"
                key={inputKey}
                ref={this.hiddenFileInput}
                data-testid="photo-input"
                onChange={(e) => this.fileSelectedHandler(e)}
                accept=".jpg,.jpeg,.png"
              />

              {showCropper && (
                <div>
                  <div className="position-relative py-5 mx-4">
                    <div className="crop-container py-5">
                      <Cropper
                        image={fileSelected}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={this.onCropChange}
                        onCropComplete={this.onCropComplete}
                        onZoomChange={this.onZoomChange}
                        cropShape="round"
                        showGrid={false}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-center mx-4">
                      <div className="btn-group mt-2">
                        <button
                          className="btn w-25 btn-outline-primary"
                          type="button"
                          onClick={this.zoomOut}
                          disabled={this.state.zoom <= 1}
                        >
                          -
                        </button>
                        <button
                          className="btn w-25 btn-outline-primary"
                          type="button"
                          onClick={this.zoomIn}
                          disabled={this.state.zoom >= 2}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="btn mt-3 mb-3 font-weight-bold ld-ext-right w-100 btn-primary"
                        type="submit"
                        data-testid="set-profile-photo"
                        onClick={() => {
                          this.setState({ loading: true }, () => {
                            this.cropAndSave();
                          });
                        }}
                      >
                        Set Profile Photo
                        {loading && (
                          <div>
                            <div className="ld ld-ring ld-spin" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <h1 className="m-3 font-weight-bold">
          {firstName} {lastName}
          &apos;s Profile
        </h1>
        <div className="row">
          <div className="col-md-6 col-12 h-75 text-dark">
            <div
              className="rounded px-5"
              style={{
                borderColor: '#7B81FF',
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            >
              <div className="container pt-4">
                {photoAvailable === false ? (
                  <Image
                    src={GenericProfilePicture}
                    className="w-50 mx-auto d-flex"
                    alt="profile photo"
                    roundedCircle
                  />
                ) : (
                  <div id="profilePhoto">
                    <Image
                      src={photo}
                      className="w-50 mx-auto d-flex"
                      alt="profile photo"
                      roundedCircle
                    />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-weight-bold mt-3 text-center">
                  {firstName} {lastName}
                </h3>
                <div className="row pb-2">
                  <div className="col font-weight-bold">Username</div>
                  <div className="col text-right">{username}</div>
                </div>
                <div className="row pb-2">
                  <div className="col font-weight-bold">Birthdate</div>
                  <div className="col text-right">{birthDate}</div>
                </div>
                <div className="row pb-2">
                  <div className="col font-weight-bold">Phone No.</div>
                  <div className="col text-right">{phone}</div>
                </div>
                <div className="row pb-2">
                  <div className="col font-weight-bold">Email</div>
                  <div className="col text-right">{email}</div>
                </div>
                <div className="row pb-2">
                  <div className="col font-weight-bold">Address</div>
                  <div className="col text-right">
                    {address}
                    {city},{state}
                    {zipcode}
                  </div>
                </div>
                <div className="row">
                  <div className="col font-weight-bold">Organization</div>
                  <div className="col text-right">{organization}</div>
                </div>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  className="btn m-5 font-weight-bold"
                  style={{
                    backgroundColor,
                    color,
                    borderColor: '#7B81FF',
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                  onMouseOver={() =>
                    this.setState({
                      backgroundColor: '#FFFFFF',
                      color: '#7B81FF',
                    })
                  }
                  onFocus={() => undefined}
                  onMouseOut={() =>
                    this.setState({
                      backgroundColor: '#7B81FF',
                      color: '#FFFFFF',
                    })
                  }
                  onBlur={() => undefined}
                  data-toggle="modal"
                  data-target="#exampleModal"
                  data-testid="edit-info"
                  onClick={() =>
                    this.setState({ showCropper: false, inputKey: Date.now() })
                  }
                >
                  Update Profile Picture
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-12 h-75 mt-2 mt-md-0">
            <div
              className="rounded-top"
              style={{
                borderColor: '#7B81FF',
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            >
              <h3 className="font-weight-bold mt-3 text-center text-dark">
                Recent Activity
              </h3>
            </div>
            <div
              className="rounded-bottom border-top-0 text-center container"
              style={{
                borderColor: '#7B81FF',
                borderWidth: 1,
                borderStyle: 'solid',
                borderTop: 0,
                maxHeight: '33rem',
                overflow: 'scroll',
              }}
            >
              {activitiesArr === null ? (
                <div className="row w-125 p-2 text-dark"> Loading ... </div>
              ) : (
                this.renderActivitiesCard(activitiesArr)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(ClientProfilePage);
