# Troubleshooting

## BYTE Grader does not appear in JupyterLab

Check both extension layers:

```bash
jupyter server extension list
jupyter labextension list
```

Confirm that the Python package is installed in the Jupyter Server environment and rebuild the frontend with `jlpm build`. Browser developer tools should show the extension activation message or an import error.

## Requests return 401 or 403

- Confirm the browser session is authenticated through JupyterHub.
- Check `JUPYTERHUB_API_TOKEN`, `JUPYTERHUB_API_URL`, and service role scopes.
- For 403 responses, verify the user’s active course enrollment and role.
- Check course activity, assignment visibility, due-date, late-submission, and resubmission policies.
- Use the response request ID to search service logs.

## The service fails during startup

If the error says no executor class is configured, set `AutogradeConfig.executor_class`. The current service initializes autograding even when its feature flag is false.

For database errors, verify the SQLAlchemy URI, connectivity, credentials, and schema privileges. For LTI errors, verify that the private key exists and that every required endpoint is configured.

## Fetch succeeds but files are missing

BitsyGrader matches files by stored relative filename and writes them below the course/assignment directory. Check the Jupyter Server process working directory and permissions. Filenames rejected by path sanitization are logged and skipped.

When fetching solutions, existing local solution files are not overwritten.

## Submission contains no notebooks

The local bridge recursively selects files ending in `.ipynb` below the assignment directory. Confirm that notebooks retain the filenames distributed with the assignment and are stored below the expected path.

## A submission remains “Submitted”

Check whether the autograding service and workers started, then inspect executor logs. The queue is in memory and has no restart recovery. A service restart or worker exception can leave a database submission without an active grading job.

For systemd execution, inspect the transient unit and journal, ensure the service can call `systemd-run`, and verify access to the configured job and runtime directories.

## LTI synchronization fails

Validate the platform URL, token endpoint, client ID, private key, service URLs, and granted OAuth scopes. Ensure each active synchronized course has an LTI ID. Moodle and Canvas use different line-item and membership URL forms, so confirm the configured platform type.