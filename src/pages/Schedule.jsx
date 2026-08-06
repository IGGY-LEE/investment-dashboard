import React, { useState, useMemo } from 'react'
import { ExternalLink, List, Calendar as CalendarIcon, X } from 'lucide-react'
import ChartModal from '../components/ChartModal'

const generateSchedules = () => {
  const baseDate = new Date('2026-08-01'); 
  const results = [];
  
  for (let m = -2; m <= 2; m++) {
    const monthStr = String(baseDate.getMonth() + 1 + m).padStart(2, '0');
    const yearStr = baseDate.getFullYear() + (baseDate.getMonth() + m < 0 ? -1 : baseDate.getMonth() + m > 11 ? 1 : 0);
    const realMonth = ((baseDate.getMonth() + m % 12) + 12) % 12 + 1;
    const realMonthStr = String(realMonth).padStart(2, '0');
    
    const prefix = `${yearStr}-${realMonthStr}`;
    
    results.push({ date: `${prefix}-02`, type: '매크로', title: `미국 ISM 제조업 구매자관리지수 (PMI)`, impact: 'Medium', link: 'https://www.ismworld.org/' });
    results.push({ date: `${prefix}-05`, type: '매크로', title: `미국 고용보고서 (Non-farm Payrolls)`, impact: 'High', link: 'https://www.bls.gov/news.release/empsit.nr0.htm' });
    results.push({ date: `${prefix}-12`, type: '매크로', title: `미국 소비자물가지수 (CPI)`, impact: 'High', link: 'https://www.bls.gov/news.release/cpi.nr0.htm' });
    results.push({ date: `${prefix}-26`, type: '매크로', title: `미국 개인소비지출(PCE) 물가지수`, impact: 'High', link: 'https://www.bea.gov/data/personal-consumption-expenditures-price-index' });
    results.push({ date: `${prefix}-24`, type: '매크로', title: `미국 분기 GDP (수정치)`, impact: 'High', link: 'https://www.bea.gov/' });
    results.push({ date: `${prefix}-01`, type: '매크로', title: `한국 수출입 동향 발표`, impact: 'High', link: 'https://www.customs.go.kr/' });
    results.push({ date: `${prefix}-15`, type: '매크로', title: `중국 실물경제지표 (산업생산/소매판매)`, impact: 'Medium', link: '' });
    
    results.push({ date: `${prefix}-13`, type: '만기일', title: `한국 선물/옵션 동시 만기일`, impact: 'High', link: '' });
    results.push({ date: `${prefix}-20`, type: '만기일', title: `미국 옵션 만기일`, impact: 'Medium', link: '' });
    
    results.push({ date: `${prefix}-28`, type: '기타', title: `한국은행 금융통화위원회 (금통위)`, impact: 'High', link: 'https://www.bok.or.kr/' });
    results.push({ date: `${prefix}-30`, type: '기타', title: `미국 FOMC 성명서 발표`, impact: 'High', link: 'https://www.federalreserve.gov/' });
    results.push({ date: `${prefix}-10`, type: '기타', title: `유로존 ECB 통화정책회의`, impact: 'Medium', link: 'https://www.ecb.europa.eu/' });

    results.push({ date: `${prefix}-15`, type: '미국실적', title: 'NVIDIA 실적발표', impact: 'High', link: 'https://investor.nvidia.com/' });
    results.push({ date: `${prefix}-22`, type: '미국실적', title: 'Apple 실적발표', impact: 'High', link: 'https://investor.apple.com/' });
    results.push({ date: `${prefix}-08`, type: '국내실적', title: '삼성전자 잠정실적발표', impact: 'High', link: 'https://www.samsung.com/sec/about-us/ir/' });
    results.push({ date: `${prefix}-25`, type: '국내실적', title: '현대차 실적발표', impact: 'Medium', link: 'https://www.hyundai.com/kr/ko/ir' });
  }
  return results.sort((a, b) => a.date.localeCompare(b.date));
};

