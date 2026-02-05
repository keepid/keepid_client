import React, { useState } from 'react';
import { useAlert } from 'react-alert';
import Cropper from 'react-easy-crop';

import getServerURL from '../../serverOverride';

const allowedTypes = ['image/jpeg', 'image/png'];
const maxZoom = 2;
const zoomIncrement = 0.1;
const minZoom = 1;

function Modal({ setModalOpen, loadProfilePhoto, username }) {
  const [file, setFile] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSelected, setFileSelected] = useState('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(0);

  const alert = useAlert();

  const dataURItoBlob = (dataURI: any): Blob => {
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

  const getCroppedImg = (imageSrc: any, pixelCrop: any): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const image = new (window as any).Image();
      image.onload = () => {
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
        resolve(file);
      };
      image.onerror = (error) => {
        reject(error);
      };
      image.src = imageSrc;
    });

  const readFile = (file: File) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });

  const photoSaveHandler = async () => {
    try {
      const croppedImage = await getCroppedImg(fileSelected, croppedAreaPixels);
      setFile(croppedImage);
      setCropperOpen(false);
      setModalOpen(false);

      if (croppedImage != null) {
        const formData = new FormData();
        formData.append('file', croppedImage);
        formData.append('username', username.username);
        formData.append('fileName', fileName);

        fetch(`${getServerURL()}/upload-pfp`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
          .then((response) => response.json())
          .then((responseJSON) => {
            const { status } = responseJSON;
            if (status.toString() === 'SUCCESS') {
              loadProfilePhoto();
              alert.show('Successfully changed profile photo.');
            }
          })
          .catch((error) => {
            alert.show('Error uploading photo.');
          });
      } else {
        alert.show('Error loading photo.');
      }
    } catch (e) {
      alert.show('Error uploading photo.');
    }
  };

  const photoCancelHandler = () => {
    setFile(null);
    setFileName('');
    setModalOpen(false);
    setCropperOpen(false);
  };

  const photoUploadHandler = async (event) => {
    if (event.target.files != null && event.target.files.length > 0) {
      if (!allowedTypes.includes(event.target.files[0].type)) {
        alert.show('Invalid file type. Please upload a PNG or JPG file.');
      } else {
        // read file and save as URL
        const file = event.target.files[0];
        const imageDataUrl = await readFile(file);
        setFileName(event.target.files[0].name);
        setFileSelected(imageDataUrl as string);
        setCropperOpen(true);
      }
    } else {
      alert.show('No file selected.');
    }
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const zoomIn = () => {
    setZoom(Math.min(maxZoom, zoom + zoomIncrement));
  };

  const zoomOut = () => {
    setZoom(Math.max(minZoom, zoom - zoomIncrement));
  };

  const onCropChange = (crop: any): void => {
    setCrop(crop);
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any): void => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  return (
    <div>
      <div className="tw-fixed tw-inset-0 tw-bg-black tw-opacity-50" />
      <div
        id="crud-modal"
        aria-hidden="true"
        className="tw-fixed tw-z-50 tw-top-1/2 tw-left-1/2 tw-transform tw--translate-x-1/2 tw--translate-y-1/2"
      >
        <div className="tw-relative tw-p-4 tw-w-full tw-max-h-full">
          <div className="tw-relative tw-bg-white tw-rounded-lg tw-shadow tw-p-6">
            <p className="tw-font-semibold tw-text-base tw-mb-1">
              Edit Profile Picture
            </p>
            <p className="tw-text-gray-400 tw-text-base tw-mb-0">
              Make changes to your profile here. Click save when you are done.
            </p>
            {!cropperOpen && (
              <div className="tw-flex tw-flex-col tw-py-5 tw-items-center tw-justify-center">
                <div className="tw-flex tw-w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="tw-py-4 tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-30 tw-border-2 tw-border-gray-300 tw-border-dashed tw-rounded-lg tw-cursor-pointer tw-bg-gray-50"
                  >
                    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
                      <svg
                        className="tw-h-24 tw-w-24 tw-text-gray-300 "
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="tw-mb-2 tw-text-sm tw-text-gray-500">
                        <span className="tw-font-semibold">
                          Click to upload{' '}
                        </span>
                      </p>
                      <p className="tw-text-xs tw-text-gray-500 tw-mb-0">
                        PNG or JPG (up to 10MB)
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="tw-hidden"
                      accept="image/*"
                      onChange={photoUploadHandler}
                    />
                  </label>
                </div>
              </div>
            )}
            {cropperOpen && (
              <div className="tw-py-6">
                <div className="tw-relative mx-4">
                  <div className="tw-py-5">
                    <Cropper
                      image={fileSelected}
                      crop={crop}
                      zoom={zoom}
                      aspect={1 / 1}
                      onCropChange={onCropChange}
                      onCropComplete={onCropComplete}
                      onZoomChange={onZoomChange}
                      cropShape="round"
                      objectFit="contain"
                      showGrid={false}
                      style={{
                        containerStyle: {
                          height: '300px',
                          position: 'relative',
                        },
                        cropAreaStyle: { borderRadius: '50%' },
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="tw-flex tw-flex-row tw-justify-between">
              {cropperOpen && (
                <div>
                  <button
                    className="tw-btn tw-w-25 tw-btn-outline-primary"
                    type="button"
                    onClick={zoomOut}
                    disabled={zoom <= 1}
                  >
                    -
                  </button>
                  <button
                    className="tw-btn tw-w-25 tw-btn-outline-primary"
                    type="button"
                    onClick={zoomIn}
                    disabled={zoom >= 2}
                  >
                    +
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={photoSaveHandler}
                className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
              >
                Save Changes
              </button>
              <button
                type="submit"
                onClick={photoCancelHandler}
                className="tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
