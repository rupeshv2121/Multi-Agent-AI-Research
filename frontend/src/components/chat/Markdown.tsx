import { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useCopy } from '@/hooks/useCopy'

/**
 * `PrismLight` with an explicit language list rather than `Prism`.
 *
 * The full build registers every Prism grammar and adds well over a megabyte
 * to the bundle; research reports realistically contain these few. An
 * unregistered language still renders — just without highlighting.
 */
for (const [name, definition] of Object.entries({
  bash,
  json,
  markdown,
  python,
  sql,
  tsx,
  typescript,
  yaml,
})) {
  SyntaxHighlighter.registerLanguage(name, definition)
}

/**
 * Markdown renderer for report bodies.
 *
 * `rehype-raw` is deliberately NOT enabled: report text comes from an LLM and
 * is therefore untrusted input, so raw HTML in it must not be executed.
 * react-markdown escapes HTML by default, which is what we want here.
 */
function MarkdownComponent({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-none text-[15px] leading-[1.75] text-ink/90',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 text-2xl font-semibold tracking-tight text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 border-b border-hairline pb-2 text-lg font-semibold tracking-tight text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => <h3 className="mb-2 mt-5 text-base font-semibold text-white">{children}</h3>,
          h4: ({ children }) => <h4 className="mb-2 mt-4 text-sm font-semibold text-ink">{children}</h4>,
          p: ({ children }) => <p className="mb-4">{children}</p>,
          ul: ({ children }) => <ul className="mb-4 space-y-1.5 pl-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1.5 pl-5 marker:text-ink-faint">{children}</ol>,
          li: ({ children }) => (
            <li className="relative pl-5 before:absolute before:left-1 before:top-[0.7em] before:h-1 before:w-1 before:rounded-full before:bg-accent-blue/60 [ol>&]:pl-0 [ol>&]:before:hidden">
              {children}
            </li>
          ),
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-ink-muted">{children}</em>,
          hr: () => <hr className="my-8 border-hairline" />,
          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-r-lg border-l-2 border-accent-purple/50 bg-white/[0.03] py-2 pl-4 pr-3 text-ink-muted">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-baseline gap-0.5 break-words font-medium text-accent-cyan decoration-accent-cyan/30 underline-offset-2 transition-colors hover:text-accent-blue hover:underline"
            >
              {children}
              <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-70" />
            </a>
          ),
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-hairline">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[0.04]">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-hairline px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border-b border-hairline/50 px-3 py-2.5 align-top">{children}</td>,
          tr: ({ children }) => <tr className="transition-colors hover:bg-white/[0.02]">{children}</tr>,
          img: ({ src, alt }) => (
            <img
              src={typeof src === 'string' ? src : undefined}
              alt={alt ?? ''}
              loading="lazy"
              className="my-4 max-w-full rounded-xl border border-hairline"
            />
          ),
          code: ({ className: codeClass, children, ...props }) => {
            const language = /language-(\w+)/.exec(codeClass ?? '')?.[1]
            const text = String(children).replace(/\n$/, '')

            // Inline code: no language fence and no newline.
            if (!language && !text.includes('\n')) {
              return (
                <code
                  className="rounded-md border border-hairline bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-accent-cyan"
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return <CodeBlock code={text} language={language} />
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const { copied, copy } = useCopy()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="group relative my-4 overflow-hidden rounded-xl border border-hairline bg-[#0b0b0f]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between border-b border-hairline bg-white/[0.03] px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{language ?? 'text'}</span>
        <button
          onClick={() => copy(code, 'Code copied')}
          className={cn(
            'flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-ink-faint transition-all hover:bg-white/10 hover:text-ink',
            hovered ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100',
          )}
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-accent-emerald" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language ?? 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: 'transparent',
          padding: '14px 16px',
          fontSize: '12.5px',
          lineHeight: 1.6,
        }}
        codeTagProps={{ style: { fontFamily: 'JetBrains Mono, monospace' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

// Report bodies are large and re-render on every stream tick, so memoise on the
// text itself.
export const Markdown = memo(MarkdownComponent, (prev, next) => prev.content === next.content)
