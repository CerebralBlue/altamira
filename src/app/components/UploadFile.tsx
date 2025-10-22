import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { DragEvent, useState } from "react";
import { useCompanyFileContext } from "../contexts/CompanyFileContext";

const UploadFile = () => {
  const { setCompanyFile } = useCompanyFileContext();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setCompanyFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (e: any) => setCompanyFile(e.target.files[0]);

  return (
    <>
      <label htmlFor='company_file_input' className={`relative my-2 py-4 border border-dashed border-gray-200 rounded-md flex flex-col gap-2 items-center justify-center ${isDragging && 'border-blue-300'}`}>
        <DocumentArrowUpIcon className={`w-10 h-10 ${isDragging ? 'text-blue-300' : 'text-neutral-300'}`} />
        <p className={`text-sm ${isDragging ? 'text-blue-300' : 'text-[rgb(50,60,80)]'}`}>Drag And Drop Files here</p>
        <p className={`text-xs ${isDragging ? 'text-blue-300' : 'text-gray-400'}`}>Files supported: PDF, DOC, DOCX</p>
        <button className={`p-2 flex items-center justify-center rounded-md text-sm ${isDragging ? 'bg-blue-300 text-white' : 'bg-neutral-200 text-gray-600'}`}>Choose File</button>
        <p className={`text-xs ${isDragging ? 'text-blue-300' : 'text-gray-400'}`}>Maximum size: 20MB</p>
        <div
          className="absolute w-full h-full bg-transparent cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
        </div>
      </label>
      <input className="hidden" id='company_file_input' type='file' accept='.pdf, .doc, .docx' onChange={handleFile} />
    </>
  )
}

export default UploadFile;