'use client'

import { useState, useEffect, useCallback } from 'react'
import { getEntries, getSummary, deleteEntry } from '../lib/api'
import type { Entry, DaySummary, Category } from '../lib/api'
import styles from './page.module.css'
import EntryModal from '../components/EntryModal'
import SummaryBar from '../components/SummaryBar'
import EntryCard from '../components/EntryCard'
import DateNav from '../components/DateNav'

const CATEGORIES: { key: Category; label: string; emoji: string; color: string }[] = [
  { key: 'food',       label: 'Food',       emoji: '🍽️', color: 'terracotta' },
  { key: 'medication', label: 'Medication',  emoji: '💊', color: 'lavender'   },
  { key: 'exercise',   label: 'Exercise',    emoji: '🏃', color: 'sage'       },
  { key: 'water',      label: 'Water',       emoji: '💧', color: 'sky'        },
  { key: 'sleep',      label: 'Sleep',       emoji: '🌙', color: 'slate'      },
  { key: 'mood',       label: 'Mood',        emoji: '✨', color: 'goldenrod'  },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function Home() {
  const [date, setDate] = useState(todayStr)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [entries, setEntries] = useState<Entry[]>([])
  const [summary, setSummary] = useState<DaySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [defaultCategory, setDefaultCategory] = useState<Category>('food')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [e, s] = await Promise.all([
        getEntries(date, activeCategory === 'all' ? undefined : activeCategory),
        getSummary(date),
      ])
      setEntries(e)
      setSummary(s)
    } catch {
      setEntries([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [date, activeCategory])

  useEffect(() => { load() }, [load])

  function openAdd(cat: Category = 'food') {
    setEditEntry(null)
    setDefaultCategory(cat)
    setModalOpen(true)
  }

  function openEdit(entry: Entry) {
    setEditEntry(entry)
    setDefaultCategory(entry.category)
    setModalOpen(true)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this entry?')) return
    await deleteEntry(id)
    load()
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = entries.filter(e => e.category === cat.key)
    return acc
  }, {} as Record<Category, Entry[]>)

  const displayCats = activeCategory === 'all' ? CATEGORIES : CATEGORIES.filter(c => c.key === activeCategory)

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◎</span>
          <span className={styles.logoText}>Planner</span>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeCategory === 'all' ? styles.active : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <span className={styles.navEmoji}>📋</span>
            <span>All entries</span>
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`${styles.navItem} ${styles[`navItem_${cat.color}`]} ${activeCategory === cat.key ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className={styles.navEmoji}>{cat.emoji}</span>
              <span>{cat.label}</span>
              {summary?.entry_counts[cat.key] ? (
                <span className={styles.navBadge}>{summary.entry_counts[cat.key]}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <button className={styles.addBtn} onClick={() => openAdd(activeCategory === 'all' ? 'food' : activeCategory)}>
          <span>+</span> Add entry
        </button>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.heading}>
              {activeCategory === 'all' ? 'Daily log' : CATEGORIES.find(c => c.key === activeCategory)?.label}
            </h1>
            <p className={styles.subheading}>Track your day, one entry at a time.</p>
          </div>
          <DateNav date={date} onChange={setDate} />
        </header>

        {summary && <SummaryBar summary={summary} />}

        <div className={styles.content}>
          {loading ? (
            <div className={styles.empty}>
              <span className={styles.spinner} />
            </div>
          ) : entries.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Nothing logged yet</p>
              <p className={styles.emptyText}>Start adding entries for {date}</p>
              <button className={styles.emptyBtn} onClick={() => openAdd(activeCategory === 'all' ? 'food' : activeCategory)}>
                + Add first entry
              </button>
            </div>
          ) : (
            displayCats.map(cat => {
              const catEntries = activeCategory === 'all' ? grouped[cat.key] : entries
              if (catEntries.length === 0) return null
              return (
                <section key={cat.key} className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionEmoji}>{cat.emoji}</span>
                    <h2 className={styles.sectionTitle}>{cat.label}</h2>
                    <span className={styles.sectionCount}>{catEntries.length}</span>
                    <button className={`${styles.sectionAdd} ${styles[`sectionAdd_${cat.color}`]}`} onClick={() => openAdd(cat.key)}>+</button>
                  </div>
                  <div className={styles.cards}>
                    {catEntries.map(entry => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        color={cat.color}
                        onEdit={() => openEdit(entry)}
                        onDelete={() => handleDelete(entry.id)}
                      />
                    ))}
                  </div>
                </section>
              )
            })
          )}
        </div>
      </main>

      {modalOpen && (
        <EntryModal
          date={date}
          defaultCategory={defaultCategory}
          entry={editEntry}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load() }}
        />
      )}
    </div>
  )
}
