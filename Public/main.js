define([
    'jquery',
    'underscore',
    'backbone',
    './Apps/ProjectManagement/Views/project_management'
], function ($, _, Backbone, ProjectManagementView) {
    var main = {
        init: function () {
            var base = this;
            SmartBlocks.Blocks.TaskManagement.Main.addTaskMainInfo(function (task) {
                var value = "";
                if (task.get("deadline_id")) {
                    var deadline = SmartBlocks.Blocks.ProjectManagement.Data.deadlines.get(task.get("deadline_id"));
                    if (deadline) {
                        value += '(' + deadline.get('name') + ')';
                    }
                }
                return value;
            });

            SmartBlocks.Blocks.TaskManagement.Main.addTaskInfo(function (task) {
                var value = "";
                if (task.get("deadline_id")) {
                    var deadline = SmartBlocks.Blocks.ProjectManagement.Data.deadlines.get(task.get("deadline_id"));
                    if (deadline) {
                        var project = deadline.getProject();
                        if (project) {
                            value += "Project : " + project.get('name');
                        }
                    }

                }
                return value;
            });
            SmartBlocks.Blocks.TaskManagement.Main.addTaskInfo(function (task) {
                var value = "";
                if (task.get("deadline_id")) {
                    var deadline = SmartBlocks.Blocks.ProjectManagement.Data.deadlines.get(task.get("deadline_id"));
                    if (deadline) {
                        value += "Deadline : " + deadline.get('name');
                    }
                }
                return value;
            });

            /**
             * This listener updates local data when notified by server.
             */
            SmartBlocks.events.on("ws_notification", function (message) {
                if (message.block == "ProjectManagement") {
                    if (message.action == "saved_project") {
                        var project = new SmartBlocks.Blocks.ProjectManagement.Models.Project(message.project);
                        SmartBlocks.Blocks.ProjectManagement.Data.projects.add(project, {merge: true});
                    }

                    if (message.action == "saved_deadline") {
                        var deadline = new SmartBlocks.Blocks.ProjectManagement.Models.Deadline(message.deadline);
                        deadline.fetch({
                            success: function () {
                                SmartBlocks.Blocks.ProjectManagement.Data.deadlines.add(deadline, {merge: true});
                            }
                        });

                    }

                    if (message.action == "deleted_project") {
                        SmartBlocks.Blocks.ProjectManagement.Data.projects.remove(message.project.id);
                    }

                    if (message.action == "deleted_deadline") {
                        SmartBlocks.Blocks.ProjectManagement.Data.deadlines.remove(message.deadline.id);
                    }
                }
            });

        },
        launch_pm: function (app) {
            console.log("launched view");
            var project_management_view = new ProjectManagementView();
            SmartBlocks.Methods.render(project_management_view.$el);
            project_management_view.init(app);
        }
    };

    return main;
});