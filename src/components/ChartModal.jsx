import React, { useState, useEffect, useMemo } from 'react';
import { X, Bell } from 'lucide-react';
import Chart from 'react-apexcharts';
import AdvancedChart from './AdvancedChart';
import { getChartData, getPluginEarnings, getPluginSentiment, getQuotes } from '../api';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', '5Y', '10Y', '30Y'];

export const TICKER_MAP = {
  // 지수
  'S&P 500': '^GSPC',
  '나스닥': '^IXIC',
  '다우존스': '^DJI',
  '코스피': '^KS11',
  '코스닥': '^KQ11',
  '닛케이': '^N225',
  '상해종합': '000001.SS',
  '원/달러 환율': 'KRW=X',
  '원/달러': 'KRW=X',
  '엔/달러': 'JPY=X',
  '미국 10년물 국채 금리': '^TNX',
  '금 (Gold)': 'GC=F',
  '비트코인 (BTC)': 'BTC-USD',

  // 코스피 20대 대표주
  '삼성전자': '005930.KS',
  'SK하이닉스': '000660.KS',
  'LG에너지솔루션': '373220.KS',
  '삼성바이오로직스': '207940.KS',
  '현대차': '005380.KS',
  '기아': '000270.KS',
  '셀트리온': '068270.KS',
  'POSCO홀딩스': '005490.KS',
  'KB금융': '105560.KS',
  'NAVER': '035420.KS',
  '신한지주': '055550.KS',
  '현대모비스': '012330.KS',
  '삼성SDI': '006400.KS',
  '하나금융지주': '086790.KS',
  '카카오': '035720.KS',
  '포스코퓨처엠': '003670.KS',
  'HD현대중공업': '329180.KS',
  '한화에어로스페이스': '012450.KS',
  '두산에너빌리티': '034020.KS',
  'LG전자': '066570.KS',

  // 코스닥 20대 대표주
  '알테오젠': '196170.KQ',
  '에코프로비엠': '247540.KQ',
  '에코프로': '086520.KQ',
  'HLB': '028300.KQ',
  '리가켐바이오': '141080.KQ',
  '엔켐': '348370.KQ',
  '휴젤': '145020.KQ',
  '클래시스': '214150.KQ',
  '리노공업': '058470.KQ',
  '삼천당제약': '000250.KQ',
  '셀트리온제약': '068760.KQ',
  'HPSP': '403870.KQ',
  '레인보우로보틱스': '277810.KQ',
  '파마리서치': '214450.KQ',
  '이오테크닉스': '039030.KQ',
  '원익IPS': '240810.KQ',
  '동진쎄미켐': '005290.KQ',
  '에스엠': '041510.KQ',
  'JYP Ent.': '035900.KQ',
  '펄어비스': '263750.KQ',

  // 미국 특수
  'BRK.B': 'BRK-B'
};

export const resolveTicker = (name, symbol) => {
  if (symbol && TICKER_MAP[symbol]) return TICKER_MAP[symbol];
  if (name && TICKER_MAP[name]) return TICKER_MAP[name];
  if (symbol && symbol !== name) return symbol;
  return symbol || name || '';
};

