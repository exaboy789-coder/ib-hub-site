const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB
const MAX_QUESTION_TEXT_LEN = 4000;
const IMAGE_PREFIX = 'data:image/png;base64,';
const ANTHROPIC_TIMEOUT_MS = 25000;

const SYSTEM_PROMPT = [
  'You are a strict-but-encouraging IB Mathematics AA tutor grading a student\'s handwritten working',
  'against the attached official mark scheme PDF. Identify which method/answer marks (M1/A1/etc.)',
  'the student earned and which they missed, quoting the specific mark-scheme line. Explain the',
  'first error precisely, in plain language a student can act on. Do not solve the rest of the',
  'problem for them or reveal the full solution beyond what is needed to explain their mistake.',
  'Keep the response under 200 words, using short paragraphs or a few bullet points.'
].join(' ');

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function arrayBufferToBase64(buffer) {
  var bytes = new Uint8Array(buffer);
  var chunkSize = 0x8000;
  var chunks = [];
  for (var i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize)));
  }
  return btoa(chunks.join(''));
}

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  var body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  var questionId = body && body.questionId;
  var questionText = body && body.questionText;
  var imageDataUrl = body && body.imageDataUrl;

  if (typeof questionId !== 'string' || !/^\d+$/.test(questionId)) {
    return jsonResponse({ error: 'Invalid or missing questionId' }, 400);
  }
  if (typeof questionText !== 'string' || questionText.trim().length === 0) {
    return jsonResponse({ error: 'Invalid or missing questionText' }, 400);
  }
  if (questionText.length > MAX_QUESTION_TEXT_LEN) {
    questionText = questionText.slice(0, MAX_QUESTION_TEXT_LEN);
  }
  if (typeof imageDataUrl !== 'string' || imageDataUrl.indexOf(IMAGE_PREFIX) !== 0) {
    return jsonResponse({ error: 'Invalid or missing imageDataUrl' }, 400);
  }

  var imageBase64 = imageDataUrl.slice(IMAGE_PREFIX.length);
  var approxImageBytes = imageBase64.length * 0.75;
  if (approxImageBytes > MAX_IMAGE_BYTES) {
    return jsonResponse({ error: 'Whiteboard image is too large' }, 413);
  }

  var pdfFilename = 'Mathematics_AA_Markscheme_Q' + questionId + '.pdf';
  var pdfUrl = new URL('/' + pdfFilename, request.url);
  var pdfResp;
  try {
    pdfResp = await fetch(pdfUrl);
  } catch (err) {
    return jsonResponse({ error: 'Could not load mark scheme' }, 502);
  }
  var pdfContentType = pdfResp.headers.get('content-type') || '';
  if (!pdfResp.ok || pdfContentType.indexOf('application/pdf') === -1) {
    return jsonResponse({ error: 'No mark scheme found for this question' }, 404);
  }
  var pdfBuffer = await pdfResp.arrayBuffer();
  var pdfBase64 = arrayBufferToBase64(pdfBuffer);

  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'AI marking is not configured' }, 500);
  }

  var anthropicBody = {
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Question:\n' + questionText },
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imageBase64 } },
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
          { type: 'text', text: 'The image above is the student\'s handwritten working. The PDF above is the official mark scheme. Mark the student\'s work against it.' }
        ]
      }
    ]
  };

  var controller = new AbortController();
  var timeout = setTimeout(function () { controller.abort(); }, ANTHROPIC_TIMEOUT_MS);

  var anthropicResp;
  try {
    anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(anthropicBody),
      signal: controller.signal
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return jsonResponse({ error: 'AI marking timed out, try again' }, 502);
    }
    return jsonResponse({ error: 'AI marking is temporarily unavailable, try again shortly.' }, 502);
  }
  clearTimeout(timeout);

  if (!anthropicResp.ok) {
    var status = anthropicResp.status === 429 ? 429 : 502;
    return jsonResponse({ error: 'AI marking is temporarily unavailable, try again shortly.' }, status);
  }

  var data;
  try {
    data = await anthropicResp.json();
  } catch (err) {
    return jsonResponse({ error: 'AI marking returned an unexpected response' }, 502);
  }

  var feedback = (data.content || [])
    .filter(function (block) { return block.type === 'text'; })
    .map(function (block) { return block.text; })
    .join('\n')
    .trim();

  if (!feedback) {
    return jsonResponse({ error: 'AI marking returned no feedback' }, 502);
  }

  return jsonResponse({ feedback: feedback }, 200);
}
