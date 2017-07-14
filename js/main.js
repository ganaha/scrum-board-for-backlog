(function() {

    "use strict";

    var app = new Vue({
        el: "#app",
        data: {
            CONFIGS: {
                API_KEY: "",
                PROJECT_KEY: "",
                BASE_URL: "",
                API: {
                    VERSION: "/api/v2/projects/:projectIdOrKey/versions",
                    ISSUES: "/api/v2/issues",
                    ICON: "/api/v2/users/:userId/icon"
                },
                PAGE: {
                    VIEW: '/view/'
                }
            },
            versions: [],
            version: 0,
            isLoading: false,
            productBacklogs: [],
            todo: [],
            doing: [],
            done: []
        },
        created: function() {
            var _this = this;



            var port = chrome.runtime.connect({
                name: chrome.runtime.id
            });
            // @see background.js#chrome.runtime.onMessage.addListener
            port.postMessage();
            port.onMessage.addListener(function(res) {
                console.log("main.js");
            });




            this.getVersions().then(function(results) {
                _this.versions = results;
            }).catch(function(err) {
                console.log(err);
            });
        },
        methods: {
            refresh: function() {
                var _this = this;
                if (!this.version) {
                    this.getVersions().then(function(results) {
                        _this.versions = results;
                    }).catch(function(err) {
                        console.log(err);
                    });
                    return;
                }
                this.isLoading = true;
                this.getIssues(this.version).then(function(res) {
                    _this.productBacklogs = res;
                    return res;
                }).then(function(res) {
                    return _this.getChildIssues(res);
                }).then(function(res) {
                    _this.sprintBacklogs = res;
                    _this.todo = _this.filterTodo(res);
                    _this.doing = _this.filterDoing(res);
                    _this.done = _this.filterDone(res);
                    _this.isLoading = false;
                });
            },
            filterTodo: function(records) {
                if (records.length === 0) return [];
                return records.filter(function(val) {
                    return val.status.id === 1;
                });
            },
            filterDoing: function(records) {
                if (records.length === 0) return [];
                return records.filter(function(val) {
                    return val.status.id === 2;
                });
            },
            filterDone: function(records) {
                if (records.length === 0) return [];
                return records.filter(function(val) {
                    return val.status.id === 3 || val.status.id === 4;
                });
            },
            getVersions: function() {
                return axios.get(this.CONFIGS.BASE_URL + this.CONFIGS.API.VERSION.replace(/:projectIdOrKey/, this.CONFIGS.PROJECT_KEY), {
                    params: {
                        apiKey: this.CONFIGS.API_KEY
                    }
                }).then(function(res) {
                    return res.data;
                });
            },
            getIssues: function(version) {
                if (!version || !version.projectId || !version.id) return [];
                return axios.get(this.CONFIGS.BASE_URL + this.CONFIGS.API.ISSUES, {
                    params: {
                        apiKey: this.CONFIGS.API_KEY,
                        projectId: [version.projectId],
                        milestoneId: [version.id],
                        sort: "created",
                        order: "asc"
                    }
                }).then(function(res) {
                    return res.data;
                });
            },
            getChildIssues: function(issues) {
                if (issues.length === 0) return [];
                var parents = issues.map(function(val) {
                    return val.id;
                });
                var params = new URLSearchParams();
                params.append('apiKey', this.CONFIGS.API_KEY);
                params.append('sort', "created");
                params.append('order', "asc");
                params.append('count', 100);
                parents.forEach(function(v, i) {
                    params.append('parentIssueId[' + i + ']', v);
                });
                return axios.get(this.CONFIGS.BASE_URL + this.CONFIGS.API.ISSUES, {
                    params: params
                }).then(function(res) {
                    return res.data;
                });
            },
            totalEstimatedHours: function(records) {
                if (records.length === 0) return 0;
                return records.map(function(val) {
                    return val.estimatedHours;
                }).reduce(this._sum);
            },
            _sum: function(a, b) {
                return a + b;
            }
        }
    });

})();
