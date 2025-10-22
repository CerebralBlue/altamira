import { webScraper } from '@/lib/scraper';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const apikey = process.env.API_KEY || '';
const urlExploreUpload = process.env.URL_EXPLORE_UPLOAD || '';
const urlDelFile = process.env.URL_DEL_FILE || '';
const urlMaistroStream = process.env.URL_MAISTRO_STREAM || '';

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}

async function uploadFile(theFile: any) {
  try {
    const formData = new FormData();
    formData.append('file', theFile, theFile.name);
    return (await axios.post(urlExploreUpload, formData, { headers: { apikey, } })).data.fn;
  } catch (err) {
    console.error(err);
  }
}

async function deleteFile(theFilename: any) {
  try {
    await axios.post(urlDelFile, { name: theFilename }, { headers: { apikey, } });
  } catch (err) {
    console.error(err);
  }
}

async function getJson(code: any) {
  try {
    const { version, title, fullPath } = code;
    const urlToExtract = `https://www.ecfr.gov/api/renderer/v1/content/enhanced/${version}/title-${title}?${fullPath}`;
    const data = await webScraper(urlToExtract, "csv");
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function* processLineItem(filename: any, lineItem: any) {
  const lineItemString = Object.values(lineItem).join(' ');

  const response = await fetch(urlMaistroStream, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey,
    },
    body: JSON.stringify({
      agent: 'compare_documents_1',
      params: [
        { name: 'filename', value: filename },
        { name: 'lineItem', value: lineItemString }
      ],
      options: {
        returnVariables: false,
        returnVariablesExpanded: false,
        returnRender: false,
        returnSource: false,
      }
    }),
  });

  if (!response.body) {
    console.error('No body in response for lineItem:', lineItem);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  let previousChunk = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    let chunk = decoder.decode(value, { stream: true });

    if (previousChunk) {
      try {
        chunk = chunk
          .replace(/\n+/g, '<br>')
          .replaceAll('\\n', '<br>')
          .replaceAll('\\t', '&ensp;')
          .replaceAll('\\"', "'")
          .replaceAll('\\', '');

        const endIndex = chunk.indexOf('}') === -1 ? chunk.length : chunk.indexOf('}') + 1;

        chunk = chunk.slice(0, endIndex);
        previousChunk += chunk;


        const { description, snippet } = JSON.parse(previousChunk);
        previousChunk = '';
        yield JSON.stringify({ lineItem, lineItemString, description, snippet });
        continue;
      } catch (err) {
        previousChunk = '';
        continue;
      }
    }

    if (chunk.includes('data: {"description":')) {
      try {

        chunk = chunk.slice(chunk.indexOf('{"description"'));
        chunk = chunk
          .replace(/\n+/g, '<br>')
          .replaceAll('\\n', '<br>')
          .replaceAll('\\t', '&ensp;')
          .replaceAll('\\"', "'")
          .replaceAll('\\', '');

        const endIndex = chunk.indexOf('}') === -1 ? chunk.length : chunk.indexOf('}') + 1;
        chunk = chunk.slice(0, endIndex);

        const { description, snippet } = JSON.parse(chunk);
        yield JSON.stringify({ lineItem, lineItemString, description, snippet });
        continue;
      } catch (err) {
        previousChunk = chunk;
        continue;
      }
    }
  }
}

async function* compareLineItems(filename: any, lineItems: any) {
  const BATCH_SIZE = 3;

  try {
    for (let i = 0; i < lineItems.length; i += BATCH_SIZE) {
      const batch = lineItems.slice(i, i + BATCH_SIZE);
      let activeGenerators = batch.map((lineItem: any) =>
        processLineItem(filename, lineItem)
      );

      while (activeGenerators.length > 0) {
        const promises = activeGenerators.map((generator: any) =>
          generator.next().then((result: any) => ({ ...result, generator }))
        );

        const { value, done, generator } = await Promise.race(promises);

        if (done) {
          activeGenerators = activeGenerators.filter((g: any) => g !== generator);
        } else {
          yield value;
        }
      }
    }
  } catch (err) {
    console.log('There was an error while trying to get the data stream');
    console.log(err);
  } finally {
    try {
      await deleteFile(filename);
    } catch (err) {
      console.log('There was an error while trying to remove the file');
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.formData();
    const theFile = await body.get('theFile');
    const uploadedFilename = await uploadFile(theFile);
    const lineItems: Array<any> = await getJson(JSON.parse(body.get('code')));
    const iterator = compareLineItems(uploadedFilename, lineItems);
    const stream = iteratorToStream(iterator);
    return new Response(stream);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'There was an error while trying to call mAIstro agent' }, { status: 500 });
  }
}
