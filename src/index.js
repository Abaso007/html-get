'use strict'

const createBrowserless = require('browserless')
const reachableUrl = require('reachable-url')
const parseDomain = require('parse-domain')
const PCancelable = require('p-cancelable')
const htmlEncode = require('html-encode')
const timeSpan = require('time-span')
const pTimeout = require('p-timeout')
const mem = require('mem')

const got = require('got')

const autoDomains = require('./auto-domains')

const ONE_MIN_MS = 60 * 1000
const ONE_HOUR_MS = ONE_MIN_MS * 60
const ONE_DAY_MS = ONE_HOUR_MS * 24

// TODO: This is a soft timeout to ensure prerender mode
// doesn't take too much time an reach the global timeout.
// Currently puppeteer is not handling a global timeout,
// need to wait until 2.0 to setup `.defaultTimeout`
// https://github.com/GoogleChrome/puppeteer/issues/2079
const REQ_TIMEOUT = 6500

// Puppeteer doesn't resolve redirection well.
// We need to ensure we have the right url.
const getUrl = mem(
  async targetUrl => {
    try {
      const { url } = await reachableUrl(targetUrl, { timeout: REQ_TIMEOUT })
      return url
    } catch (err) {
      return targetUrl
    }
  },
  { maxAge: ONE_DAY_MS }
)

const getDomain = url => (parseDomain(url) || {}).domain

const fetch = (url, { toEncode, reflect = false, ...opts }) =>
  new PCancelable(async (resolve, reject, onCancel) => {
    const req = got(url, {
      encoding: null,
      timeout: REQ_TIMEOUT,
      ...opts
    })

    onCancel(req.cancel.bind(req))

    try {
      const res = await req
      return resolve({
        url: res.url,
        html: await toEncode(res.body, res.headers['content-type']),
        mode: 'fetch'
      })
    } catch (err) {
      if (reflect) return resolve({ isRejected: true, err })
      else resolve({ url, html: '', mode: 'fetch' })
    }
  })

const prerender = async (
  targetUrl,
  { getBrowserless, gotOptions, toEncode, ...opts }
) => {
  let fetchReq
  let fetchDataProps = {}
  let isFetchRejected = false
  let html = ''
  let url

  try {
    url = await getUrl(targetUrl)
    fetchReq = fetch(url, { reflect: true, toEncode, ...gotOptions })
    const browserless = await getBrowserless()
    html = await pTimeout(browserless.html(url, opts), REQ_TIMEOUT)
    fetchReq.cancel()
    return { url, html, mode: 'prerender' }
  } catch (err) {
    const { isRejected, ...dataProps } = await fetchReq
    isFetchRejected = isRejected
    fetchDataProps = dataProps
  }

  return isFetchRejected ? { url, html, mode: 'prerender' } : fetchDataProps
}

const FETCH_MODE = { fetch, prerender }

const getFetchMode = (url, { prerender }) => {
  if (prerender === false) return 'fetch'
  if (prerender !== 'auto') return 'prerender'
  return autoDomains.includes(getDomain(url)) ? 'fetch' : 'prerender'
}

module.exports = async (
  targetUrl,
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
  const targetFetchMode = fetchMode(targetUrl, { prerender })
  const opts =
    targetFetchMode === 'fetch'
      ? { toEncode, ...gotOptions }
      : { toEncode, getBrowserless, gotOptions, ...puppeteerOpts }

  const time = timeSpan()
  const { url, html, mode } = await FETCH_MODE[targetFetchMode](targetUrl, opts)
  return { url, html, stats: { mode, timing: time() } }
}

module.exports.createBrowserless = createBrowserless
