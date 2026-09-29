import { ILabShell, ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin } from "@jupyterlab/application";
import { ICommandPalette, MainAreaWidget, WidgetTracker } from "@jupyterlab/apputils";
import { PageConfig } from "@jupyterlab/coreutils";
import { IMainMenu } from '@jupyterlab/mainmenu';
import { INotebookTracker } from '@jupyterlab/notebook';
import { INotebookShell } from "@jupyter-notebook/application";
import { INotebookTree } from "@jupyter-notebook/tree";
import { Menu } from '@lumino/widgets';
import { CoursesListWidget } from "./widgets/CoursesListWidget";
import { AssignmentsListWidget } from "./widgets/AssignmentsListWidget";
import { AssignmentModeManager } from './assignment-creation';
import { PLUGIN_ID, COMMAND_IDS, EXTENSION_LABEL } from './constants';

const bitsygraderPlugin: JupyterFrontEndPlugin<void> = {
    id: PLUGIN_ID,
    autoStart: true,
    requires: [IMainMenu],
    optional: [ICommandPalette, ILabShell, INotebookShell, ILayoutRestorer, INotebookTree, INotebookTracker],
    activate: (
        app: JupyterFrontEnd,
        mainMenu: IMainMenu,
        palette: ICommandPalette | null,
        labShell: ILabShell | null,
        notebookShell: INotebookShell | null,
        restorer: ILayoutRestorer | null,
        notebookTree: INotebookTree | null,
        notebookTracker: INotebookTracker | null
    ) => {

        let isLabEnvironment = false;
        let isNotebookTreePage = false;
        let isNotebookEditPage = false;

        if (labShell) {
            isLabEnvironment = true;
        } else if (notebookShell) {
            const page = PageConfig.getOption('notebookPage');
            if (page === 'tree') {
                isNotebookTreePage = true;
            } else if (page === 'notebooks') {
                isNotebookEditPage = true;
            }
        }

        if (!(isLabEnvironment || isNotebookTreePage || isNotebookEditPage)) {
            console.error('Unsupported environment');
            return;
        }

        const coursesListTracker = new WidgetTracker<MainAreaWidget<CoursesListWidget>>({
            namespace: 'bitsygrader-courses-list'
        });

        const assignmentsListTracker = new WidgetTracker<MainAreaWidget<AssignmentsListWidget>>({
            namespace: 'bitsygrader-assignments-list'
        });

        let coursesListWidget: MainAreaWidget<CoursesListWidget> | null = null;
        let assignmentsListWidget: MainAreaWidget<AssignmentsListWidget> | null = null;

        app.commands.addCommand(COMMAND_IDS.openCoursesList, {
            label: 'My Courses',
            caption: 'View and manage your courses',
            execute: () => {
                if (!coursesListWidget || coursesListWidget.isDisposed) {
                    const content = new CoursesListWidget(app);
                    coursesListWidget = new MainAreaWidget({ content });
                    coursesListWidget.id = 'bitsygrader-courses-list';
                    coursesListWidget.addClass('bitsygrader-mainarea-widget');
                    coursesListWidget.title.label = 'My Courses';
                    coursesListWidget.title.caption = 'View and manage your courses';
                    coursesListWidget.title.closable = true;
                }

                if (!coursesListTracker.has(coursesListWidget)) {
                    coursesListTracker.add(coursesListWidget);
                }

                if (!coursesListWidget.isAttached) {
                    if (notebookTree) {
                        notebookTree.addWidget(coursesListWidget);
                        notebookTree.currentWidget = coursesListWidget;
                    } else {
                        app.shell.add(coursesListWidget, 'main');
                    }
                }

                coursesListWidget.content.update();
                app.shell.activateById(coursesListWidget.id);
            }
        });

        app.commands.addCommand(COMMAND_IDS.openAssignmentsList, {
            label: 'Assignment List',
            caption: 'View and manage assignments',
            execute: (args?: any) => {
                const courseId = args?.courseId;
                
                if (!assignmentsListWidget || assignmentsListWidget.isDisposed) {
                    const content = new AssignmentsListWidget(app, courseId);
                    assignmentsListWidget = new MainAreaWidget({ content });
                    assignmentsListWidget.id = 'bitsygrader-assignments-list';
                    assignmentsListWidget.addClass('bitsygrader-mainarea-widget');
                    
                    assignmentsListWidget.title.label = 'Assignments';
                    
                    assignmentsListWidget.title.caption = 'View and manage assignments';
                    assignmentsListWidget.title.closable = true;
                } else {
                    if (courseId) {
                        assignmentsListWidget.content.setCourse(courseId);
                    }
                }

                if (!assignmentsListTracker.has(assignmentsListWidget)) {
                    assignmentsListTracker.add(assignmentsListWidget);
                }

                if (!assignmentsListWidget.isAttached) {
                    if (notebookTree) {
                        notebookTree.addWidget(assignmentsListWidget);
                        notebookTree.currentWidget = assignmentsListWidget;
                    } else {
                        app.shell.add(assignmentsListWidget, 'main');
                    }
                }

                assignmentsListWidget.content.update();
                app.shell.activateById(assignmentsListWidget.id);
            }
        });

        let modeManager: AssignmentModeManager | null = null;

        if (notebookTracker) {
            modeManager = new AssignmentModeManager(notebookTracker);

            app.commands.addCommand(COMMAND_IDS.toggleAssignmentCreationMode, {
                label: 'Assignment Creation Mode',
                caption: 'Toggle assignment creation mode to configure cell grading metadata',
                isToggled: () => modeManager?.isActive ?? false,
                isEnabled: () => notebookTracker.currentWidget !== null,
                execute: () => {
                    modeManager?.toggle();
                }
            });
        }

        const bitsygraderMenu = new Menu({ commands: app.commands });
        bitsygraderMenu.id = 'jp-mainmenu-bitsygrader';
        bitsygraderMenu.title.label = EXTENSION_LABEL;

        if (isLabEnvironment || isNotebookTreePage) {
            bitsygraderMenu.addItem({
                command: COMMAND_IDS.openCoursesList,
                type: 'command'
            });

            bitsygraderMenu.addItem({
                command: COMMAND_IDS.openAssignmentsList,
                type: 'command'
            });
        }

        if (modeManager && (isLabEnvironment || isNotebookEditPage)) {
            bitsygraderMenu.addItem({ type: 'separator' });
            bitsygraderMenu.addItem({
                command: COMMAND_IDS.toggleAssignmentCreationMode,
                type: 'command'
            });
        }

        if (bitsygraderMenu.items.length > 0) {
            mainMenu.addMenu(bitsygraderMenu);
        }

        if (palette && (isLabEnvironment || isNotebookTreePage)) {
            const category = EXTENSION_LABEL;

            palette.addItem({
                command: COMMAND_IDS.openCoursesList,
                category
            });

            palette.addItem({
                command: COMMAND_IDS.openInstructorTools,
                category
            });
        }

        if (palette && modeManager) {
            palette.addItem({
                command: COMMAND_IDS.toggleAssignmentCreationMode,
                category: EXTENSION_LABEL
            });
        }

        if (restorer) {
            restorer.restore(coursesListTracker, {
                command: COMMAND_IDS.openCoursesList,
                name: () => 'bitsygrader-courses-list'
            });

            restorer.restore(assignmentsListTracker, {
                command: COMMAND_IDS.openAssignmentsList,
                name: () => 'bitsygrader-assignments-list'
            });
        }

        console.debug('BitsyGrader extension activated successfully!');
        console.debug(`Environment: Lab=${isLabEnvironment}, NotebookTree=${isNotebookTreePage}, NotebookEdit=${isNotebookEditPage}`);
    }
};

export default bitsygraderPlugin;