export const DEFAULT_STOCK_INFO = {
  // 코스피
  '삼성전자': { mcap: '420.5조 원', per: '14.2배', pbr: '1.25배', div: '2.4%', range: '₩88,800 / ₩55,300', analyst: '강력 매수 (Strong Buy)', desc: '글로벌 1위 메모리 반도체 및 스마트폰, 가전 제조업체입니다.' },
  'SK하이닉스': { mcap: '142.8조 원', per: '11.5배', pbr: '1.85배', div: '1.2%', range: '₩248,500 / ₩115,000', analyst: '강력 매수 (Strong Buy)', desc: 'HBM(고대역폭 메모리) 시장을 선도하는 글로벌 AI 반도체 핵심 기업입니다.' },
  'LG에너지솔루션': { mcap: '94.2조 원', per: '48.5배', pbr: '4.10배', div: '0.3%', range: '₩445,000 / ₩310,000', analyst: '매수 (Buy)', desc: '글로벌 완성차 메이커에 전기차용 배터리를 공급하는 선도 2차전지 기업입니다.' },
  '삼성바이오로직스': { mcap: '72.5조 원', per: '62.0배', pbr: '6.80배', div: 'N/A', range: '₩1,050,000 / ₩695,000', analyst: '매수 (Buy)', desc: '글로벌 바이오의약품 위탁생산(CDMO) 세계 1위 생산능력을 보유한 바이오 기업입니다.' },
  '현대차': { mcap: '51.3조 원', per: '5.2배', pbr: '0.62배', div: '5.4%', range: '₩298,000 / ₩172,000', analyst: '매수 (Buy)', desc: '하이브리드 및 전기차 경쟁력을 바탕으로 역대급 실적을 기록 중인 글로벌 완성차 그룹입니다.' },
  '기아': { mcap: '40.8조 원', per: '4.8배', pbr: '0.81배', div: '5.8%', range: '₩135,000 / ₩78,000', analyst: '강력 매수 (Strong Buy)', desc: '글로벌 최고 수준의 영업이익률을 달성하고 있는 완성차 대표 기업입니다.' },
  '셀트리온': { mcap: '42.6조 원', per: '38.2배', pbr: '2.45배', div: '0.8%', range: '₩220,000 / ₩142,000', analyst: '매수 (Buy)', desc: '자가면역질환 및 항암 바이오시밀러 글로벌 직판 체제를 구축한 바이오 선도기업입니다.' },
  'KB금융': { mcap: '60.4조 원', per: '5.8배', pbr: '0.48배', div: '4.8%', range: '₩194,500 / ₩105,800', analyst: '강력 매수 (Strong Buy)', desc: '국내 최대 금융지주사(KB국민은행 등)로 업계 최고 자본비율과 기업 밸류업 프로그램의 핵심 수혜주입니다.' },
  'POSCO홀딩스': { mcap: '28.5조 원', per: '18.5배', pbr: '0.52배', div: '3.2%', range: '₩450,000 / ₩290,000', analyst: '보유 (Hold)', desc: '친환경 미래소재 및 철강 글로벌 대표 지주회사입니다.' },
  'NAVER': { mcap: '27.4조 원', per: '19.8배', pbr: '1.05배', div: '1.1%', range: '₩235,000 / ₩155,000', analyst: '매수 (Buy)', desc: '국내 1위 검색 포털, 이커머스, 클라우드 및 생성형 AI 하이퍼클로바X 운영사입니다.' },
  '신한지주': { mcap: '28.2조 원', per: '5.2배', pbr: '0.44배', div: '5.1%', range: '₩62,000 / ₩38,500', analyst: '매수 (Buy)', desc: '신한은행, 신한카드 등 다각화된 사업 포트폴리오를 보유한 대표 금융지주입니다.' },
  '현대모비스': { mcap: '23.8조 원', per: '5.9배', pbr: '0.49배', div: '2.8%', range: '₩275,000 / ₩205,000', analyst: '매수 (Buy)', desc: '현대차그룹의 핵심 부품 및 전동화 솔루션 제조 기업입니다.' },
  '삼성SDI': { mcap: '22.5조 원', per: '16.5배', pbr: '1.15배', div: '0.8%', range: '₩460,000 / ₩310,000', analyst: '매수 (Buy)', desc: '프리미엄 각형 배터리 및 전고체 배터리 기술을 선도하는 에너지 솔루션 기업입니다.' },
  '하나금융지주': { mcap: '18.6조 원', per: '4.7배', pbr: '0.41배', div: '5.6%', range: '₩68,500 / ₩42,000', analyst: '매수 (Buy)', desc: '글로벌 영업망과 외환 강점을 보유한 대형 금융지주사입니다.' },
  '카카오': { mcap: '17.2조 원', per: '28.5배', pbr: '1.20배', div: '0.4%', range: '₩61,000 / ₩35,000', analyst: '보유 (Hold)', desc: '국민 메신저 카카오톡 기반의 플랫폼, 모빌리티, 콘텐츠 생태계 기업입니다.' },
  '포스코퓨처엠': { mcap: '18.1조 원', per: '85.0배', pbr: '4.80배', div: '0.2%', range: '₩380,000 / ₩195,000', analyst: '매수 (Buy)', desc: '양극재와 음극재를 동시 생산하는 국내 유일 2차전지 핵심 소재 기업입니다.' },
  'HD현대중공업': { mcap: '17.8조 원', per: '22.0배', pbr: '3.10배', div: '1.5%', range: '₩215,000 / ₩110,000', analyst: '강력 매수 (Strong Buy)', desc: '친환경 LNG선 및 고부가가치 선박 수주 잔고를 확보한 글로벌 조선 1위 기업입니다.' },
  '한화에어로스페이스': { mcap: '16.5조 원', per: '18.2배', pbr: '2.85배', div: '1.2%', range: '₩365,000 / ₩115,000', analyst: '강력 매수 (Strong Buy)', desc: 'K9 자주포, 천무 등 K-방산 수출을 주도하는 대한민국 대표 항공우주/방산 기업입니다.' },
  '두산에너빌리티': { mcap: '14.2조 원', per: '24.5배', pbr: '1.65배', div: 'N/A', range: '₩24,500 / ₩13,800', analyst: '매수 (Buy)', desc: '대형 원전 주기기 및 SMR(소형모듈원자로) 글로벌 제조 선도기업입니다.' },
  'LG전자': { mcap: '15.9조 원', per: '7.8배', pbr: '0.78배', div: '1.8%', range: '₩115,000 / ₩88,000', analyst: '매수 (Buy)', desc: '프리미엄 가전 및 VS(전장부품) 사업 고성장을 이어가는 글로벌 종합 전자기업입니다.' },

  // 코스닥
  '알테오젠': { mcap: '16.8조 원', per: '75.0배', pbr: '18.5배', div: 'N/A', range: '₩395,000 / ₩65,000', analyst: '강력 매수 (Strong Buy)', desc: '피하주사(SC) 제형 변경 인간 히알루로니다제 플랫폼(ALT-B4) 글로벌 라이선스 아웃 선도 바이오 기업입니다.' },
  '에코프로비엠': { mcap: '16.2조 원', per: '42.0배', pbr: '4.90배', div: '0.3%', range: '₩320,000 / ₩155,000', analyst: '보유 (Hold)', desc: '하이니켈 NCA/NCM 양극소재 글로벌 1위 생산능력을 갖춘 2차전지 소재 기업입니다.' },
  '에코프로': { mcap: '12.8조 원', per: '35.0배', pbr: '4.10배', div: '0.2%', range: '₩140,000 / ₩72,000', analyst: '보유 (Hold)', desc: '양극재, 전구체, 리튬, 리사이클링의 2차전지 클로즈드 루프 생태계를 구축한 지주회사입니다.' },
  'HLB': { mcap: '11.5조 원', per: 'N/A', pbr: '15.2배', div: 'N/A', range: '₩129,000 / ₩28,000', analyst: '매수 (Buy)', desc: '표적항암제 리보세라닙의 글로벌 임상 및 FDA 품목허가를 추진 중인 바이오텍입니다.' },
  '리가켐바이오': { mcap: '4.2조 원', per: 'N/A', pbr: '8.5배', div: 'N/A', range: '₩125,000 / ₩48,000', analyst: '강력 매수 (Strong Buy)', desc: '차세대 ADC(항체-약물 접합체) 플랫폼 및 파이프라인 다수 기술이전을 달성한 신약 바이오 기업입니다.' },
  '엔켐': { mcap: '3.8조 원', per: '28.0배', pbr: '5.2배', div: 'N/A', range: '₩358,000 / ₩62,000', analyst: '매수 (Buy)', desc: '글로벌 2차전지 셀 메이커의 미국/유럽 현지 공장에 전해액을 공급하는 대표 화학기업입니다.' },
  '휴젤': { mcap: '3.6조 원', per: '24.5배', pbr: '3.1배', div: '0.5%', range: '₩310,000 / ₩125,000', analyst: '강력 매수 (Strong Buy)', desc: '보툴렉스 등 보툴리눔 톡신 및 HA필러의 미국/유럽/중국 글로벌 시장 진출 선도기업입니다.' },
  '클래시스': { mcap: '3.4조 원', per: '29.0배', pbr: '7.8배', div: '0.8%', range: '₩61,000 / ₩29,000', analyst: '강력 매수 (Strong Buy)', desc: '슈링크, 볼뉴머 등 고수익 소모품 중심의 글로벌 메디컬 에스테틱 의료기기 1위 기업입니다.' },
  '리노공업': { mcap: '3.2조 원', per: '21.5배', pbr: '4.6배', div: '1.6%', range: '₩285,000 / ₩175,000', analyst: '매수 (Buy)', desc: '반도체 테스트용 리노핀 및 테스트 소켓 글로벌 시장을 과점하고 있는 초정밀 부품 제조사입니다.' },
  '삼천당제약': { mcap: '2.9조 원', per: '45.0배', pbr: '9.2배', div: '0.3%', range: '₩185,000 / ₩68,000', analyst: '매수 (Buy)', desc: '경구용 제형 플랫폼(S-PASS) 및 아일리아 바이오시밀러 글로벌 공급계약을 체결한 제약사입니다.' },
  '셀트리온제약': { mcap: '2.8조 원', per: '48.0배', pbr: '4.8배', div: 'N/A', range: '₩120,000 / ₩65,000', analyst: '보유 (Hold)', desc: '간질환 치료제 고덱스 및 셀트리온 바이오시밀러의 국내 판매를 전담하는 제약사입니다.' },
  'HPSP': { mcap: '2.7조 원', per: '26.0배', pbr: '7.2배', div: '0.6%', range: '₩58,000 / ₩29,000', analyst: '강력 매수 (Strong Buy)', desc: '고압 수소 어닐링 기술을 독점 개발하여 최선단 반도체 공정에 필수 장비를 공급하는 기업입니다.' },
  '레인보우로보틱스': { mcap: '2.5조 원', per: 'N/A', pbr: '12.5배', div: 'N/A', range: '₩195,000 / ₩115,000', analyst: '매수 (Buy)', desc: '삼성전자가 지분 투자한 국내 최고 수준의 협동로봇 및 4족보행 로봇 플랫폼 기업입니다.' },
  '파마리서치': { mcap: '2.4조 원', per: '20.5배', pbr: '4.2배', div: '1.2%', range: '₩235,000 / ₩98,000', analyst: '강력 매수 (Strong Buy)', desc: '연어 DNA 유래 DOT 특허 기술 기반의 리쥬란, 콘쥬란 등 재생의학 에스테틱 대표기업입니다.' },
  '이오테크닉스': { mcap: '2.2조 원', per: '22.0배', pbr: '3.1배', div: '0.8%', range: '₩255,000 / ₩140,000', analyst: '매수 (Buy)', desc: '반도체 패키징 레이저 마커, 레이저 커팅 및 그루빙 장비 분야 글로벌 경쟁력을 갖춘 기업입니다.' },
  '원익IPS': { mcap: '2.0조 원', per: '19.5배', pbr: '1.8배', div: '1.1%', range: '₩42,000 / ₩25,000', analyst: '매수 (Buy)', desc: '삼성전자향 반도체 박막형성 ALD, CVD 증착 장비를 공급하는 대표 전공정 장비사입니다.' },
  '동진쎄미켐': { mcap: '1.9조 원', per: '12.5배', pbr: '1.7배', div: '1.4%', range: '₩48,000 / ₩31,000', analyst: '매수 (Buy)', desc: '반도체/디스플레이 포토레지스트(감광액) 국산화를 주도한 전자재료 전문기업입니다.' },
  '에스엠': { mcap: '1.8조 원', per: '18.0배', pbr: '2.2배', div: '1.5%', range: '₩105,000 / ₩62,000', analyst: '매수 (Buy)', desc: '에스파, 라이즈, NCT 등 다수의 글로벌 K-POP IP를 보유한 대한민국 대표 엔터테인먼트사입니다.' },
  'JYP Ent.': { mcap: '1.7조 원', per: '16.5배', pbr: '3.4배', div: '1.2%', range: '₩92,000 / ₩48,000', analyst: '매수 (Buy)', desc: '스트레이키즈, 트와이스 등 글로벌 팬덤을 바탕으로 높은 영업이익률을 창출하는 엔터사입니다.' },
  '펄어비스': { mcap: '1.6조 원', per: 'N/A', pbr: '2.8배', div: 'N/A', range: '₩48,000 / ₩29,000', analyst: '보유 (Hold)', desc: '자체 개발 엔진을 보유하고 검은사막 및 기대작 붉은사막(Crimson Desert)을 개발하는 게임사입니다.' }
};

