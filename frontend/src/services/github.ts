import axios from 'axios';
import JSZip from 'jszip';

export type WorkflowRun = {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: string;
  conclusion: string | null;
  event: string;
  created_at: string;
  html_url: string;
  artifacts?: ArtifactSummary[];
};

export type ArtifactSummary = {
  id: number;
  name: string;
  size_in_bytes: number;
  archive_download_url: string;
  expired: boolean;
};

type WorkflowRunsResponse = {
  workflow_runs: Array<{
    id: number;
    name: string;
    head_branch: string;
    head_sha: string;
    status: string;
    conclusion: string | null;
    event: string;
    created_at: string;
    html_url: string;
  }>;
};

type ArtifactsResponse = {
  artifacts: ArtifactSummary[];
};

function buildHeaders(token?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getWorkflowRuns(owner: string, repo: string, token?: string): Promise<WorkflowRun[]> {
  const response = await axios.get<WorkflowRunsResponse>(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=20`, {
    headers: buildHeaders(token)
  });

  return response.data.workflow_runs.map((run) => ({ ...run }));
}

export async function getArtifacts(owner: string, repo: string, runId: number, token?: string): Promise<ArtifactSummary[]> {
  const response = await axios.get<ArtifactsResponse>(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`, {
    headers: buildHeaders(token)
  });

  return response.data.artifacts;
}

export async function readRcaFromArtifact(owner: string, repo: string, runId: number, token?: string): Promise<string> {
  const artifacts = await getArtifacts(owner, repo, runId, token);
  const artifact = artifacts.find((entry) => entry.name.toLowerCase() === 'rca-report');

  if (!artifact) {
    throw new Error('No artifact named rca-report was found for this run.');
  }

  const response = await axios.get<ArrayBuffer>(artifact.archive_download_url, {
    responseType: 'arraybuffer',
    headers: buildHeaders(token)
  });

  const zip = await JSZip.loadAsync(response.data);
  const entry = Object.keys(zip.files).find((name) => /(^|\/)(rca\.md)$/i.test(name));

  if (!entry || !zip.files[entry]) {
    throw new Error('The artifact did not include a readable rca.md file.');
  }

  return zip.files[entry].async('string');
}
