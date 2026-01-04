import type { Plugin, ViteDevServer } from "vite";

interface ConsoleLogOptions {
  enabled?: boolean;
  route?: string;
  levels?: Array<"log" | "info" | "warn" | "error" | "debug">;
  tag?: string;
  colors?: boolean;
}

const DEFAULTS: Required<ConsoleLogOptions> = {
  enabled: true,
  route: "/__console-log",
  levels: ["log", "info", "warn", "error", "debug"],
  tag: "[browser]",
  colors: true,
};

export function consoleLog(opts: ConsoleLogOptions = {}): Plugin {
  const options = { ...DEFAULTS, ...opts };
  const VIRTUAL_ID = "\0virtual:console-log-client";
  const PUBLIC_ID = "virtual:console-log-client";

  return {
    name: "vite-console-log",
    enforce: "pre",

    resolveId(id) {
      if (id === PUBLIC_ID) return VIRTUAL_ID;
      return null;
    },

    load(id, loadOptions) {
      if (id !== VIRTUAL_ID) return null;
      // Return empty module in production or SSR
      if (loadOptions?.ssr || process.env.NODE_ENV === "production") {
        return "export default undefined;";
      }
      return makeClientScript(options);
    },

    configureServer(server: ViteDevServer) {
      if (!options.enabled) return;

      server.middlewares.use(options.route, (req, res, next) => {
        if (req.method !== "POST") return next();

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            if (!payload?.entries?.length) {
              res.statusCode = 400;
              res.end();
              return;
            }

            const logger = server.config.logger;
            for (const entry of payload.entries) {
              const level = entry.level || "log";
              const text = entry.text || "";
              const source = entry.source ? ` (${entry.source})` : "";
              const line = `${options.tag} ${level.toUpperCase()}: ${text}${source}`;
              const colored = options.colors ? colorize(level, line) : line;

              if (level === "error") logger.error(colored);
              else if (level === "warn") logger.warn(colored);
              else logger.info(colored);
            }

            res.statusCode = 204;
            res.end();
          } catch {
            res.statusCode = 400;
            res.end();
          }
        });
      });
    },
  };
}

function colorize(level: string, message: string): string {
  const colors: Record<string, string> = {
    error: "\x1b[31m",
    warn: "\x1b[33m",
    debug: "\x1b[35m",
    info: "\x1b[36m",
    log: "\x1b[37m",
  };
  const reset = "\x1b[0m";
  return `${colors[level] || colors.log}${message}${reset}`;
}

function makeClientScript(options: Required<ConsoleLogOptions>): string {
  return `
if (typeof window !== 'undefined' && !window.__console_log_installed__) {
  window.__console_log_installed__ = true;

  const route = ${JSON.stringify(options.route)};
  const levels = ${JSON.stringify(options.levels)};
  const queue = [];
  let timer = null;

  const session = (() => {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  })();

  function flush() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!queue.length) return;
    const entries = queue.splice(0, queue.length);
    const payload = JSON.stringify({ sessionId: session, entries });
    navigator.sendBeacon?.(route, new Blob([payload], { type: 'application/json' }));
  }

  function enqueue(entry) {
    queue.push(entry);
    if (queue.length >= 20) flush();
    else if (!timer) timer = setTimeout(flush, 300);
  }

  function getSource() {
    try {
      const stack = new Error().stack || '';
      const lines = stack.split('\\n').slice(1);
      const appLine = lines.find(l => !l.includes('console-log-client') && !l.includes('getSource'));
      if (!appLine) return '';
      const match = appLine.match(/\\(?((?:file:\\/\\/|https?:\\/\\/|\\/)[^) \\n]+):(\\d+):(\\d+)\\)?/);
      return match ? match[1] + ':' + match[2] : '';
    } catch { return ''; }
  }

  function format(val) {
    if (typeof val === 'string') return val;
    if (val instanceof Error) return val.name + ': ' + val.message;
    try { return JSON.stringify(val); } catch { return String(val); }
  }

  for (const level of levels) {
    const orig = console[level]?.bind(console) || console.log.bind(console);
    console[level] = (...args) => {
      enqueue({ level, text: args.map(format).join(' '), source: getSource(), time: Date.now() });
      orig(...args);
    };
  }

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  addEventListener('pagehide', flush);
}
`;
}

export default consoleLog;