// Helper to generate summary data (uses real quote data if provided)
const generateSummaryData = (name, baseValue, quoteData) => {
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
  const defaultInfo = DEFAULT_STOCK_INFO[name];
  
  if (quoteData) {
    let mcapStr = defaultInfo?.mcap || 'N/A';
    if (quoteData.marketCap) {
      if (isKorea) {
        mcapStr = (quoteData.marketCap / 1e12).toFixed(1) + '조 원';
      } else {
        mcapStr = quoteData.marketCap >= 1e12 ? (quoteData.marketCap / 1e12).toFixed(2) + 'T' 
                : quoteData.marketCap >= 1e9 ? (quoteData.marketCap / 1e9).toFixed(2) + 'B' 
                : (quoteData.marketCap / 1e6).toFixed(2) + 'M';
        if (!isKorea) mcapStr = '$' + mcapStr;
      }
    }
      
    const per = quoteData.trailingPE ? `${quoteData.trailingPE.toFixed(1)}배`
      : quoteData.priceEpsCurrentYear ? `${quoteData.priceEpsCurrentYear.toFixed(1)}배`
      : quoteData.forwardPE ? `${quoteData.forwardPE.toFixed(1)}배`
      : (defaultInfo?.per || 'N/A');

    const pbr = quoteData.priceToBook ? `${quoteData.priceToBook.toFixed(2)}배`
      : (defaultInfo?.pbr || 'N/A');

    let div = defaultInfo?.div || 'N/A';
    if (quoteData.dividendYield !== undefined && quoteData.dividendYield !== null && quoteData.dividendYield > 0) {
      div = quoteData.dividendYield > 0.5 ? `${quoteData.dividendYield.toFixed(2)}%` : `${(quoteData.dividendYield * 100).toFixed(2)}%`;
    } else if (quoteData.trailingAnnualDividendYield !== undefined && quoteData.trailingAnnualDividendYield !== null && quoteData.trailingAnnualDividendYield > 0) {
      div = `${(quoteData.trailingAnnualDividendYield * 100).toFixed(2)}%`;
    }

    const highVal = quoteData.fiftyTwoWeekHigh;
    const lowVal = quoteData.fiftyTwoWeekLow;
    const high = highVal ? (isKorea ? `₩${highVal.toLocaleString()}` : `$${highVal.toFixed(2)}`) : null;
    const low = lowVal ? (isKorea ? `₩${lowVal.toLocaleString()}` : `$${lowVal.toFixed(2)}`) : null;
    const rangeStr = (high && low) ? `${high} / ${low}` : (defaultInfo?.range || 'N/A');

    const analystRating = quoteData.averageAnalystRating || defaultInfo?.analyst || '매수 (Buy)';
    
    const curPrice = quoteData.regularMarketPrice || price;
    const curPriceStr = isKorea ? `₩${curPrice.toLocaleString()}` : `$${curPrice.toLocaleString()}`;

    return {
      fields: [
        { label: '현재가', value: curPriceStr, isBold: true, valueColor: 'var(--text-primary)' },
        { label: '시가총액', value: mcapStr },
        { label: 'PER / PBR', value: `${per} / ${pbr}` },
        { label: '배당수익률', value: div },
        { label: '52주 최고/최저', value: rangeStr },
        { label: '애널리스트 의견', value: analystRating, isBold: true, valueColor: 'var(--accent-color)' },
      ],
      description: defaultInfo?.desc || `${name}의 실시간 시세 및 펀더멘털 요약 지표입니다.`
    };
  }

  // Fallback if no quote data is available yet or offline
  if (defaultInfo) {
    const curPrice = price;
    const curPriceStr = isKorea ? `₩${curPrice.toLocaleString()}` : `$${curPrice.toLocaleString()}`;
    return {
      fields: [
        { label: '현재가', value: curPriceStr, isBold: true, valueColor: 'var(--text-primary)' },
        { label: '시가총액', value: defaultInfo.mcap || 'N/A' },
        { label: 'PER / PBR', value: `${defaultInfo.per || 'N/A'} / ${defaultInfo.pbr || 'N/A'}` },
        { label: '배당수익률', value: defaultInfo.div || 'N/A' },
        { label: '52주 최고/최저', value: defaultInfo.range || 'N/A' },
        { label: '애널리스트 의견', value: defaultInfo.analyst || '매수 (Buy)', isBold: true, valueColor: 'var(--accent-color)' },
      ],
      description: defaultInfo.desc || `${name}의 기업 개요 및 펀더멘털 지표입니다.`
    };
  }

  const curPriceStr = isKorea ? `₩${price.toLocaleString()}` : `$${price.toLocaleString()}`;
  return {
    fields: [
      { label: '현재가', value: curPriceStr, isBold: true, valueColor: 'var(--text-primary)' },
      { label: '52주 최고/최저', value: isKorea ? `₩${(price * 1.25).toLocaleString()} / ₩${(price * 0.75).toLocaleString()}` : `$${(price * 1.25).toFixed(2)} / $${(price * 0.75).toFixed(2)}` },
      { label: '시장 구분', value: isKorea ? '한국 증시 (KRX)' : '미국 증시' },
      { label: '애널리스트 의견', value: '매수 (Buy)', isBold: true, valueColor: 'var(--accent-color)' }
    ],
    description: `${name}의 시장 데이터입니다. 상단 차트에서 가격 변동 추이 및 기술적 분석 지표를 확인하실 수 있습니다.`
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
  const clampedScore = Math.max(0, Math.min(100, Math.round(Number(score) || 50)));
  // Needle angle: -90 degrees (score 0 / Sell) to +90 degrees (score 100 / Buy)
  const angle = (clampedScore / 100) * 180 - 90;
  
  let label = '중립 (Neutral)';
  let color = '#94a3b8';
  let title = '기술적 분석 (Technical Analysis)';
  let desc = `이동평균 및 오실레이터 종합 수치 (${clampedScore}/100)`;
  let leftLabel = '매도';
  let rightLabel = '매수';
  
  if (isMacro) {
    title = '거시경제 환경 (Macro Environment)';
    desc = `증시에 미치는 우호적/비우호적 환경 (${clampedScore}/100)`;
    leftLabel = '악재';
    rightLabel = '호재';
    if (clampedScore <= 25) { label = '매우 악재 (Strong Bearish)'; color = '#ef4444'; }
    else if (clampedScore <= 45) { label = '악재 (Bearish)'; color = '#f87171'; }
    else if (clampedScore <= 55) { label = '중립 (Neutral)'; color = '#94a3b8'; }
    else if (clampedScore <= 75) { label = '호재 (Bullish)'; color = '#60a5fa'; }
    else { label = '강한 호재 (Strong Bullish)'; color = '#3b82f6'; }
  } else if (isCommodity) {
    title = '수급 및 펀더멘털 분석 (Supply & Demand)';
    desc = `생산/재고/수요 종합 분석 지표 (${clampedScore}/100)`;
    leftLabel = '공급과잉';
    rightLabel = '수요우위';
    if (clampedScore <= 25) { label = '공급 과잉/수요 급감'; color = '#ef4444'; }
    else if (clampedScore <= 45) { label = '수요 둔화'; color = '#f87171'; }
    else if (clampedScore <= 55) { label = '수급 균형 (Neutral)'; color = '#94a3b8'; }
    else if (clampedScore <= 75) { label = '수요 강세'; color = '#60a5fa'; }
    else { label = '공급 부족/수요 급증'; color = '#3b82f6'; }
  } else {
    if (clampedScore <= 25) { label = '강력 매도 (Strong Sell)'; color = '#ef4444'; }
    else if (clampedScore <= 45) { label = '매도 (Sell)'; color = '#f87171'; }
    else if (clampedScore <= 55) { label = '중립 (Neutral)'; color = '#94a3b8'; }
    else if (clampedScore <= 75) { label = '매수 (Buy)'; color = '#60a5fa'; }
    else { label = '강력 매수 (Strong Buy)'; color = '#3b82f6'; }
  }

  const cx = 130;
  const cy = 105;
  const r = 75;
  const strokeWidth = 15;

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.25rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.75rem', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>{title}</h4>
      
      <div style={{ position: 'relative', width: '260px', height: '130px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
        <svg width="260" height="130" viewBox="0 0 260 130" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="75%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="meterNeedleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="var(--surface-hover)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Gradient Colored Arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="url(#meterGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Scale Labels */}
          <text x={cx - r + 5} y={cy + 20} fontSize="10" fill="var(--text-secondary)" textAnchor="middle" fontWeight="bold">
            {leftLabel}
          </text>
          <text x={cx} y={cy - r - 10} fontSize="10" fill="var(--text-secondary)" textAnchor="middle" fontWeight="bold">
            중립 (50)
          </text>
          <text x={cx + r - 5} y={cy + 20} fontSize="10" fill="var(--text-secondary)" textAnchor="middle" fontWeight="bold">
            {rightLabel}
          </text>

          {/* Animated Needle */}
          <g transform={`rotate(${angle} ${cx} ${cy})`} style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} filter="url(#meterNeedleShadow)">
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - r + 8}
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="7" fill={color} />
            <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
          </g>
        </svg>
      </div>

      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: color, marginTop: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
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

  const [quoteData, setQuoteData] = useState(null);

  const summary = useMemo(() => {
    if (!item) return null;
    return generateSummaryData(item.name, item.value || item.price || '100', quoteData);
  }, [item, quoteData]);

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
      
      // Fetch real quote data for stocks/indices
      if (!checkIsMacro(item.name) && !isCommodity) {
        let ticker = resolveTicker(item.name, item.symbol);
        
        getQuotes([ticker]).then(res => {
          if (res && res.length > 0) {
            setQuoteData(res[0]);
          } else {
            setQuoteData(null);
          }
        });
      } else {
        setQuoteData(null);
      }
    }
  }, [isOpen, item, isCommodity]);
  
  const handleRunPlugin = async (type) => {
    setPluginLoading(true);
    setPluginResult(null);
    let ticker = resolveTicker(item.name, item.symbol);
    // Map common names for better accuracy
    if (ticker === '^GSPC') ticker = 'SPY';
    else if (ticker === '^IXIC') ticker = 'QQQ';
    else if (ticker === '^KS11' || ticker === '^KQ11') ticker = 'EWY';
    
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
        let symbol = resolveTicker(cItem.name, cItem.symbol);
        
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
                <span className="text-2xl" style={{ fontWeight: 'bold' }}>
                  {(() => {
                    const val = item.value || item.price;
                    if (typeof val === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
                    if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') return Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 });
                    return val;
                  })()}
                </span>
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
