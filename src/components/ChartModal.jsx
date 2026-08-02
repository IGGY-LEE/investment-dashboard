import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import Chart from 'react-apexcharts';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', '5Y', '10Y', '30Y'];

// Helper to generate dummy OHLC data based on timeframe
const generateOHLCData = (timeframe, baseValue) => {
  let points = 60;
  let intervalMs = 0;
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  
  if (timeframe === '1D') { points = 72; intervalMs = (24 * HOUR) / 72; }
  else if (timeframe === '1W') { points = 84; intervalMs = (7 * DAY) / 84; }
  else if (timeframe === '1M') { points = 60; intervalMs = (30 * DAY) / 60; }
  else if (timeframe === '3M') { points = 90; intervalMs = DAY; }
  else if (timeframe === '1Y') { points = 104; intervalMs = (365 * DAY) / 104; }
  else if (timeframe === '5Y') { points = 120; intervalMs = (5 * 365 * DAY) / 120; }
  else if (timeframe === '10Y') { points = 120; intervalMs = (10 * 365 * DAY) / 120; }
  else if (timeframe === '30Y') { points = 120; intervalMs = (30 * 365 * DAY) / 120; }

  const data = [];
  let currentVal = parseFloat(String(baseValue).replace(/,/g, '').replace('%', '').replace('$', '').replace('원', '')) || 100;
  
  const now = new Date().getTime();
  const startTime = now - (points * intervalMs);

  for (let i = 0; i < points; i++) {
    const volatility = currentVal * 0.015;
    const change = (Math.random() - 0.45) * volatility;
    
    const open = currentVal;
    const close = currentVal + change;
    const high = Math.max(open, close) + (Math.random() * volatility * 0.5);
    const low = Math.min(open, close) - (Math.random() * volatility * 0.5);
    
    currentVal = close;

    data.push({
      x: startTime + (i * intervalMs),
      y: [Number(open.toFixed(2)), Number(high.toFixed(2)), Number(low.toFixed(2)), Number(close.toFixed(2))]
    });
  }
  return data;
};

