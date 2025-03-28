# Snapshot report for `test/html/rewrite-urls.js`

The actual snapshot is saved in `rewrite-urls.js.snap`.

Generated by [AVA](https://avajs.dev).

## remove localhost alike URLs

> Snapshot 1

    `<!DOCTYPE html>␊
    <html lang="en">␊
      <head>␊
        <title>kikobeats.com</title>␊
        <meta property="og:site_name" content="kikobeats.com">␊
        <link rel="canonical" href="https://kikobeats.com/">␊
        <meta charset="utf-8">␊
      </head>␊
      <body>␊
        <script async="" src="https://kikobeats.com/testfile" id="livereloadscript"></script>␊
        <a href="mailto:example@example.com">Email</a>␊
        <a href="ftp://example.com/file.txt">FTP Link</a>␊
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==" alt="Base64 Image">␊
      </body>␊
    </html>`

## rewrites relative root URLs inside html markup

> Snapshot 1

    `<!DOCTYPE html>␊
    <html lang="en">␊
      <head>␊
    ␊
        <!-- Basic -->␊
        <meta charset="utf-8">␊
        <meta http-equiv="x-ua-compatible" content="ie=edge">␊
    ␊
        <!-- Search Engine -->␊
        <meta name="description" content="a puppeter-like Node.js library for interacting with Headless production scenarios.">␊
        <meta name="image" content="https://browserless.js.org/static/logo-banner.png">␊
        <link rel="canonical" href="https://browserless.js.org/">␊
        <title>browserless, a puppeter-like Node.js library for interacting with Headless production scenarios.</title>␊
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">␊
    ␊
        <!-- Schema.org for Google -->␊
        <meta itemprop="name" content="browserless, a puppeter-like Node.js library for interacting with Headless production scenarios.">␊
        <meta itemprop="description" content="a puppeter-like Node.js library for interacting with Headless production scenarios.">␊
        <meta itemprop="image" content="https://browserless.js.org/static/logo-banner.png">␊
    ␊
        <!-- Twitter -->␊
        <meta name="twitter:card" content="summary_large_image">␊
        <meta name="twitter:title" content="browserless">␊
        <meta name="twitter:description" content="a puppeter-like Node.js library for interacting with Headless production scenarios.">␊
        <meta name="twitter:image" content="https://browserless.js.org/static/demo.png">␊
        <meta name="twitter:label1" value="Installation">␊
        <meta name="twitter:data1" value="npm install browserless --save">␊
    ␊
        <!-- Open Graph general (Facebook, Pinterest & Google+) -->␊
        <meta property="og:title" content="browserless">␊
        <meta property="og:logo" content="https://browserless.js.org/static/logo.png">␊
        <meta property="og:description" content="a puppeter-like Node.js library for interacting with Headless production scenarios.">␊
        <meta property="og:image" content="https://browserless.js.org/static/demo.png">␊
        <meta property="og:url" content="https://browserless.js.org">␊
        <meta property="og:site_name" content="browserless.js.org">␊
        <meta property="og:type" content="website">␊
    ␊
        <!-- Favicon -->␊
        <link rel="icon" type="image/png" href="https://browserless.js.org/static/favicon-32x32.png" sizes="32x32">␊
        <link rel="icon" type="image/png" href="https://browserless.js.org/static/favicon-16x16.png" sizes="16x16">␊
    ␊
        <!-- Stylesheet -->␊
        <link href="https://fonts.googleapis.com/css?family=Nunito|Nunito+Sans" rel="stylesheet">␊
        <link rel="stylesheet" href="https://browserless.js.org/static/style.min.css">␊
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codecopy/umd/codecopy.min.css">␊
      </head>␊
      <body>␊
        <div id="app"></div>␊
        <script src="https://browserless.js.org/static/main.min.js"></script>␊
        <script src="https://unpkg.com/docsify/lib/docsify.min.js"></script>␊
        <script src="https://unpkg.com/docsify/lib/plugins/ga.min.js"></script>␊
        <script src="https://unpkg.com/docsify/lib/plugins/external-script.min.js"></script>␊
        <script src="https://unpkg.com/prismjs/components/prism-bash.min.js"></script>␊
        <script src="https://unpkg.com/prismjs/components/prism-jsx.min.js"></script>␊
        <script src="https://cdn.jsdelivr.net/npm/codecopy/umd/codecopy.min.js"></script>␊
      </body>␊
    </html>`

## rewrites relative URLs inside html markup

> Snapshot 1

    `<!DOCTYPE html>␊
    <html>␊
      <head>␊
        <link rel="apple-touch-icon" href="https://moovility.me/img/icons/MOV/icon2-76.png" sizes="76x76">␊
        <title>moovility.me</title>␊
        <meta property="og:site_name" content="moovility.me">␊
        <link rel="canonical" href="https://moovility.me/">␊
        <meta charset="utf-8">␊
      </head>␊
      <body>␊
      </body>␊
    </html>`

## don't modify inline javascript

> Snapshot 1

    `<!DOCTYPE html>␊
    <html lang="en">␊
      <head>␊
        <meta charset="UTF-8">␊
        <meta name="viewport" content="width=device-width, initial-scale=1.0">␊
        <title>column-muralist-honors-african-americans-killed-by-police</title>␊
        <meta property="og:site_name" content="latimes.com">␊
        <link rel="canonical" href="https://www.latimes.com/opinion/story/2020-06-07/column-muralist-honors-african-americans-killed-by-police">␊
      </head>␊
      <body>␊
        <a class="ActionLink" data-social-service="print" href="javascript:window.print()"><svg>␊
            <use xlink:href="#mono-icon-print"></use>␊
          </svg><span>Print</span></a>␊
      </body>␊
    </html>`

## don't modify non http protocols

> Snapshot 1

    `<!DOCTYPE html>␊
    <html lang="en">␊
      <head>␊
        <meta charset="UTF-8">␊
        <meta name="viewport" content="width=device-width, initial-scale=1.0">␊
        <title>column-muralist-honors-african-americans-killed-by-police</title>␊
        <meta property="og:site_name" content="latimes.com">␊
        <link rel="canonical" href="https://www.latimes.com/opinion/story/2020-06-07/column-muralist-honors-african-americans-killed-by-police">␊
      </head>␊
      <body>␊
        <a href="mailto:jen@oreilly.com"></a>␊
        <a href="ftp://user:password@server/pathname"></a>␊
        <a href="file://server/path"></a>␊
        <a href="nntp://server:port/newsgroup/article"></a>␊
        <a href="telnet://user:password@server:port/"></a>␊
        <a href="gopher://docstore.mik.ua/orelly.htm"></a>␊
      </body>␊
    </html>`

## don't modify data URIs

> Snapshot 1

    `<!DOCTYPE html>␊
    <html lang="en">␊
      <head>␊
        <meta charset="UTF-8">␊
        <meta name="viewport" content="width=device-width, initial-scale=1.0">␊
        <title>example.com</title>␊
        <meta property="og:site_name" content="example.com">␊
        <link rel="canonical" href="https://example.com">␊
      </head>␊
      <body>␊
        <img src="data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7" alt="star" width="16" height="16">␊
      </body>␊
    </html>`

## don't modify undefined attributes

> Snapshot 1

    `<!DOCTYPE html>␊
    <html lang="en">␊
      <head>␊
        <title>Document</title>␊
        <meta property="og:site_name" content="moovility.me">␊
        <link rel="canonical" href="https://moovility.me">␊
        <meta charset="utf-8">␊
      </head>␊
      <body>␊
        <script>␊
          console.log('greetings')␊
        </script>␊
      </body>␊
    </html>`
