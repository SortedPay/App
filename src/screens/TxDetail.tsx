import { useNavigate, useParams } from 'react-router-dom'
import Screen from '../components/Screen'
import Header from '../components/Header'
import { TxDetailContent } from '../components/TxDetailContent'
import { useStore } from '../lib/store'

export default function TxDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tx = useStore((s) => s.transactions.find((t) => t.id === id))

  if (!tx) {
    return (
      <Screen className="pt-2">
        <Header title="Not found" />
        <p className="text-ink-muted px-2 pt-6">Transaction not found.</p>
        <button onClick={() => navigate('/activity')} className="btn btn-primary mt-4">
          Back to activity
        </button>
      </Screen>
    )
  }

  return (
    <Screen transition="modal" className="pt-2 pb-8">
      <Header title="TRANSACTION" />
      <TxDetailContent tx={tx} />
    </Screen>
  )
}
