import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, BarChart2, Zap } from 'lucide-react'

export default function DashboardSubNav({ activeTab = 'ai' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
      backgroundColor: 'var(--surface-color)',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.75rem',
      border: '1px solid var(--border-color)',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
        <Link 
          to="/" 
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.92rem',
            fontWeight: activeTab === 'ai' ? '700' : '500',
            color: activeTab === 'ai' ? '#ffffff' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'ai' ? 'var(--accent-color, #3b82f6)' : 'transparent',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'ai' ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none'
          }}
        >
          <Sparkles size={17} style={{ color: activeTab === 'ai' ? '#fbbf24' : 'inherit' }} />
          <span>Gemini AI 투자 분석</span>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '1rem',
            backgroundColor: activeTab === 'ai' ? 'rgba(255,255,255,0.22)' : 'var(--surface-hover)',
            fontWeight: '600'
          }}>
            AI Hub
          </span>
        </Link>

        <Link 
          to="/market" 
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.92rem',
            fontWeight: activeTab === 'market' ? '700' : '500',
            color: activeTab === 'market' ? '#ffffff' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'market' ? 'var(--accent-color, #3b82f6)' : 'transparent',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'market' ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none'
          }}
        >
          <BarChart2 size={17} />
          <span>실시간 종합 시황</span>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '1rem',
            backgroundColor: activeTab === 'market' ? 'rgba(255,255,255,0.22)' : 'var(--surface-hover)',
            fontWeight: '600'
          }}>
            Live Data
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <Zap size={14} style={{ color: '#10b981' }} />
        <span>Gemini 3.8 / 3.6 Active</span>
      </div>
    </div>
  )
}
