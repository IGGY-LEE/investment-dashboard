import React, { useState } from 'react'
import { ExternalLink, Clock, TrendingUp, Pickaxe, Banknote, Trophy, Bitcoin, Layers } from 'lucide-react'

const generateNewsData = () => ({
  '거시/지표': [
    { source: 'Bloomberg', time: '1시간 전', title: '연준 파월 의장, "금리 인하 서두르지 않을 것"', summary: '최근 예상보다 높게 나온 CPI 데이터와 견고한 고용 시장을 근거로 금리 인하에 대한 신중론을 재차 강조했습니다.' },
    { source: 'Reuters', time: '3시간 전', title: '미국 2분기 GDP 수정치, 연착륙 기대감 키워', summary: '미국 경제가 예상보다 강한 소비 지출을 바탕으로 탄탄한 성장세를 이어가고 있음을 보여주었습니다.' },
    { source: '한국경제', time: '5시간 전', title: '한은 금통위, 기준금리 연 3.50%로 동결', summary: '가계부채와 부동산 시장 과열 우려를 이유로 금리를 동결하며 매파적 기조를 유지했습니다.' },
    { source: 'CNBC', time: '12시간 전', title: '미국 10년물 국채 금리 4.5% 돌파, 주식시장 압박', summary: '인플레이션 우려가 다시 고개를 들면서 장기 국채 금리가 급등, 나스닥 등 기술주에 하방 압력을 가하고 있습니다.' },
  ],
  '환율': [
    { source: 'Wall Street Journal', time: '2시간 전', title: '달러 인덱스 104 돌파, 신흥국 통화 일제히 약세', summary: '미국의 고금리 장기화 우려로 글로벌 자금이 달러로 쏠리며 아시아 신흥국 통화가 하락 압력을 받고 있습니다.' },
    { source: '매일경제', time: '4시간 전', title: '원·달러 환율 장중 1,385원 돌파... 배당 역송금 여파', summary: '국내 주요 기업들의 배당금 지급 시즌이 도래하면서 달러 수요가 급증해 환율 상승을 부추겼습니다.' },
    { source: 'Reuters', time: '8시간 전', title: '일본은행(BOJ) 개입 경계감 속 엔/달러 환율 158엔 터치', summary: '엔화 약세가 지속되자 일본 외환 당국의 실개입 가능성이 대두되며 외환 시장의 변동성이 커지고 있습니다.' },
  ],
  '원자재': [
    { source: 'CNBC', time: '1시간 전', title: 'WTI 원유 80달러 하회... 중국 수요 둔화 우려', summary: '세계 최대 원유 수입국인 중국의 제조업 지표 부진으로 원유 수요 감소 우려가 커지며 유가가 하락했습니다.' },
    { source: 'Bloomberg', time: '4시간 전', title: '금 가격 사상 최고치 경신, 안전자산 선호 현상 뚜렷', summary: '지정학적 리스크 고조와 각국 중앙은행들의 금 매입이 지속되면서 금 가격이 트로이온스당 2,400달러를 돌파했습니다.' },
    { source: 'Financial Times', time: '12시간 전', title: '닥터 코퍼(구리) 가격 급락, 글로벌 경기 침체 신호인가', summary: 'LME 구리 재고량이 급증하고 수요가 둔화되면서 구리 가격이 하락세로 전환했습니다.' },
  ],
  '시장 주도주': [
    { source: 'TechCrunch', time: '30분 전', title: '엔비디아(NVDA), 차세대 AI 칩 블랙웰 양산 돌입', summary: '대만 TSMC와의 협력을 통해 차세대 AI 가속기 양산을 본격화하며 시장 지배력을 더욱 공고히 하고 있습니다.' },
    { source: '지디넷', time: '2시간 전', title: '삼성전자, HBM3E 수율 대폭 개선... 하반기 기대감', summary: '고대역폭메모리(HBM) 수율 문제를 상당 부분 해결하며 주요 고객사 납품이 가시화되고 있습니다.' },
    { source: 'Bloomberg', time: '6시간 전', title: '테슬라(TSLA), 중국 시장 판매량 반등 성공', summary: '대대적인 가격 인하와 프로모션 효과로 지난달 중국 내 전기차 인도량이 큰 폭으로 증가했습니다.' },
    { source: 'Apple News', time: '9시간 전', title: '애플(AAPL), 자체 생성형 AI 모델 \'Apple Intelligence\' 비전 발표', summary: 'iOS 18에 탑재될 강력한 온디바이스 AI 기능들을 선보이며 주가가 강세를 보였습니다.' },
  ],
  '가상자산': [
    { source: 'CoinDesk', time: '15분 전', title: '비트코인, 반감기 이후 채굴자 매도세 진정... 64K 회복', summary: '채굴자들의 대규모 물량 출회가 일단락되면서 비트코인 가격이 다시 상승 곡선을 그리고 있습니다.' },
    { source: 'Cointelegraph', time: '1시간 전', title: '이더리움 현물 ETF, 승인 첫날 거래량 10억 달러 돌파', summary: '월가 기관 투자자들의 자금이 빠르게 유입되면서 성공적인 데뷔전을 치렀습니다.' },
    { source: 'Bloomberg', time: '5시간 전', title: '솔라나 기반 디파이 프로토콜 TVL, 1년 만에 최고치', summary: '밈 코인 거래 폭증과 생태계 활성화로 솔라나 네트워크의 예치금이 급증했습니다.' },
  ],
  '테마/ETF': [
    { 소스: 'CNBC', time: '20분 전', title: '미국 원전 관련 ETF (NLR) 일주일 새 15% 폭등', summary: '마이크로소프트, 구글 등 빅테크 기업들이 AI 데이터센터 전력 확보를 위해 원전에 투자한다는 소식이 호재로 작용했습니다.' },
    { source: '한국경제', time: '3시간 전', title: 'K-뷰티(화장품) ETF, 외국인 순매수 1위 등극', summary: '미국과 일본 시장에서의 K-뷰티 수출 호조 실적이 발표되면서 관련 ETF에 자금이 몰리고 있습니다.' },
    { source: 'Financial Times', time: '7시간 전', title: '글로벌 방산 ETF (ITA), 지정학적 긴장에 사상 최고치', summary: '중동과 동유럽의 분쟁 장기화로 각국 국방비 예산이 증액되며 방산주들이 강세를 보이고 있습니다.' },
  ]
});

