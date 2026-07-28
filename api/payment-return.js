function readBody(req) {
  if (req.body) {
    return Promise.resolve(
      typeof req.body === "string" ? req.body : JSON.stringify(req.body)
    );
  }

  return new Promise((resolve) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      resolve(body);
    });

    req.on("error", () => {
      resolve("");
    });
  });
}

function getField(body, name) {
  if (!body) {
    return "";
  }

  try {
    const parsed = JSON.parse(body);
    return String(parsed[name] || "");
  } catch {
    const params = new URLSearchParams(body);
    return String(params.get(name) || "");
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.writeHead(303, { Location: "/payment-success.html" });
    res.end();
    return;
  }

  const body = await readBody(req);
  const transactionStatus = getField(body, "transactionStatus").toLowerCase();
  const reasonCode = getField(body, "reasonCode");
  const isApproved =
    transactionStatus === "" ||
    transactionStatus === "approved" ||
    reasonCode === "1100";

  res.writeHead(303, {
    Location: isApproved ? "/payment-success.html" : "/payment-failed.html",
  });
  res.end();
};
