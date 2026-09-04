import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Compass, CalendarDays, TrendingUp, Pickaxe, Trophy, Banknote, Newspaper, Bitcoin, Layers, Briefcase, Puzzle, Search } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Screener from './pages/Screener'
import Strategy from './pages/Strategy'
import Schedule from './pages/Schedule'
import Macro from './pages/Macro'
import ExchangeRates from './pages/ExchangeRates'
import Materials from './pages/Materials'
import Watchlist from './pages/Watchlist'
import News from './pages/News'
import Crypto from './pages/Crypto'
import ETF from './pages/ETF'
import Portfolio from './pages/Portfolio'
import Plugins from './pages/Plugins'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LogIn, LogOut } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import './index.css'

const NAV_ITEMS = [
  { path: '/', label: '대시보드', icon: <LayoutDashboard size={20} /> },
  { path: '/screener', label: '종목 스크리너', icon: <Search size={20} /> },
  { path: '/strategy', label: 'AI 투자 전략', icon: <Compass size={20} /> },
  { path: '/schedule', label: '주요 일정', icon: <CalendarDays size={20} /> },
  { path: '/news', label: '주요 뉴스', icon: <Newspaper size={20} /> },
  { path: '/macro', label: '거시/선물', icon: <TrendingUp size={20} /> },
  { path: '/exchange', label: '환율', icon: <Banknote size={20} /> },
  { path: '/materials', label: '원자재', icon: <Pickaxe size={20} /> },
  { path: '/crypto', label: '가상자산', icon: <Bitcoin size={20} /> },
  { path: '/etf', label: '테마/ETF', icon: <Layers size={20} /> },
  { path: '/leaders', label: '시장 주도주', icon: <Trophy size={20} /> },
  { path: '/portfolio', label: '내 포트폴리오', icon: <Briefcase size={20} /> },
  { path: '/plugins', label: 'AI 스킬/플러그인', icon: <Puzzle size={20} /> },
]

function PrivateRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" />
}

function Layout({ children }) {
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  
  const getPageTitle = () => {
    const current = NAV_ITEMS.find(item => item.path === location.pathname)
    return current ? current.label : '투자 대시보드'
  }

  return (
    <div className="app-container">
      {/* PC Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 'bold', letterSpacing: '-0.3px' }}>연구원 아빠의 투자연구소</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 'normal' }}>
            InvestBoard by IGGY
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Auth Button */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          {currentUser ? (
            <button onClick={logout} className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <LogOut size={20} />
              <span>로그아웃</span>
            </button>
          ) : (
            <NavLink to="/login" className="nav-item">
              <LogIn size={20} />
              <span>로그인</span>
            </NavLink>
          )}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile Header */}
        <header className="mobile-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>{getPageTitle()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>연구원 아빠의 투자연구소</span>
            <span>InvestBoard by IGGY</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content" style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/login" element={<Login />} />
            <Route path="/strategy" element={<PrivateRoute><Strategy /></PrivateRoute>} />
            <Route path="/schedule" element={<Schedule />} />
          <Route path="/news" element={<News />} />
          <Route path="/macro" element={<Macro />} />
          <Route path="/exchange" element={<ExchangeRates />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/crypto" element={<Crypto />} />
          <Route path="/etf" element={<ETF />} />
          <Route path="/leaders" element={<Watchlist />} />
            <Route path="/plugins" element={<Plugins />} />
            <Route path="/portfolio" element={<PrivateRoute><Portfolio /></PrivateRoute>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
