# 🛠️ Debugging Rules

Apply these rules strictly when writing or refactoring code involving debugging logic.

---

## 1. 🚫 No Debug Code in Functional Files
- Do **not** include debugging code (e.g., `console.log`, debug props, UI toggles) directly inside functional files such as:
  - Forms (`Form.tsx`)
  - Logic handlers (`index.tsx`, services)
  - Core components

---

## 2. 📂 Use Dedicated Debug Files Only
- Always isolate debug logic in **separate files**.
- Examples:
  - `DebugPanel.tsx`
  - `FlowDebugger.tsx`
  - `debugUtils.ts`
  - `useDebugLogger.ts`

---

## 3. ♻️ Reuse Existing Debug Components
- Before creating a new debug component or utility:
  - Search for existing tools/components (e.g., `DebugPanel`, `FlowDebugger`).
  - **Do not create redundant or duplicate code.**
  - Extend only if necessary and ensure the extension integrates well.

---

## 4. 🔒 Dev-Only Inclusion
- Ensure all debug-related code is:
  - **Conditionally included** using environment checks:
    ```ts
    if (process.env.NODE_ENV === 'development') {
      // include debug tools
    }
    ```
  - **Never included in production builds**.

---
