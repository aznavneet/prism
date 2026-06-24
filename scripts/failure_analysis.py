import os
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel("gemini-2.5-flash")

# Read CI log
with open("ci.log", "r", encoding="utf-8", errors="ignore") as f:
    ci_log = f.read()[-15000:]

# Full RCA
full_prompt = f"""
You are a Senior DevOps Engineer.

Analyze this CI/CD pipeline failure.

Provide:

# Root Cause

# Explanation

# Suggested Fix

CI Log:

{ci_log}
"""

full_response = model.generate_content(full_prompt)

with open("rca.md", "w", encoding="utf-8") as f:
    f.write(full_response.text)

# Short Summary
summary_prompt = f"""
You are a Senior DevOps Engineer.

Analyze this CI/CD pipeline failure.

Return only:

## Root Cause
(max 2 lines)

## Suggested Fix
(max 3 lines)

CI Log:

{ci_log}
"""

summary_response = model.generate_content(summary_prompt)

with open("rca_summary.md", "w", encoding="utf-8") as f:
    f.write(summary_response.text)

print("RCA and Summary generated successfully.")