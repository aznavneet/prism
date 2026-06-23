# PRISM - Pipeline Root Cause Intelligence & Self-Healing Mechanism

PRISM is an AI-powered CI/CD failure analysis platform that automatically detects pipeline failures, analyzes build logs using Generative AI, and generates actionable Root Cause Analysis (RCA) reports for developers.

## Problem Statement

Modern CI/CD pipelines generate extensive logs during build, test, and deployment stages. When a failure occurs, developers often spend significant time manually investigating logs to identify the actual issue.

PRISM reduces troubleshooting effort by automatically analyzing failures and providing structured RCA reports.

---

## Features

* Automated build failure detection
* AI-powered root cause analysis using Gemini
* Detailed RCA report generation (`rca.md`)
* Developer-friendly RCA summaries
* Commit-aware RCA tracking
* Build log artifact collection
* Automated RCA distribution via email
* GitHub Actions integration
* Extensible notification framework (Email, Teams, Slack)

---

## How It Works

```text
Developer Commit
        │
        ▼
GitHub Pull Request
        │
        ▼
GitHub Actions Pipeline
        │
        ▼
Build Execution
        │
        ├── Success
        │       ▼
        │    Pipeline Pass
        │
        └── Failure
                │
                ▼
         build.log Generated
                │
                ▼
      PRISM Failure Analyzer
                │
                ▼
         Gemini AI Analysis
                │
                ▼
      RCA + Summary Generation
                │
                ▼
      RCA Artifact Creation
                │
                ▼
     Email Notification (Optional)
                │
                ▼
         Developer Action
```

---

## Generated Outputs

### Full RCA Report

```text
rca.md
```

Contains:

* Root Cause
* Technical Explanation
* Suggested Fix

### RCA Summary

Provides a concise overview of the failure for quick developer consumption.

---

## Notification Support

PRISM can automatically send the generated RCA report as an email attachment to development teams.

Email notifications include:

* Repository Name
* Branch Name
* Commit ID
* Build Status
* RCA Report Attachment (`rca.md`)

This enables developers to receive failure diagnostics directly in their inbox without manually inspecting CI/CD logs.

---

## Benefits

* Faster troubleshooting
* Reduced Mean Time To Resolution (MTTR)
* Improved developer productivity
* Automated failure intelligence
* Better CI/CD visibility
* Historical failure tracking

---

## Future Enhancements

* Pull Request RCA Comments
* Microsoft Teams Integration
* Slack Integration
* Jira Ticket Creation
* Failure Pattern Analytics
* AI-Assisted Self-Healing Pull Requests

---

## Tech Stack

* GitHub Actions
* Python
* Google Gemini API
* Maven
* Java
* GitHub Artifacts
* SMTP Email Notifications

---

## Vision

PRISM transforms traditional CI/CD pipelines into intelligent failure analysis systems by combining build automation, AI-driven diagnostics, and automated developer notifications.
