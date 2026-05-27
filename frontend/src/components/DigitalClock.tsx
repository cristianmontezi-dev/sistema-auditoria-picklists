import { useState, useEffect } from 'react'

interface TimeZoneClock {
  name: string
  timezone: string
  time: string
  date: string
}

function DigitalClock() {
  const [clocks, setClocks] = useState<TimeZoneClock[]>([])

  useEffect(() => {
    const updateClocks = () => {
      const timeZones = [
        { name: '🇧🇷 Brasil (São Paulo)', timezone: 'America/Sao_Paulo' },
        { name: '🇺🇸 USA (New York)', timezone: 'America/New_York' },
        { name: '🇬🇧 UK (London)', timezone: 'Europe/London' },
        { name: '🇯🇵 Japan (Tokyo)', timezone: 'Asia/Tokyo' },
        { name: '🇦🇺 Australia (Sydney)', timezone: 'Australia/Sydney' },
        { name: '🇮🇳 India (Delhi)', timezone: 'Asia/Kolkata' },
      ]

      const updatedClocks = timeZones.map((tz) => {
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('pt-BR', {
          timeZone: tz.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })

        const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
          timeZone: tz.timezone,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })

        return {
          name: tz.name,
          timezone: tz.timezone,
          time: formatter.format(now),
          date: dateFormatter.format(now),
        }
      })

      setClocks(updatedClocks)
    }

    updateClocks()
    const interval = setInterval(updateClocks, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🕐 Relógios Digitais - Múltiplos Fusos Horários</h1>
      
      <div style={styles.clocksGrid}>
        {clocks.map((clock) => (
          <div key={clock.timezone} style={styles.clockCard}>
            <h3 style={styles.clockName}>{clock.name}</h3>
            <div style={styles.timeDisplay}>{clock.time}</div>
            <div style={styles.dateDisplay}>{clock.date}</div>
            <div style={styles.timezoneLabel}>{clock.timezone}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center' as const,
    color: '#003366',
    marginBottom: '40px',
    fontSize: '28px',
  },
  clocksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  clockCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
    border: '2px solid #003366',
  },
  clockName: {
    color: '#003366',
    fontSize: '16px',
    marginBottom: '10px',
  },
  timeDisplay: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#00aa00',
    fontFamily: 'monospace',
    margin: '20px 0',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  dateDisplay: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px',
  },
  timezoneLabel: {
    fontSize: '12px',
    color: '#999',
    marginTop: '10px',
  },
}

export default DigitalClock
