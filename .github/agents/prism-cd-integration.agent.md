---
name: prism-cd-integration
description: Describe what this custom agent does and when to use it.
argument-hint: The inputs this agent expects, e.g., "a task to implement" or "a question to answer".
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->

Right — then **modify the existing `.github/workflows/test.yml`**. Don't create another workflow.

Use this Copilot prompt:

Extend the existing PRISM CI/CD implementation.

We already have:

* `.github/workflows/test.yml` with working CI integration
* `failure_analysis.py` that sends `ci.log` to Gemini for CI RCA

**Do not create a new workflow. Modify the existing `test.yml`.**

### Required flow

```text
CI
 ↓
Generate ci.log
 ↓
CI failure_analysis.py → Gemini
 ↓
IF CI FAILED → stop CD → pipeline FAILS

IF CI SUCCEEDS
 ↓
CD / EKS deployment
 ↓
Append CD/Kubernetes logs to SAME ci.log
 ↓
failure_analysis.py CD analysis
 ↓
Gemini receives COMPLETE ci.log
 ↓
Final CI + CD RCA
```

### Unified log requirement

`ci.log` must be the **single unified log file**.

On successful CI, append:

```text
===== CD / KUBERNETES LOGS =====
...
```

and then:

```text
===== CD RCA =====
...
```

The final `ci.log` must contain:

```text
CI logs
CI RCA
CD/Kubernetes logs
CD RCA
```

The CD Gemini analysis must receive the **entire updated `ci.log`**, so it has access to both CI and CD context.

### `failure_analysis.py`

Extend the existing script rather than creating another Python script.

Support a CD mode, e.g.:

```bash
python failure_analysis.py --type cd --log ci.log
```

Reuse the existing Gemini integration.

Add a dedicated Kubernetes/SRE prompt that analyzes:

* deployment status
* root cause
* severity
* confidence
* affected resources/pods
* Kubernetes events
* container errors
* rollout issues
* evidence
* remediation

Do not invent evidence.

Keep existing CI behavior unchanged.

### CI failure handling

If CI fails:

1. Generate `ci.log`.
2. Send the complete `ci.log` to Gemini for CI RCA.
3. Do NOT run CD.
4. Exit the workflow with failure.

### CI success

If CI succeeds:

1. Run the existing CD/EKS deployment.
2. Collect read-only Kubernetes diagnostics:

   * deployments
   * pods
   * pod descriptions
   * container status/restarts
   * container logs
   * events
   * rollout status
3. Append them to `ci.log`.
4. Run CD analysis using the existing `failure_analysis.py`.
5. Send the **entire `ci.log`** to Gemini.
6. Append the CD RCA to `ci.log`.
7. Upload the final `ci.log` as an artifact.

If CD fails, still collect logs and run the CD RCA before the workflow ultimately reports failure.

### Constraints

Do NOT add:

* another workflow
* another Gemini integration
* `analyze-cd.py`
* MCP
* Java code
* Kubernetes manifests
* Helm
* ArgoCD
* automatic remediation

First inspect the existing `test.yml` and `failure_analysis.py`, then make the **minimum changes required** to add this CD functionality while preserving the existing CI implementation.

