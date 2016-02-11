React = require 'react'
window._ = require 'lodash'

visualInject = ->
  positionInDom = (el, count = 1) ->
    if new_el = el.previousElementSibling
      positionInDom(new_el, count + 1)
    else
      count

  getSelector = (el) ->
    names = []

    while el.parentNode
      if el.id
        names.unshift '#' + el.id
        break
      else
        if el == el.ownerDocument.documentElement
          names.unshift el.tagName.toLowerCase()
        else
          c = 1
          e = el
          while e.previousElementSibling
            e = e.previousElementSibling
            c++
          names.unshift el.tagName.toLowerCase() + ':nth-child(' + c + ')'
        el = el.parentNode

    names.join ' > '

  edit = (e) ->
    ->
      e.preventDefault()
      selector = getSelector(e.target)

      offsets = getElementOffset(e.target)
      # debugger if event == 'click'

      parent.postMessage
        action: 'edit'
        selector: selector
        top: e.clientX
        left: e.clientY
        height: e.target.offsetHeight
        width: e.target.offsetWidth
        old_outline: e.target.outline
        text: text(e.target)
        style: JSON.stringify(window.getComputedStyle(e.target))
      , SERVER_URL

  text = (target) ->
    WHITESPACE_REGEX = /^\s*$/

    result = []

    for node in target.childNodes
      if node.nodeName == "#text" && !(WHITESPACE_REGEX.test(node.nodeValue))
        result.push node.nodeValue

    # TODO: handle "hello<a>some</a> super" editing super

    result[0]

  bindEvents = ->
    hold_timeout_id = 0

    window.addEventListener 'mousedown', (e) ->
      hold_timeout_id = setTimeout(edit(e), 1000)

    window.addEventListener 'mouseup', (e) ->
      clearTimeout(hold_timeout_id)

    window.addEventListener 'mouseleave', (e) ->
      clearTimeout(hold_timeout_id)

  getElementOffset = (element) ->
    de = document.documentElement
    box = element.getBoundingClientRect()
    top = box.top + window.pageYOffset - de.clientTop
    left = box.left + window.pageXOffset - de.clientLeft
    { top: top, left: left }

  #
  # events = [
  #   'click'
  #   'mouseover'
  #   'mouseout'
  # ]

  bindEvents()
  # bindEvent(event) for event in events
  # bindScrollEvent()
  console.log('injected her')

  # browser.on 'focus', '[contenteditable]', ->
  #   console.log('focus')
  #   @setAttribute('data-before', noContentEditable($(@)).prop('outerHTML'))
  #
  # browser.on 'blur', '[contenteditable]', ->
  #   console.log('bl')
  #   sendToEditor($(@).data('before'), noContentEditable($(@)).prop('outerHTML'))

module.exports =
React.createClass
  getInitialState: ->
    window.addEventListener('message', @props.onMessage, false)

    {}
  iframe: ->
    document.getElementById('browser')
  refresh: ->
    @iframe().src = @props.browser_url
  componentDidMount: ->
    $(@iframe()).load =>
      @inject()
  wrapEvalFunction: (code) ->
    "evalFunction = #{code}; evalFunction()"
  inject: ->
    console.log 'inkecting'
    @evalInIframe(visualInject.toString())
  evalInIframe: (code) ->
    @iframe().contentWindow.postMessage(@wrapEvalFunction(code), @props.browser_url)
  render: ->
    <div className='browser'>
      <iframe id='browser' name='browser-frame' src={@props.browser_url}></iframe>
    </div>