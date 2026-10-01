import React, { useState } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import {
    ChartLineUp,
    ChartBar,
    Calendar,
    Users,
    CalendarCheck,
    VideoCamera,
    Sparkle,
    ArrowUpRight
} from '@phosphor-icons/react';

// Daily trend data spanning the last 7 days
const last7DaysData = [
    { day: 'Sat (Sep 19)', date: 'Sep 19', patients: 2, appointments: 3, consultancy: 1 },
    { day: 'Sun (Sep 20)', date: 'Sep 20', patients: 1, appointments: 2, consultancy: 1 },
    { day: 'Mon (Sep 21)', date: 'Sep 21', patients: 3, appointments: 4, consultancy: 2 },
    { day: 'Tue (Sep 22)', date: 'Sep 22', patients: 2, appointments: 3, consultancy: 1 },
    { day: 'Wed (Sep 23)', date: 'Sep 23', patients: 4, appointments: 5, consultancy: 3 },
    { day: 'Thu (Sep 24)', date: 'Sep 24', patients: 3, appointments: 4, consultancy: 2 },
    { day: 'Today (Fri)', date: 'Today', patients: 5, appointments: 6, consultancy: 3 }
];

const last14DaysData = [
    { day: 'Sep 12', date: 'Sep 12', patients: 1, appointments: 2, consultancy: 1 },
    { day: 'Sep 13', date: 'Sep 13', patients: 2, appointments: 1, consultancy: 0 },
    { day: 'Sep 14', date: 'Sep 14', patients: 3, appointments: 3, consultancy: 2 },
    { day: 'Sep 15', date: 'Sep 15', patients: 2, appointments: 4, consultancy: 1 },
    { day: 'Sep 16', date: 'Sep 16', patients: 4, appointments: 3, consultancy: 2 },
    { day: 'Sep 17', date: 'Sep 17', patients: 3, appointments: 5, consultancy: 1 },
    { day: 'Sep 18', date: 'Sep 18', patients: 2, appointments: 2, consultancy: 2 },
    { day: 'Sep 19', date: 'Sep 19', patients: 2, appointments: 3, consultancy: 1 },
    { day: 'Sep 20', date: 'Sep 20', patients: 1, appointments: 2, consultancy: 1 },
    { day: 'Sep 21', date: 'Sep 21', patients: 3, appointments: 4, consultancy: 2 },
    { day: 'Sep 22', date: 'Sep 22', patients: 2, appointments: 3, consultancy: 1 },
    { day: 'Sep 23', date: 'Sep 23', patients: 4, appointments: 5, consultancy: 3 },
    { day: 'Sep 24', date: 'Sep 24', patients: 3, appointments: 4, consultancy: 2 },
    { day: 'Today',  date: 'Today',  patients: 5, appointments: 6, consultancy: 3 }
];

