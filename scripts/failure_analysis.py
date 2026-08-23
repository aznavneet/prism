import argparse
import os
from pathlib import Path

import google.generativeai as genai


def read_log(log_path):
    path = Path(log_path)
    if not path.exists():
        return ""
    with path.open("r", encoding="utf-8", errors="ignore") as fh:
        return fh.read()


def build_prompt(log_text, analysis_type):
    if analysis_type == "cd":
        return f"""
You are a Senior Kubernetes / SRE Engineer.

Analyze the unified CI + CD log for deployment health and operational failure.
Use only evidence present in the log. Do not invent evidence. If a field cannot be determined, state "Not enough evidence in the log".

Provide the following sections:
- Deployment Status
- Root Cause
- Severity
- Confidence
- Affected Resources / Pods
- Kubernetes Events
- Container Errors
- Rollout Issues
- Evidence
- Remediation

Focus on:
1. Deployment status (successful, failed, partial rollout, pending, crashlooping, unavailable)
2. Root cause of the deployment issue using real log evidence
3. Severity and confidence based on what is shown in the log
4. Affected workloads, pods, namespaces, events, and container issues
5. Rollout, image pull, crashloop, readiness, and restart evidence

Unified Log:

{log_text}
"""

    return f"""
You are a Senior DevOps Engineer.

Analyze the CI pipeline log.

Identify:
1. Which stage failed first.
2. Ignore warnings from successful stages.
3. Focus on the stage that caused the pipeline failure.
4. Provide:
   - Failed Stage
   - Root Cause
   - Evidence
   - Suggested Fix

If multiple failures exist, prioritize the first blocking failure.
If an earlier stage fails, treat failures in later stages as cascading failures unless they are independent. Report the first blocking failure as the primary root cause and list later failures separately under "Subsequent Errors".

CI Log:

{log_text}
"""


def write_outputs(rca_text):
    with open("rca.md", "w", encoding="utf-8") as file_handle:
        file_handle.write(rca_text)

    summary_lines = []
    for line in rca_text.splitlines():
        if len(summary_lines) >= 15:
            break
        summary_lines.append(line)

    with open("rca_summary.md", "w", encoding="utf-8") as file_handle:
        file_handle.write("\n".join(summary_lines))


def main():
    parser = argparse.ArgumentParser(description="Generate RCA from CI/CD logs using Gemini.")
    parser.add_argument("--type", choices=["ci", "cd"], default="ci", help="Type of RCA to generate.")
    parser.add_argument("--log", default="ci.log", help="Path to the unified log file.")
    args = parser.parse_args()

    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-2.5-flash")

    log_text = read_log(args.log)
    if args.type == "cd":
        log_text = log_text[-50000:]
    else:
        log_text = log_text[-15000:]

    prompt = build_prompt(log_text, args.type)

    try:
        response = model.generate_content(prompt)
        rca_text = response.text
        write_outputs(rca_text)
        print(f"{args.type.upper()} RCA generated successfully.")
    except Exception as exc:
        error_text = f"""
## Root Cause

Gemini API request failed.

## Error

{str(exc)}

## Suggested Fix

- Check Gemini API quota.
- Verify API key configuration.
- Retry after quota reset.
"""
        write_outputs(error_text)
        print(f"Gemini API Error: {exc}")


if __name__ == "__main__":
    main()