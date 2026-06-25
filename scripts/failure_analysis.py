import os
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel("gemini-2.5-flash")

# Read CI log
with open("ci.log", "r", encoding="utf-8", errors="ignore") as f:
    ci_log = f.read()[-15000:]

prompt = f"""
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

{ci_log}
"""

try:
    response = model.generate_content(prompt)

    rca_text = response.text

    # Full RCA
    with open("rca.md", "w", encoding="utf-8") as f:
        f.write(rca_text)

    # Summary for GitHub Actions
    summary_lines = []

    for line in rca_text.splitlines():
        if len(summary_lines) >= 15:
            break
        summary_lines.append(line)

    with open("rca_summary.md", "w", encoding="utf-8") as f:
        f.write("\n".join(summary_lines))

    print("RCA and Summary generated successfully.")

except Exception as e:

    error_text = f"""
## Root Cause

Gemini API request failed.

## Error

{str(e)}

## Suggested Fix

- Check Gemini API quota.
- Verify API key configuration.
- Retry after quota reset.
"""

    with open("rca.md", "w", encoding="utf-8") as f:
        f.write(error_text)

    with open("rca_summary.md", "w", encoding="utf-8") as f:
        f.write(error_text)

    print(f"Gemini API Error: {e}")