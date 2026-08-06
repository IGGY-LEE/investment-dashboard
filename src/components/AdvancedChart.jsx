import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, LineSeries } from 'lightweight-charts';

export default function AdvancedChart({ data, type = 'candle', height = 300, colors }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;
    
    // Sort and deduplicate data (lightweight-charts requires strictly ascending time)
    const uniqueDataMap = new Map();
    data.forEach(item => {
      if (item.time) {
        uniqueDataMap.set(item.time, item);
      }
    });
    
    const sortedData = Array.from(uniqueDataMap.values()).sort((a, b) => a.time - b.time);

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: colors?.textColor || '#64748b',
      },
      grid: {
        vertLines: { color: colors?.gridColor || 'rgba(226, 232, 240, 0.5)' },
        horzLines: { color: colors?.gridColor || 'rgba(226, 232, 240, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: colors?.gridColor || '#e2e8f0',
        autoScale: true,
      },
      timeScale: {
        borderColor: colors?.gridColor || '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });
    
    chartRef.current = chart;

    let series;
    if (type === 'candle') {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#ef4444',
        downColor: '#3b82f6',
        borderVisible: false,
        wickUpColor: '#ef4444',
        wickDownColor: '#3b82f6',
      });
    } else {
      series = chart.addSeries(LineSeries, {
        color: colors?.lineColor || 'var(--accent-color, #3b82f6)',
        lineWidth: 2,
      });
    }

    series.setData(sortedData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, type, colors]);

  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        차트 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: `${height}px` }} />
  );
}
