import React, { useState } from 'react'
import { Briefcase, Target, ArrowUpRight, ArrowDownRight, Wallet, PieChart as PieChartIcon, Edit, Trash2, Plus, X, Save } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import ChartModal from '../components/ChartModal'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getQuotes } from '../api'

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('전체 현황')
  const [selectedItem, setSelectedItem] = useState(null)
  
  const { currentUser } = useAuth()
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false)
  const [editHoldings, setEditHoldings] = useState({})
  const [newHolding, setNewHolding] = useState({ category: '미국 주식', ticker: '', name: '', qty: '', avgPrice: '', sector: '기술 (Tech)' })
  const [isSaving, setIsSaving] = useState(false)

  const tabs = ['전체 현황', '미국 주식', '한국 주식', '배당 및 배분']

  const defaultData = {
    portfolioHistory: [
      { month: '1월', value: 95000 },
      { month: '2월', value: 98000 },
      { month: '3월', value: 102000 },
      { month: '4월', value: 99000 },
      { month: '5월', value: 105000 },
      { month: '6월', value: 112000 },
      { month: '7월', value: 115400 },
    ],
    sectorAllocation: [
      { name: '기술 (Tech)', value: 45, color: '#3b82f6' },
      { name: '금융 (Financials)', value: 20, color: '#10b981' },
      { name: '헬스케어 (Healthcare)', value: 15, color: '#f59e0b' },
      { name: '소비재 (Consumer)', value: 10, color: '#8b5cf6' },
      { name: '현금 (Cash)', value: 10, color: '#64748b' },
    ],
    holdings: {
      '미국 주식': [
        { ticker: 'AAPL', name: 'Apple Inc.', qty: 50, avgPrice: 150.20, currentPrice: 175.40, return: '+16.7%', sector: '기술 (Tech)' },
        { ticker: 'MSFT', name: 'Microsoft Corp.', qty: 30, avgPrice: 310.50, currentPrice: 420.10, return: '+35.3%', sector: '기술 (Tech)' },
        { ticker: 'NVDA', name: 'Nvidia Corp.', qty: 15, avgPrice: 450.00, currentPrice: 880.20, return: '+95.6%', sector: '기술 (Tech)' },
      ],
      '한국 주식': [
        { ticker: '005930', name: '삼성전자', qty: 200, avgPrice: 72000, currentPrice: 81000, return: '+12.5%', sector: '기술 (Tech)' },
        { ticker: '000660', name: 'SK하이닉스', qty: 50, avgPrice: 110000, currentPrice: 175000, return: '+59.0%', sector: '기술 (Tech)' },
      ]
    }
  }

  React.useEffect(() => {
    let timeoutId;
    async function loadPortfolio() {
      if (!currentUser) return;
      
      // 만약 5초 이상 응답이 없으면 데이터베이스 미생성으로 간주
      timeoutId = setTimeout(() => {
        if (loading) {
          setErrorMsg('데이터베이스(Firestore) 연결이 지연되고 있습니다. Firebase 콘솔에서 Firestore Database가 정상적으로 "생성"되었는지 다시 한번 확인해 주세요.');
          setLoading(false);
        }
      }, 5000);

      try {
        const docRef = doc(db, 'users', currentUser.uid, 'data', 'portfolio');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPortfolioData(docSnap.data());
        } else {
          await setDoc(docRef, defaultData);
          setPortfolioData(defaultData);
        }
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load portfolio:", err);
        setErrorMsg('데이터베이스 권한 오류가 발생했습니다. (Test mode 기간 만료 등)');
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
    loadPortfolio();
    return () => clearTimeout(timeoutId);
  }, [currentUser]);

  React.useEffect(() => {
    if (!portfolioData || loading) return;
    let isMounted = true;

    const fetchLivePrices = async () => {
      const symbols = [];
      for (const cat in portfolioData.holdings) {
        portfolioData.holdings[cat].forEach(item => {
          let yfSymbol = item.ticker;
          if (cat === '한국 주식' && /^\d+$/.test(yfSymbol)) yfSymbol += '.KS';
          symbols.push(yfSymbol);
        });
      }

      if (symbols.length > 0) {
        const quotes = await getQuotes(symbols);
        if (!isMounted || quotes.length === 0) return;

        setPortfolioData(prev => {
          const next = JSON.parse(JSON.stringify(prev));
          let totalValue = 0;
          let totalCost = 0;
          
          for (const cat in next.holdings) {
            next.holdings[cat].forEach(holding => {
              let yfSymbol = holding.ticker;
              if (cat === '한국 주식' && /^\d+$/.test(yfSymbol)) yfSymbol += '.KS';
              
              const quote = quotes.find(q => q.symbol === yfSymbol);
              if (quote && quote.regularMarketPrice) {
                holding.currentPrice = quote.regularMarketPrice;
                const cost = holding.avgPrice * holding.qty;
                const val = holding.currentPrice * holding.qty;
                const ret = ((val - cost) / cost) * 100;
                holding.return = `${ret >= 0 ? '+' : ''}${ret.toFixed(2)}%`;
                
                totalValue += val;
                totalCost += cost;
              } else {
                totalValue += holding.currentPrice * holding.qty;
                totalCost += holding.avgPrice * holding.qty;
              }
            });
          }
          
          next.totalValue = totalValue;
          next.totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
          
          // Avoid setting state if nothing changed (basic check)
          if (JSON.stringify(prev.holdings) === JSON.stringify(next.holdings)) {
            return prev;
          }
          return next;
        });
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loading, isEditing]); // Stop fetching live prices while editing? No, it's fine, but let's re-run when saving.

  // Dynamic Sector Allocation Calculation
  const dynamicSectorAllocation = React.useMemo(() => {
    if (!portfolioData || !portfolioData.holdings) return [];
    
    const sectorValues = {};
    let totalValue = 0;

    const predefinedColors = {
      '기술 (Tech)': '#3b82f6',
      '금융 (Financials)': '#10b981',
      '헬스케어 (Healthcare)': '#f59e0b',
      '소비재 (Consumer)': '#8b5cf6',
      '현금 (Cash)': '#64748b',
      '산업재 (Industrials)': '#ef4444',
      '에너지 (Energy)': '#f97316',
      '기타 (Others)': '#a8a29e'
    };
    const colorsList = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b', '#ef4444', '#f97316', '#14b8a6', '#f43f5e', '#84cc16'];
    let colorIndex = 0;
    
    for (const cat in portfolioData.holdings) {
      portfolioData.holdings[cat].forEach(h => {
        const value = (h.currentPrice || h.avgPrice) * h.qty;
        const sector = h.sector || '기타 (Others)';
        sectorValues[sector] = (sectorValues[sector] || 0) + value;
        totalValue += value;
      });
    }

    if (totalValue === 0) return [];

    return Object.entries(sectorValues)
      .map(([name, value]) => ({
        name,
        value: Number(((value / totalValue) * 100).toFixed(1)),
        color: predefinedColors[name] || colorsList[(colorIndex++) % colorsList.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [portfolioData]);

  // Editing Handlers
  const openEditModal = () => {
    setEditHoldings(JSON.parse(JSON.stringify(portfolioData.holdings)));
    setIsEditing(true);
  };

  const handleRemoveHolding = (cat, idx) => {
    const updated = { ...editHoldings };
    updated[cat].splice(idx, 1);
    setEditHoldings(updated);
  };

  const handleAddHolding = () => {
    if (!newHolding.ticker || !newHolding.qty || !newHolding.avgPrice) {
      alert("티커, 수량, 매수단가는 필수입니다.");
      return;
    }
    const cat = newHolding.category;
    const updated = { ...editHoldings };
    if (!updated[cat]) updated[cat] = [];
    
    updated[cat].push({
      ticker: newHolding.ticker.toUpperCase(),
      name: newHolding.name || newHolding.ticker.toUpperCase(),
      qty: parseFloat(newHolding.qty),
      avgPrice: parseFloat(newHolding.avgPrice),
      currentPrice: parseFloat(newHolding.avgPrice), // Temp value until fetched
      return: '0.00%',
      sector: newHolding.sector
    });
    
    setEditHoldings(updated);
    setNewHolding({ category: '미국 주식', ticker: '', name: '', qty: '', avgPrice: '', sector: '기술 (Tech)' });
  };

  const savePortfolio = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'data', 'portfolio');
      const nextData = { ...portfolioData, holdings: editHoldings };
      await setDoc(docRef, nextData);
      setPortfolioData(nextData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("포트폴리오 저장에 실패했습니다.");
    }
    setIsSaving(false);
  };

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spin" style={{ display: 'inline-block', marginRight: '0.5rem', width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%' }}></span> 데이터를 불러오는 중입니다...</div>
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid var(--positive-color)' }}>
          <h2 style={{ color: 'var(--positive-color)', marginBottom: '1rem' }}>데이터베이스 접근 오류</h2>
          <p style={{ lineHeight: '1.6' }}>{errorMsg}</p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'left' }}>
            <strong>💡 해결 방법:</strong><br/>
            1. <a href="https://console.firebase.google.com/project/invest-dashboard-a476d/firestore" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>Firebase 콘솔(여기 클릭)</a>에 접속합니다.<br/>
            2. 좌측 <strong>빌드 {'>'} Firestore Database</strong> 메뉴로 들어갑니다.<br/>
            3. <strong>데이터베이스 만들기</strong> 버튼을 눌러 생성을 완료해주세요. ('테스트 모드에서 시작' 선택)<br/>
            4. 생성 완료 후 1~2분 뒤에 이 페이지를 새로고침 해보세요.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={24} color="var(--accent-color)" /> 내 포트폴리오
          </h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>계좌 연동을 통한 실시간 자산 추이 및 종목 관리 대시보드입니다.</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="badge neutral clickable" 
            onClick={openEditModal}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-color)' }}
          >
            <Edit size={14} /> 포트폴리오 편집
          </button>
          <button 
            className="badge neutral clickable" 
            onClick={() => alert('증권사 Open API 연동 기능은 백엔드에서 제공됩니다.')}
          >
            + 증권사 계좌 연동
          </button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === '전체 현황' ? (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <Wallet size={16} /> 총 평가 금액
              </div>
              <div className="text-4xl" style={{ fontWeight: 'bold' }}>
                ${portfolioData.totalValue ? portfolioData.totalValue.toLocaleString(undefined, {maximumFractionDigits: 2}) : '115,400.00'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                {portfolioData.totalReturn !== undefined ? (
                  <span className={`badge ${portfolioData.totalReturn >= 0 ? 'positive' : 'negative'}`} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {portfolioData.totalReturn >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} 
                    {portfolioData.totalReturn > 0 ? '+' : ''}{portfolioData.totalReturn.toFixed(2)}%
                  </span>
                ) : (
                  <span className="badge positive" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <ArrowUpRight size={14} /> +$4,250 (3.8%)
                  </span>
                )}
                <span className="text-secondary" style={{ fontSize: '0.875rem' }}>평가 수익률</span>
              </div>
            </div>
            
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <Target size={16} /> 2026년 목표 달성률
              </div>
              <div className="text-4xl" style={{ fontWeight: 'bold' }}>76.9%</div>
              
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginTop: '1.25rem', overflow: 'hidden' }}>
                <div style={{ width: '76.9%', height: '100%', backgroundColor: 'var(--accent-color)' }}></div>
              </div>
              <div className="flex-between text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                <span>$115,400</span>
                <span>목표 $150,000</span>
              </div>
            </div>
            
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <PieChartIcon size={16} /> 투자 성향 분석
              </div>
              <div className="text-2xl" style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>적극투자형 (Aggressive)</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '1rem', lineHeight: '1.4' }}>
                현재 포트폴리오는 기술주(45%) 비중이 매우 높아 시장 변동성에 민감하게 반응할 수 있습니다. 
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 className="card-title">월별 자산 추이</h2>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={portfolioData.portfolioHistory} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="month" stroke={textColor} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke={textColor} 
                      axisLine={false} 
                      tickLine={false} 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip 
                      formatter={(val) => `$${val.toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">섹터 비중 (Sector Allocation)</h2>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicSectorAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dynamicSectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `${value}%`}
                      contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legend Overlay */}
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dynamicSectorAllocation.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: s.color }}></div>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === '배당 및 배분' ? (
        <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '3rem 1rem' }}>
          <div className="text-secondary" style={{ marginBottom: '1rem' }}>배당 캘린더 및 리밸런싱 시뮬레이터는 백엔드 연동 후 제공됩니다.</div>
        </div>
      ) : (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>종목명 (Ticker)</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>수량</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>매수 평균가</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>현재가</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>수익률</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.holdings[activeTab]?.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="clickable" 
                    onClick={() => setSelectedItem({ name: item.name, value: item.currentPrice })}
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.ticker}</div>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{item.name}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{item.qty}주</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{item.avgPrice.toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>{item.currentPrice.toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span className={`badge ${item.return.startsWith('+') ? 'positive' : 'negative'}`}>{item.return}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ChartModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />

      {/* Edit Modal */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsEditing(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              <Edit size={20} color="var(--accent-color)" /> 포트폴리오 편집
            </h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>현재 보유 종목</h3>
              {Object.keys(editHoldings).map(cat => (
                <div key={cat} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>{cat}</h4>
                  {editHoldings[cat].length === 0 ? <div className="text-secondary" style={{ fontSize: '0.875rem' }}>종목이 없습니다.</div> : null}
                  {editHoldings[cat].map((item, idx) => (
                    <div key={idx} className="flex-between" style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <strong>{item.ticker}</strong> <span className="text-secondary" style={{ fontSize: '0.875rem' }}>({item.name})</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          섹터: {item.sector || '기타'} | 매수단가: {item.avgPrice} | 수량: {item.qty}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveHolding(cat, idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--negative-color)', cursor: 'pointer', padding: '0.5rem' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: 'var(--surface-color)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>새 종목 추가</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>분류</label>
                  <select 
                    value={newHolding.category} 
                    onChange={e => setNewHolding({...newHolding, category: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="미국 주식">미국 주식</option>
                    <option value="한국 주식">한국 주식</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>섹터 (Sector)</label>
                  <select 
                    value={newHolding.sector} 
                    onChange={e => setNewHolding({...newHolding, sector: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="기술 (Tech)">기술 (Tech)</option>
                    <option value="금융 (Financials)">금융 (Financials)</option>
                    <option value="헬스케어 (Healthcare)">헬스케어 (Healthcare)</option>
                    <option value="소비재 (Consumer)">소비재 (Consumer)</option>
                    <option value="산업재 (Industrials)">산업재 (Industrials)</option>
                    <option value="에너지 (Energy)">에너지 (Energy)</option>
                    <option value="현금 (Cash)">현금 (Cash)</option>
                    <option value="기타 (Others)">기타 (Others)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>티커 (Ticker)</label>
                  <input type="text" placeholder="예: AAPL, 005930" value={newHolding.ticker} onChange={e => setNewHolding({...newHolding, ticker: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>종목명 (선택)</label>
                  <input type="text" placeholder="예: Apple" value={newHolding.name} onChange={e => setNewHolding({...newHolding, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>매수 평균가</label>
                  <input type="number" placeholder="0" value={newHolding.avgPrice} onChange={e => setNewHolding({...newHolding, avgPrice: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>수량</label>
                  <input type="number" placeholder="0" value={newHolding.qty} onChange={e => setNewHolding({...newHolding, qty: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <button 
                onClick={handleAddHolding}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)', border: '1px dashed var(--border-color)', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}
              >
                <Plus size={18} /> 종목 목록에 추가하기
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <button 
                onClick={() => setIsEditing(false)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                취소
              </button>
              <button 
                onClick={savePortfolio}
                disabled={isSaving}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isSaving ? <span className="spin" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }}></span> : <Save size={18} />} 
                {isSaving ? '저장 중...' : '저장 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
