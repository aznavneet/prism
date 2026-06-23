import os
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel("gemini-2.5-flash")

with open("build.log", "r", encoding="utf-8") as f:
    build_log = f.read()[-10000:]

prompt = f"""
You are a Senior DevOps Engineer.

Analyze this CI/CD pipeline failure.

Provide:
1. Root Cause
2. Explanation
3. Suggested Fix

Build Log:

{build_log}
"""

response = model.generate_content(prompt)

with open("rca.md", "w", encoding="utf-8") as f:
    f.write(response.text)