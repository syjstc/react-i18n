import React from 'react'
import Jed from 'jed'
import ReactDOMServer from 'react-dom/server'
import assert from 'assert'

let i18n = null
let debug = '0'

describe('i18n', () => {
  before(() => {
    i18n = require('../index')
  })

  it('should return i18n strings or react components', () => {
    assert(i18n.t('lorem ipsum') === 'lorem ipsum')
    // returns 'lorem ipsum'

    assert(i18n.t('settings|lorem ipsum') === 'lorem ipsum')
    // returns 'lorem ipsum'

    assert(i18n.t('%{li}s', {li: <p>lorem ipsum</p>})[0].$$typeof === Symbol.for('react.element'))
    // returns [<p>lorem ipsum</p>]

    assert(i18n.t('lorem %{li}s ipsum', {li: <p>lorem ipsum</p>}).length === 3)
    // returns ['lorem', <p>lorem ipsum</p>, 'ipsum']
  })

  it('should return templated strings', () => {
    assert(i18n.t('%{l}s', {l: 'lorem'}) === 'lorem');
    assert(i18n.t('%{l}s %{i}s', {
        l: 'lorem',
        i: 'ipsum'
      }) === 'lorem ipsum');
    assert(i18n.t('%{li}j', {li: ['lorem', 'ipsum']}) === '["lorem","ipsum"]')

    assert(i18n.t('%{author}s assigned this event to %{assignee}s', {
      author: <p>example</p>,
      assignee: <em>example@example.com</em>
    }))
  })

  it('should return wrapped react components', () => {
    assert(ReactDOMServer.renderToStaticMarkup(i18n.tct('lorem [li] ipsum', {
        root: <div/>,
        li: <b>hey</b>
      })) === '<div><span>lorem </span><b>hey</b><span> ipsum</span></div>')
  })

  it('should translate words through jed', () => {
    i18n.init({
      'domain': 'i18n',
      'missing_key_callback': function (key) {
      },
      'locale_data': {
        'i18n': {
          '': {
            'domain': 'i18n',
            'lang': 'fr',
            'plural_forms': 'nplurals=2; plural=(n != 1);'
          },
          'hello': ['bonjour']
        }
      }
    })

    assert(i18n.t('hello') === 'bonjour')
  })

  it('should works with __', () => {
    i18n.init({
      'domain': 'i18n',
      'missing_key_callback': function (key) {
      },
      'locale_data': {
        'i18n': {
          '': {
            'domain': 'i18n',
            'lang': 'fr',
            'plural_forms': 'nplurals=2; plural=(n != 1);'
          },
          'hello %{name}': ['bonjour %{name}'],
          'main|hello %{name}': ['bonjour %{name}!!!']
        }
      }
    })

    assert(i18n.__('hello %{name}', {name: 'world'}) === 'bonjour world')
    assert(i18n.__('main|hello %{name}', {name: 'world'}) === 'bonjour world!!!')
  })

  it('should return debugging wrapper', () => {
    i18n.setDebug()
    assert(ReactDOMServer.renderToStaticMarkup(i18n.tct('lorem [li] ipsum', {
        root: <div/>,
        li: <b>hey</b>
      })) === '<span class="translation-wrapper"><div><span>lorem </span><b>hey</b><span> ipsum</span></div></span>')
  })

  it('should return some emoji chars when debugging with toString()', () => {
    assert(i18n.tct('hello', {
        root: <span/>
      }).toString() === '🇦🇹[object Object]🇦🇹')
  })
})