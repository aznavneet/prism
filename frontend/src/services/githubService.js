import axios from 'axios';
import JSZip from 'jszip';

const owner = import.meta.env.VITE_GITHUB_OWNER || 'aznavneet';
const repo = import.meta.env.VITE_GITHUB_REPO || 'prism';
const token = import.meta.env.VITE_GITHUB_TOKEN || '';

console.log("================================");
console.log("GitHub Token:", token ? "PRESENT" : "MISSING");
console.log("Token Length:", token.length);
console.log("================================");

const GITHUB_API_BASE = 'https://api.github.com';

function getHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function normalizeRun(run) {
  return {
    id: run.id,
    name: run.name,
    head_sha: run.head_sha,
    head_branch: run.head_branch,
    status: run.status,
    conclusion: run.conclusion,
    created_at: run.created_at,
    html_url: run.html_url
  };
}

export async function getWorkflowRuns() {
  console.log("Loading workflow runs...");

  const response = await axios.get(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs?per_page=20`,
    {
      headers: getHeaders()
    }
  );

  console.log("Workflow Runs:", response.data.workflow_runs);

  return response.data.workflow_runs.map(normalizeRun);
}

export async function getArtifacts(runId) {
  console.log("Loading artifacts for run:", runId);

  const response = await axios.get(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
    {
      headers: getHeaders()
    }
  );

  console.log("Artifacts:", response.data.artifacts);

  return response.data.artifacts;
}

export async function downloadArtifact(artifactId) {

  console.log("======================================");
  console.log("Downloading Artifact:", artifactId);

  const metadata = await axios.get(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/artifacts/${artifactId}`,
    {
      headers: getHeaders()
    }
  );

  console.log("Artifact Metadata:");
  console.log(metadata.data);

  const downloadUrl = metadata.data.archive_download_url;

  console.log("Archive Download URL:");
  console.log(downloadUrl);

  const zipResponse = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
    headers: getHeaders(),
    validateStatus: () => true,
    maxRedirects: 5
  });

  console.log("Download Status:", zipResponse.status);
  console.log("Content-Type:", zipResponse.headers["content-type"]);
  console.log("Content-Length:", zipResponse.data?.byteLength);

  if (zipResponse.status !== 200) {
    throw new Error(`Artifact download failed with status ${zipResponse.status}`);
  }

  return zipResponse.data;
}

export async function extractMarkdown(zipBuffer) {

  console.log("Loading ZIP...");

  const zip = await JSZip.loadAsync(zipBuffer);

  console.log("ZIP Loaded");

  console.log("ZIP Files:");

  Object.values(zip.files).forEach(file => {
    console.log(" ->", file.name);
  });

  const markdownFile = Object.values(zip.files).find(file =>
    !file.dir &&
    file.name.toLowerCase().endsWith(".md")
  );

  console.log("Selected Markdown:", markdownFile);

  if (!markdownFile) {
    throw new Error("No markdown file found inside ZIP.");
  }

  const markdown = await markdownFile.async("string");

  console.log("Markdown Length:", markdown.length);

  return markdown;
}
console.log("getRcaArtifact CALLED", runId);

export async function getRcaArtifact(runId) {

  console.log("Fetching artifacts for run:", runId);

  const artifacts = await getArtifacts(runId);

  const rankedArtifacts = [...artifacts].sort((a, b) => {
    const scoreA = /ci-rca|rca/i.test(a.name) ? 1 : 0;
    const scoreB = /ci-rca|rca/i.test(b.name) ? 1 : 0;
    return scoreB - scoreA;
  });

  console.log("Ranked Artifacts:");

  rankedArtifacts.forEach(a => {
    console.log(a.name, a.id);
  });

  for (const artifact of rankedArtifacts) {

    console.log("--------------------------------");
    console.log("Trying:", artifact.name);

    try {

      const archive = await downloadArtifact(artifact.id);

      const markdown = await extractMarkdown(archive);

      if (markdown && markdown.trim()) {

        console.log("SUCCESS");

        return {
          markdown,
          artifactName: artifact.name,
          artifactId: artifact.id,
          artifactDownloadUrl: artifact.archive_download_url
        };
      }

    } catch (err) {

      console.error("FAILED");

      console.error(err);

      if (err.response) {
        console.error("HTTP Status:", err.response.status);
        console.error(err.response.data);
      }

      throw err;
    }
  }

  throw new Error("No RCA markdown could be extracted from the workflow artifacts.");
}

export async function getRcaMarkdown(runId) {
  const result = await getRcaArtifact(runId);
  return result.markdown;
}