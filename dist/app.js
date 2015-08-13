var $, Header, React, RouteHandler, Router, _, jade;

React = require('react/addons');

jade = require('jade-memory-fs');

_ = require('lodash');

$ = window.jQuery = window.$ = require('jquery');

require('./materialize');

Router = require('react-router');

RouteHandler = Router.RouteHandler;

Header = require('./header');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      browser_content: this.indexHTML(),
      editor_content: this.rawIndex()
    };
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
  editorChange: function(path, new_content) {
    var bug_message;
    bug_message = 'If you see this - a bug occured. Could you send us a message by clicking Support in the top?';
    return fs.writeFileSync(fs.join('/', path), new_content || bug_message);
  },
  render: function() {
    return React.createElement("main", null, React.createElement(Header, null), React.createElement(RouteHandler, {
      "base": this.props.base,
      "index_filename": this.indexFilename(),
      "editor_content": this.state.editor_content,
      "browser_content": this.state.browser_content,
      "index_html": this.indexHTML(),
      "raw_index": this.rawIndex(),
      "editorChange": this.editorChange
    }));
  }
});
