import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import getServerURL from '../../serverOverride';
import FileType from '../../static/FileType';
import { IdCategories } from './IdCategories';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/gif,image/webp';

export interface DocumentsInlineUploadProps {
  targetUser: string;
  alert: { show: (msg: string, opts?: { type?: string }) => void };
  onUploadComplete: () => void;
}

export default function DocumentsInlineUpload({
  targetUser,
  alert,
  onUploadComplete,
}: DocumentsInlineUploadProps) {
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setFile(acceptedFiles[0]);
    setCategory('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    maxFiles: 1,
    disabled: uploading,
  });

  const close = () => {
    setExpanded(false);
    setFile(null);
    setCategory('');
  };

  const handleUpload = async () => {
    if (!file) {
      alert.show('Choose a file to upload.');
      return;
    }
    if (!category) {
      alert.show('Please choose a category.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('idCategory', category);
      formData.append('fileType', FileType.IDENTIFICATION_PDF);
      formData.append('targetUser', targetUser);

      const response = await fetch(`${getServerURL()}/upload-file`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const responseJSON = await response.json();
      if (responseJSON?.status === 'SUCCESS') {
        alert.show('Document uploaded successfully.');
        setExpanded(false);
        setFile(null);
        setCategory('');
        queueMicrotask(() => {
          onUploadComplete();
        });
      } else {
        alert.show(`Failed to upload ${file.name}`, { type: 'error' });
      }
    } catch (e) {
      alert.show(`Upload failed: ${e instanceof Error ? e.message : String(e)}`, { type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const categoryOptions = Object.values(IdCategories);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary fs-5 px-3 py-2"
        onClick={() => setExpanded((v) => !v)}
        disabled={uploading}
      >
        {expanded ? 'Close' : 'Upload documents'}
      </button>

      {expanded && (
        <div
          className="w-100 mt-3 border rounded p-4 bg-light"
          style={{ flex: '1 0 100%' }}
        >
          {!file && (
            <div
              {...getRootProps()}
              className={`d-flex flex-column align-items-center justify-content-center border border-2 rounded p-4 mb-3 bg-white ${
                isDragActive ? 'border-primary' : 'border-secondary'
              }`}
              style={{ minHeight: 140, cursor: uploading ? 'not-allowed' : 'pointer' }}
            >
              <input {...getInputProps()} />
              <p className="mb-2 text-center fs-5 fw-medium">
                {isDragActive ? 'Drop file here' : 'Drag a file here, or click to browse'}
              </p>
              <p className="mb-0 text-muted fs-6 text-center">PDF or image · one file</p>
            </div>
          )}

          {file && (
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <span
                className="fs-5 fw-medium text-break flex-grow-1"
                style={{ minWidth: '8rem' }}
                title={file.name}
              >
                {file.name}
              </span>
              <select
                id="inline-upload-category"
                className="form-select fs-5"
                style={{ width: 'auto', minWidth: '16rem', maxWidth: '24rem' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading}
                aria-label="Document category"
              >
                <option value="">Select category…</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-link fs-5 text-decoration-none p-0 align-self-center"
                onClick={() => {
                  setFile(null);
                  setCategory('');
                }}
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-secondary btn-lg fs-5" onClick={close} disabled={uploading}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg fs-5"
              onClick={handleUpload}
              disabled={uploading || !file || !category}
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
