React = require 'react/addons'
Browser = require('./browser')

module.exports =
React.createClass
  getInitialState: ->
    {
      build_finished: false,
    }
  componentDidMount: ->
    @props.build().then((resp) =>
      @setState(build_finished: true)
    ).catch (err) ->
      console.log(err)
  building: ->
    <h1>Building</h1>

  browser: ->
    <div>
      <div className='row'>
        <div className='col browser-col full m12'>
          <Browser ref='browser' browser_url={@props.browser_url} />
        </div>
      </div>
    </div>
  render: ->
    if @state.build_finished
      @browser()
    else
      @building()
