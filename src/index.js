'use strict'

const { isMediaUrl } = require('@metascraper/helpers')
const { getDomainWithoutSuffix } = require('tldts')
const debug = require('debug-logfmt')('html-get')
const { AbortError } = require('p-retry')

const requireOneOf = require('require-one-of')
const PCancelable = require('p-cancelable')
const htmlEncode = require('html-encode')
const timeSpan = require('time-span')
const got = require('got')

const autoDomains = require('./auto-domains')
const addHtml = require('./html')

const REQ_TIMEOUT = 8000

const fetch = (url, { reflect = false, toEncode, ...opts }) =>
  new PCancelable(async (resolve, reject, onCancel) => {
    const req = got(url, {
      responseType: 'buffer',
      timeout: reflect ? REQ_TIMEOUT / 2 : REQ_TIMEOUT,
      ...opts
    })

    onCancel.shouldReject = false
    onCancel(req.cancel.bind(req))

    try {
      const res = await req
      return resolve({
        headers: res.headers,
        html: await toEncode(res.body, res.headers['content-type']),
        mode: 'fetch',
        url: res.url,
        statusCode: res.statusCode
      })
    } catch (err) {
      debug.error('fetch', { message: err.message || err })
      debug('fetch', { reflect })
      if (reflect) return resolve({ isRejected: true, err })
      else resolve({ url, html: '', mode: 'fetch' })
    }
  })

const prerender = async (
  url,
  { getBrowserless, toEncode, headers, gotOpts, ...opts }
) => {
  let fetchRes
  let fetchDataProps = {}
  let isFetchResRejected = false

  try {
    fetchRes = fetch(url, { reflect: true, toEncode, headers, ...gotOpts })
    const browserless = await getBrowserless()

    const getPayload = browserless.evaluate(async (page, response) => {
      if (!response) throw AbortError()

      return {
        headers: response.headers(),
        html: await page.content(),
        mode: 'prerender',
        url: response.url(),
        statusCode: response.status()
      }
    })

    const payload = await getPayload(url, {
      timeout: REQ_TIMEOUT,
      headers,
      ...opts
    })

    await fetchRes.cancel()
    debug('prerender', { state: 'success' })
    return payload
  } catch (err) {
    const { isRejected, ...dataProps } = await fetchRes
    const message = err.message || err
    debug.error('prerender', { isRejected, message })
    isFetchResRejected = isRejected
    fetchDataProps = dataProps
  }

  return isFetchResRejected
    ? {
        headers: fetchDataProps.headers || {},
        html: '',
        url,
        mode: 'prerender'
      }
    : fetchDataProps
}

const modes = { fetch, prerender }

const isFetchMode = url => autoDomains.includes(getDomainWithoutSuffix(url))

const determinateMode = (url, { prerender }) => {
  if (prerender === false) return 'fetch'
  if (prerender !== 'auto') return 'prerender'
  if (isMediaUrl(url)) return 'fetch'
  return isFetchMode(url) ? 'fetch' : 'prerender'
}

const getContent = async (
  url,
  mode,
  { puppeteerOpts, getBrowserless, gotOpts, toEncode, headers }
) => {
  const fetchOpts =
    mode === 'fetch'
      ? { headers, toEncode, ...gotOpts }
      : { headers, toEncode, getBrowserless, gotOpts, ...puppeteerOpts }

  const content = await modes[mode](url, fetchOpts)
  const html = addHtml({ ...fetchOpts, ...content })
  return { ...content, html }
}

module.exports = async (
  targetUrl,
  {
    getBrowserless = requireOneOf(['@browserless/pool', 'browserless']),
    encoding = 'utf-8',
    getMode = determinateMode,
    gotOpts,
    prerender = 'auto',
    puppeteerOpts,
    headers
  } = {}
) => {
  const toEncode = htmlEncode(encoding)
  const reqMode = getMode(targetUrl, { prerender })

  const time = timeSpan()

  const { mode, ...payload } = await getContent(targetUrl, reqMode, {
    puppeteerOpts,
    getBrowserless,
    gotOpts,
    toEncode,
    headers
  })

  return { ...payload, stats: { mode, timing: time.rounded() } }
}

module.exports.REQ_TIMEOUT = REQ_TIMEOUT
