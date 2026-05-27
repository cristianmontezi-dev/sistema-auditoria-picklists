import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

interface User {
  id: string
  email: string
  name: string
}

interface Route {
  id: string
  code: string
  branches: Branch[]
}

interface Branch {
  id: string
  code: string
  name: string
}

interface ConferenceItem {
  picklistCode: string
  status: 'SCANNED' | 'MISSING' | 'CANCELLED'
  timestamp: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [conferenceStarted, setConferenceStarted] = useState(false)
  const [conferenceId, setConferenceId] = useState('')
  const [picklistCode, setPicklistCode] = useState('')
  const [scans, setScans] = useState<ConferenceItem[]>([])
  const [currentStep, setCurrentStep] = useState<'login' | 'routes' | 'branches' | 'scanning' | 'report'>('login')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      })
      setUser(response.data.user)
      localStorage.setItem('token', response.data.accessToken)
      await loadRoutes(response.data.accessToken)
      setCurrentStep('routes')
    } catch (error) {
      alert('Erro ao fazer login')
    }
  }

  const loadRoutes = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRoutes(response.data)
    } catch (error) {
      alert('Erro ao carregar rotas')
    }
  }

  const selectRoute = (route: Route) => {
    setSelectedRoute(route)
    setCurrentStep('branches')
  }

  const startBranchConference = async (branch: Branch) => {
    try {
      setSelectedBranch(branch)
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/conferences`,
        { userId: user?.id, routeId: selectedRoute?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setConferenceId(response.data.id)
      setScans([])
      setCurrentStep('scanning')
    } catch (error) {
      alert('Erro ao iniciar conferência')
    }
  }

  const addScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!picklistCode.trim()) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/conferences/${conferenceId}/scan`,
        {
          branchId: selectedBranch?.id,
          picklistCode,
          status: 'SCANNED',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const newScan: ConferenceItem = {
        picklistCode,
        status: 'SCANNED',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      }

      setScans([...scans, newScan])
      setPicklistCode('')
    } catch (error) {
      alert('Erro ao registrar scan')
    }
  }

  const finishBranchConference = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/api/conferences/${conferenceId}/finish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCurrentStep('report')
    } catch (error) {
      alert('Erro ao finalizar conferência')
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    setRoutes([])
    setSelectedRoute(null)
    setSelectedBranch(null)
    setScans([])
    setCurrentStep('login')
  }

  // LOGIN SCREEN
  if (currentStep === 'login') {
    return (
      <div className="mobile-container login-screen">
        <div className="login-header">
          <h1>📦</h1>
          <h2>Sistema de Auditoria</h2>
          <p>Picklists & Embarques</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-large">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <p><strong>Email Demo:</strong></p>
          <p>conferente@carrarologistica.com.br</p>
          <p><strong>Senha Demo:</strong></p>
          <p>123456</p>
        </div>
      </div>
    )
  }

  // ROUTES SCREEN
  if (currentStep === 'routes') {
    return (
      <div className="mobile-container">
        <header className="app-header">
          <h1>🚚 Selecione uma Rota</h1>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </header>

        <div className="routes-list">
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => selectRoute(route)}
              className="route-card"
            >
              <div className="route-code">Rota {route.code}</div>
              <div className="route-branches">{route.branches.length} filiais</div>
              <div className="route-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // BRANCHES SCREEN
  if (currentStep === 'branches') {
    return (
      <div className="mobile-container">
        <header className="app-header">
          <button onClick={() => setCurrentStep('routes')} className="btn-back">← Voltar</button>
          <h1>🏢 Rota {selectedRoute?.code}</h1>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </header>

        <div className="branches-list">
          {selectedRoute?.branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => startBranchConference(branch)}
              className="branch-card"
            >
              <div className="branch-icon">📍</div>
              <div className="branch-info">
                <div className="branch-code">Filial {branch.code}</div>
                <div className="branch-name">{branch.name}</div>
              </div>
              <div className="branch-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // SCANNING SCREEN
  if (currentStep === 'scanning') {
    return (
      <div className="mobile-container scanning-screen">
        <header className="app-header">
          <button onClick={() => setCurrentStep('branches')} className="btn-back">← Voltar</button>
          <h1>📋 Conferência</h1>
        </header>

        <div className="scanning-info">
          <div className="info-row">
            <span className="info-label">Rota:</span>
            <span className="info-value">{selectedRoute?.code}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Filial:</span>
            <span className="info-value">{selectedBranch?.code}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Picklists:</span>
            <span className="info-value badge-count">{scans.length}</span>
          </div>
        </div>

        <form onSubmit={addScan} className="scanning-form">
          <div className="scanner-input-group">
            <input
              type="text"
              placeholder="🔍 Escaneie ou digite o código"
              value={picklistCode}
              onChange={(e) => setPicklistCode(e.target.value)}
              autoFocus
              className="scanner-input"
            />
            <button type="submit" className="btn-scan">
              ✓
            </button>
          </div>
        </form>

        <div className="scans-list">
          {scans.length > 0 ? (
            scans.map((scan, idx) => (
              <div key={idx} className="scan-item">
                <div className="scan-code">{scan.picklistCode}</div>
                <div className="scan-status">
                  <span className="status-badge scanned">✓ Conferenciado</span>
                  <span className="scan-time">{scan.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Nenhuma picklist registrada</p>
            </div>
          )}
        </div>

        <button onClick={finishBranchConference} className="btn-finish">
          ✅ Finalizar Filial
        </button>
      </div>
    )
  }

  // REPORT SCREEN
  if (currentStep === 'report') {
    return (
      <div className="mobile-container report-screen">
        <div className="report-header success">
          <h1>✅</h1>
          <h2>Conferência Concluída!</h2>
        </div>

        <div className="report-content">
          <div className="report-section">
            <h3>Resumo da Conferência</h3>
            <div className="report-row">
              <span>Rota:</span>
              <strong>{selectedRoute?.code}</strong>
            </div>
            <div className="report-row">
              <span>Filial:</span>
              <strong>{selectedBranch?.code}</strong>
            </div>
            <div className="report-row">
              <span>Total de Picklists:</span>
              <strong>{scans.length}</strong>
            </div>
            <div className="report-row">
              <span>Status:</span>
              <strong className="status-success">100% Conferenciado</strong>
            </div>
          </div>

          <div className="report-section">
            <h3>📧 Relatório Enviado</h3>
            <p className="email-info">
              Um relatório detalhado foi enviado para:
              <br />
              <strong>cdguarulhos@carrarologistica.com.br</strong>
            </p>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={() => setCurrentStep('branches')} className="btn-primary">
            ➕ Próxima Filial
          </button>
          <button onClick={() => setCurrentStep('routes')} className="btn-secondary">
            🏠 Menu Principal
          </button>
        </div>
      </div>
    )
  }
}

export default App
