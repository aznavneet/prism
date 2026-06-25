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
  const candidate = Object.keys(zip.files).find((entry) => entry.toLowerCase().endsWith('ci-rca.md'));

  if (!candidate) {
    throw new Error('The artifact archive did not contain ci-rca.md.');
  }

  return zip.files[candidate].async('string');
}

export async function getRcaMarkdown(runId) {
  const artifacts = await getArtifacts(runId);

  for (const artifact of artifacts) {
    try {
      const archive = await downloadArtifact(artifact.id);
      const markdown = await extractMarkdown(archive);
      return markdown;
    } catch (error) {
      // Continue scanning other artifacts until one yields a readable RCA report.
      if (error instanceof Error && error.message.includes('ci-rca.md')) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('No RCA artifact could be extracted for this workflow run.');
}
