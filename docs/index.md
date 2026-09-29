# BitsyGrader

<div markdown>

BitsyGrader is a JupyterHub service for distributing notebook assignments, grading submissions in an isolated environment, and synchronizing courses and grades with an LMS through LTI 1.3.

The name comes from Bitsy, the BYTE Challenge mascot. Install the `bitsygrader` package and use either `bitsygrader` or its CLI shorthand, `bgrader`.

In JupyterLab, the menu and command-palette categories retain the familiar **BYTE Grader** label.

</div>


## Documentation

<div class="audience-grid" markdown>

<div class="audience-card" markdown>

### User documentation

For people who install, operate, teach with, or study through BitsyGrader.

- [Understand the workflow](user/index.md)
- [Install BitsyGrader](user/installation.md)
- [Connect an LMS](user/lms/index.md)
- [Teach a course](user/instructors.md)
- [Complete an assignment](user/students.md)
- [Configure and operate the service](user/configuration.md)

</div>

<div class="audience-card" markdown>

### Developer documentation

For contributors working on the Python service, Jupyter extensions, execution backends, or documentation.

- [Set up a development environment](developer/index.md)
- [Understand the architecture](developer/architecture.md)
- [Navigate the codebase](developer/project-structure.md)
- [Use the API and data model](developer/api.md)

</div>

</div>

## What BitsyGrader does

An instructor prepares an nbgrader-compatible notebook and publishes it to a course. Students fetch and submit the assignment from JupyterLab. BitsyGrader reconstructs each submission with instructor-owned tests, sends it to the configured executor, stores the result, and can pass the grade back to the LMS.

BitsyGrader currently includes platform adapters for **Moodle** and **Canvas**.

## Why BitsyGrader was developed

BitsyGrader builds on the notebook format and many of the ideas established by [nbgrader](https://nbgrader.readthedocs.io/). nbgrader is a capable tool for creating, distributing, collecting, and grading notebook assignments. BitsyGrader exists because the environment in which it needed to run followed a different operating model.

The BYTE Challenge needed a central JupyterHub service that could treat an LMS as the source of truth for identities, courses, roles, and grades while executing code submitted by students with an explicit isolation boundary.

| Requirement | Why the existing model did not fit | BitsyGrader's approach |
| --- | --- | --- |
| LMS integration | nbgrader does not provide an end-to-end LTI 1.3 workflow for launches, rosters, assignments, and grade passback. | LTI Advantage integration uses NRPS for membership and AGS for assignments and grades. |
| Multiple courses and roles | The required deployment needed one central service for many LMS courses, with administrator, instructor, and student permissions derived from the platform. | BitsyGrader stores courses and enrollments centrally and applies role-aware authorization policies. |
| Isolated autograding | nbgrader can be combined with Docker-based execution, but isolation is not a first-class, interchangeable service boundary in its default workflow. | BitsyGrader delegates grading to configurable executors so the isolation model can match the deployment. |
| Synchronized operation | Maintaining separate users, course membership, and grades in JupyterHub and the LMS would create duplicate administrative work. | Scheduled roster synchronization and grade passback keep BitsyGrader aligned with the LMS. |

This is not a claim that nbgrader chose the wrong architecture. It was just built for a different setup.

## Developed within the BYTE Challenge

[BYTE Challenge](https://byte-challenge.de/) is a nonprofit educational project that gives young people free access to interactive learning in computer science and digital skills, independent of their school, background, or budget.

BitsyGrader began when the project wanted to offer new Python programming courses in which students could write and test real code in a secure environment. JupyterHub provided an accessible, browser-based development environment, but the surrounding assignment and grading workflow did not fit the project's LMS-centered infrastructure. BitsyGrader was created to connect those pieces: the learning platform, JupyterHub, notebook assignments, isolated execution, and automated feedback.

[Learn more about the BYTE Challenge](https://byte-challenge.de/){ .md-button }
