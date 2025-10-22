'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import UploadFile from './components/UploadFile';
import RemoveFile from './components/RemoveFile';
import ModalCompareResults from './components/ModalCompareResults';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import ModalSelectFederalCode from './components/ModalSelectFederalCode';
import { CodeProvider, useCodeContext } from './contexts/SelectFederalCode';
import { CompanyFileProvider, useCompanyFileContext } from './contexts/CompanyFileContext';
import { CompareResultsProvider, useCompareResultsContext } from './contexts/CompareResultsContext';

interface loadingProps {
  download?: boolean
  compare?: boolean
}

const Main = () => {
  const { results, setResults } = useCompareResultsContext();
  const { companyFile } = useCompanyFileContext();
  const { code, setCode } = useCodeContext();
  const [tempResult, setTempResult] = useState<any>([]);
  const [showExpand, setShowExpand] = useState(false);
  const [loading, setLoading] = useState<loadingProps>({
    download: false,
    compare: false
  });

  const compare = async () => {
    try {
      setLoading({ ...loading, compare: true });
      const formData = new FormData();
      formData.append('agent', 'compare_documents');
      formData.append('suffix', 'docx');
      formData.append('code', JSON.stringify(code));
      formData.append('theFile', companyFile);

      const response = await fetch('/api', {
        method: 'POST',
        body: formData
      })

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        try {
          setTempResult(JSON.parse(chunk));
        } catch (err) { }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading({ ...loading, compare: false });
    }
  }

  const downloadWithCode = async () => {
    try {
      setLoading({ ...loading, download: true });
      const response = await axios.get('/api/scraper', {
        responseType: 'blob',
        params: code
      });

      if (!response) {
        throw new Error('Error en la respuesta del servidor');
      }

      const filename = `CFR_VERSION_${code.version}_TITLE_${code.title}_PART_${code.part}.xlsx`;
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading({ ...loading, download: false });
    }
  }

  useEffect(() => {
    setResults({ ...results, results: [...results.results, tempResult] });
  }, [tempResult]);

  return (
    <section className="relative flex flex-col h-[100vh] w-full bg-neutral-50">
      <div className="flex flex-row gap-4 items-center justify-center my-6 px-6">
        <div className="min-h-[250px] w-full bg-white rounded-lg shadow-lg p-4">
          <p className="text-lg text-[rgb(50,60,80)] font-bold">Company Docs</p>
          {!companyFile ? <UploadFile /> : <RemoveFile />}
        </div>

        <div className="min-h-[250px] flex flex-col w-full bg-white rounded-lg shadow-lg p-4">
          <p className="text-lg text-[rgb(50,60,80)] font-bold">Federal Code</p>

          <div
            className={`h-full relative my-2 py-4 border border-dashed border-gray-200 rounded-md flex flex-col grow gap-2 items-center justify-center cursor-pointer`}
            onClick={() => setCode({ ...code, show: true })}
          >
            <p className="text-[rgb(50,60,80)] p-2 text-center">
              {code.part && `https://www.ecfr.gov/api/versioner/v1/full/${code.version}/title-${code.title}?part=${code.part}`}
              {!code.part && 'Select the federal code'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4 items-center justify-center">
        {/* Compare Button */}
        <button
          onClick={() => { setResults({ ...results, results: [] }); compare() }}
          className={`
              rounded-md bg-neutral-100 p-2 shadow-lg hover:bg-neutral-200 transition-colors
              ${(companyFile && code.part && !loading.compare) ? 'bg-neutral-100 hover:bg-neutral-200 cursor-pointer' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}
            `}
          disabled={!companyFile || !code.part || loading.compare}
        >
          {loading.compare &&
            <div className={`size-[15px] animate-spin rounded-full border-2 border-neutral-800/30 border-s-blue-800 border-t-blue-800`}></div>}
          {!loading.compare && 'Compare'}
        </button>

        {/* Stop Button */}
        {
          // loading.compare &&
          // <button
          //   onClick={() => setStopLoading(true)}
          //   className={`
          //     rounded-md bg-neutral-100 p-2 shadow-lg hover:bg-neutral-200 transition-colors bg-neutral-100 hover:bg-neutral-200
          //   `}
          // >
          //   Stop
          // </button>
        }

        {/* Download Button */}
        <button
          onClick={downloadWithCode}
          className={`
              rounded-md p-2 shadow-lg transition-colors
              ${(code.part && !loading.download) ? 'bg-neutral-100 hover:bg-neutral-200 cursor-pointer' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}
            `}
          disabled={!code.part || loading.download}
        >
          {loading.download &&
            <div className={`size-[15px] animate-spin rounded-full border-2 border-neutral-800/30 border-s-blue-800 border-t-blue-800`}></div>}
          {!loading.download && 'Download Federal CSV Summary'}
        </button>
      </div>

      <div className="relative grow-[1] flex flex-col gap-2 my-6 px-6 bg-white rounded-lg shadow-lg p-4 mx-6 min-h-[0]">
        <div className="flex flex-row justify-between items-center">
          <p className="text-lg text-[rgb(50,60,80)] font-bold">Compare results</p>
          <button
            className="bg-neutral-100/50 p-2 rounded-md transition-opacity cursor-pointer"
            style={{ opacity: showExpand ? '1' : '0.2' }}
            onMouseEnter={() => setShowExpand(true)}
            onMouseLeave={() => setShowExpand(false)}
            onClick={() => setResults({ ...results, show: true })}
          >
            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {
            results.results.map((result: any, index: any) => (
              result.lineItem &&
              <div key={`result${index}`} className="flex flex-col gap-1">
                <p className="text-sm font-bold">{result.lineItemString}</p>
                <p className="text-sm">{result.description}</p>
              </div>
            ))
          }
        </div>
      </div>

      <ModalSelectFederalCode />
      <ModalCompareResults />
    </section>
  );
};

export default function MainPage() {
  return (
    <CompareResultsProvider>
      <CodeProvider>
        <CompanyFileProvider>
          <Main />
        </CompanyFileProvider>
      </CodeProvider>
    </CompareResultsProvider>
  )
};
