import { useMemo, useState } from 'react'
import './App.css'

const STARTER_PEOPLE = [
  { id: 'you', name: 'You' },
  { id: 'alex', name: 'Alex' },
  { id: 'sam', name: 'Sam' },
]

export default function App() {
  const [people] = useState(STARTER_PEOPLE)
  const [description, setDescription] = useState('Dinner')
  const [amount, setAmount] = useState('84')
  const [paidBy, setPaidBy] = useState('you')
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Groceries', amount: 46.5, paidBy: 'alex' },
  ])

  const balances = useMemo(() => {
    const totals = Object.fromEntries(people.map((person) => [person.id, 0]))
    const shareCount = people.length || 1

    expenses.forEach((expense) => {
      const share = expense.amount / shareCount
      people.forEach((person) => {
        totals[person.id] -= share
      })
      totals[expense.paidBy] += expense.amount
    })

    return people.map((person) => ({
      ...person,
      balance: totals[person.id],
    }))
  }, [expenses, people])

  function addExpense(event) {
    event.preventDefault()
    const parsed = Number.parseFloat(amount)

    if (!description.trim() || !Number.isFinite(parsed) || parsed <= 0) {
      return
    }

    setExpenses((current) => [
      {
        id: Date.now(),
        description: description.trim(),
        amount: parsed,
        paidBy,
      },
      ...current,
    ])
    setDescription('')
    setAmount('')
  }

  function personName(id) {
    return people.find((person) => person.id === id)?.name ?? id
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">PayBoi</p>
        <h1>Split it. Track it. Settle up.</h1>
        <p className="lede">
          A fresh React starter for shared expenses. Edit locally, then see the
          same app live on GitHub Pages.
        </p>
      </header>

      <main className="layout">
        <section className="card">
          <h2>Add an expense</h2>
          <form className="form" onSubmit={addExpense}>
            <label>
              What was it?
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Coffee, taxi, rent..."
              />
            </label>
            <label>
              Amount
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder="0.00"
              />
            </label>
            <label>
              Paid by
              <select
                value={paidBy}
                onChange={(event) => setPaidBy(event.target.value)}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Add expense</button>
          </form>
        </section>

        <section className="card">
          <h2>Balances</h2>
          <ul className="balances">
            {balances.map((person) => (
              <li key={person.id}>
                <span>{person.name}</span>
                <strong className={person.balance >= 0 ? 'positive' : 'negative'}>
                  {person.balance >= 0 ? 'is owed' : 'owes'}{' '}
                  {Math.abs(person.balance).toFixed(2)}
                </strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="card wide">
          <h2>Activity</h2>
          {expenses.length === 0 ? (
            <p className="empty">No expenses yet. Add the first one above.</p>
          ) : (
            <ul className="activity">
              {expenses.map((expense) => (
                <li key={expense.id}>
                  <div>
                    <strong>{expense.description}</strong>
                    <span>{personName(expense.paidBy)} paid</span>
                  </div>
                  <em>{expense.amount.toFixed(2)}</em>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
