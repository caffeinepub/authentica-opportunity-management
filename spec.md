# Authentica Opportunity Management

## Current State
- Opportunities have: id, name, stage, value, closeDate, summary, createdAt
- No 'type of help' field exists
- Opportunity creation form, overview tab, and Kanban pipeline cards do not display help types

## Requested Changes (Diff)

### Add
- `helpTypes: [Text]` field to Opportunity (multi-select: user growth/marketing, product development, capital)
- Backend: versioned migration (InternalOpportunityV2 with helpTypes, migrate from V1)
- Opportunity creation form: multi-select checkboxes for help types
- Opportunity overview tab: editable multi-select for help types
- Kanban pipeline cards: show small colored badges per selected help type

### Modify
- `createOpportunity` backend function to accept `helpTypes: [Text]` parameter
- `updateOpportunity` backend function to accept `helpTypes: [Text]` parameter
- `Opportunity` and `InternalOpportunity` types to include `helpTypes: [Text]`
- `backend.d.ts` to reflect new Opportunity shape and updated function signatures

### Remove
- Nothing removed

## Implementation Plan
1. Add `InternalOpportunityV1` type alias for old shape
2. Add `helpTypes: [Text]` to `InternalOpportunity` and `Opportunity` types
3. Add `opportunitiesV2` stable var for migrated opportunities; add `opportunitiesV2Migrated` flag
4. Migrate `opportunities` -> `opportunitiesV2` in postupgrade (defaulting helpTypes to [])
5. Update `createOpportunity`, `updateOpportunity`, `getOpportunity`, `listOpportunities` to use V2
6. Update `backend.d.ts`: add helpTypes to Opportunity, update createOpportunity/updateOpportunity signatures
7. Frontend: add multi-select help type picker to creation form
8. Frontend: add editable multi-select to opportunity overview tab
9. Frontend: render small badges on Kanban pipeline cards