// Helper to generate dummy summary data
const generateSummaryData = (name, baseValue) => {
  const price = parseFloat(String(baseValue).replace(/[^0-9.]/g, '')) || 100;
  
  // 1. Check if commodity
  const isOil = name.includes('원유') || name.includes('브렌트');
  const isGas = name.includes('천연가스');
  const isPrecious = name.includes('금') || name.includes('은');
  const isAgri = name.includes('밀') || name.includes('대두');
  const isMetal = name.includes('구리') || name.includes('알루미늄') || name.includes('리튬');
  const isCommodity = isOil || isGas || isPrecious || isAgri || isMetal;

  if (isCommodity) {
    if (isOil) {
      return {
        fields: [
          { label: '3-2-1 크랙 스프레드', value: '$28.50' },
          { label: '선물 곡선 상태', value: 'Backwardation', valueColor: 'var(--positive-color)' },
          { label: 'EIA 주간 재고 변동', value: '-1.5M 배럴' },
          { label: '52주 최고/최저', value: `$93.50 / $68.20` },
        ],
        description: '원유 3배럴을 정제하여 휘발유 2배럴과 난방유 1배럴을 생산할 때의 정제 마진(3-2-1 크랙 스프레드)입니다. 현재 백워데이션 상태는 단기 수급이 타이트함을 시사합니다.'
      };
    } else if (isGas) {
      return {
        fields: [
          { label: '기준 시장', value: '미국 Henry Hub' },
          { label: 'EIA 주간 재고 변동', value: '+45 Bcf' },
          { label: '선물 곡선 상태', value: 'Contango', valueColor: 'var(--negative-color)' },
          { label: '52주 최고/최저', value: `${(price * 1.6).toFixed(2)} / ${(price * 0.7).toFixed(2)}` },
        ],
        description: '천연가스는 날씨와 난방/발전 수요에 극도로 민감하며, 국제 지표로는 미국 헨리허브가격을 주로 참고합니다. EIA 재고 발표가 단기 가격 변동의 핵심입니다.'
      };
    } else if (isPrecious) {
      return {
        fields: [
          { label: '금/은 비율 (G/S Ratio)', value: '88.5' },
          { label: '미 10년물 실질금리', value: '1.92%' },
          { label: '선물 곡선 상태', value: 'Contango' },
          { label: '52주 최고/최저', value: `${(price * 1.1).toFixed(2)} / ${(price * 0.8).toFixed(2)}` },
        ],
        description: '금/은 비율이 높을수록 은이 금 대비 역사적 저평가 구간에 있음을 의미합니다. 또한 실질금리와 귀금속은 역의 상관관계를 가집니다.'
      };
    } else {
      return {
        fields: [
          { label: 'LME/시카고 재고량', value: '감소 추세' },
          { label: '선물 곡선 상태', value: 'Contango' },
          { label: '최근 롤오버 비용', value: '-0.8%' },
          { label: '52주 최고/최저', value: `${(price * 1.2).toFixed(2)} / ${(price * 0.7).toFixed(2)}` },
        ],
        description: '해당 원자재의 주요 거래소 재고 동향 및 선물 월물간 스프레드 현황입니다.'
      };
    }
  }

  // 2. Schedule Events (일정 - 실적발표, FOMC, 만기일 등)
  if (name.includes('실적발표')) {
    const isDomestic = /[가-힣]/.test(name.replace('실적발표','').trim());
    return {
      fields: [
        { label: '시장 컨센서스 (예상치)', value: isDomestic ? '영업이익 8.5조원' : 'EPS $1.25 / 매출 $30B' },
        { label: '전분기 (QoQ) 대비', value: '+12.5%', valueColor: 'var(--positive-color)' },
        { label: '작년 동기 (YoY) 대비', value: '+45.2%', valueColor: 'var(--positive-color)' },
        { label: '핵심 관전 포인트', value: '가이던스 (다음 분기 실적 전망)' },
      ],
      description: '실적 발표는 기업의 내재가치를 확인하는 가장 중요한 이벤트입니다. 발표 수치가 시장의 예상치(컨센서스)를 상회(서프라이즈)하는지 하회(쇼크)하는지에 따라 단기 주가 변동성이 극대화됩니다.'
    };
  }

  if (name.includes('FOMC') || name.includes('금융통화위원회') || name.includes('금통위') || name.includes('ECB')) {
    return {
      fields: [
        { label: '시장 예상치 (컨센서스)', value: '동결 (확률 95%)' },
        { label: '직전 회의 금리 (이전치)', value: name.includes('한국') ? '3.50%' : '5.50%' },
        { label: '작년 동월(YoY) 금리', value: name.includes('한국') ? '3.50%' : '5.25%' },
        { label: '시장에 미치는 영향', value: name.includes('FOMC') ? '점도표 하향(비둘기파) 시 증시 호재' : '총재 간담회 비둘기파적 발언 시 호재' },
      ],
      description: '중앙은행의 기준금리 결정은 모든 자산 가격의 밸류에이션을 재산정하는 기준점입니다. 금리 수치 자체보다 향후 금리 경로에 대한 포워드 가이던스가 증시에 더 큰 영향을 미칩니다.'
    };
  }

  if (name.includes('만기일')) {
    return {
      fields: [
        { label: '이벤트 성격', value: name.includes('동시') ? '네 마녀의 날 (선물/옵션 동시만기)' : '월간 옵션 만기' },
        { label: '시장 변동성 예상', value: '매우 높음 (장 막판 급변동 주의)', valueColor: 'var(--negative-color)' },
        { label: '과거 만기일 평균 등락', value: '보합/하락 우위' },
        { label: '주요 체크포인트', value: '외국인/기관 롤오버(월물 교체) 동향' },
      ],
      description: '파생상품 만기일에는 기존 포지션을 청산하거나 다음 월물로 이월하려는 대규모 기관 및 외국인 자금이 몰려 주가 변동성이 극심해질 수 있습니다.'
    };
  }

  if (name.includes('고용보고서') || name.includes('CPI') || name.includes('구매자관리지수') || name.includes('PMI') || name.includes('PCE') || name.includes('GDP') || name.includes('수출입') || name.includes('실물경제')) {
    return {
      fields: [
        { label: '시장 예상치 (컨센서스)', value: name.includes('PCE') ? '+2.6% (YoY)' : name.includes('GDP') ? '+2.4% (QoQ)' : '+3.1% (YoY)' },
        { label: '직전(월/분기) 데이터', value: name.includes('PCE') ? '+2.8% (YoY)' : name.includes('GDP') ? '+1.4% (QoQ)' : '+3.2% (YoY)' },
        { label: '작년 동월(동분기) 데이터', value: name.includes('PCE') ? '+3.5% (YoY)' : name.includes('GDP') ? '+2.1% (QoQ)' : '+4.0% (YoY)' },
        { label: '시장에 미치는 영향', value: name.includes('GDP') || name.includes('수출') ? '수치 호조 시 증시 긍정적 (연착륙/실적 상승)' : '물가 지표 상회 시 금리/달러 강세 (악재)' },
      ],
      description: '주요 경제 지표 발표는 시장의 펀더멘털을 확인하는 잣대입니다. 실제 수치가 컨센서스(예상치)를 얼마나 벗어났는지가 그날의 시장 방향성을 결정합니다.'
    };
  }

  // 3. VIX & Volatility
  if (name.includes('VIX') || name.includes('변동성')) {
    return {
      fields: [
        { label: '현재 변동성', value: baseValue },
        { label: '과거 1년 평균', value: '14.50' },
        { label: 'VIX 선물 곡선', value: 'Contango (정상)' },
        { label: '시장 심리 상태', value: parseFloat(baseValue) > 20 ? '공포 (Fear)' : '탐욕 (Greed)' },
      ],
      description: '변동성 지수는 향후 30일간의 증시 변동성에 대한 시장의 기대를 나타냅니다. 20을 넘으면 공포 심리가 확산된 것으로 해석됩니다.'
    };
  }

  // 4. Spreads & Taylor
  if (name.includes('스프레드') || name.includes('금리차')) {
    return {
      fields: [
        { label: '현재 스프레드', value: baseValue },
        { label: '과거 1년 평균', value: name.includes('하이일드') ? '4.15%' : '-0.55%' },
        { label: '위험 신호 임계치', value: name.includes('하이일드') ? '5.00% 돌파 시' : '역전(음수) 심화' },
        { label: '52주 최고/최저', value: name.includes('하이일드') ? '4.80% / 3.20%' : '+0.10% / -1.05%' },
      ],
      description: name.includes('하이일드') 
        ? '하이일드 스프레드는 우량 국채와 투기등급 회사채 간의 금리 차이로, 신용 위험을 나타냅니다.'
        : '장단기 금리차(10년물-2년물) 역전 현상은 역사적으로 경기 침체의 강력한 선행 지표입니다.'
    };
  }

  if (name.includes('테일러')) {
    return {
      fields: [
        { label: '현재 실효 기준금리', value: '5.33%' },
        { label: '테일러 준칙 적정금리', value: '4.75%' },
        { label: '괴리율 (정책 압박)', value: '+0.58%p (인하 압박)', valueColor: 'var(--positive-color)' },
        { label: '근원 PCE 인플레이션', value: '2.6%' },
      ],
      description: '테일러 룰은 물가와 실업률을 바탕으로 적정 기준금리를 계산하는 공식입니다. 실제 금리가 더 높으면 인하 여력이 큰 상태입니다.'
    };
  }

  // 5. FX (Exchange Rates)

  if (name.includes('환율') || name.includes('원/달러') || name.includes('엔/달러')) {
    return {
      fields: [
        { label: '현재 환율', value: baseValue },
        { label: '양국 기준금리 차이', value: name.includes('엔') ? '-5.25%p' : '-1.50%p' },
        { label: 'YTD (연초 대비 변동)', value: '+4.5%' },
        { label: '52주 최고/최저', value: `${(price*1.05).toFixed(1)} / ${(price*0.9).toFixed(1)}` },
      ],
      description: '환율은 양국 간의 펀더멘털과 금리 차이, 그리고 글로벌 안전자산 선호 심리를 종합적으로 반영하는 지표입니다.'
    };
  }

  // 5. Index Futures (지수 선물)
  if (name.includes('선물') && !isCommodity) {
    return {
      fields: [
        { label: '선물 현재가', value: baseValue },
        { label: '현물 대비 베이시스', value: '+1.50 (콘탱고)' },
        { label: '미결제약정 (Open Interest)', value: '증가 추세' },
        { label: '최근 만기일', value: '9월 셋째 주 금요일' },
      ],
      description: '지수 선물은 현물과의 가격 차이(베이시스) 및 미결제약정 동향을 통해 단기 시장 방향성을 예측하는 데 유용합니다.'
    };
  }

  // 6. Stock Indices (지수 현물 및 섹터)
  const isIndex = ['S&P 500', '코스피', '나스닥', '다우존스', '닛케이', '상해종합', '섹터'].some(idx => name.includes(idx)) && !name.includes('선물');
  if (isIndex) {
    return {
      fields: [
        { label: 'YTD (연초 대비 수익률)', value: '+12.5%', valueColor: 'var(--positive-color)' },
        { label: 'RSI (상대강도지수, 14일)', value: '62 (중립)' },
        { label: '단기 추세 (20일선 대비)', value: '상회 (강세)', valueColor: 'var(--positive-color)' },
        { label: '52주 최고/최저', value: `${(price * 1.1).toFixed(2)} / ${(price * 0.8).toFixed(2)}` },
      ],
      description: `해당 지수/섹터의 전반적인 모멘텀과 기술적 위치를 나타냅니다. RSI가 70 이상이면 과매수, 30 이하이면 과매도로 판단합니다.`
    };
  }

  // 7. Generic Macro Indicators
  if (['국채', '금리', '달러', 'CPI', '수출', '지수', 'PMI', 'GDP'].some(m => name.includes(m))) {
    return {
      fields: [
        { label: '최근 발표치 / 현재가', value: baseValue },
        { label: '전월 대비 변동 (MoM)', value: '+0.2%' },
        { label: '52주 최고/최저', value: `${(price * 1.1).toFixed(2)} / ${(price * 0.8).toFixed(2)}` },
      ],
      description: '거시 경제 지표는 중앙은행의 통화 정책 및 글로벌 자금 흐름을 판단하는 핵심 잣대입니다.'
    };
  }

  // 8. Default: Individual Stocks
  const isKorea = String(baseValue).includes('원') || /[가-힣]/.test(name);
  
  return {
    fields: [
      { label: '시가총액', value: isKorea ? (Math.random() * 50 + 10).toFixed(1) + '조 원' : (Math.random() * 2 + 0.5).toFixed(2) + 'T (달러)' },
      { label: 'PER (주가수익비율)', value: (Math.random() * 20 + 10).toFixed(2) },
      { label: '배당수익률', value: (Math.random() * 4 + 0.5).toFixed(2) + '%' },
      { label: '52주 최고/최저', value: isKorea ? `${(price * 1.3).toLocaleString(undefined, {maximumFractionDigits:0})} / ${(price * 0.8).toLocaleString(undefined, {maximumFractionDigits:0})}` : `${(price * 1.3).toFixed(2)} / ${(price * 0.8).toFixed(2)}` },
      { label: '목표 주가', value: isKorea ? (price * 1.2).toLocaleString(undefined, {maximumFractionDigits:0}) + '원' : '$' + (price * 1.2).toFixed(2), isBold: true },
      { label: '투자의견', value: Math.random() > 0.5 ? '매수 (Buy)' : '보유 (Hold)', valueColor: 'var(--accent-color)', isBold: true },
    ],
    description: `${name}의 기업 개요 및 요약 정보입니다. 백엔드 연동 시 실제 재무 실적이 반영됩니다.`
  };
};

