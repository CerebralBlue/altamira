import { XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useCodeContext } from "../contexts/SelectFederalCode";
import axios from "axios";


const ModalSelectFederalCode = () => {
  const { code, setCode } = useCodeContext();
  const [titles, setTitles] = useState([]);
  const [nonTitles, setNonTitles] = useState<any>([]);
  const [structure, setStructure] = useState<any>(null);
  const [selections, setSelections] = useState<any>([]);
  const [childrenIndex, setChildrenIndex] = useState<any>([]);

  const getTitles = async () => {
    try {
      const { titles } = (await axios.get('https://www.ecfr.gov/api/versioner/v1/titles.json')).data;
      setTitles(titles);
    } catch (err) {
      console.error({ err });
    }
  }

  const processChildrens = (childrens: any) => {
    const processedChildrens = [];
    for (const children of childrens) {
      delete children['children'];
      processedChildrens.push(children);
    }
    return processedChildrens;
  }

  const getNextStructure = async () => {
    try {
      if (structure) {
        let iterate = Number(selections.length - 1);
        let iterateInverse = 0;
        let parent = structure;
        while (iterate > 0) {
          parent = parent.children[childrenIndex[iterateInverse]];
          iterate--;
          iterateInverse++;
        }
        if (parent.children) setNonTitles(processChildrens(JSON.parse(JSON.stringify(parent.children))));
        else setNonTitles([]);
      } else {
        const response: any = await axios.get(`https://www.ecfr.gov/api/versioner/v1/structure/${code.version}/title-${code.title}.json`);
        setStructure(JSON.parse(JSON.stringify(response.data)));
        setNonTitles(processChildrens(JSON.parse(JSON.stringify(response.data.children))));
      }

    } catch (err) {
      console.error(err);
    }
  }

  const addSelection = (selection: any, type: string, childrenI: any = 0) => {
    selection['type'] = type;
    const newSelections = [...selections, selection];
    
    setCode((prevCode: any) => {
      const newCode = { ...prevCode };
      if (type === 'title') {
        newCode.title = selection.number;
        newCode.version = selection.up_to_date_as_of;
      }
      else {
        newCode.fullPath = newSelections.filter((e: any) => e.type !== 'title')
        .map((e: any) => `${e.type}=${e.identifier}`)
        .join('&');
        if (type === 'part') newCode.part = selection.identifier;
      }
      return newCode;
    });
    
    setSelections(newSelections);
    if (type !== 'title') setChildrenIndex([...childrenIndex, childrenI]);
  };

  const removeSelection = (index: number) => {
    const prevChildrens: any = [...childrenIndex];
    prevChildrens.splice(index - 1);

    const prevSelections: any = [...selections];
    prevSelections.splice(index);

    const haveTitle = prevSelections.find((e: any) => e.type === 'title');
    if (!haveTitle) {
      setCode({ show: true, version: code.version });
      setSelections([]);
      setStructure(null);
      return;
    };

    const havePart = prevSelections.find((e: any) => e.type === 'part');
    setCode((prevCode: any) => {
      const newCode = { ...prevCode };
      newCode.part = !havePart ? null : code.part;
      newCode.fullPath = prevSelections.filter((e: any) => e.type !== 'title')
        .map((e: any) => `${e.type}=${e.identifier}`)
        .join('&');
      return newCode;
    });

    setSelections([...prevSelections]);
    setChildrenIndex([...prevChildrens]);
  }

  useEffect(() => { getTitles() }, []);

  useEffect(() => {
    if (!code.title) return;
    getNextStructure();
  }, [selections]);

  return (
    <div
      className={`
        absolute top-0 h-[100vh] w-[100%] bg-neutral-400/60 flex items-center justify-center z-[100]
        ${code.show && 'opacity-100 visible transition-[opacity_0.5s_ease-in-out]'}
        ${!code.show && 'opacity-0 invisible transition-[opacity_0.5s_ease-in-out,visibility_0s_linear_0.5s]'}
      `}
    >
      {/* Card */}
      <div
        className={`bg-gray-200 w-[75%] h-[75%] bg-white rounded-md flex flex-col
          ${code.show && 'opacity-100 visible transition-[opacity_0.5s_ease-in-out]'}
          ${!code.show && 'opacity-0 invisible transition-[opacity_0.5s_ease-in-out,visibility_0s_linear_0.5s]'}
        `}
        style={{ opacity: code.show ? '1' : '0' }}
      >
        {/* Card Header */}
        <div className="px-4 h-[3rem] border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm text-[rgb(50,60,80)]">Select Federal Code</p>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-200/20 cursor-pointer"
            onClick={() => setCode({ ...code, show: false })}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="flex flex-col p-4 h-[calc(100%-3rem)]">
          {/* Selections */}
          {
            !!selections.length && (
              <div className="flex items-center gap-4 mb-2 h-[80px] overflow-x-auto">
                {
                  selections.map((selection: any, index: number) => (
                    selection.type === 'title' ?
                      <div
                        key={`selection_${index}`}
                        className="relative flex items-center text-xs bg-gray-600 text-white p-1 rounded-md max-w-[100px] h-[25px]"
                        title={`Title ${selection.number}: ${selection.name}`}
                      >
                        <p className="truncate">{`Title ${selection.number}: ${selection.name}`}</p>
                        <button
                          className={`absolute w-5 h-5 rounded-full right-[-0.625rem] top-[-0.625rem] bg-gray-600 flex items-center justify-center z-[900] cursor-pointer`}
                          onClick={() => removeSelection(index)}
                        >
                          <XMarkIcon className="text-white w-[0.8rem] h-[0.8rem]" />
                        </button>
                      </div>
                      :
                      <div
                        key={`selection_${index}`}
                        className="relative flex items-center text-xs bg-gray-600 text-white p-1 rounded-md max-w-[100px] h-[25px]"
                        title={selection.label}
                      >
                        <p className="truncate">{selection.label}</p>
                        <button
                          className={`absolute w-5 h-5 rounded-full right-[-0.625rem] top-[-0.625rem] bg-gray-600 flex items-center justify-center z-[900] cursor-pointer`}
                          onClick={() => removeSelection(index)}
                        >
                          <XMarkIcon className="text-white w-[0.8rem] h-[0.8rem]" />
                        </button>
                      </div>
                  ))
                }
              </div>
            )
          }

          {/* Results */}
          <div className="w-full h-full rounded-md border border-gray-200 flex flex-col p-4 overflow-y-auto">
            {/* Titles */}
            {
              code.title === undefined && titles.map((title: any, index) => (
                <div key={`${index}_title`} className="flex items-center justify-between border-b border-gray-200 mb-2">
                  <p
                    className="w-full p-2 pb-4 hover:text-blue-600 text-sm cursor-pointer"
                    onClick={() => addSelection(title, 'title')}
                  >
                    Title {title.number}: {title.name}
                  </p>
                  <a
                    className="h-full w-8 flex items-center justify-center"
                    href={`https://www.ecfr.gov/current/title-${title.number}`}
                    target="_blank"
                  >
                    <ArrowTopRightOnSquareIcon className="text-gray-400 w-6 h-6" />
                  </a>
                </div>
              ))
            }

            {/* Non-Titles */}
            {
              code.title !== undefined && nonTitles.map((section: any, index: any) => (
                <div key={`${index}_title`} className="flex items-center justify-between border-b border-gray-200 mb-2">
                  <p
                    className="w-full p-2 pb-4 hover:text-blue-600 text-sm cursor-pointer"
                    onClick={() => addSelection(section, section.type, index)}
                  >
                    {section.label}
                  </p>
                  <a
                    className="h-full w-8 flex items-center justify-center"
                    href={`https://www.ecfr.gov/current/title-${code.title}/${section.type}-${section.identifier}`}
                    target="_blank"
                  >
                    <ArrowTopRightOnSquareIcon className="text-gray-400 w-6 h-6" />
                  </a>
                </div>
              ))
            }
          </div>

          {/* Accept Button */}
          <div className="flex justify-end mt-6">
            <button
              className={`
                p-2 text-white rounded-md transition-colors
                ${code.part ? 'bg-blue-400 hover:bg-blue-500 cursor-pointer' : 'bg-neutral-200 cursor-not-allowed'}
              `}
              disabled={!code.part}
              onClick={() => setCode({ ...code, show: false })}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalSelectFederalCode;