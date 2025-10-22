import { getExcelResults, webScraper } from '@/lib/scraper';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const version = searchParams.get('version');
    const title = searchParams.get('title');
    const fullPath = searchParams.get('fullPath');

    if (!version || !title || !fullPath) {
      return NextResponse.json({ error: "Missing required query parameters. Please provide 'version', 'title', and 'fullPath'." }, { status: 400 });
    }
    const urlToExtract = `https://www.ecfr.gov/api/renderer/v1/content/enhanced/${version}/title-${title}?${fullPath}`;
    const dataBuffer = await webScraper(urlToExtract, 'excel');
    const res = new NextResponse(dataBuffer);

    res.headers.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.headers.set(
      'Content-Disposition',
      `attachment; filename="REPORT.xlsx"`
    );
    return res;
  } catch (err) {
    return NextResponse.json({ error: `There was an error while trying to get the Federal CSV Summary. Error: ${err}` }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const { results } = await req.json();
    const newResults = results.map((e: any) => {
      return {
        codeRef: e.lineItem.codeRef,
        paragraphTitle: e.lineItem.paragraphTitle,
        codeText: e.lineItem.codeText,
        sectionManual: e.description,
        snippet: e.snippet,
        comments: "",
      };
    });

    const dataBuffer = await getExcelResults(newResults);
    const res = new NextResponse(dataBuffer);
    res.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.headers.set("Content-Disposition", `attachment; filename="REPORT.xlsx"`);
    return res;
  } catch (err) {
    return NextResponse.json({ error: `There was an error while trying to get the CSV comparison result file. Error: ${err}` }, { status: 500 });
  }
}
