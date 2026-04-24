# Governance Context

Contains operational governance and admin-only capabilities.

## Submodules

- `admin/`: role and status governance, admin management
- `audit-log/`: centralized write/read strategy for audit events
- `activity/`: activity feed and timeline projections
- `bulk-action/`: batch mutation orchestration with per-item result tracking
- `dashboard/`: aggregated metrics for admin panel

## Migration Note

Current runtime routes still use legacy modules. New work should target governance context first.
