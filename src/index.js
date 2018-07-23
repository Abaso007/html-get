'use strict'

const createBrowserless = require('browserless')
const parseDomain = require('parse-domain')
const PCancelable = require('p-cancelable')
const htmlEncode = require('html-encode')
const timeSpan = require('time-span')
const got = require('got')

const autoDomains = require('./auto-domains')

const fetch = (url, { toEncode, ...opts }) =>
  new PCancelable((resolve, reject, onCancel) => {
    const req = got(url, { encoding: null, ...opts })
    onCancel(() => req.cancel())
    req.catch(reject)
    req.then(res => resolve(toEncode(res.body, res.headers['content-type'])))
  })

const prerender = async (
  url,
  { getBrowserless, gotOptions, toEncode, ...opts }
) => {
  const fetchData = fetch(url, { toEncode, ...gotOptions })
  const browserless = await getBrowserless()
  let html

  try {
    html = await browserless.html(url, opts)
    fetchData.cancel()
  } catch (err) {
    html = await fetchData
  }

  return html
}

const FETCH_MODE = { fetch, prerender }

const getFetchMode = (url, { prerender }) => {
  if (prerender === false) return 'fetch'
  if (prerender !== 'auto') return 'prerender'
  return autoDomains.includes(parseDomain(url).domain) ? 'fetch' : 'prerender'
}

module.exports = async (
  url,
  {
    getBrowserless = createBrowserless,
    encoding = 'utf-8',
    fetchMode = getFetchMode,
    gotOptions,
    prerender = 'auto',
    puppeteerOpts
  } = {}
) => {
  const toEncode = htmlEncode(encoding)
  const mode = fetchMode(url, { prerender })
  const opts =
    mode === 'fetch'
      ? { toEncode, ...gotOptions }
      : { toEncode, getBrowserless, gotOptions, ...puppeteerOpts }
  const time = timeSpan()
  const html = await FETCH_MODE[mode](url, opts)
  return { html, stats: { mode, timing: time() } }
}

module.exports.createBrowserless = createBrowserless
