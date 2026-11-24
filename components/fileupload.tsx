import React, { useRef } from 'react';
import { useInputContext } from '@/context/inputcontext';
import { ALLOWED_UPLOAD_MIME_TYPES } from '@/utils/constants';
import { countWords } from '@/utils/text';
import type { UploadResponse } from '@/utils/types';
import Button from './button';

interface FileUploadProps {
  handleSubmit: (wordCount: number) => void;
}

export default function FileUpload({ handleSubmit }: FileUploadProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    setAlertMessage,
    setWordCount,
    setInputStory,
    setIsSimpleLoading,
    setLoadingMessage,
    setFile,
  } = useInputContext();

  async function handleUpload(selectedFile: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsSimpleLoading(true);
    setLoadingMessage('Currently uploading your file.');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (!response.ok || typeof data.text !== 'string') {
        setAlertMessage(data.error ?? 'File upload failed.');
        return;
      }

      const extractedWordCount = countWords(data.text);
      setWordCount(extractedWordCount);
      setInputStory(data.text);
      handleSubmit(extractedWordCount);
    } catch (error) {
      console.error('File upload failed:', error);
      setAlertMessage('File upload failed.');
    } finally {
      setIsSimpleLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(selectedFile.type)) {
      setAlertMessage('Unsupported file type. Please select a PDF, DOCX, TXT, or EPUB file.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFile(selectedFile);
    try {
      await handleUpload(selectedFile);
    } finally {
      setFile(null);
    }
  }

  function handleClick(): void {
    fileInputRef.current?.click();
  }

  return (
    <>
      <Button text="Upload file" onClick={handleClick} type="hollow" />
      <form style={{ display: 'none' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt,.epub"
        />
      </form>
    </>
  );
}
