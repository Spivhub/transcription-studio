exports.handler = async function (event) {
  const API_KEY = process.env.ASSEMBLYAI_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured on server." }),
    };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const { action, payload } = JSON.parse(event.body || "{}");

  try {
    if (action === "getKey") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ key: API_KEY }),
      };
    }

    if (action === "request") {
      const { upload_url } = payload;
      const res = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          authorization: API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          audio_url: upload_url,
          punctuate: true,
          format_text: true,
          speech_models: ["universal-2"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (action === "poll") {
      const { id } = payload;
      const res = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { authorization: API_KEY },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Poll failed");
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Unknown action" }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
