import os

try:
    import google.generativeai as genai
except ImportError:
    print("Error: google-generativeai library is not installed.")
    print("Install it with: pip install google-generativeai")
    exit(1)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load model
model = genai.GenerativeModel("gemini-2.5-flash")

# Read build log
with open("build.log", "r", encoding="utf-8", errors="ignore") as f:
    build_log = f.read()[-15000:]  # last 15k chars

prompt = f"""
You are a Senior DevOps Engineer.

Analyze the following CI/CD pipeline failure.

Return the response in markdown format with:

# Root Cause
# Explanation
# Suggested Fix

Build Log:

{build_log}
"""

response = model.generate_content(prompt)

# Write RCA file
with open("rca.md", "w", encoding="utf-8") as f:
    f.write(response.text)

print("RCA generated successfully.")