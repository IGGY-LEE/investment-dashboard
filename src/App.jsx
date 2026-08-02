import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Compass, CalendarDays, TrendingUp, Pickaxe, Trophy, Banknote, Newspaper, Bitcoin, Layers, Briefcase, Puzzle } from 'lucide-react'
import Dashboard from './pages/Dashboard'
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
import './index.css'

const NAV_ITEMS = [
  { path: '/', label: '대시보드', icon: <LayoutDashboard size={20} /> },
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

function Layout({ children }) {
  const location = useLocation()
  
  const getPageTitle = () => {
    const current = NAV_ITEMS.find(item => item.path === location.pathname)
    return current ? current.label : '투자 대시보드'
  }

  return (
    <div className="app-container">
      {/* PC Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          InvestBoard
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
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile Header */}
        <header className="mobile-header">
          {getPageTitle()}
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
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/news" element={<News />} />
          <Route path="/macro" element={<Macro />} />
          <Route path="/exchange" element={<ExchangeRates />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/crypto" element={<Crypto />} />
          <Route path="/etf" element={<ETF />} />
          <Route path="/leaders" element={<Watchlist />} />
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
