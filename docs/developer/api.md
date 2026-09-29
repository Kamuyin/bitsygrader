# HTTP API

The central API is mounted below `JUPYTERHUB_SERVICE_PREFIX`. The Jupyter Server extension exposes a corresponding local API below `/bitsygrader` and adapts file operations to the user workspace.

All central endpoints require JupyterHub authentication. Successful JSON responses use:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Errors use an HTTP error status and include a request ID:

```json
{
  "error": {
    "code": 400,
    "message": "Invalid request",
    "request_id": "…"
  }
}
```

## Authentication

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/auth/whoami` | Return the resolved local user and administrator flag |

## Courses

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/courses` | authenticated | List visible courses and scoped permissions |
| `POST` | `/courses/create` | `course:create` | Create a course from JSON |
| `PATCH` | `/courses/{course_id}/update` | `course:edit` | Update title, LTI ID, or active state |
| `DELETE` | `/courses/{course_id}/delete` | `course:delete` | Delete a course and cascading records |

Course labels must be alphanumeric.

## Assignments

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/courses/{course_id}/assignments` | authenticated | List assignments visible to the current user |
| `POST` | `/courses/{course_id}/assignments/create` | `assignment:create` | Create from multipart metadata, notebooks, and assets |
| `GET` | `/courses/{course_id}/assignments/{assignment_id}/fetch` | `assignment:fetch` | Return metadata and files as `multipart/mixed` |
| `DELETE` | `/courses/{course_id}/assignments/{assignment_id}/delete` | `assignment:delete` | Delete an assignment |

Pass `solution=true` to the fetch endpoint to request instructor sources. This performs the additional `assignment:fetch_solution` policy check.

Creation expects a `metadata` form field containing JSON, one or more `notebooks` file fields, and optional `assets` file fields. The local Jupyter Server API accepts JSON file references and constructs this multipart request itself.

## Submissions

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| `POST` | `/courses/{course_id}/assignments/{assignment_id}/submit` | `assignment:submit` | Submit one or more notebook files as multipart data |

The submission policy checks course and assignment visibility, due-date/late-submission rules, enrollment, and resubmission rules. Accepted submissions receive `201 Created`; grading continues asynchronously.

## Permission payloads

List endpoints return permission data alongside resources:

```json
{
  "global": ["course:create"],
  "scoped": {
    "course-or-assignment-id": ["course:view", "course:edit"]
  }
}
```

Clients should use this payload to drive interface availability, but the server remains the authority and checks permissions on every protected operation.

