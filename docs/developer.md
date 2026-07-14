# Developer Guide — AI Task Processing Platform

This document describes how to set up local workspaces, implement coding standards, add new task processors/API endpoints/React layouts, and execute code reviews.

---

## 🛠️ 1. Workspace Configuration

Ensure your local development environment has standard styling linters and formatters installed.

### Prettier & ESLint (Backend & Frontend)
We enforce formatting checks before builds. Install standard dependencies:
- **VS Code extensions**: ESLint, Prettier.
- **Prettier formatting command**:
  ```bash
  npm run format # executed inside backend/ or frontend/
  ```
- **Linting check command**:
  ```bash
  npm run lint
  ```

### Python PEP8 & Ruff (Worker)
The Python worker uses `ruff` for code checking and `black` for formatting:
- **Format check**:
  ```bash
  black --check src
  ```
- **Lint check**:
  ```bash
  ruff check src
  ```

---

## ➕ 2. Implementing New Features

### How to Add a New Task Type (e.g. `TEXT_TRANSLATE`)

Adding a task processor involves modifying the backend schema, updating worker processors, and configuring React inputs.

#### Step 1: Update Zod Schema and Queue Types (Backend)
1. Add the enum type inside `backend/src/validators/taskValidator.js` (or task controller schema).
2. Inside `backend/src/services/taskService.js`, verify the payload is passed correctly to the BullMQ producer.

#### Step 2: Implement the Python Worker Processor
1. Create a new file under `worker/src/processors/translate.py`:
   ```python
   def process_translation(task_id, payload):
       text = payload.get("text")
       target_lang = payload.get("target_lang", "es")
       # Execution logic
       result = {"translated_text": f"[translated to {target_lang}]: {text}"}
       return result
   ```
2. Mount the processor inside the worker routing layout in `worker/src/queue/consumer.py`:
   ```python
   from src.processors.translate import process_translation

   # In task routing loop:
   if task_type == "TEXT_TRANSLATE":
       result = process_translation(task_id, payload)
   ```

#### Step 3: Implement Frontend UI Component
1. Create/update layout input panels inside `frontend/src/components/TaskSubmitForm.jsx`.
2. Add input states (text, target language dropdown) and submit payloads.

---

## 🔄 3. Git Workflow Guidelines

We enforce a strict branching model:

### 1. Branch Naming
- Features: `feature/short-desc`
- Bug Fixes: `bugfix/short-desc`
- Hotfixes: `hotfix/short-desc`

### 2. Pull Request Checklist
Before opening a pull request to `main`:
1. Ensure all local tests pass (`npm test` and `pytest`).
2. Run linters (`npm run lint` and `black --check src`).
3. Ensure no local secrets are committed in `.env` files.
4. Verify Docker builds locally (`docker compose build`).
5. Open PR, linking corresponding Jira tickets or issue IDs.
