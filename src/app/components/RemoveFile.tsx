import { DocumentIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useCompanyFileContext } from "../contexts/CompanyFileContext";

const RemoveFile = () => {
  const { companyFile, setCompanyFile } = useCompanyFileContext();
  const [hoverRemoveFile, setHoverRemoveFile] = useState(false);

  const formattedSize = () => {
    let size = companyFile.size;
    size = Math.floor(size / 1000);
    if (size >= 1000000) {
      return `${Math.floor(size / 1000000)} GB`;
    } else if (size >= 1000) {
      return `${Math.floor(size / 1000)} MB`;
    } else {
      return `${size} KB`;
    }
  }

  const handleRemove = (e: any) => setCompanyFile(undefined);

  return (
    <div
      className={`relative my-2 p-4 flex flex-col border border-gray-200 gap-2 items-center rounded-md`}
      onMouseEnter={() => setHoverRemoveFile(true)}
      onMouseLeave={() => setHoverRemoveFile(false)}
    >
      <DocumentIcon className="w-6" />
      <div className="flex flex-col justify-center">
        <p className="text-sm text-[rgb(50,60,80)] text-center">{ companyFile?.name }</p>
        <p className="text-xs text-gray-400 text-center">{ formattedSize() }</p>
      </div>
      <div
        className={`absolute top-0 w-full h-full flex flex-col items-center justify-center bg-red-400/60 cursor-pointer backdrop-blur-sm opacity-0 transition-opacity rounded-md`}
        style={{ opacity: hoverRemoveFile ? 1 : 0 }}
        onClick={handleRemove}
      >
        <TrashIcon className="w-8 text-white" />
        <p className="text-sm text-white text-center">Remove file</p>
      </div>
    </div>
  )
}

export default RemoveFile;