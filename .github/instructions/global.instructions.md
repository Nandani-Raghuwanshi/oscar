---
description: a global instruction file that applies to all files in the project, providing general context and guidelines for AI interactions.
applyTo: '**/*' # applies to all files in the project
# applyTo: 'Describe when these instructions should be loaded' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---
# Global Instructions for AI Interactions
Rules:
1. Implement **only minimal, production-ready code**.
2. Follow **DRY** principles at all times.
3. All documentation must live in the **/docs** folder.
4. For every change:
   - Create or update a **specific MD file** in `/docs` (no summary or catch-all docs).
   - Update **README.md** to link to the relevant doc.
5. **README.md must stay minimal**:
   - High-level pointers only
   - Links to docs
   - An up-to-date **To-Do list**
6. Keep the **To-Do list current** as work progresses.

Avoid:
- Duplicate documentation
- Summary/overview MD files
- Long explanations in README.md