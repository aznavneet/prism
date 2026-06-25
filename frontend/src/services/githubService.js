import axios from 'axios';
import JSZip from 'jszip';

const owner = import.meta.env.VITE_GITHUB_OWNER || 'aznavneet';
const repo = import.meta.env.VITE_GITHUB_REPO || 'prism';
const token = import.meta.env.VITE_GITHUB_TOKEN || '';

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
  const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs?per_page=20`, {
    headers: getHeaders()
  });

  return response.data.workflow_runs.map(normalizeRun);
}

export async function getArtifacts(runId) {
  const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`, {
    headers: getHeaders()
  });

  return response.data.artifacts;
}

export async function downloadArtifact(artifactId) {
  const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/artifacts/${artifactId}`, {
    headers: getHeaders()
  });

  const downloadUrl = response.data.archive_download_url;
  const zipResponse = await axios.get(downloadUrl, {
    responseType: 'arraybuffer',
    headers: getHeaders()
  });

  return zipResponse.data;
}

export async function extractMarkdown(zipBuffer) {
  const zip = await JSZip.loadAsync(zipBuffer);
  const markdownEntries = Object.entries(zip.files)
    .filter(([entryName, file]) => !file.dir && /\.md$/i.test(entryName))
    .map(([entryName]) => entryName);

  const candidate = markdownEntries.find((entryName) => /(^|\/)(ci-rca[^/]*\.md|rca\.md)$/i.test(entryName))
    || markdownEntries.find((entryName) => /rca/i.test(entryName))
    || markdownEntries[0];

  if (!candidate) {
    throw new Error('The artifact archive did not contain a readable RCA markdown file.');
  }

  return zip.files[candidate].async('string');
}

export async function getRcaArtifact(runId) {
  const artifacts = await getArtifacts(runId);
  const rankedArtifacts = [...artifacts].sort((left, right) => {
    const leftScore = /rca|ci-rca/i.test(left.name) ? 1 : 0;
    const rightScore = /rca|ci-rca/i.test(right.name) ? 1 : 0;
    return rightScore - leftScore;
  });

  for (const artifact of rankedArtifacts) {
    try {
      const archive = await downloadArtifact(artifact.id);
      const markdown = await extractMarkdown(archive);

      if (markdown && markdown.trim()) {
        return {
          markdown,
          artifactName: artifact.name,
          artifactId: artifact.id,
          artifactDownloadUrl: artifact.archive_download_url
        };
      }
    } catch {
      // Continue scanning other artifacts until one yields a readable RCA report.
    }
  }

  throw new Error('No RCA markdown could be extracted from the workflow artifacts.');
}

export async function getRcaMarkdown(runId) {
  const result = await getRcaArtifact(runId);
  return result.markdown;
}
