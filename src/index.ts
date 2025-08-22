import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import AhoCorasick from 'modern-ahocorasick';

const RENDERING_ENDPOINT = 'https://render.ostr.io';
export const IGNORE_EXTENSIONS = ['3ds', '3g2', '3gp', '3gpp', '7z', 'a', 'aac', 'aaf', 'adp', 'ai', 'aif', 'aiff', 'alz', 'ape', 'apk', 'appcache', 'ar', 'arj', 'asf', 'asx', 'atom', 'au', 'avchd', 'avi', 'bak', 'bbaw', 'bh', 'bin', 'bk', 'bmp', 'btif', 'bz2', 'bzip2', 'cab', 'caf', 'cco', 'cgm', 'class', 'cmx', 'cpio', 'cr2', 'crt', 'crx', 'css', 'csv', 'cur', 'dat', 'deb', 'der', 'dex', 'djvu', 'dll', 'dmg', 'dng', 'doc', 'docm', 'docx', 'dot', 'dotm', 'dra', 'drc', 'ds_store', 'dsk', 'dts', 'dtshd', 'dvb', 'dwg', 'dxf', 'ear', 'ecelp4800', 'ecelp7470', 'ecelp9600', 'egg', 'eol', 'eot', 'eps', 'epub', 'exe', 'f4a', 'f4b', 'f4p', 'f4v', 'fbs', 'fh', 'fla', 'flac', 'fli', 'flv', 'fpx', 'fst', 'fvt', 'g3', 'geojson', 'gif', 'graffle', 'gz', 'gzip', 'h261', 'h263', 'h264', 'hqx', 'htc', 'ico', 'ief', 'img', 'ipa', 'iso', 'jad', 'jar', 'jardiff', 'jng', 'jnlp', 'jpeg', 'jpg', 'jpgv', 'jpm', 'js', 'jxr', 'key', 'kml', 'kmz', 'ktx', 'less', 'lha', 'lvp', 'lz', 'lzh', 'lzma', 'lzo', 'm2v', 'm3u', 'm4a', 'm4p', 'm4v', 'map', 'manifest', 'mar', 'markdown', 'md', 'mdi', 'mdown', 'mdwn', 'mht', 'mid', 'midi', 'mj2', 'mka', 'mkd', 'mkdn', 'mkdown', 'mkv', 'mml', 'mmr', 'mng', 'mobi', 'mov', 'movie', 'mp2', 'mp3', 'mp4', 'mp4a', 'mpe', 'mpeg', 'mpg', 'mpga', 'mpv', 'msi', 'msm', 'msp', 'mxf', 'mxu', 'nef', 'npx', 'nsv', 'numbers', 'o', 'oex', 'oga', 'ogg', 'ogv', 'opus', 'otf', 'pages', 'pbm', 'pcx', 'pdb', 'pdf', 'pea', 'pem', 'pgm', 'pic', 'pl', 'pm', 'png', 'pnm', 'pot', 'potm', 'potx', 'ppa', 'ppam', 'ppm', 'pps', 'ppsm', 'ppsx', 'ppt', 'pptm', 'pptx', 'prc', 'ps', 'psd', 'pya', 'pyc', 'pyo', 'pyv', 'qt', 'ra', 'rar', 'ras', 'raw', 'rdf', 'rgb', 'rip', 'rlc', 'rm', 'rmf', 'rmvb', 'ron', 'roq', 'rpm', 'rss', 'rtf', 'run', 'rz', 's3m', 's7z', 'safariextz', 'scpt', 'sea', 'sgi', 'shar', 'sil', 'sit', 'slk', 'smv', 'so', 'sub', 'svg', 'svgz', 'svi', 'swf', 'tar', 'tbz', 'tbz2', 'tcl', 'tga', 'tgz', 'thmx', 'tif', 'tiff', 'tk', 'tlz', 'topojson', 'torrent', 'ttc', 'ttf', 'txt', 'txz', 'udf', 'uvh', 'uvi', 'uvm', 'uvp', 'uvs', 'uvu', 'vcard', 'vcf', 'viv', 'vob', 'vtt', 'war', 'wav', 'wax', 'wbmp', 'wdp', 'weba', 'webapp', 'webm', 'webmanifest', 'webp', 'whl', 'wim', 'wm', 'wma', 'wml', 'wmlc', 'wmv', 'wmx', 'woff', 'woff2', 'wvx', 'xbm', 'xif', 'xla', 'xlam', 'xloc', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlt', 'xltm', 'xltx', 'xm', 'xmind', 'xml', 'xpi', 'xpm', 'xsl', 'xwd', 'xz', 'yuv', 'z', 'zip', 'zipx'];
export const BOT_AGENTS = ['.net crawler', '360spider', '50.nu', '8bo crawler bot', 'aboundex', 'accoona', 'adldxbot', 'adsbot-google', 'ahrefsbot', 'altavista', 'appengine-google', 'applebot', 'archiver', 'arielisbot', 'ask jeeves', 'auskunftbot', 'baidumobaider', 'baiduspider', 'becomebot', 'bingbot', 'bingpreview', 'bitbot', 'bitlybot', 'blitzbot', 'blogbridge', 'boardreader', 'botseer', 'catchbot', 'catchpoint bot', 'charlotte', 'checklinks', 'cliqzbot', 'clumboot', 'coccocbot', 'converacrawler', 'crawl-e', 'crawlconvera', 'dataparksearch', 'daum', 'deusu', 'developers.google.com/+/web/snippet', 'discordbot', 'dotbot', 'duckduckbot', 'elefent', 'embedly', 'evernote', 'exabot', 'facebookbot', 'facebookexternalhit', 'fatbot', 'fdse robot', 'feed seeker bot', 'feedfetcher', 'femtosearchbot', 'findlinks', 'flamingo_searchengine', 'flipboard', 'followsite bot', 'furlbot', 'fyberspider', 'gaisbot', 'galaxybot', 'geniebot', 'genieo', 'gigablast', 'gigabot', 'girafabot', 'gomezagent', 'gonzo1', 'google sketchup', 'google-structured-data-testing-tool', 'googlebot', 'haosouspider', 'heritrix', 'holmes', 'hoowwwer', 'htdig', 'ia_archiver', 'idbot', 'infuzapp', 'innovazion crawler', 'internetarchive', 'iqdb', 'iskanie', 'istellabot', 'izsearch.com', 'kaloogabot', 'kaz.kz_bot', 'kd bot', 'konqueror', 'kraken', 'kurzor', 'larbin', 'leia', 'lesnikbot', 'linguee bot', 'linkaider', 'linkapediabot', 'linkedinbot', 'lite bot', 'llaut', 'lookseek', 'lycos', 'mail.ru_bot', 'masidani_bot', 'masscan', 'mediapartners-google', 'metajobbot', 'mj12bot', 'mnogosearch', 'mogimogi', 'mojeekbot', 'motominerbot', 'mozdex', 'msiecrawler', 'msnbot', 'msrbot', 'netpursual', 'netresearch', 'netvibes', 'newsgator', 'ng-search', 'nicebot', 'nutchcvs', 'nuzzel', 'nymesis', 'objectssearch', 'odklbot', 'omgili', 'oovoo', 'oozbot', 'openfosbot', 'orangebot', 'orbiter', 'org_bot', 'outbrain', 'pagepeeker', 'pagesinventory', 'parsijoobot', 'paxleframework', 'peeplo screenshot bot', 'pinterest', 'plantynet_webrobot', 'plukkie', 'pompos', 'psbot', 'quora link preview', 'qwantify', 'read%20later', 'reaper', 'redcarpet', 'redditbot', 'retreiver', 'riddler', 'rival iq', 'rogerbot', 'saucenao', 'scooter', 'scrapy', 'scrubby', 'searchie', 'searchsight', 'seekbot', 'semanticdiscovery', 'seznambot', 'showyoubot', 'simplepie', 'simpy', 'sitelockspider', 'skypeuripreview', 'slack-imgproxy', 'slackbot', 'slurp', 'snappy', 'sogou', 'solofield', 'speedy spider', 'speedyspider', 'sputnikbot', 'stackrambler', 'teeraidbot', 'teoma', 'theusefulbot', 'thumbshots.ru', 'thumbshotsbot', 'tineye', 'toweya.com', 'toweyabot', 'tumblr', 'tweetedtimes', 'tweetmemebot', 'twitterbot', 'url2png', 'vagabondo', 'vebidoobot', 'viber', 'visionutils', 'vkshare', 'voilabot', 'vortex', 'votay bot', 'voyager', 'w3c_validator', 'wasalive.bot', 'web-sniffer', 'websquash.com', 'webthumb', 'whatsapp', 'whatweb', 'wire', 'wotbox', 'yacybot', 'yahoo', 'yandex', 'yeti', 'yisouspider', 'yodaobot', 'yooglifetchagent', 'yoozbot', 'yottaamonitor', 'yowedo', 'zao-crawler', 'zebot_www.ze.bz', 'zooshot', 'zyborg', 'ai2bot', 'amazonbot', 'anthropic.com', 'bard', 'bytespider', 'ccbot', 'chatgpt-user', 'claude-web', 'claudebot', 'cohere-ai', 'deepseek', 'diffbot', 'duckassistbot', 'gemini', 'google-extended', 'gptbot', 'grok', 'meta-external', 'mistralai', 'oai-searchbot', 'openai.com', 'perplexity.ai', 'perplexitybot', 'xai', 'youbot'];

const DICT = {
  escapedFragment: '_escaped_fragment_',
  wellknownPath: '/.well-known/',
  slash: '/',
  pipe: '|',
  dot: '.',
  empty: '',
  colon: ':',
  allowedMethods: new Set(['GET', 'HEAD']),
  args: { bot: '&bot=' },
  service: {
    origin: 'ostr.io',
    originTld: '.ostr.io',
    authStartsWith: 'Basic ',
  },
  headers: {
    ua: 'user-agent',
    auth: 'authorization',
  },
  keepReqHeaders: ['user-agent', 'accept-language'],
  ignoreRespHeaders: ['age', 'alt-svc', 'cache-status', 'cf-connecting-ip', 'cf-ipcountry', 'cf-cache-status', 'cf-ray', 'cf-request-id', 'cnection', 'cneonction', 'connection', 'content-encoding', 'content-length', 'date', 'etag', 'expect-ct', 'expires', 'keep-alive', 'last-modified', 'link', 'nel', 'nncoection', 'pragma', 'server', 'set-cookie', 'status', 'transfer-encoding', 'report-to', 'vary', 'via', 'www-authenticate', 'x-accel-buffering', 'x-accel-charset', 'x-accel-expires', 'x-accel-limit-rate', 'x-accel-redirect', 'x-ostrio-domain', 'x-powered-by', 'x-preprender-status', 'x-prerender-status', 'x-real-ip', 'x-runtime'],
};

const beginningSlashRe = /^\//;
const trailingSlashRe = /\/$/;

export type SEOMiddlewareLogger = Pick<Console, 'debug' | 'info' | 'warn' | 'error' | 'log'>;

export interface SEOMiddlewareOptions {
  auth?: string;
  supportEscapedFragment?: boolean;
  keepGetQuery?: boolean;
  ignoredPaths?: false | RegExp;
  logger?: SEOMiddlewareLogger;
  ignoredExtensions?: string[];
  botAgents?: string[];
  renderingEndpoint?: string;
  retries?: number;
  debug?: boolean;
}

export class SEOMiddleware {
  auth: string;
  supportEscapedFragment: boolean;
  keepGetQuery: boolean;
  ignoredPaths: false | RegExp;
  logger: SEOMiddlewareLogger;
  ignoredExtensions: Set<string>;
  botAgents: AhoCorasick;
  renderingEndpoint: string;
  renderingBase: string;
  retries: number;
  debug: boolean;

  constructor(opts: SEOMiddlewareOptions) {
    this.logger = opts.logger ?? console;
    this.auth = opts.auth || process.env.PRERENDER_SERVICE_AUTH || process.env.SPIDERABLE_SERVICE_AUTH || process.env.OSTR_AUTH || '';
    if (!this.auth) {
      throw new Error('[seo-middleware-nextjs] missing {auth} option! Passed via {auth} option or set via PRERENDER_SERVICE_URL or OSTR_AUTH environment variable');
    }

    if (!this.auth.startsWith(DICT.service.authStartsWith) || this.auth.includes(DICT.colon)) {
      throw new Error('[seo-middleware-nextjs] {auth} option is misconfigured or wrong value is used!');
    }

    this.supportEscapedFragment = opts.supportEscapedFragment ?? true;
    this.keepGetQuery = opts.keepGetQuery ?? true;
    this.ignoredPaths = opts.ignoredPaths ?? false;
    this.ignoredExtensions = new Set(opts.ignoredExtensions ?? IGNORE_EXTENSIONS);
    this.botAgents = new AhoCorasick(opts.botAgents ?? BOT_AGENTS);
    this.renderingEndpoint = opts.renderingEndpoint ?? RENDERING_ENDPOINT;
    if (this.renderingEndpoint.endsWith(DICT.slash)) {
      this.renderingEndpoint = this.renderingEndpoint.slice(0, -1);
    }
    this.renderingBase = `${this.renderingEndpoint}/?url=`;
    this.retries = opts.retries ?? 2;
    this.debug = opts.debug || process.env.DEBUG === 'true' || false;

    this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [new SEOMiddleware()]', 'OK', opts);
  }

  createMiddleware(): (req: NextRequest) => Promise<Response> {
    const self = this;
    this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [createMiddleware]', 'OK');

    return async function middleware(req: NextRequest) {
      const url = req.nextUrl.clone();
      self.debug && self.logger.info('[seo-middleware-nextjs] [DEBUG] [middleware]', 'received request', url.toString());

      const escapedFragment = url.searchParams.get(DICT.escapedFragment);

      if (typeof escapedFragment !== 'string' && !self.shouldPrerender(req, url)) {
        return NextResponse.next();
      }

      const ua = (req.headers.get(DICT.headers.ua) || DICT.empty).toLowerCase();
      let fetchUrl = `${url.origin}`;
      if (self.supportEscapedFragment && typeof escapedFragment === 'string') {
        url.searchParams.delete(DICT.escapedFragment);

        if (escapedFragment.length) {
          fetchUrl += `${url.pathname.replace(trailingSlashRe, DICT.empty)}${DICT.slash}${escapedFragment.replace(beginningSlashRe, DICT.empty)}`;
        } else {
          fetchUrl += url.pathname.replace(trailingSlashRe, DICT.empty);
        }

        if (!self.shouldPrerender(req, new URL(fetchUrl))) {
          return NextResponse.next();
        }
      } else {
        if (!self.checkBot(ua)) {
          return NextResponse.next();
        }
        fetchUrl += url.pathname;
      }

      if (self.keepGetQuery && url.search && url.search.length > 1) {
        fetchUrl += url.search;
      }

      const headers = new Headers();
      headers.set(DICT.headers.auth, self.auth);

      for (const h of DICT.keepReqHeaders) {
        if (req.headers.has(h)) {
          headers.set(h, req.headers.get(h) as string);
        }
      }

      const renderUrl = new URL(`${self.renderingBase}${encodeURIComponent(fetchUrl)}${DICT.args.bot}${encodeURIComponent(ua)}`);

      try {
        const res = await self.sendRequest(renderUrl, headers, 1);

        if (res) {
          const outHeaders = new Headers(res.headers);
          for (const h of DICT.ignoreRespHeaders) {
            outHeaders.delete(h);
          }

          return new NextResponse(res.body, {
            status: res.status,
            headers: outHeaders,
          });
        }

        return NextResponse.next();
      } catch (fetchError) {
        self.logger.warn('[seo-middleware-nextjs] [WARN] [middleware]', url.toString(), 'CAUGHT ERROR; FALLBACK TO NextResponse.next()', fetchError);
        return NextResponse.next();
      }
    };
  }

  private checkStatic(path: string): boolean {
    const lastDot = path.lastIndexOf(DICT.dot);
    const lastSlash = path.lastIndexOf(DICT.slash);
    const ext = lastDot > lastSlash ? path.slice(lastDot + 1) : DICT.empty;
    if (ext && this.ignoredExtensions.has(ext)) {
      return true;
    }
    return false;
  }

  private checkBot(ua: string): boolean {
    if (!ua || !this.botAgents.match(ua)) {
      this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [checkBot]', 'IGNORED: NOT A BOT');
      return false;
    }
    return true;
  }

  private shouldPrerender(req: NextRequest, url: URL): boolean {
    if (!DICT.allowedMethods.has(req.method)) {
      this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [shouldPrerender]', url.toString(), 'METHOD NOT ALLOWED');
      return false;
    }

    const path = url.pathname.toLowerCase();
    if (url.hostname === DICT.service.origin || url.hostname.endsWith(DICT.service.originTld) || path.includes(DICT.wellknownPath)) {
      this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [shouldPrerender]', url.toString(), 'IGNORED: GENERAL RULES');
      return false;
    }

    if (this.checkStatic(path)) {
      this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [shouldPrerender]', url.toString(), 'IGNORED: IS STATIC');
      return false;
    }

    if (this.ignoredPaths instanceof RegExp && this.ignoredPaths.test(path)) {
      this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [shouldPrerender]', url.toString(), 'IGNORED: BY PATH');
      return false;
    }

    this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [shouldPrerender]', url.toString(), 'WILL PRERENDER');
    return true;
  }

  private async sendRequest(url: URL, headers: Headers, attempt: number = 1): Promise<Response|null> {
    const signal = AbortSignal.timeout(25000);
    this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [sendRequest]', url.toString(), 'SENDING');

    try {
      const res = await fetch(url, {
        headers,
        signal,
      });

      return res;
    } catch (requestError) {
      this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [sendRequest]', url.toString(), 'CAUGHT AN ERROR', requestError);
      const nextAttempt = attempt + 1;
      if (nextAttempt <= this.retries) {
        this.debug && this.logger.info('[seo-middleware-nextjs] [DEBUG] [sendRequest]', url.toString(), 'RETRY REQUEST');
        return await this.sendRequest(url, headers, nextAttempt);
      }
      this.logger.warn('[seo-middleware-nextjs] [WARN] [sendRequest]', url.toString(), 'CAUGHT AN ERROR AFTER RETRY', requestError);
    }

    return null;
  }
}

