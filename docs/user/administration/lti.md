# LTI 1.3 integration

BitsyGrader implements the service-side parts of LTI Advantage. JupyterHub’s LTI authenticator remains responsible for validating launches and establishing the user session.

## Required endpoints and credentials

Configure:

- the LMS/platform base URL;
- OAuth 2 token URL;
- LTI services URL used for AGS line items;
- optional explicit NRPS URL;
- client ID and platform type (`moodle` or `canvas`);
- an RSA private key used to sign the client assertion.

The OAuth token request asks for line-item, result, score, and context-membership scopes.

## Roster synchronization

When the scheduled task is enabled, BitsyGrader:

1. selects active local courses;
2. requests the NRPS membership list for each course’s LTI ID;
3. creates or updates local users;
4. maps instructor roles to `INSTRUCTOR` and other members to `STUDENT`;
5. creates or reactivates enrollments;
6. deactivates enrollments absent from the current LMS roster.

The synchronization interval accepts a number followed by `m`, `h`, or `d`, such as `5m` or `1h`.

!!! caution

    Give every LTI-managed course a valid `lti_id`. The current scheduler considers all active courses, including manually created courses without an LTI ID.

## Assignments and grades

With assignment-level LTI synchronization enabled, creation adds an AGS line item and stores its remote ID. After grading, BitsyGrader computes the achieved score from local cell grades, scales it to the remote maximum when necessary, and submits it for the user’s LMS identifier.

An LTI grade failure is logged and captured by observability backends, but it does not roll back the locally stored grade.