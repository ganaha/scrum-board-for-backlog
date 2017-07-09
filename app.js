var configs = {
    API_KEY: "",
    PROJECT_KEY: "",
    BASE_URL: "https://.backlog.jp",
    API: {
        VERSION: "/api/v2/projects/:projectIdOrKey/versions",
        ISSUES: "/api/v2/issues",
        ICON: "/api/v2/users/:userId/icon"
    },
    PAGE: {
        VIEW: '/view/'
    }
};

Vue.component('card', {
    props: ['card'],
    template: '#card-template'
});
Vue.component('cards', {
    props: ['title', 'group', 'cards', 'total', 'type'],
    template: '#cards-template'
});

var app = new Vue({
    el: "#app",
    created: function() {
        var _this = this;
        this.getVersions().then(function(results) {
            _this.versions = results;
        }).catch(function(err) {
            console.log(err);
        });
    },
    data: {
        versions: [],
        version: 0,
        isLoading: false,
        productBacklogs: [],
        sprintBacklogs: []
    },
    computed: {
        todo: function() {
            if (this.sprintBacklogs.length === 0) return [];
            return this.sprintBacklogs.filter(function(val) {
                return val.status.id === 1;
            });
        },
        doing: function() {
            if (this.sprintBacklogs.length === 0) return [];
            return this.sprintBacklogs.filter(function(val) {
                return val.status.id === 2;
            });
        },
        done: function() {
            if (this.sprintBacklogs.length === 0) return [];
            return this.sprintBacklogs.filter(function(val) {
                return val.status.id === 3 || val.status.id === 4;
            });
        },
        totalProductBacklogs: function() {
            if (this.productBacklogs.length === 0) return 0;
            return this.productBacklogs.map(function(val) {
                return val.estimatedHours;
            }).reduce(this._sum);
        },
        totalTodo: function() {
            if (this.todo.length === 0) return 0;
            return this.todo.map(function(val) {
                return val.estimatedHours;
            }).reduce(this._sum);
        },
        totalDoing: function() {
            if (this.doing.length === 0) return 0;
            return this.doing.map(function(val) {
                return val.estimatedHours;
            }).reduce(this._sum);
        },
        totalDone: function() {
            if (this.done.length === 0) return 0;
            return this.done.map(function(val) {
                return val.estimatedHours;
            }).reduce(this._sum);
        }
    },
    methods: {
        refresh: function() {
            var _this = this;
            this.isLoading = true;
            this.getIssues(this.version).then(function(res) {
                _this.productBacklogs = res;
                return res;
            }).then(function(res) {
                return _this.getChildIssues(res);
            }).then(function(res) {
                _this.sprintBacklogs = res;
                _this.isLoading = false;
            });
        },
        getVersions: function() {
            return axios.get(configs.BASE_URL + configs.API.VERSION.replace(/:projectIdOrKey/, configs.PROJECT_KEY), {
                params: {
                    apiKey: configs.API_KEY
                }
            }).then(function(res) {
                return res.data;
            });
        },
        getIssues: function(version) {
            return axios.get(configs.BASE_URL + configs.API.ISSUES, {
                params: {
                    apiKey: configs.API_KEY,
                    milestoneId: [version],
                    sort: "created",
                    order: "asc"
                }
            }).then(function(res) {
                return res.data;
            });
        },
        getChildIssues: function(issues) {
            var parents = issues.map(function(val) {
                return val.id;
            });
            return axios.get(configs.BASE_URL + configs.API.ISSUES, {
                params: {
                    apiKey: configs.API_KEY,
                    parentIssueId: parents,
                    sort: "created",
                    order: "asc"
                }
            }).then(function(res) {
                return res.data;
            });
        },
        _sum: function(a, b) {
            return a + b;
        }
    }
});
