import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon } from 'lucide-react'
import { Button } from './Button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Catches render errors so a single bad report or chart cannot blank the whole
 * app. The message is shown verbatim — hiding it would only make a local bug
 * harder to report.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="grid h-full place-items-center bg-canvas p-6">
        <div className="glass max-w-md p-6 text-center">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-accent-rose/25 bg-accent-rose/10">
            <AlertOctagon className="h-5 w-5 text-accent-rose" />
          </span>
          <h1 className="text-base font-semibold">Something broke in the interface</h1>
          <p className="mt-2 break-words text-[12px] leading-relaxed text-ink-muted">{error.message}</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    )
  }
}
