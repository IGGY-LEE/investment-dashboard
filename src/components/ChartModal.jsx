import React, { useState, useEffect, useMemo } from 'react';
import { X, Bell } from 'lucide-react';
import Chart from 'react-apexcharts';
import AdvancedChart from './AdvancedChart';
import { getChartData, getPluginEarnings, getPluginSentiment } from '../api';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', '5Y', '10Y', '30Y'];

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
      { label: 'PER / PBR', value: `${(Math.random() * 20 + 10).toFixed(2)} / ${(Math.random() * 3 + 1).toFixed(2)}` },
      { label: 'ROE (자기자본이익률)', value: (Math.random() * 15 + 5).toFixed(2) + '%' },
      { label: '배당수익률', value: (Math.random() * 4 + 0.5).toFixed(2) + '%' },
      { label: '52주 최고/최저', value: isKorea ? `${(price * 1.3).toLocaleString(undefined, {maximumFractionDigits:0})} / ${(price * 0.8).toLocaleString(undefined, {maximumFractionDigits:0})}` : `${(price * 1.3).toFixed(2)} / ${(price * 0.8).toFixed(2)}` },
      { label: '목표 주가', value: isKorea ? (price * 1.2).toLocaleString(undefined, {maximumFractionDigits:0}) + '원' : '$' + (price * 1.2).toFixed(2), isBold: true },
      { label: '어닝콜 요약', value: '매출 다각화 및 마진 개선 긍정적 평가' },
      { label: '투자의견', value: Math.random() > 0.5 ? '매수 (Buy)' : '보유 (Hold)', valueColor: 'var(--accent-color)', isBold: true },
    ],
    description: `${name}의 재무 상태, 실적 및 펀더멘털을 포함한 종합 기업 분석 요약입니다.`
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

