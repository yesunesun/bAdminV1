# 🧠 Special Instructions to the Model

## 📁 Knowledge Base

Use the following files located in `/kb`:

- `search_components_data_flow.pdf` — Search component architecture and data flow  
- `Homepage Search Component.pdf` — Homepage search UI/component structure  
- `db_database.txt` — Database schema and all relevant DB functions  
- `btadmin_dependencies.txt` — File/module dependency graph  
- `btadmin_all_files.txt` — Comprehensive file list

---

## 🗂 Active Task File Maintenance

Maintain the following active files in the `tasks/` directory for the entire duration of this task:

1. `property_search_todo.md`  
   - A prioritized checklist of subtasks  
   - Mark each step as complete with timestamps  
   - Keep this file updated after every subtask

2. `property_search_plan.md`  
   - Log all architecture decisions, diagrams, implementation notes, debug logs, and test coverage  
   - Append all findings and resolutions here throughout the task

3. `property_search_context.md`  
   - Summarize final context and conclusions after completing steps  
   - Include assumptions, architectural insights, mappings, resolved bugs, etc.  
   - This ensures no rediscovery is needed if the task is resumed later or passed to someone else

### ✅ Log Progress

- Every technical/design decision → `tasks/property_search_plan.md`  
- Every completed step → `tasks/property_search_todo.md`  
- Finalized task understanding → `tasks/property_search_context.md`  

These files are considered **active** and must be maintained until the task is 100% complete.

---

# 🔧 Main Task: Homepage Property Search – Fix & Redesign

The homepage property search feature is implemented but **not working as expected**. You are responsible for fixing the core search functionality, synchronizing the Google Map display, and redesigning the UI for better user experience.

---

## 🎯 Goal

- Ensure accurate search results based on filters  
- Update both the **property list** and **Google Map markers** in real time  
- Redesign the search filter UI, which is currently unclear and defaulted to "All" without labels

---

## 🔢 Prioritized Tasks

### 1. Fix Search Logic
- Debug backend and DB functions
- Ensure each filter parameter translates to a working query
- Return only accurate and relevant properties

### 2. Improve Filter UI
- Add descriptive labels to filters  
- Replace default "All" with contextual placeholders  
- Organize filters logically (e.g., grouped or collapsible sections)  
- Clearly indicate active filters in the UI

### 3. Ensure Map and List Sync
- Show only filtered property markers on the map  
- Keep the property list and Google Map in sync after every search

### 4. Test Filter Scenarios
- Validate using multiple real-world combinations  
- Confirm expected listings and map markers are displayed correctly

### 5. Log and Persist Progress
- Log technical findings → `property_search_plan.md`  
- Mark off completed work → `property_search_todo.md`  
- Save distilled context for future work → `property_search_context.md`

---

## 🧪 Example Search Scenarios

### ✅ Scenario 1
- Type: Residential → Apartment  
- Transaction: Buy  
- Price: ₹25L–₹50L  
- Location: Bangalore  

**Expected:** Relevant apartments shown on both the list and map views.

---

### ✅ Scenario 2
- Type: PG/Hostel → Double Sharing  
- Transaction: Rent  
- Location: Mumbai  

**Expected:** Matching PG listings visible in both list and map results.

---

## 📦 Final Deliverables

- Fully functioning homepage search feature  
- Responsive, intuitive, and well-labeled filter UI  
- Synced map markers with filtered property list  
- Completed and updated task files:
  - `tasks/property_search_todo.md`  
  - `tasks/property_search_plan.md`  
  - `tasks/property_search_context.md`  
- Final summary of:
  - Changed code and files  
  - Affected services and flows  
  - UI/UX improvements
