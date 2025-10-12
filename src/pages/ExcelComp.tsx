import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ComparisonResults {
  commonUrl: string;
  only1Url: string;
  only2Url: string;
}

export default function ExcelComp() {
  const [results, setResults] = useState<ComparisonResults | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file1 = formData.get('file1') as File | null;
    const file2 = formData.get('file2') as File | null;

    if (!file1 || !file2) {
      alert('Both files need to be selected.');
      return;
    }

    const [b1, b2] = await Promise.all([
      file1.arrayBuffer(),
      file2.arrayBuffer(),
    ]);

    const wb1 = XLSX.read(b1, { type: 'array' });
    const wb2 = XLSX.read(b2, { type: 'array' });

    const s1 = XLSX.utils.sheet_to_json<any[]>(wb1.Sheets[wb1.SheetNames[0]], {
      header: 1,
    });
    const s2 = XLSX.utils.sheet_to_json<any[]>(wb2.Sheets[wb2.SheetNames[0]], {
      header: 1,
    });

    const [head] = s1;
    const rows1 = s1.slice(1).map((r) => JSON.stringify(r));
    const rows2 = s2.slice(1).map((r) => JSON.stringify(r));

    const common: any[] = [];
    const only1: any[] = [];
    const only2: any[] = [];

    rows1.forEach((r) =>
      rows2.includes(r) ? common.push(JSON.parse(r)) : only1.push(JSON.parse(r))
    );
    rows2.forEach((r) => !rows1.includes(r) && only2.push(JSON.parse(r)));

    const makeBlob = (data: any[]) => {
      const ws = XLSX.utils.aoa_to_sheet([head, ...data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const arr = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new Blob([arr], { type: 'application/octet-stream' });
    };

    const commonUrl = URL.createObjectURL(makeBlob(common));
    const only1Url = URL.createObjectURL(makeBlob(only1));
    const only2Url = URL.createObjectURL(makeBlob(only2));

    setResults({ commonUrl, only1Url, only2Url });
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
            Compare Two Excel Files
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-6 rounded-lg shadow-lg w-full max-w-md"
        >
          <form onSubmit={handleSubmit}>
            <label htmlFor="file1" className="block font-semibold mb-2">
              Upload File 1:
            </label>
            <input
              type="file"
              id="file1"
              name="file1"
              accept=".xlsx"
              required
              className="block w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700"
            />
            <label htmlFor="file2" className="block font-semibold mb-2">
              Upload File 2:
            </label>
            <input
              type="file"
              id="file2"
              name="file2"
              accept=".xlsx"
              required
              className="block w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded transition"
            >
              Compare Files
            </button>
          </form>

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-center space-y-4"
            >
              <a
                href={results.commonUrl}
                download="common.xlsx"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white py-2 px-4 rounded transition"
              >
                <Download className="w-5 h-5" />
                Common Rows
              </a>
              <a
                href={results.only1Url}
                download="only_in_file1.xlsx"
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded transition"
              >
                <Download className="w-5 h-5" />
                Only in File 1
              </a>
              <a
                href={results.only2Url}
                download="only_in_file2.xlsx"
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded transition"
              >
                <Download className="w-5 h-5" />
                Only in File 2
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>

      <footer className="text-center py-6 text-gray-500">
        &copy; 2025 Marv140. All rights reserved.
      </footer>
    </div>
  );
}
