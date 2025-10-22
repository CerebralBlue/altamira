import axios from 'axios';
import exceljs from 'exceljs';
import * as cheerio from 'cheerio';

export async function webScraper(url: string, fileType = 'excel') {
  const html = await getHTMLFile(url);
  const extractedData = extractData(html);
  if (fileType === 'excel') {
    return await getExcel(extractedData);
  } else {
    return extractedData;
  }
}

async function getHTMLFile(url: string) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(`Error trying to get the page ${url}:`, error);
    return null;
  }
}

function childsDivs(parentElement: any) {
  return parentElement.find("> div").filter((index: any, element: any) => {
    const attributes = element.attribs;
    const attributeKeys = Object.keys(attributes);
    return attributeKeys.length === 1 && attributeKeys[0] === "id";
  });
}

function extractData(html: string) {
  const $ = cheerio.load(html);
  const datos: any = [];

  $(".section").each((index: any, element: any) => {
    element = $(element);

    const firstCodeRef = element.attr("id");
    const h4 = element.children("h4");
    const paragraphTitle = h4
      .text()
      .trim()
      .replace(/\s+/g, " ")
      .replace(`§ ${firstCodeRef} `, "");
    const firstText = element.children("p").first().text().trim().replace(/\s+/g, " ") || "";

    datos.push({
      codeRef: firstCodeRef,
      paragraphTitle,
      codeText: firstText,
    });

    const allChildsList: any[] = [];
    let childsList = [];
    const initialChildList = childsDivs(element);

    initialChildList.each((index: any, everyChild: any) => {
      everyChild = $(everyChild);
      childsList.push(everyChild);
      allChildsList.push(everyChild);
    });

    while (childsList.length) {
      const auxChildsList: any[] = [];

      for (let everyChild of childsList) {
        everyChild = $(everyChild);
        const tempChilds = childsDivs(everyChild);

        tempChilds.each((index: any, deeperChilds: any) => {
          deeperChilds = $(deeperChilds);
          auxChildsList.push(deeperChilds);
          allChildsList.push(deeperChilds);
        })
      }

      if (!auxChildsList.length) break;

      childsList = auxChildsList;
    }

    for (let everyChild of allChildsList) {
      everyChild = $(everyChild);
      const codeRef = everyChild.attr("id").replace("p-", "");
      const pElement = everyChild.children("p");
      if (pElement.length === 0) return;
      pElement.find("span.paragraph-hierarchy").remove();
      const codeText = pElement.text().trim().replace(/\s+/g, " ");

      datos.push({
        codeRef,
        paragraphTitle,
        codeText,
      });
    }
  });

  return datos;
}

async function getExcel(data: any) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Results");

  worksheet.columns = [
    { header: "Code Ref", key: "codeRef" },
    { header: "Paragraph Title", key: "paragraphTitle" },
    { header: "Code Text", key: "codeText" },
    { header: "Section of Manual", key: "sectionManual" },
    { header: "Comments", key: "comments" },
  ];

  worksheet.addRows(data);
  return await workbook.xlsx.writeBuffer();
}


export async function getExcelResults(data: any) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Results");

  worksheet.columns = [
    { header: "Code Ref", key: "codeRef" },
    { header: "Paragraph Title", key: "paragraphTitle" },
    { header: "Code Text", key: "codeText" },
    { header: "Section of Manual", key: "sectionManual" },
    { header: "Snippet", key: "snippet" },
  ];

  worksheet.addRows(data);
  return await workbook.xlsx.writeBuffer();
}
