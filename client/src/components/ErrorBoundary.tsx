import { Component, type ReactNode } from 'react'
import s from './ErrorBoundary.module.css'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('FormCraft crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className={s.page}>
        <div className={s.card}>
          <span className={s.icon}>⚠️</span>
          <h1 className={s.title}>Algo deu errado</h1>
          <p className={s.desc}>
            Essa tela travou por um erro inesperado. Seus dados estão salvos no Firestore — nada foi perdido.
          </p>
          <div className={s.actions}>
            <button className={s.secondary} onClick={() => this.setState({ error: null })}>Tentar de novo</button>
            <button className={s.primary} onClick={() => window.location.reload()}>Recarregar a página</button>
          </div>
          <details className={s.details}>
            <summary>Detalhes técnicos</summary>
            <pre>{this.state.error.message}{'\n'}{this.state.error.stack}</pre>
          </details>
        </div>
      </div>
    )
  }
}