const BENCHMARKS = [
  { name: 'S&P 500', value: '5,100.50' },
  { name: '나스닥', value: '16,200.00' },
  { name: '코스피', value: '2,750.20' },
  { name: '미국 10년물 국채 금리', value: '4.25%' },
  { name: '금 (Gold)', value: '$2,050.10' },
  { name: '비트코인 (BTC)', value: '$64,250.00' },
  { name: '원/달러 환율', value: '1,350.50' }
];

export default function ChartModal({ isOpen, onClose, item }) {
  const [activeTimeframe, setActiveTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('candlestick'); 
  const [compareItems, setCompareItems] = useState([]);
  const [showMAs, setShowMAs] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const summary = useMemo(() => {
    if (!item) return null;
    return generateSummaryData(item.name, item.value || item.price || '100');
  }, [item]);

  useEffect(() => {
    if (isOpen && item) {
      setCompareItems([item]);
      setActiveTimeframe('1Y'); // 장기 추세를 위해 기본값을 1년으로 설정
      setShowMAs(true);
      setIsDropdownOpen(false);
    }
  }, [isOpen, item]);

  const handleAddCompare = (benchmark) => {
    if (compareItems.length >= 5) return;
    if (compareItems.find(c => c.name === benchmark.name)) return;
    setCompareItems([...compareItems, benchmark]);
    setIsDropdownOpen(false);
  };
  
  const handleRemoveCompare = (name) => {
    setCompareItems(compareItems.filter(c => c.name !== name));
  };

  const isCompare = compareItems.length > 1;

  const seriesData = useMemo(() => {
    if (!compareItems.length) return [];
    
    return compareItems.map((cItem, index) => {
      // seed variation per item to look distinct
      const seedVal = (parseFloat(String(cItem.value || cItem.price).replace(/[^0-9.]/g, '')) || 100) * (index + 1);
      const rawData = generateOHLCData(activeTimeframe, seedVal);
      
      if (!isCompare) {
        return { name: cItem.name, type: chartType, data: rawData };
      } else {
        const startValue = rawData[0].y[3];
        const lineData = rawData.map(d => ({
          x: d.x,
          y: Number((((d.y[3] / startValue) - 1) * 100).toFixed(2))
        }));
        return { name: cItem.name, type: 'line', data: lineData };
      }
    });
  }, [compareItems, activeTimeframe, chartType, isCompare]);

  const finalSeries = useMemo(() => {
    if (isCompare || !seriesData[0] || !showMAs) return seriesData;
    
    let baseData = seriesData[0].data;
    let seriesList = [...seriesData];
    
    const maPeriods = [5, 20, 60, 120, 240, 480];
    const maColors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];
    
    maPeriods.forEach((period, idx) => {
      const maData = baseData.map((d, i) => {
        let sum = 0;
        let count = 0;
        for (let j = 0; j < period; j++) {
          if (i - j >= 0) {
            sum += Array.isArray(baseData[i-j].y) ? baseData[i-j].y[3] : baseData[i-j].y;
          } else {
            const firstY = Array.isArray(baseData[0].y) ? baseData[0].y[3] : baseData[0].y;
            sum += firstY * (1 - (j * 0.0001)); 
          }
          count++;
        }
        return { x: d.x, y: Number((sum / count).toFixed(2)) };
      });
      seriesList.push({ name: `${period}일 이동평균`, type: 'line', data: maData, color: maColors[idx] });
    });
    return seriesList;
  }, [seriesData, isCompare, showMAs]);

  if (!isOpen || !item) return null;

  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';

  const actualChartType = isCompare ? 'line' : chartType;
  
  // Base colors for compare items
  const compareColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  // Colors for MAs when in single mode
  const singleColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

  const chartOptions = {
    chart: {
      type: actualChartType,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: textColor,
      animations: { enabled: false }
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 3,
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: textColor }, datetimeUTC: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: 6,
    },
    yaxis: {
      labels: {
        style: { colors: textColor },
        formatter: (value) => isCompare ? `${value.toFixed(2)}%` : value.toLocaleString(undefined, {maximumFractionDigits: 2})
      }
    },
    plotOptions: {
      candlestick: { colors: { upward: '#ef4444', downward: '#3b82f6' }, wick: { useFillColor: true } }
    },
    stroke: {
      curve: 'smooth',
      width: isCompare ? 2 : (showMAs ? [actualChartType === 'line' ? 2 : 1, 1, 1, 1, 1, 1, 1] : (actualChartType === 'line' ? 2 : 1))
    },
    colors: isCompare ? compareColors : singleColors,
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      x: { format: 'yyyy-MM-dd HH:mm' },
      y: { formatter: (val) => isCompare ? `${val}%` : val }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: textColor }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: 0, flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <div className="flex-between" style={{ width: '100%' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.name}
              </h2>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                <span className="text-2xl" style={{ fontWeight: 'bold' }}>{item.value || item.price}</span>
                {item.change && (
                  <span className={`badge ${item.change.startsWith('+') ? 'positive' : 'negative'}`}>
                    {item.change}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="badge neutral clickable" style={{ padding: '0.5rem' }}>
              <X size={24} color="var(--text-secondary)" />
            </button>
          </div>
          
          {/* Comparison Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="text-secondary" style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>비교 지표:</span>
            {compareItems.map((c, idx) => (
              <span key={c.name} className="badge neutral" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: chartOptions.colors[idx % chartOptions.colors.length] }}></span>
                {c.name}
                {c.name !== item.name && (
                  <X size={14} className="clickable" onClick={() => handleRemoveCompare(c.name)} style={{ marginLeft: '4px' }} />
                )}
              </span>
            ))}
            
            {compareItems.length < 5 && (
              <div style={{ position: 'relative' }}>
                <button 
                  className="badge positive clickable" 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--positive-color)', backgroundColor: 'transparent' }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  + 지표 추가
                </button>
                
                {isDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.5rem', zIndex: 50, width: '200px', boxShadow: 'var(--card-shadow)' }}>
                    {BENCHMARKS.map(b => (
                      <div 
                        key={b.name} 
                        className="clickable" 
                        style={{ padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', opacity: compareItems.find(c=>c.name===b.name) ? 0.3 : 1 }}
                        onClick={() => handleAddCompare(b)}
                      >
                        {b.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start', padding: '0 1.5rem 1.5rem 1.5rem' }}>
          {/* Left Column: Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex-between">
              <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {TIMEFRAMES.map(tf => (
                  <button 
                    key={tf}
                    className={`timeframe-btn ${activeTimeframe === tf ? 'active' : ''}`}
                    onClick={() => setActiveTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {!isCompare && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={showMAs} onChange={e => setShowMAs(e.target.checked)} />
                    이동평균선
                  </label>
                )}
                <select 
                  className="badge neutral" 
                  style={{ border: '1px solid var(--border-color)', outline: 'none', padding: '0.25rem', backgroundColor: 'transparent' }}
                  value={actualChartType}
                  onChange={(e) => setChartType(e.target.value)}
                  disabled={isCompare}
                >
                  <option value="candlestick">캔들 차트</option>
                  <option value="line">선 차트</option>
                </select>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '400px', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', padding: '1rem 0' }}>
              {finalSeries.length > 0 && (
                <Chart 
                  options={chartOptions} 
                  series={finalSeries} 
                  type={actualChartType} 
                  height="100%" 
                />
              )}
            </div>
          </div>

          {/* Right Column: Summary Info */}
          <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '0.75rem', height: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>요약 정보 ({item.name})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {summary.fields.map((field, idx) => (
                <div key={idx} className="flex-between" style={{ borderTop: idx > 0 && idx % 3 === 0 ? '1px dashed var(--border-color)' : 'none', paddingTop: idx > 0 && idx % 3 === 0 ? '0.75rem' : '0' }}>
                  <span className="text-secondary" style={{ fontSize: '0.95rem' }}>{field.label}</span>
                  <span style={{ 
                    fontWeight: field.isBold ? 'bold' : '500', 
                    color: field.valueColor || 'var(--text-primary)' 
                  }}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem' }}>
              {summary.description}
            </div>
            
            {isCompare && (
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--accent-color)', padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                * 비교 모드에서는 첫 거래일을 0% 기준으로 정규화한 수익률 선 차트가 제공됩니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
