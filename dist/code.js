var $, Browser, CodeMode, Editor, PublishStatus, React, Tour, _, jade;

React = require('react/addons');

jade = require('jade-memory-fs');

_ = require('lodash');

$ = window.jQuery = window.$ = require('jquery');

require('./materialize');

Browser = require('./browser');

Editor = require('./editor');

PublishStatus = require('./publish_status');

Tour = require('./tour');

module.exports = CodeMode = React.createClass({
  getInitialState: function() {
    var tour_step;
    tour_step = TOUR_FINISHED ? 1000 : 1;
    return {
      browser_content: this.indexHTML(),
      editor_content: this.rawIndex(),
      tour_step: tour_step,
      stage: 0
    };
  },
  noStep: function() {
    return this.setState({
      tour_step: 1000
    });
  },
  goToStep: function(tour_step) {
    console.log({
      tour_step: tour_step,
      state: this.state.tour_step
    });
    if (tour_step < this.state.tour_step) {
      return;
    }
    return this.setState({
      tour_step: tour_step
    });
  },
  indexFilename: function() {
    var e;
    try {
      fs.readFileSync('/index.jade');
      return '/index.jade';
    } catch (_error) {
      e = _error;
      return '/index.html';
    }
  },
  indexHTML: function() {
    var md;
    if (this.indexFilename() === '/index.html') {
      return this.rawIndex();
    }
    md = require('marked');
    jade.filters.md = md;
    return jade.renderFile(this.indexFilename());
  },
  rawIndex: function() {
    return fs.readFileSync(this.indexFilename()).toString();
  },
  update: function() {
    fs.writeFileSync(this.indexFilename(), this.state.editor_content);
    this.refs.browser.refresh(this.indexHTML());
    if (this.state.loaded) {
      this.goToStep(3);
    }
    return this.trackEverything('browser_editor/preview');
  },
  showError: function(e) {
    return this.setState({
      publish_error: e
    });
  },
  showSuccess: function() {
    this.setState({
      stage: 2
    });
    return _.delay((function(_this) {
      return function() {
        return _this.setState({
          stage: 3
        });
      };
    })(this), 9000);
  },
  deploy: function() {
    this.trackEverything('browser_editor/publish');
    this.setState({
      tour_done: true,
      stage: 1
    });
    $.ajax({
      url: SERVER_URL + "/apps/" + APP_SLUG + "/live_deploy",
      method: 'POST',
      dataType: 'json',
      data: {
        username: this.props.username,
        reponame: this.props.reponame,
        code: this.rawIndex(),
        index_filename: this.indexFilename()
      }
    }).then(this.showSuccess).fail(this.showError);
    return pusher_user_channel.bind('app.build', (function(_this) {
      return function() {
        return _this.setState({
          stage: 3
        });
      };
    })(this));
  },
  editorChange: function(new_content) {
    this.setState({
      editor_content: new_content
    });
    if (this.state.loaded) {
      this.goToStep(2);
    }
    if (new_content === this.state.editor_content) {
      return this.setState({
        loaded: true
      });
    }
  },
  slideEditor: function() {
    $('.editor-col').toggleClass('disabled');
    $('.browser-col').toggleClass('active');
    $('.tour-code-editor').toggleClass('hide');
    return this.trackEverything('browser_editor/slide');
  },
  trackEverything: function(part_url) {
    return $.ajax({
      url: SERVER_URL + "/track/" + part_url,
      method: 'POST',
      dataType: 'json',
      data: {
        app_slug: APP_SLUG,
        editor_content: this.state.editor_content
      }
    });
  },
  publishingModal: function() {
    return React.createElement("div", {
      "id": "publishing-modal",
      "className": "modal"
    }, this.publishingContent(), this.publishedFooter());
  },
  publishingContent: function() {
    var stages;
    if (!(this.state.stage > 0)) {
      return;
    }
    stages = ['Publish to GitHub', 'Publish to server'];
    return React.createElement("div", {
      "className": "modal-content"
    }, React.createElement("h4", null, "Publishing"), React.createElement("p", null, React.createElement(PublishStatus, {
      "stages": stages,
      "current": this.state.stage
    })), this.published());
  },
  published: function() {
    if (this.state.stage !== 3) {
      return;
    }
    return React.createElement("p", null, React.createElement("span", {
      "className": "green-text"
    }, "Your changes were succesfully published."));
  },
  publishedFooter: function() {
    if (this.state.stage !== 3) {
      return;
    }
    return React.createElement("div", {
      "className": 'modal-footer'
    }, React.createElement("a", {
      "className": "modal-action waves-effect waves-light btn green",
      "href": 'http://' + APP_SLUG + '.closeheatapp.com'
    }, "Take a look at my changes"), React.createElement("button", {
      "style": {
        marginRight: '10px'
      },
      "className": 'modal-action waves-effect waves-light btn blue',
      "onClick": this.closeModal
    }, "Back to editor"));
  },
  openModal: function() {
    if (this.state.modalOpened) {
      return;
    }
    this.setState({
      modalOpened: true
    });
    return $('#publishing-modal').openModal();
  },
  closeModal: function() {
    this.setState({
      stage: 0
    });
    this.setState({
      modalOpened: false
    });
    return $('#publishing-modal').closeModal();
  },
  componentDidUpdate: function(_prev_props, prev_state) {
    if (this.state.stage === prev_state.stage) {
      return;
    }
    if (this.state.stage > 0) {
      return this.openModal();
    } else {
      return this.closeModal();
    }
  },
  render: function() {
    var edit_other_files_url;
    edit_other_files_url = "http://app.closeheat.com/apps/" + APP_SLUG + "/guide/toolkit";
    return React.createElement("main", null, React.createElement("div", {
      "className": 'row'
    }, React.createElement("div", {
      "className": 'col editor-col full m5'
    }, React.createElement("nav", null, React.createElement("div", {
      "className": "nav-wrapper"
    }, React.createElement("ul", {
      "className": "left"
    }, React.createElement("li", null, React.createElement("a", {
      "href": "javascript:void(0)",
      "onClick": this.update
    }, React.createElement("i", {
      "className": "mdi-image-remove-red-eye left"
    }), "Preview")), React.createElement("li", null, React.createElement("a", {
      "href": "javascript:void(0)",
      "onClick": this.deploy
    }, React.createElement("i", {
      "className": "mdi-content-send left"
    }), "Publish")), React.createElement("li", null, React.createElement("a", {
      "href": edit_other_files_url,
      "onClick": ((function(_this) {
        return function() {
          return _this.trackEverything('browser_editor/edit_other');
        };
      })(this)),
      "target": '_blank'
    }, React.createElement("i", {
      "className": "mdi-action-view-module left"
    }), "Edit other files"))))), React.createElement("div", {
      "className": 'editor'
    }, React.createElement(Editor, {
      "value": this.state.editor_content,
      "onChange": this.editorChange,
      "index_filename": this.indexFilename()
    }))), React.createElement("div", {
      "className": 'col browser-col full m7'
    }, React.createElement("nav", null, React.createElement("div", {
      "className": "nav-wrapper"
    }, React.createElement("a", {
      "href": edit_other_files_url,
      "onClick": ((function(_this) {
        return function() {
          return _this.trackEverything('browser_editor/click_logo');
        };
      })(this)),
      "target": '_blank',
      "className": "right brand-logo"
    }, React.createElement("img", {
      "src": "/logo-square.png"
    })), React.createElement("ul", {
      "className": "left"
    }, React.createElement("li", null, React.createElement("a", {
      "href": "javascript:void(0)",
      "onClick": this.slideEditor
    }, React.createElement("i", {
      "className": "mdi-navigation-menu left"
    })))))), React.createElement(Browser, {
      "initial_content": this.state.browser_content,
      "base": this.props.base,
      "ref": 'browser'
    }))), React.createElement(Tour, {
      "step": this.state.tour_step,
      "done": this.state.tour_done
    }), this.publishingModal());
  }
});
