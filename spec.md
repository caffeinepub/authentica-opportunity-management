# Authentica Opportunity Management

## Current State
The app has a full admin page accessible via Shield icon in the sidebar. It includes:
- User management (list users, remove users, change roles)
- Role system (admin/confidential/user/guest)
- Confidential file permissions per user
- Configurable user cap (default 3)

Corresponding backend endpoints: setMaxUsers, getMaxUsers, listAllUsersWithRoles, removeUser, makeAdmin, assignConfidentialRole, demoteToUser, setFileConfidential, grantFileAccess, revokeFileAccess, listFilePermissions, listAllFileRecordsAdmin, restoreCallerRole.

## Requested Changes (Diff)

### Add
- postupgrade logic to delete user named 'test' from userProfiles and stableUserRoles

### Modify
- Backend: remove all admin-only public functions listed above (keep getMaxUsers for UserContext cap check)
- Frontend App.tsx: remove adminRoute and AdminPage import
- Frontend Sidebar.tsx: remove Shield icon and Admin nav link
- Frontend useQueries.ts: remove admin-related hooks (useAdminAllFileRecords, useFilePermissions, useSetFileConfidential, useGrantFileAccess, useRevokeFileAccess, useMakeAdmin, useAssignConfidentialRole, useDemoteToUser)

### Remove
- src/frontend/src/pages/AdminPage.tsx
- src/frontend/src/components/FilePermissionsSection.tsx

## Implementation Plan
1. Modify backend main.mo: add test-user-deletion in postupgrade; remove all admin-only public functions
2. Update App.tsx: remove adminRoute and AdminPage
3. Update Sidebar.tsx: remove Admin link and Shield import
4. Update useQueries.ts: remove admin hooks
5. Delete AdminPage.tsx and FilePermissionsSection.tsx (they will no longer be imported)
6. Validate frontend build
