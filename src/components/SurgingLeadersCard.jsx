import React, { useState, useMemo } from 'react';
import { TrendingUp, Flame, Award, ChevronRight, Layers, ExternalLink, Sparkles } from 'lucide-react';

// Predefined thematic tags and markets for key tracked stocks
const STOCK_METADATA = {
  // 코스피
  '삼성전자': { theme: '반도체·스마트폰', market: '코스피', sector: '반도체 & AI' },
  'SK하이닉스': { theme: 'HBM 반도체', market: '코스피', sector: '반도체 & AI' },
  'LG에너지솔루션': { theme: '2차전지 배터리', market: '코스피', sector: '2차전지' },
  '삼성바이오로직스': { theme: '바이오 CDMO', market: '코스피', sector: '바이오 & 헬스케어' },
  '현대차': { theme: '하이브리드·완성차', market: '코스피', sector: '자동차 & 모빌리티' },
  '기아': { theme: '고수익 완성차', market: '코스피', sector: '자동차 & 모빌리티' },
  '셀트리온': { theme: '바이오시밀러 신약', market: '코스피', sector: '바이오 & 헬스케어' },
  'KB금융': { theme: '밸류업·주주환원', market: '코스피', sector: '금융 & 밸류업' },
  'POSCO홀딩스': { theme: '친환경 철강·소재', market: '코스피', sector: '철강 & 소재' },
  'NAVER': { theme: 'AI 플랫폼·검색', market: '코스피', sector: '빅테크 & AI' },
  '신한지주': { theme: '금융·자본비율', market: '코스피', sector: '금융 & 밸류업' },
  '현대모비스': { theme: '전장·전동화 부품', market: '코스피', sector: '자동차 & 모빌리티' },
  '삼성SDI': { theme: '각형·전고체 배터리', market: '코스피', sector: '2차전지' },
  '하나금융지주': { theme: '금융·글로벌', market: '코스피', sector: '금융 & 밸류업' },
  '카카오': { theme: '모바일 메신저 생태계', market: '코스피', sector: '빅테크 & AI' },
  '포스코퓨처엠': { theme: '양·음극재 2차전지', market: '코스피', sector: '2차전지' },
  'HD현대중공업': { theme: '친환경 LNG 조선', market: '코스피', sector: '조선 & 해양' },
  '한화에어로스페이스': { theme: 'K-방산·우주항공', market: '코스피', sector: '방산 & 항공우주' },
  '두산에너빌리티': { theme: '대형원전·SMR', market: '코스피', sector: '원자력 & 전력' },
  'LG전자': { theme: '프리미엄 가전·VS', market: '코스피', sector: 'IT 가전' },

  // 코스닥
  '알테오젠': { theme: '피하주사(SC) 플랫폼', market: '코스닥', sector: '바이오 & 헬스케어' },
  '에코프로비엠': { theme: '하이니켈 양극재', market: '코스닥', sector: '2차전지' },
  '에코프로': { theme: '2차전지 생태계 지주', market: '코스닥', sector: '2차전지' },
  'HLB': { theme: '표적항암제 리보세라닙', market: '코스닥', sector: '바이오 & 헬스케어' },
  '리가켐바이오': { theme: '차세대 ADC 신약', market: '코스닥', sector: '바이오 & 헬스케어' },
  '엔켐': { theme: '글로벌 전해액 공급', market: '코스닥', sector: '2차전지' },
  '휴젤': { theme: '보툴리눔 톡신 에스테틱', market: '코스닥', sector: '바이오 & 헬스케어' },
  '클래시스': { theme: '슈링크 의료기기 1위', market: '코스닥', sector: '바이오 & 헬스케어' },
  '리노공업': { theme: '반도체 테스트 소켓·핀', market: '코스닥', sector: '반도체 & AI' },
  '삼천당제약': { theme: '경구용 바이오 플랫폼', market: '코스닥', sector: '바이오 & 헬스케어' },
  '셀트리온제약': { theme: '케미컬·바이오의약품', market: '코스닥', sector: '바이오 & 헬스케어' },
  'HPSP': { theme: '고압 수소 어닐링 장비', market: '코스닥', sector: '반도체 & AI' },
  '레인보우로보틱스': { theme: '협동·4족보행 로봇', market: '코스닥', sector: '로봇 & 자동화' },
  '파마리서치': { theme: '리쥬란 재생의학', market: '코스닥', sector: '바이오 & 헬스케어' },
  '이오테크닉스': { theme: '반도체 레이저 장비', market: '코스닥', sector: '반도체 & AI' },
  '원익IPS': { theme: '반도체 증착 전공정', market: '코스닥', sector: '반도체 & AI' },
  '동진쎄미켐': { theme: '포토레지스트 감광액', market: '코스닥', sector: '반도체 & AI' },
  '에스엠': { theme: '글로벌 K-POP IP', market: '코스닥', sector: '미디어 & 엔터' },
  'JYP Ent.': { theme: '글로벌 팬덤 엔터', market: '코스닥', sector: '미디어 & 엔터' },
  '펄어비스': { theme: '붉은사막 대작 게임', market: '코스닥', sector: '게임 & 콘텐츠' },

  // 미국
  'NVDA': { theme: 'AI 가속기 GPU 독점', market: '나스닥', sector: '반도체 & AI' },
  'MSFT': { theme: '애저 클라우드·Copilot', market: '나스닥', sector: '빅테크 & AI' },
  'AAPL': { theme: '애플 인텔리전스 생태계', market: '나스닥', sector: '빅테크 & AI' },
  'AMZN': { theme: 'AWS 클라우드 인프라', market: '나스닥', sector: '빅테크 & AI' },
  'GOOGL': { theme: '제미나이 AI·검색 1위', market: '나스닥', sector: '빅테크 & AI' },
  'META': { theme: '라마 오픈소스 AI·SNS', market: '나스닥', sector: '빅테크 & AI' },
  'AVGO': { theme: 'AI 맞춤형 ASIC 네트워킹', market: '나스닥', sector: '반도체 & AI' },
  'TSLA': { theme: '자율주행 FSD·로보택시', market: '나스닥', sector: '자동차 & 모빌리티' },
  'COST': { theme: '창고형 멤버십 유통', market: '나스닥', sector: '소비재 & 유통' },
  'AMD': { theme: 'MI300X AI 칩 경쟁력', market: '나스닥', sector: '반도체 & AI' },
  'ASML': { theme: 'EUV 첨단 노광 독점', market: '나스닥', sector: '반도체 & AI' },
  'NFLX': { theme: '글로벌 OTT 스트리밍 1위', market: '나스닥', sector: '미디어 & 엔터' },
  'QCOM': { theme: '온디바이스 스냅드래곤 AI', market: '나스닥', sector: '반도체 & AI' },
  'UNH': { theme: '미국 최대 헬스케어 보험', market: '다우존스', sector: '바이오 & 헬스케어' },
  'GS': { theme: '월가 글로벌 투자은행 IB', market: '다우존스', sector: '금융 & 밸류업' },
  'CAT': { theme: '글로벌 인프라 건설장비', market: '다우존스', sector: '산업재 & 인프라' },
  'LLY': { theme: '마운자로 비만치료제', market: 'S&P 500', sector: '바이오 & 헬스케어' },
  'JPM': { theme: '미국 최대 상업은행', market: 'S&P 500', sector: '금융 & 밸류업' },
  'WMT': { theme: '미국 최대 오프라인 유통', market: 'S&P 500', sector: '소비재 & 유통' },
  'V': { theme: '글로벌 카드 결제망 독점', market: 'S&P 500', sector: '금융 & 밸류업' },
  'BA': { theme: '보잉 민간 항공기 제조', market: '다우존스', sector: '방산 & 항공우주' },
  'IBM': { theme: '엔터프라이즈 왓슨x AI', market: '다우존스', sector: '빅테크 & AI' }
};

