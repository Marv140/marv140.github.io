import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Download } from 'lucide-react';

const ImageConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [showDownload, setShowDownload] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setShowDownload(false);
    setStatus('');
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowDownload(false);
    setStatus('');

    if (!selectedFile) {
      alert('Please select an image.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          alert('Error creating canvas context.');
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Error converting the image.');
            return;
          }

          const url = URL.createObjectURL(blob);
          const newFileName = selectedFile.name.replace(/\.[^.]+$/, '') + '.webp';

          setDownloadUrl(url);
          setFileName(newFileName);
          setShowDownload(true);
          setStatus('Conversion successful!');
        }, 'image/webp');
      };

      img.onerror = () => {
        alert('Unable to load the image.');
      };

      img.src = reader.result as string;
    };

    reader.onerror = () => {
      alert('Error reading the file.');
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mb-8 flex items-center gap-4"
        >
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0 flex items-center mt-1"
            title="Back to main page"
          >
            <ArrowLeft className="w-8 h-8" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold whitespace-nowrap leading-none">
            Convert Image to WEBP
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-6 rounded-lg shadow-lg w-full max-w-md"
        >
          <form onSubmit={handleSubmit}>
            <label htmlFor="imageInput" className="block font-semibold mb-2">
              Choose an image (JPG or PNG):
            </label>
            <input
              type="file"
              id="imageInput"
              ref={fileInputRef}
              accept="image/png, image/jpeg"
              required
              onChange={handleFileChange}
              className="block w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded transition flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Convert to WEBP
            </motion.button>
          </form>

          {showDownload && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mt-6"
            >
              <motion.a
                href={downloadUrl}
                download={fileName}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded transition"
              >
                <Download className="w-5 h-5" />
                Download Image
              </motion.a>
            </motion.div>
          )}

          {status && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-center text-green-600 dark:text-green-400 font-semibold"
            >
              {status}
            </motion.p>
          )}
        </motion.div>
      </div>

      <footer className="text-center py-6 text-gray-500">
        &copy; 2025 Marv140. All rights reserved.
      </footer>
    </div>
  );
};

export default ImageConverter;
