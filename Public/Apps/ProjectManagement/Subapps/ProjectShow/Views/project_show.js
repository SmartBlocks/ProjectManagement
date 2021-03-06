define([
    'jquery',
    'underscore',
    'backbone',
    'text!../Templates/project_show.html',
    './deadline_thumb',
    'datejs',
    './tasks_list',
    '../../Views/timeline',
    './users_popup',
    './user_thumb'
], function ($, _, Backbone, project_show_tpl, DeadlineThumb, datejs, TasksListView, TimelineView, UsersPopup, UserThumb) {
    var View = Backbone.View.extend({
        tagName: "div",
        className: "project_show",
        initialize: function (obj) {
            var base = this;
            base.project = obj.model;
            base.events = $.extend({}, Backbone.Events);
        },
        init: function () {
            var base = this;

            base.render();

        },
        render: function () {
            var base = this;

            var template = _.template(project_show_tpl, {
                project: base.project
            });
            base.$el.html(template);
            base.registerEvents();
            base.renderDeadlines();

            var timeline = new TimelineView();
            base.$el.find(".project_dashboard").html(timeline.$el);
            timeline.init(base.project.getTasks());
            base.timeline = timeline;

            base.renderUsers();
        },
        renderDeadlines: function () {
            var base = this;
            base.$el.find('.deadlines').html('');
            var deadlines = base.project.getDeadlines();
            for (var k in deadlines) {
                var deadline_thumb = new DeadlineThumb({model: deadlines[k]});
                base.$el.find('.deadlines').append(deadline_thumb.$el);
                deadline_thumb.init();
            }

        },
        renderUsers: function () {
            var base = this;
            var users = base.model.getAllParticipants();
            base.$el.find(".participants_list").html("");

            for (var k in users.models) {
                var user = users.models[k];

                var user_thumb = new UserThumb({
                    model: user
                });
                base.$el.find(".participants_list").append(user_thumb.$el);

                user_thumb.init();
            }
            base.$el.find(".participants_list").append('<div class="clearer"></div>');
        },
        registerEvents: function () {
            var base = this;
            base.$el.delegate(".new_deadline_time", 'keyup', function (e) {
                var date = datejs($(this).val());
                base.$el.find('.result_date').html(SmartBlocks.Blocks.Time.Main.moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a"));

                if (e.keyCode == 13) {
                    var deadline = new SmartBlocks.Blocks.ProjectManagement.Models.Deadline();
                    deadline.set('name', base.$el.find('.new_deadline_name').val());
                    deadline.setDate(date);
                    base.$el.find('.result_date').html('');
                    base.$el.find('.result_date').html('');
                    base.$el.find('.new_deadline_time').val('');
                    base.$el.find('.new_deadline_name').val('');
                    deadline.set('project', base.project);
                    SmartBlocks.Blocks.ProjectManagement.Data.deadlines.add(deadline);
                    deadline.save();
                }
            });

            base.$el.delegate('.add_deadline_button', 'click', function (e) {
                var date = datejs(base.$el.find('.new_deadline_time').val());
                base.$el.find('.result_date').html(SmartBlocks.Blocks.Time.Main.moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a"));

                if (e.keyCode == 13) {
                    var deadline = new SmartBlocks.Blocks.ProjectManagement.Models.Deadline();
                    deadline.set('name', base.$el.find('.new_deadline_name').val());
                    deadline.setDate(date);
                    base.$el.find('.result_date').html('');
                    base.$el.find('.result_date').html('');
                    base.$el.find('.new_deadline_time').val('');
                    base.$el.find('.new_deadline_name').val('');
                    deadline.set('project', base.project);
                    SmartBlocks.Blocks.ProjectManagement.Data.deadlines.add(deadline);
                    deadline.save();
                }
            });

            SmartBlocks.Blocks.ProjectManagement.Data.deadlines.on("add", function (deadline) {
                if (deadline.get('project').id == base.project.get('id')) {
                    base.renderDeadlines();
                }
            });

            SmartBlocks.Blocks.ProjectManagement.Data.deadlines.on("remove", function (deadline) {
                if (deadline.get('project').id == base.project.get('id')) {
                    base.renderDeadlines();
                }
            });

            base.$el.delegate('.deadline_thumb', 'click', function () {
                var id = $(this).attr("data-id");
                base.selected_deadline = SmartBlocks.Blocks.ProjectManagement.Data.deadlines.get(id);

                if (base.selected_deadline) {
                    base.$el.find(".deadline_thumb.selected").removeClass("selected");
                    $(this).addClass("selected");
                    base.events.trigger("selected_deadline", base.selected_deadline);

                }


            });

            base.$el.delegate('.deadline_thumb', 'mouseover', function () {
                var id = $(this).attr("data-id");
                var deadline = SmartBlocks.Blocks.ProjectManagement.Data.deadlines.get(id);
                if (deadline)
                    base.timeline.setTasks(deadline.getTasks());
            });

            base.$el.delegate('.deadline_thumb', 'mouseout', function () {
                base.timeline.setTasks(base.model.getTasks());
            });

            base.$el.delegate('.task', 'mouseover', function () {
                var id = $(this).attr("data-id");
                var task = SmartBlocks.Blocks.TaskManagement.Data.tasks.get(id);
                if (task)
                    base.timeline.setTasks([task]);
            });

            base.$el.delegate('.task', 'mouseout', function () {
                base.timeline.setTasks(base.model.getTasks());
            });

            base.$el.delegate('.user_thumb', 'mouseover', function () {
                var id = $(this).attr("data-id");
                var user = SmartBlocks.Blocks.Kernel.Data.users.get(id);
                if (user) {
                    var tasks = new SmartBlocks.Blocks.TaskManagement.Collections.Tasks(base.model.getTasks());
                    var filtered = tasks.filter(function (task) {
                        var events = task.getAllEvents();
                        for (var k in events) {
                            var event = events[k];
                            if (event.get('owner').id == user.get('id')) {
                                return true;
                            }
                        }
                        return false;
                    });
                    base.timeline.setTasks(filtered);
                }

            });

            base.$el.delegate('.user_thumb', 'mouseout', function () {
                base.timeline.setTasks(base.model.getTasks());
            });

            base.events.on('selected_deadline', function () {
                if (base.selected_deadline) {
                    var tasks_list_view = new TasksListView({model: base.selected_deadline});
                    base.$el.find(".tasks_list_container").html(tasks_list_view.$el);
                    tasks_list_view.init();
                } else {
                    base.$el.find(".tasks_list_container").html("");
                }
            });

            base.$el.delegate('.deadline_thumb.selected', 'click', function () {
                $(this).removeClass("selected");
                base.selected_deadline = undefined;
                base.events.trigger("selected_deadline", base.selected_deadline);
                base.timeline.setTasks(base.project.getTasks());
            });


            base.$el.delegate(".manage_participants_button", "click", function () {
                var users_popup = new UsersPopup({
                    model: base.project
                });
                base.$el.append(users_popup.$el);
                users_popup.init();
                users_popup.on("changed_users", function () {
                    base.renderUsers();
                });
            });


        }
    });

    return View;
});