import React, { Component, useEffect, useRef, useState } from 'react';
import { withAlert } from 'react-alert';
import Image from 'react-bootstrap/Image';
import Cropper from 'react-easy-crop';

import getServerURL from '../../serverOverride';
import DefaultProfilePhoto from '../../static/images/Solid_grey.svg';

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

const ClientProfilePage = (props: Props) => {
  const [firstName, setFirstName] = useState<State['firstName']>('');
  const [lastName, setLastName] = useState<State['lastName']>('');
  const [birthDate, setBirthDate] = useState<State['birthDate']>('');
  const [address, setAddress] = useState<State['address']>('');
  const [city, setCity] = useState<State['city']>('');
  const [state, setState] = useState<State['state']>('');
  const [email, setEmail] = useState<State['email']>('');
  const [organization, setOrganization] = useState<State['organization']>('');
  const [phone, setPhone] = useState<State['phone']>('');
  const [zipcode, setZipCode] = useState<State['zipcode']>('');
  const [activitiesArr, setActivitiesArr] =
    useState<State['activitiesArr']>(null);
  const [file, setFile] = useState<State['file']>(undefined);
  const [photoAvailable, setPhotoAvailable] =
    useState<State['photoAvailable']>(false);
  const [photo, setPhoto] = useState<State['photo']>(null);
  const [crop, setCrop] = useState<State['crop']>({
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState<State['zoom']>(1);
  const [aspect, setAspect] = useState<State['aspect']>(1 / 1);
  const [showCropper, setShowCropper] = useState<State['showCropper']>(false);
  const [fileSelected, setFileSelected] = useState<State['fileSelected']>(null);
  const [inputKey, setInputKey] = useState<State['inputKey']>(0);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<State['croppedAreaPixels']>(0);
  const [loading, setLoading] = useState<State['loading']>(false);
  const [fileName, setFileName] = useState<State['fileName']>('');
  const [backgroundColor, setBackgroundColor] =
    useState<State['backgroundColor']>('#7B81FF');
  const [color, setColor] = useState<State['color']>('#FFFFFF');

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const loadProfilePhoto = (): void => {
    const { username } = props;
    const signal = controllerRef.current?.signal;

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
            setPhotoAvailable(true);
            setPhoto(url);
          }
        }
      })
      .catch((error) => {
        if (error.toString() !== 'AbortError: The user aborted a request.') {
          const { alert } = props;
          alert.show(
            `Could Not Retrieve Activities. Try again or report this network failure to team keep: ${error}`,
          );
        }
      });
  };

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const { username } = props;
    const abortController = new AbortController();
    controllerRef.current = abortController;
    const signal = controllerRef.current?.signal;

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
        setFirstName(firstName);
        setLastName(lastName);
        setBirthDate(birthDate);
        setAddress(address);
        setCity(city);
        setState(state);
        setZipCode(zipcode);
        setEmail(email);
        setOrganization(organization);
        setPhone(phone);
      })
      .then(() => loadProfilePhoto())
      .then(() => {
        fetch(`${getServerURL()}/get-all-activities`, {
          signal,
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ username }),
        })
          .then((response) => response.json())
          .then((responseJSON) => {
            const responseObject = responseJSON;
            const activitiesArr = responseObject.activities.allActivities;
            setActivitiesArr(activitiesArr);
          })
          .catch((error) => {
            if (
              error.toString() !== 'AbortError: The user aborted a request.'
            ) {
              const { alert } = props;
              alert.show(
                `Could Not Retrieve Activities. Try again or report this network failure to team keep: ${error}`,
              );
            }
          });
      });
  }, []);

  const readFile = (file: File) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });

  const fileSelectedHandler = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<any> => {
    try {
      if (event.target.files != null) {
        const file = event.target.files[0];
        const imageDataUrl = await readFile(file);
        setFileName(file.name);
        setFileSelected(imageDataUrl);
        setShowCropper(true);
      }
    } catch (e) {
      const { alert } = props;
      alert.show(
        `Trouble Selecting File. Try Again or Report This Error To Keep.id: ${e}`,
      );
    }
  };

  const onZoomChange = (zoom: number): void => {
    setZoom(zoom);
  };

  const onCropChange = (crop: any): void => {
    setCrop(crop);
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any): void => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const dataURItoBlob = (dataURI: any): Blob => {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  };

  const getCroppedImg = (imageSrc: any, pixelCrop: any): Blob => {
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
    const file = dataURItoBlob(dataURL);
    return file;
  };

  const cropAndSave = async (): Promise<any> => {
    try {
      const croppedImage = await getCroppedImg(fileSelected, croppedAreaPixels);
      setFile(croppedImage);
      // this.setState(
      //   {
      //     file: croppedImage,
      //   },
      //   () => {
      //     this.photoUploadHandler();
      //   },
      // );
    } catch (e) {
      const { alert } = props;
      alert.show(`Could Not Crop Photo. Report This Error To Keep.id: ${e}`);
    }
  };

  const photoUploadHandler = (): void => {
    const { username } = props;
    const formData = new FormData();
    const signal = controllerRef.current?.signal;

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
          loadProfilePhoto();
        }
        setLoading(false);
      })
      .catch((error) => {
        const { alert } = props;
        alert.show(
          `Could Not Upload Photo. Report This Error To Keep.id: ${error}`,
        );
      });
  };

  useEffect(() => {
    if (file) {
      photoUploadHandler();
    }
  }, [file]);

  const renderActivities = (
    activitiesArr: Array<any>,
  ): JSX.Element[] | JSX.Element => {
    if (activitiesArr.length === 0) {
      return <div className="row w-125 p-2 text-dark">No activities</div>;
    }
    const row = activitiesArr.map((activity, i) => {
      const info = JSON.parse(activity.info);
      const name = `${info.owner.firstName} ${info.owner.lastName}`;
      const unparsedTime = info.occuredAt.$date;
      const date = new Date(unparsedTime);
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const year = date.getFullYear();
      const month = months[date.getMonth()];
      const day = date.getDate();
      const hour = date.getHours();
      const min = date.getMinutes();
      const time = `${day} ${month} ${year} ${hour}:${min}`;
      if (i === activitiesArr.length - 1) {
        return (
          <div className="row w-125 p-2 text-dark" key={activity.toString()}>
            <div className="row">
              <div className="col text-left ml-3 font-weight-bold">
                {activity.type}
              </div>
              <div className="col text-right mr-3">{name}</div>
            </div>
            <div className="row">
              <div className="col text-left ml-3">{time}</div>
              <div className="col text-right mr-3" />
            </div>
          </div>
        );
      }

      return (
        <div
          className="row w-125 p-2 text-dark"
          key={Math.random()}
          style={{
            borderColor: '#7B81FF',
            borderWidth: 1,
            borderStyle: 'solid',
            borderTop: 0,
            borderRight: 0,
            borderLeft: 0,
          }}
        >
          <div className="row">
            <div className="col text-left ml-3 font-weight-bold">
              {activity.type}
            </div>
            <div className="col text-right mr-3">{name}</div>
          </div>
          <div className="row">
            <div className="col text-left ml-3">{time}</div>
            <div className="col text-right mr-3" />
          </div>
        </div>
      );
    });
    return row;
  };

  const { username } = props;

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
              onClick={() => hiddenFileInput.current!.click()}
            >
              Select Photo
            </button>
            <input
              style={{ display: 'none' }}
              type="file"
              key={inputKey}
              ref={hiddenFileInput}
              onChange={(e) => fileSelectedHandler(e)}
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
                      onCropChange={onCropChange}
                      onCropComplete={onCropComplete}
                      onZoomChange={onZoomChange}
                      cropShape="round"
                      showGrid={false}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-center mx-4">
                    <button
                      className="btn mt-3 mb-3 font-weight-bold ld-ext-right w-100 btn-primary"
                      type="submit"
                      onClick={() => {
                        setLoading(true);
                        cropAndSave();
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
        {username}
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
                  src={DefaultProfilePhoto}
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
                {firstName}

                {lastName}
              </h3>
              <div className="row pb-2">
                <div className="col font-weight-bold">Username</div>
                <div className="col text-right">{username}</div>
              </div>
              <div className="row pb-2">
                <div className="col font-weight-bold">Password</div>
                <div className="col text-right">******</div>
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
                onMouseOver={() => {
                  setBackgroundColor('#FFFFFF');
                  setColor('#7B81FF');
                }}
                onFocus={() => undefined}
                onMouseOut={() => {
                  setBackgroundColor('#7B81FF');
                  setColor('#FFFFFF');
                }}
                onBlur={() => undefined}
                data-toggle="modal"
                data-target="#exampleModal"
                onClick={() => {
                  setShowCropper(false);
                  setInputKey(Date.now());
                }}
              >
                Edit Your Information
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
              renderActivities(activitiesArr)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default withAlert()(ClientProfilePage);
