'use strict'

const test = require('ava')

const getHTML = require('../src')
const { initBrowserless } = require('./helpers')

const getBrowserless = initBrowserless(test)

test('`{ prerender: true }`', async t => {
  const url = 'https://example.com'
  const { stats } = await getHTML(url, { getBrowserless })
  t.is(stats.mode, 'prerender')
})

test('`{ prerender: false }`', async t => {
  const url = 'https://example.com'
  const { stats } = await getHTML(url, { prerender: false, getBrowserless })
  t.is(stats.mode, 'fetch')
})

test("`{ prerender: 'auto' }`", async t => {
  {
    const url = 'https://google.com'
    const { stats } = await getHTML(url, {
      getBrowserless,
      puppeteerOpts: { adblock: false }
    })
    t.is(stats.mode, 'fetch')
  }
  {
    const url = 'https://twitter.com/Kikobeats/status/1741205717636264436'
    const { html, stats } = await getHTML(url, {
      headers: {
        'user-agent': 'Slackbot 1.0 (+https://api.slack.com/robots)'
      },
      getBrowserless,
      puppeteerOpts: { adblock: false }
    })
    t.true(html.includes('og:title'))
    t.is(stats.mode, 'fetch')
  }
})

test.skip('prerender error fallback into fetch mode', async t => {
  const url =
    'https://www.sportsnet.ca/hockey/nhl/leafs-john-tavares-return-new-york-hope-positive/'
  const { stats, html } = await getHTML(url, {
    prerender: true,
    getBrowserless,
    puppeteerOpts: { adblock: false }
  })
  t.true(!!html)
  t.is(stats.mode, 'fetch')
})