// Custom sleek dark tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '14px 18px',
                color: 'white',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                minWidth: '200px'
            }}>
                <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '6px'
                }}>
                    {label}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {payload.map((item) => (
                        <div key={item.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }}></span>
                                <span style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>{item.name}</span>
                            </div>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'white' }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const DashboardAnalyticsChart = ({ totalPatients = 12, completedAppts = 13, liveConsults = 8 }) => {
    const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
    const [timeframe, setTimeframe] = useState('7d'); // '7d' | '14d'
    const [activeSeries, setActiveSeries] = useState({
        patients: true,
        appointments: true,
        consultancy: true
    });

    const currentData = timeframe === '7d' ? last7DaysData : last14DaysData;

    const toggleSeries = (key) => {
        setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div style={{
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '24px',
            padding: '28px 32px',
            marginBottom: '36px',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header: Title + Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '18px',
                marginBottom: '24px'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '11px',
                            background: 'rgba(37, 99, 235, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563EB'
                        }}>
                            <ChartLineUp size={22} weight="bold" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', letterSpacing: '-0.01em' }}>
                            Operational Activity & Trends
                        </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted, #64748B)' }}>
                        Volume comparison across patients registered, appointments completed, and CareConnect sessions
                    </p>
                </div>

                {/* Right controls: View toggle & Timeframe */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Timeframe pill selector */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--bg-color, #F1F5F9)',
                        padding: '3px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #E2E8F0)'
                    }}>
                        <button
                            onClick={() => setTimeframe('7d')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: timeframe === '7d' ? '#2563EB' : 'transparent',
                                color: timeframe === '7d' ? 'white' : 'var(--text-muted, #64748B)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => setTimeframe('14d')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: timeframe === '14d' ? '#2563EB' : 'transparent',
                                color: timeframe === '14d' ? 'white' : 'var(--text-muted, #64748B)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            Last 14 Days
                        </button>
                    </div>

                    {/* Chart Mode Toggle */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--bg-color, #F1F5F9)',
                        padding: '3px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #E2E8F0)'
                    }}>
                        <button
                            onClick={() => setChartType('area')}
                            title="Area Trend View"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: chartType === 'area' ? 'white' : 'transparent',
                                color: chartType === 'area' ? 'var(--text-main, #1F2937)' : 'var(--text-muted, #64748B)',
                                boxShadow: chartType === 'area' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <ChartLineUp size={16} weight="bold" /> Line
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            title="Grouped Bar View"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: chartType === 'bar' ? 'white' : 'transparent',
                                color: chartType === 'bar' ? 'var(--text-main, #1F2937)' : 'var(--text-muted, #64748B)',
                                boxShadow: chartType === 'bar' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <ChartBar size={16} weight="bold" /> Bar
                        </button>
                    </div>
                </div>
            </div>

            {/* Interactive Series Legend Tabs */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                flexWrap: 'wrap'
            }}>
                {/* 1. Patients Series */}
                <div
                    onClick={() => toggleSeries('patients')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: activeSeries.patients ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-color, #F8FAFC)',
                        border: `1.5px solid ${activeSeries.patients ? '#2563EB' : 'var(--border-color, #E2E8F0)'}`,
                        opacity: activeSeries.patients ? 1 : 0.5,
                        transition: 'all 0.15s ease'
                    }}
                >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563EB' }} />
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>Unique Patients</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563EB' }}>{totalPatients}</div>
                    </div>
                </div>

                {/* 2. Appointments Series */}
                <div
                    onClick={() => toggleSeries('appointments')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: activeSeries.appointments ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-color, #F8FAFC)',
                        border: `1.5px solid ${activeSeries.appointments ? '#10B981' : 'var(--border-color, #E2E8F0)'}`,
                        opacity: activeSeries.appointments ? 1 : 0.5,
                        transition: 'all 0.15s ease'
                    }}
                >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>Appointments Completed</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10B981' }}>{completedAppts}</div>
                    </div>
                </div>

                {/* 3. CareConnect Series */}
                <div
                    onClick={() => toggleSeries('consultancy')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: activeSeries.consultancy ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-color, #F8FAFC)',
                        border: `1.5px solid ${activeSeries.consultancy ? '#7C3AED' : 'var(--border-color, #E2E8F0)'}`,
                        opacity: activeSeries.consultancy ? 1 : 0.5,
                        transition: 'all 0.15s ease'
                    }}
                >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#7C3AED' }} />
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>Live Consultancy (CareConnect)</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7C3AED' }}>{liveConsults}</div>
                    </div>
                </div>
            </div>

            {/* Chart Canvas */}
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                        <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="consultGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #E2E8F0)" opacity={0.6} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--text-muted, #94A3B8)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={{ stroke: 'var(--border-color, #E2E8F0)' }}
                            />
                            <YAxis
                                stroke="var(--text-muted, #94A3B8)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            {activeSeries.patients && (
                                <Area
                                    type="monotone"
                                    dataKey="patients"
                                    name="Unique Patients"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#patientGrad)"
                                />
                            )}
                            {activeSeries.appointments && (
                                <Area
                                    type="monotone"
                                    dataKey="appointments"
                                    name="Appointments Completed"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#apptGrad)"
                                />
                            )}
                            {activeSeries.consultancy && (
                                <Area
                                    type="monotone"
                                    dataKey="consultancy"
                                    name="Live Consultancy"
                                    stroke="#7C3AED"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#consultGrad)"
                                />
                            )}
                        </AreaChart>
                    ) : (
                        <BarChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #E2E8F0)" opacity={0.6} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--text-muted, #94A3B8)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={{ stroke: 'var(--border-color, #E2E8F0)' }}
                            />
                            <YAxis
                                stroke="var(--text-muted, #94A3B8)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            {activeSeries.patients && (
                                <Bar
                                    dataKey="patients"
                                    name="Unique Patients"
                                    fill="#2563EB"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={28}
                                />
                            )}
                            {activeSeries.appointments && (
                                <Bar
                                    dataKey="appointments"
                                    name="Appointments Completed"
                                    fill="#10B981"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={28}
                                />
                            )}
                            {activeSeries.consultancy && (
                                <Bar
                                    dataKey="consultancy"
                                    name="Live Consultancy"
                                    fill="#7C3AED"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={28}
                                />
                            )}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardAnalyticsChart;