const allSchedules = generateSchedules();

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-08-01'));
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const getMacroDefaultValue = (title) => {
    if (title.includes('금리') || title.includes('FOMC') || title.includes('금통위') || title.includes('ECB')) return { value: '5.25%', change: '0.00%p' };
    if (title.includes('CPI') || title.includes('PCE')) return { value: '+3.1% (YoY)', change: '-0.1%p' };
    if (title.includes('고용')) return { value: '206K', change: '+12K' };
    if (title.includes('PMI')) return { value: '48.5', change: '-1.2' };
    if (title.includes('GDP')) return { value: '2.4%', change: '+1.0%p' };
    if (title.includes('실적')) return { value: '발표대기', change: null };
    return { value: '-', change: null };
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const monthStr = String(currentMonth).padStart(2, '0');
  
  const currentMonthSchedules = useMemo(() => {
    const prefix = `${currentYear}-${monthStr}`;
    return allSchedules.filter(s => s.date.startsWith(prefix));
  }, [currentYear, monthStr]);

  const getTypeColor = (type) => {
    if (type.includes('실적')) return 'var(--positive-color)';
    if (type === '만기일') return 'var(--negative-color)';
    if (type === '매크로') return 'var(--accent-color)';
    return 'var(--text-secondary)';
  }

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${monthStr}-${String(day).padStart(2, '0')}`;
    return currentMonthSchedules.filter(s => s.date === dateStr);
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>주요 일정</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`badge clickable ${viewMode === 'calendar' ? 'positive' : 'neutral'}`}
            onClick={() => setViewMode('calendar')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <CalendarIcon size={16} /> 캘린더
          </button>
          <button 
            className={`badge clickable ${viewMode === 'list' ? 'positive' : 'neutral'}`}
            onClick={() => setViewMode('list')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <List size={16} /> 목록
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            {currentYear}년 {currentMonth}월
          </h2>
          <div>
            <button className="badge neutral clickable" style={{ marginRight: '0.5rem' }} onClick={prevMonth}>&lt; 이전</button>
            <button className="badge neutral clickable" onClick={nextMonth}>다음 &gt;</button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="calendar-grid">
            {WEEKDAYS.map(day => (
              <div key={day} className="calendar-header-cell">{day}</div>
            ))}
            {calendarDays.map((day, idx) => {
              const events = getEventsForDay(day);
              return (
                <div 
                  key={idx} 
                  className={`calendar-cell ${!day ? 'empty' : ''}`}
                  onClick={() => {
                    if (day && events.length > 0) setSelectedDayEvents({ day, events });
                  }}
                >
                  {day && (
                    <>
                      <div className="calendar-date" style={{ color: idx % 7 === 0 ? 'var(--negative-color)' : idx % 7 === 6 ? 'var(--accent-color)' : 'inherit' }}>
                        {day}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {events.map((evt, eIdx) => (
                          <div key={eIdx} style={{ fontSize: '0.7rem', whiteSpace: 'normal', wordBreak: 'keep-all', lineHeight: '1.2', color: getTypeColor(evt.type), marginBottom: '2px' }}>
                            • {evt.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>구분</th>
                  <th>일정명</th>
                  <th>중요도</th>
                  <th>원문 링크</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthSchedules.length > 0 ? currentMonthSchedules.map((item, idx) => (
                  <tr key={idx} className="clickable" onClick={(e) => {
                    if (e.target.closest('a')) return;
                    const defaultVals = getMacroDefaultValue(item.title);
                    setSelectedItem({ name: item.title, value: defaultVals.value, change: defaultVals.change });
                  }}>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: '500' }}>{item.date}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getTypeColor(item.type), color: 'white', opacity: 0.9 }}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.title}</td>
                    <td>
                      <span style={{ color: item.impact === 'High' ? 'var(--negative-color)' : item.impact === 'Medium' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                        {item.impact === 'High' ? '⭐⭐⭐' : item.impact === 'Medium' ? '⭐⭐' : '⭐'}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="badge neutral clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                          <ExternalLink size={14} /> 확인
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>일정이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Day Events Modal */}
      {selectedDayEvents && (
        <div className="modal-overlay" onClick={() => setSelectedDayEvents(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem' }}>{currentMonth}월 {selectedDayEvents.day}일 일정</h2>
              <button onClick={() => setSelectedDayEvents(null)}><X size={24} color="var(--text-secondary)" /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedDayEvents.events.map((evt, idx) => (
                <div key={idx} className="card clickable" style={{ marginBottom: 0 }} onClick={() => { 
                  setSelectedDayEvents(null); 
                  const defaultVals = getMacroDefaultValue(evt.title);
                  setSelectedItem({ name: evt.title, value: defaultVals.value, change: defaultVals.change }); 
                }}>
                  <div className="flex-between">
                    <div>
                      <span className="badge" style={{ backgroundColor: getTypeColor(evt.type), color: 'white', marginBottom: '0.5rem', display: 'inline-block' }}>{evt.type}</span>
                      <div style={{ fontWeight: 'bold' }}>{evt.title}</div>
                    </div>
                    {evt.link && (
                      <a href={evt.link} target="_blank" rel="noopener noreferrer" className="badge neutral clickable" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                        <ExternalLink size={14} /> 원문
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ChartModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />
    </div>
  )
}