const TechnicalMeter = ({ score, isMacro, isCommodity }) => {
  // score: 0 to 100
  const angle = (score / 100) * 180;
  
  let label = '중립 (Neutral)';
  let color = '#94a3b8';
  let title = '기술적 분석 (Technical Analysis)';
  let desc = `이동평균 및 오실레이터 종합 수치 (${score.toFixed(0)}/100)`;
  
  if (isMacro) {
    title = '거시경제 환경 (Macro Environment)';
    desc = `증시에 미치는 우호적/비우호적 환경 (${score.toFixed(0)}/100)`;
    if (score <= 20) { label = '매우 악재 (Strong Bearish)'; color = '#ef4444'; }
    else if (score <= 40) { label = '악재 (Bearish)'; color = '#f87171'; }
    else if (score >= 80) { label = '강한 호재 (Strong Bullish)'; color = '#3b82f6'; }
    else if (score >= 60) { label = '호재 (Bullish)'; color = '#60a5fa'; }
  } else if (isCommodity) {
    title = '수급 및 펀더멘털 분석 (Supply & Demand)';
    desc = `생산/재고/수요 종합 분석 지표 (${score.toFixed(0)}/100)`;
    if (score <= 20) { label = '공급 과잉/수요 급감'; color = '#ef4444'; }
    else if (score <= 40) { label = '수요 둔화'; color = '#f87171'; }
    else if (score >= 80) { label = '공급 부족/수요 급증'; color = '#3b82f6'; }
    else if (score >= 60) { label = '수요 강세'; color = '#60a5fa'; }
  } else {
    if (score <= 20) { label = '강력 매도 (Strong Sell)'; color = '#ef4444'; }
    else if (score <= 40) { label = '매도 (Sell)'; color = '#f87171'; }
    else if (score >= 80) { label = '강력 매수 (Strong Buy)'; color = '#3b82f6'; }
    else if (score >= 60) { label = '매수 (Buy)'; color = '#60a5fa'; }
  }

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.75rem', textAlign: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>{title}</h4>
      <div style={{ position: 'relative', width: '220px', height: '110px', margin: '0 auto', overflow: 'hidden' }}>
        <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', dropShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <defs>
            <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="75%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path d="M 15 90 A 85 85 0 0 1 185 90" fill="none" stroke="url(#meterGrad)" strokeWidth="18" strokeLinecap="round" />
          
          {/* Needle */}
          <g transform={`translate(100, 90) rotate(${angle - 180})`} style={{ transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <polygon points="-4,0 4,0 0,-70" fill={color} />
            <circle cx="0" cy="0" r="8" fill={color} />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </svg>
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: color, marginTop: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        {desc}
      </div>
    </div>
  );
};

export default function ChartModal({ isOpen, onClose, item }) {
  const [activeTimeframe, setActiveTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('candlestick'); 
  const [compareItems, setCompareItems] = useState([]);
  const [showMAs, setShowMAs] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [techScore, setTechScore] = useState(50);
  const [showToast, setShowToast] = useState(false);
  const [pluginLoading, setPluginLoading] = useState(false);
  const [pluginResult, setPluginResult] = useState(null);
  
  const checkIsMacro = (name) => {
    if (!name) return false;
    return ['CPI', 'PMI', '고용보고서', 'PCE', 'GDP', '수출입', '실물경제', '금통위', 'FOMC', 'ECB', '실적발표', '만기일'].some(m => name.includes(m));
  };
  const isMacro = useMemo(() => checkIsMacro(item?.name), [item]);
  
  const isCommodity = useMemo(() => {
    if (!item?.name) return false;
    const name = item.name;
    return name.includes('원유') || name.includes('브렌트') || name.includes('천연가스') || name.includes('금') || name.includes('은') || name.includes('구리') || name.includes('알루미늄') || name.includes('리튬');
  }, [item]);

  const summary = useMemo(() => {
    if (!item) return null;
    return generateSummaryData(item.name, item.value || item.price || '100');
  }, [item]);

  useEffect(() => {
    if (isOpen && item) {
      setCompareItems([item]);
      setActiveTimeframe(checkIsMacro(item.name) ? '1Y' : '1Y'); 
      setShowMAs(!checkIsMacro(item.name));
      setIsDropdownOpen(false);
      // Generate a random stable tech score for the item
      const seed = Array.from(item.name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      setTechScore(20 + (seed % 70) + (Math.random() * 10 - 5));
      setPluginResult(null); // Reset plugin result on new item
    }
  }, [isOpen, item]);
  
  const handleRunPlugin = async (type) => {
    setPluginLoading(true);
    setPluginResult(null);
    let ticker = item.symbol || item.name;
    // Map common names for better accuracy
    if (ticker === 'S&P 500') ticker = 'SPY';
    else if (ticker === '나스닥') ticker = 'QQQ';
    else if (ticker === '코스피') ticker = 'EWY';
    
    try {
      if (type === 'earnings') {
        const res = await getPluginEarnings(ticker);
        setPluginResult({ type: 'earnings', data: res });
      } else if (type === 'sentiment') {
        const res = await getPluginSentiment(ticker);
        setPluginResult({ type: 'sentiment', data: res });
      }
    } catch (e) {
      console.error(e);
      setPluginResult({ error: '데이터를 불러오는데 실패했습니다.' });
    }
    setPluginLoading(false);
  };

  const handleAddCompare = (benchmark) => {
    if (compareItems.length >= 5) return;
    if (compareItems.find(c => c.name === benchmark.name)) return;
    setCompareItems([...compareItems, benchmark]);
    setIsDropdownOpen(false);
  };
  
  const handleRemoveCompare = (name) => {
    setCompareItems(compareItems.filter(c => c.name !== name));
  };

  const [seriesData, setSeriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isCompare = compareItems.length > 1;

  useEffect(() => {
    async function fetchData() {
      if (!compareItems.length) {
        setSeriesData([]);
        return;
      }
      setIsLoading(true);
      
      const newSeries = await Promise.all(compareItems.map(async (cItem, index) => {
        let symbol = cItem.symbol || cItem.name;
        
        // Map common Korean indices to Yahoo ticker symbols
        if (symbol === 'S&P 500') symbol = '^GSPC';
        else if (symbol === '나스닥') symbol = '^IXIC';
        else if (symbol === '코스피') symbol = '^KS11';
        else if (symbol === '미국 10년물 국채 금리') symbol = '^TNX';
        else if (symbol === '금 (Gold)') symbol = 'GC=F';
        else if (symbol === '비트코인 (BTC)') symbol = 'BTC-USD';
        else if (symbol === '원/달러 환율') symbol = 'KRW=X';
        
        let range = '1y';
        let interval = '1d';
        
        if (activeTimeframe === '1D') { range = '1d'; interval = '5m'; }
        else if (activeTimeframe === '1W') { range = '5d'; interval = '15m'; }
        else if (activeTimeframe === '1M') { range = '1mo'; interval = '1d'; }
        else if (activeTimeframe === '3M') { range = '3mo'; interval = '1d'; }
        else if (activeTimeframe === '1Y') { range = '1y'; interval = '1d'; }
        else if (activeTimeframe === '5Y') { range = '5y'; interval = '1wk'; }
        else if (activeTimeframe === '10Y') { range = '10y'; interval = '1mo'; }
        else if (activeTimeframe === '30Y') { range = 'max'; interval = '1mo'; }
        
        if (isMacro) {
          const isEarnings = symbol.includes('실적발표');
          const points = isEarnings 
            ? (activeTimeframe.includes('Y') ? parseInt(activeTimeframe)*4 : 4) // Quarterly for earnings
            : (activeTimeframe.includes('Y') ? parseInt(activeTimeframe)*12 : 12); // Monthly for others
          const intervalDays = isEarnings ? 90 : 30; // 3 months vs 1 month
          const now = Date.now();
          const isRate = symbol.includes('금리') || symbol.includes('FOMC') || symbol.includes('금통위') || symbol.includes('ECB');
          const isEmployment = symbol.includes('고용');
          const isPMI = symbol.includes('PMI');
          
          let lineData = [];
          let barData = [];
          for(let i = points; i >= 0; i--) {
            const time = now - (i * intervalDays * 24 * 60 * 60 * 1000); 
            let absVal = 0;
            let changeVal = 0;
            
            if (isRate) {
              absVal = Math.round((5.5 - ((points - i)/(isEarnings?4:12)) * 0.5) * 4) / 4; 
              if (absVal < 4.0) absVal = 4.0;
            } else if (isEmployment) {
              changeVal = Math.floor((Math.random() * 300) - 50); // -50K to +250K
              absVal = 150000 + (points - i) * 150 + changeVal;
            } else if (isPMI) {
              changeVal = Number(((Math.random() * 4) - 2).toFixed(2)); // -2.0 to +2.0 change
              absVal = Number((50 + (Math.random() * 10 - 5)).toFixed(2));
            } else {
              // CPI, GDP, etc (MoM change)
              changeVal = Number(((Math.random() * 0.8) - 0.3).toFixed(2)); // -0.3% to +0.5%
              absVal = Number((3.5 + (Math.random() * 2 - 1)).toFixed(2));
            }
            
            lineData.push({ time: time / 1000, x: time, y: absVal, open: absVal, high: absVal, low: absVal, close: absVal });
            barData.push({ time: time / 1000, x: time, y: changeVal, open: changeVal, high: changeVal, low: changeVal, close: changeVal });
          }
          
          if (isRate) {
            return { name: cItem.name, type: 'line', data: lineData };
          } else {
            return [
              { name: '증감 (Change)', type: 'bar', data: barData },
              { name: `${cItem.name} (수치)`, type: 'line', data: lineData }
            ];
          }
        }

        const rawData = await getChartData(symbol, interval, range);
        
        if (!isCompare) {
          const mappedData = rawData.map(d => ({
            ...d,
            y: chartType === 'line' ? d.close : d.y
          }));
          return { name: cItem.name, type: chartType, data: mappedData };
        } else {
          if (rawData.length === 0) return { name: cItem.name, type: 'line', data: [] };
          const startValue = rawData[0].close;
          const lineData = rawData.map(d => ({
            x: d.x,
            y: Number((((d.close / startValue) - 1) * 100).toFixed(2))
          }));
          return { name: cItem.name, type: 'line', data: lineData };
        }
      }));
      
      setSeriesData(newSeries.flat());
      setIsLoading(false);
    }
    
    fetchData();
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

  const actualChartType = isCompare ? 'line' : (isMacro ? (item.name.includes('금리') || item.name.includes('FOMC') || item.name.includes('금통위') ? 'line' : 'bar') : chartType);
  
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
    dataLabels: {
      enabled: false
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: textColor }, datetimeUTC: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: 6,
    },
    yaxis: isMacro && !item.name.includes('금리') && !item.name.includes('FOMC') && !item.name.includes('금통위') && !item.name.includes('ECB') ? [
      {
        seriesName: '증감 (Change)',
        labels: { style: { colors: textColor } },
        forceNiceScale: true,
      },
      {
        seriesName: `${item.name} (수치)`,
        opposite: true,
        labels: { style: { colors: textColor } },
        forceNiceScale: true,
      }
    ] : {
      labels: {
        style: { colors: textColor },
        formatter: (value) => isCompare ? `${value.toFixed(2)}%` : value.toLocaleString(undefined, {maximumFractionDigits: 2})
      },
      forceNiceScale: true
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        colors: {
          ranges: [
            { from: -10000, to: -0.001, color: '#3b82f6' }, // Blue for negative
            { from: 0, to: 10000, color: '#ef4444' } // Red for positive
          ]
        }
      },
      candlestick: { colors: { upward: '#ef4444', downward: '#3b82f6' }, wick: { useFillColor: true } }
    },
    stroke: {
      curve: 'smooth',
      width: isCompare ? 2 : (isMacro ? [0, 3] : (showMAs ? [actualChartType === 'line' ? 2 : 1, 1, 1, 1, 1, 1, 1] : (actualChartType === 'line' ? 2 : 1)))
    },
    fill: {
      opacity: isMacro && !item.name.includes('금리') && !item.name.includes('FOMC') && !item.name.includes('금통위') && !item.name.includes('ECB') ? [0.4, 1] : 1,
    },
    colors: isCompare ? compareColors : (isMacro ? ['#94a3b8', '#f59e0b'] : singleColors),
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      shared: true,
      intersect: false,
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="badge neutral clickable" 
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}
                onClick={() => {
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                title="가격 알림 설정"
              >
                <Bell size={20} color="var(--accent-color)" />
              </button>
              <button onClick={onClose} className="badge neutral clickable" style={{ padding: '0.5rem' }}>
                <X size={24} color="var(--text-secondary)" />
              </button>
            </div>
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

        <div className="modal-grid">
          {/* Left Column: Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%', flex: '1 1 auto' }}>
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
                {!isCompare && !isMacro && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={showMAs} onChange={e => setShowMAs(e.target.checked)} />
                    이동평균선
                  </label>
                )}
                {!isMacro && (
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
                )}
              </div>
            </div>
            
            <div style={{ width: '100%', height: '400px', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', padding: '1rem 0', position: 'relative' }}>
              {isLoading && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248, 250, 252, 0.8)', zIndex: 10 }}>
                  <div className="text-secondary font-bold">차트 데이터를 불러오는 중...</div>
                </div>
              )}
              {finalSeries.length > 0 && finalSeries[0].data && finalSeries[0].data.length > 0 && (
                (isCompare || isMacro) ? (
                  <Chart 
                    options={chartOptions} 
                    series={finalSeries} 
                    type={actualChartType} 
                    height="100%" 
                  />
                ) : (
                  <AdvancedChart 
                    data={finalSeries[0].data.map(d => ({
                      time: d.time,
                      open: Array.isArray(d.y) ? d.y[0] : d.y, 
                      high: Array.isArray(d.y) ? d.y[1] : d.y, 
                      low: Array.isArray(d.y) ? d.y[2] : d.y, 
                      close: Array.isArray(d.y) ? d.y[3] : d.y,
                      value: Array.isArray(d.y) ? d.y[3] : d.y
                    }))}
                    type={actualChartType === 'candlestick' ? 'candle' : 'line'}
                    height={380}
                  />
                )
              )}
              {!isLoading && (!finalSeries.length || !finalSeries[0].data || finalSeries[0].data.length === 0) && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="text-secondary">해당 기간의 데이터가 없습니다.</div>
                </div>
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

            {/* Technical Meter */}
            {!isCompare && <TechnicalMeter score={techScore} isMacro={isMacro} isCommodity={isCommodity} />}
            
            {/* Community Sentiment (Phase 3) */}
            {!isCompare && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>커뮤니티 심리 (Community Sentiment)</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="clickable" style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: 'var(--surface-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '1.2rem' }}>🐂</span> <span style={{ fontWeight: 'bold', color: 'var(--positive-color)' }}>강세 (Bull)</span>
                  </button>
                  <button className="clickable" style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: 'var(--surface-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '1.2rem' }}>🐻</span> <span style={{ fontWeight: 'bold', color: 'var(--negative-color)' }}>약세 (Bear)</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* AI Plugins */}
            {!isCompare && !isMacro && !isCommodity && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ✨ AI 심층 분석 플러그인
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button 
                    className="clickable"
                    onClick={() => handleRunPlugin('earnings')}
                    disabled={pluginLoading}
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--accent-color)', borderRadius: '0.5rem', backgroundColor: 'var(--accent-color)', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: pluginLoading ? 0.7 : 1 }}
                  >
                    어닝콜 요약
                  </button>
                  <button 
                    className="clickable"
                    onClick={() => handleRunPlugin('sentiment')}
                    disabled={pluginLoading}
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: pluginLoading ? 0.7 : 1 }}
                  >
                    뉴스 센티먼트
                  </button>
                </div>
                
                {pluginLoading && (
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div className="spin" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>⏳</div>
                    <div>AI가 데이터를 수집하고 분석 중입니다...</div>
                  </div>
                )}
                
                {pluginResult && pluginResult.data && pluginResult.type === 'earnings' && (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span className="text-secondary font-bold">가이던스</span>
                      <span style={{ fontWeight: 'bold', color: pluginResult.data.guidance.includes('상향') || pluginResult.data.guidance.includes('Upgraded') ? 'var(--positive-color)' : (pluginResult.data.guidance.includes('하향') || pluginResult.data.guidance.includes('Downgraded') ? 'var(--negative-color)' : 'var(--text-primary)') }}>
                        {pluginResult.data.guidance}
                      </span>
                    </div>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.9rem' }}>
                      {pluginResult.data.summary}
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-secondary font-bold">AI 투자의견</span>
                      <span style={{ fontWeight: 'bold', color: pluginResult.data.sentiment.includes('Bullish') || pluginResult.data.sentiment.includes('강세') ? 'var(--positive-color)' : (pluginResult.data.sentiment.includes('Bearish') || pluginResult.data.sentiment.includes('약세') ? 'var(--negative-color)' : 'var(--text-primary)') }}>
                        {pluginResult.data.sentiment}
                      </span>
                    </div>
                  </div>
                )}
                
                {pluginResult && pluginResult.data && pluginResult.type === 'sentiment' && (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid', borderColor: pluginResult.data.score >= 60 ? 'var(--positive-color)' : (pluginResult.data.score <= 40 ? 'var(--negative-color)' : '#f59e0b'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {pluginResult.data.score}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {pluginResult.data.conclusion}
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                      <div style={{ backgroundColor: 'var(--surface-color)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ color: 'var(--positive-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>👍 호재 요소</div>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                          {pluginResult.data.bullFactors.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                      <div style={{ backgroundColor: 'var(--surface-color)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ color: 'var(--negative-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>👎 악재 요소</div>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                          {pluginResult.data.bearFactors.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {pluginResult && pluginResult.error && (
                  <div style={{ padding: '1rem', backgroundColor: 'var(--negative-bg)', color: 'var(--negative-color)', borderRadius: '0.5rem' }}>
                    {pluginResult.error}
                  </div>
                )}
              </div>
            )}
            
            {isCompare && (
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--accent-color)', padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                * 비교 모드에서는 첫 거래일을 0% 기준으로 정규화한 수익률 선 차트가 제공됩니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--accent-color)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'slideUp 0.3s ease-out forwards',
          zIndex: 1000
        }}>
          <Bell size={20} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>알림 설정 완료</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{item.name}의 목표가 도달 시 알림을 보내드립니다.</div>
          </div>
        </div>
      )}
    </div>
  );
}