export default function SurgingLeadersCard({ detailedDataState = {}, onSelectStock }) {
  const [marketFilter, setMarketFilter] = useState('ALL'); // 'ALL' | 'KR' | 'US'

  // 1. Extract and aggregate all unique stocks from all 5 markets in detailedDataState
  const { surgingStocks, surgingSectors } = useMemo(() => {
    const stockMap = new Map();

    Object.values(detailedDataState).forEach(idxData => {
      if (idxData && idxData.heatmap) {
        idxData.heatmap.forEach(item => {
          if (!item.name) return;
          const meta = STOCK_METADATA[item.name] || {};
          const isKR = meta.market === '코스피' || meta.market === '코스닥' || /[가-힣]/.test(item.name);
          const market = meta.market || (isKR ? '코스피' : '미국');
          const theme = meta.theme || '대표 우량주';
          const sector = meta.sector || '종합';

          if (!stockMap.has(item.name)) {
            stockMap.set(item.name, {
              ...item,
              market,
              theme,
              sector,
              isKR,
              change: typeof item.change === 'number' ? item.change : 0
            });
          } else {
            // Merge with existing if symbol/price was updated
            const existing = stockMap.get(item.name);
            stockMap.set(item.name, {
              ...existing,
              ...item,
              market,
              theme,
              sector,
              isKR,
              change: typeof item.change === 'number' ? item.change : existing.change
            });
          }
        });
      }
    });

    const allStocks = Array.from(stockMap.values());

    // Filter by market
    const filtered = allStocks.filter(stock => {
      if (marketFilter === 'KR') return stock.isKR;
      if (marketFilter === 'US') return !stock.isKR;
      return true;
    });

    // Sort strictly by change descending to get top surging stocks
    const sortedStocks = [...filtered]
      .sort((a, b) => b.change - a.change)
      .slice(0, 6);

    // 2. Aggregate sector momentum & top leaders
    const sectorMap = new Map();
    allStocks.forEach(stock => {
      if (!stock.sector || stock.sector === '종합') return;
      if (!sectorMap.has(stock.sector)) {
        sectorMap.set(stock.sector, {
          name: stock.sector,
          totalChange: 0,
          count: 0,
          stocks: []
        });
      }
      const sec = sectorMap.get(stock.sector);
      sec.totalChange += stock.change;
      sec.count += 1;
      sec.stocks.push(stock);
    });

    const sectorList = Array.from(sectorMap.values()).map(sec => {
      const avgChange = sec.count > 0 ? sec.totalChange / sec.count : 0;
      // Top 2 leader stocks inside this sector
      const leaders = [...sec.stocks].sort((a, b) => b.change - a.change).slice(0, 2);
      return {
        name: sec.name,
        avgChange: Number(avgChange.toFixed(2)),
        leaders
      };
    });

    // Sort sectors by average change descending
    const sortedSectors = sectorList
      .sort((a, b) => b.avgChange - a.avgChange)
      .slice(0, 5);

    return { surgingStocks: sortedStocks, surgingSectors: sortedSectors };
  }, [detailedDataState, marketFilter]);

  const formatPrice = (stock) => {
    if (stock.price !== undefined && stock.price !== null) {
      const num = Number(stock.price);
      if (!isNaN(num)) {
        return stock.isKR ? `₩${num.toLocaleString('ko-KR')}` : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
    return null;
  };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div className="card" style={{ padding: '1.25rem 1.25rem 1.5rem 1.25rem' }}>
        {/* Card Header */}
        <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flame size={19} color="var(--positive-color)" />
            </div>
            <div>
              <h2 className="card-title" style={{ margin: 0, fontSize: '1.15rem' }}>
                당일 시장 주도주 & 급등 섹터 랭킹
              </h2>
              <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
                글로벌 5대 시장 실시간 시세 기준 수급 집중 종목 및 테마 모아보기
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} color="var(--accent-color)" />
              실시간 자동 갱신
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Column 1: 당일 급등주 TOP 랭킹 */}
          <div style={{
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.65rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Tab Filter Header */}
            <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="var(--positive-color)" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>당일 급등주 TOP</span>
              </div>

              {/* Market Filter Tabs */}
              <div style={{ display: 'flex', backgroundColor: 'var(--surface-hover)', borderRadius: '0.35rem', padding: '2px' }}>
                <button
                  onClick={() => setMarketFilter('ALL')}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: marketFilter === 'ALL' ? 'var(--surface-color)' : 'transparent',
                    color: marketFilter === 'ALL' ? 'var(--text-color)' : 'var(--text-secondary)',
                    boxShadow: marketFilter === 'ALL' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  전체
                </button>
                <button
                  onClick={() => setMarketFilter('KR')}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: marketFilter === 'KR' ? 'var(--surface-color)' : 'transparent',
                    color: marketFilter === 'KR' ? 'var(--text-color)' : 'var(--text-secondary)',
                    boxShadow: marketFilter === 'KR' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  국내
                </button>
                <button
                  onClick={() => setMarketFilter('US')}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: marketFilter === 'US' ? 'var(--surface-color)' : 'transparent',
                    color: marketFilter === 'US' ? 'var(--text-color)' : 'var(--text-secondary)',
                    boxShadow: marketFilter === 'US' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  미국
                </button>
              </div>
            </div>

            {/* Surging Stock List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {surgingStocks.length === 0 ? (
                <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>
                  급등주 데이터를 취합하는 중입니다...
                </div>
              ) : (
                surgingStocks.map((stock, idx) => {
                  const isUp = stock.change >= 0;
                  const rank = idx + 1;
                  const priceStr = formatPrice(stock);

                  return (
                    <div
                      key={idx}
                      className="clickable"
                      onClick={() => onSelectStock && onSelectStock({
                        name: stock.name,
                        symbol: stock.symbol || stock.name,
                        value: String(stock.price || stock.size || '100')
                      })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '0.45rem',
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border-color)',
                        transition: 'transform 0.15s, border-color 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {/* Rank Badge */}
                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          backgroundColor: rank === 1 ? 'rgba(239, 68, 68, 0.2)' : rank <= 3 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(100, 116, 139, 0.12)',
                          color: rank === 1 ? 'var(--positive-color)' : rank <= 3 ? 'var(--accent-color)' : 'var(--text-secondary)'
                        }}>
                          {rank}
                        </span>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>{stock.name}</span>
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: stock.isKR ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                              color: stock.isKR ? 'var(--accent-color)' : '#a855f7',
                              fontWeight: '500'
                            }}>
                              {stock.market}
                            </span>
                          </div>

                          <div className="text-secondary" style={{ fontSize: '0.73rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{stock.theme}</span>
                            {priceStr && <span style={{ opacity: 0.4 }}>·</span>}
                            {priceStr && <span style={{ fontWeight: '500', color: 'var(--text-color)' }}>{priceStr}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Change Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span
                          className={`badge ${isUp ? 'positive' : 'negative'}`}
                          style={{ fontSize: '0.82rem', padding: '0.2rem 0.5rem', fontWeight: 'bold' }}
                        >
                          {isUp ? '+' : ''}{stock.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: 당일 급등 섹터 & 주도 테마 TOP */}
          <div style={{
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.65rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="var(--accent-color)" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>당일 주도 섹터 & 테마 TOP</span>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.73rem' }}>
                섹터별 평균 등락 및 주도 대장주
              </span>
            </div>

            {/* Sector List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1 }}>
              {surgingSectors.length === 0 ? (
                <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>
                  섹터 데이터를 분석하는 중입니다...
                </div>
              ) : (
                surgingSectors.map((sector, idx) => {
                  const isUp = sector.avgChange >= 0;
                  const rank = idx + 1;
                  // Momentum bar width percentage (relative to max 4%)
                  const barWidth = Math.min(Math.max((Math.abs(sector.avgChange) / 3.5) * 100, 15), 100);

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '0.45rem',
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}
                    >
                      <div className="flex-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            backgroundColor: rank === 1 ? 'var(--accent-color)' : 'rgba(100, 116, 139, 0.15)',
                            color: rank === 1 ? '#ffffff' : 'var(--text-secondary)'
                          }}>
                            {rank}
                          </span>
                          <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>{sector.name}</span>
                        </div>

                        <span className={isUp ? 'text-positive' : 'text-negative'} style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                          {isUp ? '+' : ''}{sector.avgChange.toFixed(2)}%
                        </span>
                      </div>

                      {/* Momentum Bar */}
                      <div style={{
                        width: '100%',
                        height: '4px',
                        borderRadius: '2px',
                        backgroundColor: 'var(--border-color)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          borderRadius: '2px',
                          backgroundColor: isUp ? 'var(--positive-color)' : 'var(--negative-color)',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>

                      {/* Sector Leaders Chips */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span className="text-secondary" style={{ fontSize: '0.7rem' }}>주도주:</span>
                        {sector.leaders.map((lead, lIdx) => (
                          <button
                            key={lIdx}
                            onClick={() => onSelectStock && onSelectStock({
                              name: lead.name,
                              symbol: lead.symbol || lead.name,
                              value: String(lead.price || '100')
                            })}
                            style={{
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              padding: '1px 6px',
                              fontSize: '0.7rem',
                              backgroundColor: 'var(--surface-color)',
                              color: 'var(--text-color)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span>{lead.name}</span>
                            <span className={lead.change >= 0 ? 'text-positive' : 'text-negative'} style={{ fontWeight: '600', fontSize: '0.68rem' }}>
                              {lead.change >= 0 ? '+' : ''}{lead.change.toFixed(1)}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
          <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
            💡 급등 종목 및 주도주 칩을 클릭하면 실시간 캔들스틱 차트와 기술적 분석 팝업이 표시됩니다.
          </span>
        </div>
      </div>
    </div>
  );
}
