import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const REQUIRED_ENV = [
  "CONFLUENCE_BASE_URL",
  "CONFLUENCE_EMAIL",
  "CONFLUENCE_API_TOKEN",
  "CONFLUENCE_SPACE_KEY",
  "CONFLUENCE_PARENT_PAGE_ID",
];

function getEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const baseUrl = process.env.CONFLUENCE_BASE_URL.replace(/\/+$/, "");
  const parentPageId = String(process.env.CONFLUENCE_PARENT_PAGE_ID);

  return {
    baseUrl,
    email: process.env.CONFLUENCE_EMAIL,
    apiToken: process.env.CONFLUENCE_API_TOKEN,
    spaceKey: process.env.CONFLUENCE_SPACE_KEY,
    parentPageId,
    syncEnabled: process.env.CONFLUENCE_SYNC_ENABLED !== "false",
    dryRun: process.env.CONFLUENCE_DRY_RUN === "true",
    swaggerJsonUrl: process.env.CONFLUENCE_SWAGGER_JSON_URL,
    swaggerJsonFile: process.env.CONFLUENCE_SWAGGER_JSON_FILE,
    swaggerPageTitle: process.env.CONFLUENCE_SWAGGER_PAGE_TITLE || "OrderIQ API Swagger",
  };
}

function authHeader(email, apiToken) {
  return `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`;
}

async function confluenceRequest(config, endpoint, init = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: authHeader(config.email, config.apiToken),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`Confluence request failed (${response.status}) ${endpoint}: ${bodyText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function findMarkdownFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownFiles(fullPath);
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        return [fullPath];
      }

      return [];
    }),
  );

  return nested.flat().sort((a, b) => a.localeCompare(b));
}

function filenameToTitle(filePath) {
  const filename = path.basename(filePath, ".md");
  return filename
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function extractTitle(markdown, filePath) {
  const headingMatch = markdown.match(/^#\s+(.+)$/m);
  if (headingMatch && headingMatch[1]) {
    return headingMatch[1].trim();
  }

  return filenameToTitle(filePath);
}

async function markdownToStorage(config, markdown) {
  const payload = {
    representation: "markdown",
    value: markdown,
  };

  const result = await confluenceRequest(config, "/rest/api/contentbody/convert/storage", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result.value;
}

async function findPageByTitle(config, title, parentPageId) {
  const escapedTitle = title.replace(/"/g, '\\"');
  const cql = `space = "${config.spaceKey}" AND title = "${escapedTitle}" AND ancestor = ${parentPageId}`;
  const endpoint = `/rest/api/content/search?cql=${encodeURIComponent(cql)}&expand=version`;
  const result = await confluenceRequest(config, endpoint);

  if (!result.results || result.results.length === 0) {
    return null;
  }

  return result.results[0];
}

async function createPage(config, title, storageValue, parentPageId) {
  const payload = {
    type: "page",
    title,
    space: { key: config.spaceKey },
    ancestors: [{ id: parentPageId }],
    body: {
      storage: {
        value: storageValue,
        representation: "storage",
      },
    },
  };

  return confluenceRequest(config, "/rest/api/content", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updatePage(config, page, title, storageValue, parentPageId) {
  const payload = {
    id: page.id,
    type: "page",
    title,
    space: { key: config.spaceKey },
    ancestors: [{ id: parentPageId }],
    version: { number: page.version.number + 1 },
    body: {
      storage: {
        value: storageValue,
        representation: "storage",
      },
    },
  };

  return confluenceRequest(config, `/rest/api/content/${page.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function syncSingleFile(config, filePath) {
  const markdown = await readFile(filePath, "utf8");
  const title = extractTitle(markdown, filePath);
  const storageValue = await markdownToStorage(config, markdown);
  const existingPage = await findPageByTitle(config, title, config.parentPageId);

  if (config.dryRun) {
    const action = existingPage ? "UPDATE" : "CREATE";
    console.log(`[DRY RUN] ${action} ${title} (${filePath})`);
    return;
  }

  if (existingPage) {
    await updatePage(config, existingPage, title, storageValue, config.parentPageId);
    console.log(`Updated page: ${title}`);
    return;
  }

  await createPage(config, title, storageValue, config.parentPageId);
  console.log(`Created page: ${title}`);
}

async function loadSwaggerJson(config) {
  if (config.swaggerJsonUrl) {
    const response = await fetch(config.swaggerJsonUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(
        `Swagger JSON fetch failed (${response.status}) ${config.swaggerJsonUrl}: ${bodyText}`,
      );
    }

    return response.json();
  }

  if (config.swaggerJsonFile) {
    const fileContent = await readFile(path.resolve(process.cwd(), config.swaggerJsonFile), "utf8");
    return JSON.parse(fileContent);
  }

  return null;
}

function buildSwaggerMarkdown(config, swaggerJson) {
  const sourceLine = config.swaggerJsonUrl
    ? `Swagger source URL: ${config.swaggerJsonUrl}`
    : `Swagger source file: ${config.swaggerJsonFile}`;

  return [
    `# ${config.swaggerPageTitle}`,
    "",
    "Automatikusan szinkronizalt OpenAPI/Swagger dokumentacio.",
    "",
    sourceLine,
    `Frissitve: ${new Date().toISOString()}`,
    "",
    "```json",
    JSON.stringify(swaggerJson, null, 2),
    "```",
  ].join("\n");
}

async function syncSwaggerPage(config) {
  const swaggerJson = await loadSwaggerJson(config);
  if (!swaggerJson) {
    console.log("Skipping Swagger sync: no Swagger source configured.");
    return;
  }

  const title = config.swaggerPageTitle;
  const markdown = buildSwaggerMarkdown(config, swaggerJson);
  const storageValue = await markdownToStorage(config, markdown);
  const existingPage = await findPageByTitle(config, title, config.parentPageId);

  if (config.dryRun) {
    const action = existingPage ? "UPDATE" : "CREATE";
    console.log(`[DRY RUN] ${action} ${title} (swagger)`);
    return;
  }

  if (existingPage) {
    await updatePage(config, existingPage, title, storageValue, config.parentPageId);
    console.log(`Updated page: ${title}`);
    return;
  }

  await createPage(config, title, storageValue, config.parentPageId);
  console.log(`Created page: ${title}`);
}

async function main() {
  const config = getEnv();
  if (!config.syncEnabled) {
    console.log("Confluence sync is temporarily disabled.");
    return;
  }

  const docsDir = path.resolve(process.cwd(), "docs");
  const files = await findMarkdownFiles(docsDir);

  if (files.length === 0) {
    console.log("No markdown files found in docs directory.");
    return;
  }

  console.log(`Found ${files.length} markdown files in docs.`);
  for (const filePath of files) {
    await syncSingleFile(config, filePath);
  }

  await syncSwaggerPage(config);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
