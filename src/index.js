'use strict'

const { getDomain, getPublicSuffix } = require('tldts')
const { isMime } = require('@metascraper/helpers')
const requireOneOf = require('require-one-of')
const reachableUrl = require('reachable-url')
const PCancelable = require('p-cancelable')
const debug = require('debug')('html-get')
const htmlEncode = require('html-encode')
const timeSpan = require('time-span')
const { URL } = require('url')
const path = require('path')
const got = require('got')
const mem = require('mem')
const he = require('he')

const autoDomains = require('./auto-domains')

const ONE_MIN_MS = 60 * 1000
const ONE_HOUR_MS = ONE_MIN_MS * 60
const ONE_DAY_MS = ONE_HOUR_MS * 24

// TODO: This is a soft timeout to ensure prerender mode
// doesn't take too much time an reach the global timeout.
// Currently puppeteer is not handling a global timeout,
// need to wait until 2.0 to setup `.defaultTimeout`
// https://github.com/GoogleChrome/puppeteer/issues/2079
const REQ_TIMEOUT = Number(process.env.REQ_TIMEOUT || 6000)
const REQ_TIMEOUT_REACHABLE = REQ_TIMEOUT * 0.25

// Puppeteer doesn't resolve redirection well.
// We need to ensure we have the right url.
const getUrl = mem(
  async targetUrl => {
    try {
      const res = await reachableUrl(targetUrl, {
        timeout: REQ_TIMEOUT_REACHABLE
      })
      return res
    } catch (err) {
      return { url: targetUrl, headers: {} }
    }
  },
  { maxAge: ONE_DAY_MS }
)

const getHtml = html => he.decode(html)

const fetch = (url, { toEncode, reflect = false, ...opts }) =>
  new PCancelable(async (resolve, reject, onCancel) => {
    const req = got(url, {
      encoding: null,
      timeout: reflect ? REQ_TIMEOUT / 2 : REQ_TIMEOUT,
      ...opts
    })

    onCancel.shouldReject = false
    onCancel(() => req.cancel && req.cancel())

    try {
      const res = await req
      return resolve({
        url: res.url,
        html: getHtml(await toEncode(res.body, res.headers['content-type'])),
        mode: 'fetch'
      })
    } catch (err) {
      debug('fetch:error', err)
      debug('fetch:reflect', reflect)
      if (reflect) return resolve({ isRejected: true, err })
      else resolve({ url, html: '', mode: 'fetch' })
    }
  })

const prerender = async (url, { getBrowserless, gotOptions, toEncode, ...opts }) => {
  let fetchReq
  let fetchDataProps = {}
  let isFetchRejected = false
  let html = ''

  try {
    fetchReq = fetch(url, { reflect: true, toEncode, ...gotOptions })
    const browserless = await getBrowserless()
    html = await browserless.html(url, { timeout: REQ_TIMEOUT, ...opts })
    await fetchReq.cancel()
    debug('prerender:success')
    return { url, html: getHtml(html), mode: 'prerender' }
  } catch (err) {
    debug('prerender:error', err)
    const { isRejected, ...dataProps } = await fetchReq
    debug('prerender:error:isRejected?', isRejected)
    isFetchRejected = isRejected
    fetchDataProps = dataProps
  }

  return isFetchRejected ? { url, html, mode: 'prerender' } : fetchDataProps
}

const modes = { fetch, prerender }

const isFetchMode = mem(url => {
  const suffix = getPublicSuffix(url)
  const domain = getDomain(url)
  return autoDomains.includes(suffix ? domain.replace(`.${suffix}`, '') : domain)
})

const determinateMode = (url, { prerender }) => {
  if (prerender === false) return 'fetch'
  if (prerender !== 'auto') return 'prerender'
  return isFetchMode(url) ? 'fetch' : 'prerender'
}

const baseHtml = ({ url, headers, head, body }) => {
  const { hostname } = new URL(url)
  const { date, expires } = headers

  return {
    url,
    mode: 'fetch',
    html: `
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" shrink-to-fit="no">
        <title>${path.basename(url)}</title>
        <meta property="og:site_name" content="${hostname}">
        ${date ? `<meta property="article:published_time" content="${date}">` : ''}
        ${expires ? `<meta property="article:expiration_time" content="${expires}">` : ''}
        <meta property="og:locale" content="en">
        <meta property="og:url" content="${url}">
        ${head}
        <link rel="canonical" href="${url}">
      </head>
      <body>
        ${body}
      </body>
    </html>`.trim()
  }
}

const getImageHtml = (url, headers) =>
  baseHtml({
    url,
    headers,
    head: `
      <meta property="og:image" content="${url}">
      <meta property="og:image:type" content="${headers['content-type']}">
    `,
    body: `<img src="${url}">`
  })

const getVideoHtml = (url, headers) => {
  const { protocol } = new URL(url)
  const isHttps = protocol === 'https:'
  const videoProperty = `og:video${isHttps ? ':secure_url' : ''}`

  return baseHtml({
    url,
    headers,
    head: `
      <meta property="${videoProperty}" content="${url}">
      <meta property="og:video:type" content="${headers['content-type']}">
    `,
    body: `<video src="${url}">`
  })
}

const getAudioHtml = (url, headers) => {
  const { protocol } = new URL(url)
  const isHttps = protocol === 'https:'
  const audioProperty = `og:audio${isHttps ? ':secure_url' : ''}`

  return baseHtml({
    url,
    headers,
    head: `
      <meta property="${audioProperty}" content="${url}">
      <meta property="og:audio:type" content="${headers['content-type']}">
    `,
    body: `<audio src="${url}">`
  })
}

const getContent = async (encodedUrl, mode, opts) => {
  const { url, headers } = await getUrl(encodedUrl)
  debug(`getUrl ${encodedUrl === url ? url : `${encodedUrl} → ${url}`}`)
  const contentType = headers['content-type']
  if (isMime(contentType, 'image')) return getImageHtml(url, headers)
  if (isMime(contentType, 'video')) return getVideoHtml(url, headers)
  if (isMime(contentType, 'audio')) return getAudioHtml(url, headers)

  return modes[mode](url, opts)
}

module.exports = async (
  targetUrl,
  {
    getBrowserless = requireOneOf(['@browserless/pool', 'browserless']),
    encoding = 'utf-8',
    getMode = determinateMode,
    gotOptions,
    prerender = 'auto',
    puppeteerOpts
  } = {}
) => {
  const { href: encodedUrl } = new URL(targetUrl)
  const toEncode = htmlEncode(encoding)
  const reqMode = getMode(encodedUrl, { prerender })

  const opts =
    reqMode === 'fetch'
      ? { toEncode, ...gotOptions }
      : { toEncode, getBrowserless, gotOptions, ...puppeteerOpts }

  const time = timeSpan()
  const { url, html, mode } = await getContent(encodedUrl, reqMode, opts)
  return { url, html, stats: { mode, timing: time() } }
}