const newsData = generateNewsData();

export default function News() {
  const [activeTab, setActiveTab] = useState('거시/지표');

  const tabs = [
    { id: '거시/지표', icon: <TrendingUp size={16} /> },
    { id: '환율', icon: <Banknote size={16} /> },
    { id: '원자재', icon: <Pickaxe size={16} /> },
    { id: '시장 주도주', icon: <Trophy size={16} /> },
    { id: '가상자산', icon: <Bitcoin size={16} /> },
    { id: '테마/ETF', icon: <Layers size={16} /> },
  ];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>주요 뉴스</h1>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            섹터별 최신 헤드라인 및 이슈를 실시간으로 확인하세요.
          </div>
        </div>
      </div>

      <div className="tabs" style={{ overflowX: 'auto', display: 'flex', gap: '0.5rem', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            {tab.icon} {tab.id}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        {newsData[activeTab].map((news, idx) => (
          <div key={idx} className="card clickable" style={{ padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => alert('실제 뉴스 기사(외부 링크)로 이동합니다.')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{news.source || news.소스}</span>
                  <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {news.time}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                  {news.title}
                </h2>
                <p className="text-secondary" style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {news.summary}
                </p>
              </div>
              <div style={{ marginLeft: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', width: '40px', height: '40px', flexShrink: 0 }}>
                <ExternalLink size={18} color="var(--text-secondary)" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
