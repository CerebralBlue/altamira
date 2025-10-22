import { ArrowDownOnSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCompareResultsContext } from "../contexts/CompareResultsContext";
import { useState } from "react";
import axios from "axios";
import { useCodeContext } from "../contexts/SelectFederalCode";

const ModalCompareResults = () => {
  const { results, setResults } = useCompareResultsContext();
  const { code } = useCodeContext();
  const [showDownload, setShowDownload] = useState(false);

  const download = async () => {
    try {
      const response = await axios.post('http://localhost:3001/excel', { results: results.results }, {
        responseType: 'blob'
      });

      if (!response) {
        throw new Error('Error en la respuesta del servidor');
      }

      const filename = `RESULTS_CFR_VERSION_${code.version}_TITLE_${code.title}_PART_${code.part}.xlsx`;
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
      console.log('There was an error while trying to download the results');
      console.error(err);
    }
  }

  return (
    <div
      className={`
        absolute h-[100vh] w-[100%] bg-neutral-400/60 flex items-center justify-center z-[100] top-0
        ${results.show && 'opacity-100 visible transition-[opacity_0.5s_ease-in-out]'}
        ${!results.show && 'opacity-0 invisible transition-[opacity_0.5s_ease-in-out,visibility_0s_linear_0.5s]'}
      `}
    >
      {/* Card */}
      <div
        className={`w-[75%] h-[75%] bg-white rounded-md flex flex-col
          ${results.show && 'opacity-100 visible transition-[opacity_0.5s_ease-in-out]'}
          ${!results.show && 'opacity-0 invisible transition-[opacity_0.5s_ease-in-out,visibility_0s_linear_0.5s]'}
        `}
      >
        {/* Card Header */}
        <div className="px-4 h-[3rem] border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm text-[rgb(50,60,80)]">Compare Results</p>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-200/20 cursor-pointer"
            onClick={() => setResults({ ...results, show: false })}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="relative flex flex-col p-4 h-[calc(100%-3rem)]">
          {/* Results */}
          <div className="absolute top-0 left-0 w-full h-full rounded-md flex flex-col gap-4 p-4 overflow-y-auto">
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

          <button
            className="absolute bottom-[1rem] right-[1rem] bg-neutral-100/50 p-2 rounded-md transition-opacity cursor-pointer"
            style={{ opacity: showDownload ? '1' : '0.2' }}
            onMouseEnter={() => setShowDownload(true)}
            onMouseLeave={() => setShowDownload(false)}
            onClick={download}
          >
            <ArrowDownOnSquareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalCompareResults;
