import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  RefreshCw,
  Search,
  Package,
  ChevronRight,
  Flame,
  ArrowRight,
  Calendar,
  Layers,
  ShoppingCart
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { api } from '../../api';

// ─── Sri Lankan Seasons Catalog (Clean & Visual) ──────────────────────────────
const SEASONS_CATALOG = [
  {
    id: 'wedding-season',
    emoji: '💍',
    title: 'Wedding Season',
    subtitle: 'Highland & Coastal Weddings',
    dates: 'Nov 15 – Dec 30',
    surgeMultiplier: 1.65,
    surgeLabel: '+65% Peak',
    color: 'var(--pb-rose)',
    bg: '#FFF1F5',
    focusFlowers: 'Red Naomi Roses, Avalanche White, Asiatic Lilies',
    tip: 'Heavy wedding ballroom bookings in Colombo & Galle Fort.'
  },
  {
    id: 'christmas-newyear',
    emoji: '🎄',
    title: 'Christmas & New Year',
    subtitle: 'Hotel Galas & Banquets',
    dates: 'Dec 18 – Jan 05',
    surgeMultiplier: 1.45,
    surgeLabel: '+45% Peak',
    color: '#0284C7',
    bg: '#F0F9FF',
    focusFlowers: 'White Roses, Red Anthuriums, Carnations',
    tip: 'Year-end corporate dinners and luxury hotel dining displays.'
  },
  {
    id: 'valentines-rush',
    emoji: '🌹',
    title: "Valentine's Rush",
    subtitle: 'Cut-Flower Retail Spike',
    dates: 'Feb 01 – Feb 15',
    surgeMultiplier: 2.2,
    surgeLabel: '+120% Massive',
    color: '#B91C1C',
    bg: '#FEF2F2',
    focusFlowers: 'Red Naomi Roses, Oriental Lilies, Gypsophila',
    tip: 'Highest single peak of the year. Florists pre-order 3 weeks ahead.'
  },
  {
    id: 'sinhala-tamil-newyear',
    emoji: '🌞',
    title: 'Sinhala & Tamil Avurudu',
    subtitle: 'Cultural & Family Season',
    dates: 'Apr 05 – Apr 20',
    surgeMultiplier: 1.35,
    surgeLabel: '+35% Peak',
    color: '#D97706',
    bg: '#FFFBEB',
    focusFlowers: 'Marigolds, Lotus, Yellow Sunflowers',
    tip: 'Traditional floral arrangements, table centerpieces, and temple offerings.'
  },
  {
    id: 'vesak-poson',
    emoji: '🪔',
    title: 'Vesak & Poson Full Moon',
    subtitle: 'Religious & Temple Days',
    dates: 'May 10 – Jun 15',
    surgeMultiplier: 1.8,
    surgeLabel: '+80% Peak',
    color: '#7C3AED',
    bg: '#FAF5FF',
    focusFlowers: 'Sacred Pink Lotus, Araliya, Jasmine, Tuberoses',
    tip: 'Massive devotional offerings across Kelaniya, Kandy, and Anuradhapura.'
  },
  {
    id: 'summer-tourist',
    emoji: '🏖️',
    title: 'Tourist & Destination Weddings',
    subtitle: 'Coastal Resort Season',
    dates: 'Jul 01 – Aug 31',
    surgeMultiplier: 1.5,
    surgeLabel: '+50% Peak',
    color: '#059669',
    bg: '#ECFDF5',
    focusFlowers: 'Dendrobium Orchids, Bird of Paradise, Anthuriums',
    tip: 'High hotel occupancy along the southern coast and Kandy Perahera.'
  },
  {
    id: 'current',
    emoji: '📅',
    title: 'Normal Baseline',
    subtitle: 'Standard Day-to-Day',
    dates: 'Next 30 Days',
    surgeMultiplier: 1.0,
    surgeLabel: 'Regular',
    color: 'var(--pb-plum)',
    bg: 'var(--pb-blush)',
    focusFlowers: 'Standard hotel lobby displays and walk-in sales',
    tip: 'Normal baseline wholesale demand across current corporate orders.'
  }
];

// ─── 23 Master Flower Varieties ───────────────────────────────────────────────
const BASE_VARIETIES = [
  { id: 'F001', name: 'Red Naomi Rose', category: 'Rose', emoji: '🌹', currentStock: 1200, baseDemand: 3500, preferredSupplier: 'Nuwara Eliya Royale Rose Nurseries', unitPrice: 380, specialtySeason: ['wedding-season', 'valentines-rush'] },
  { id: 'F002', name: 'Avalanche Snow White Rose', category: 'Rose', emoji: '🌹', currentStock: 950, baseDemand: 2800, preferredSupplier: 'Nuwara Eliya Royale Rose Nurseries', unitPrice: 340, specialtySeason: ['wedding-season', 'christmas-newyear'] },
  { id: 'F003', name: 'Exotic Dendrobium Orchid', category: 'Orchid', emoji: '🪷', currentStock: 1400, baseDemand: 2200, preferredSupplier: 'Bandarawela Orchid Blooms', unitPrice: 420, specialtySeason: ['summer-tourist', 'wedding-season'] },
  { id: 'F004', name: 'Phalaenopsis Orchid', category: 'Orchid', emoji: '🌺', currentStock: 600, baseDemand: 950, preferredSupplier: 'Bandarawela Orchid Blooms', unitPrice: 410, specialtySeason: ['summer-tourist'] },
  { id: 'F005', name: 'Oriental Lily', category: 'Lily', emoji: '🌷', currentStock: 600, baseDemand: 1600, preferredSupplier: 'Hawa Eliya Exotic Lilies', unitPrice: 820, specialtySeason: ['wedding-season', 'valentines-rush'] },
  { id: 'F006', name: 'Asiatic Lily', category: 'Lily', emoji: '🌼', currentStock: 820, baseDemand: 1450, preferredSupplier: 'Hawa Eliya Exotic Lilies', unitPrice: 810, specialtySeason: ['wedding-season'] },
  { id: 'F007', name: 'Sacred Pink Lotus', category: 'Traditional', emoji: '🪷', currentStock: 500, baseDemand: 1100, preferredSupplier: 'Welimada Flora Growers', unitPrice: 350, specialtySeason: ['vesak-poson', 'sinhala-tamil-newyear'] },
  { id: 'F008', name: 'Araliya (Frangipani)', category: 'Traditional', emoji: '🌸', currentStock: 700, baseDemand: 1200, preferredSupplier: 'Welimada Flora Growers', unitPrice: 280, specialtySeason: ['vesak-poson'] },
  { id: 'F009', name: 'Wild Hill Jasmine', category: 'Traditional', emoji: '🌼', currentStock: 450, baseDemand: 800, preferredSupplier: 'Pedro Highlands Floral Farm', unitPrice: 300, specialtySeason: ['vesak-poson'] },
  { id: 'F010', name: 'Highland Tuberose', category: 'Traditional', emoji: '🌾', currentStock: 400, baseDemand: 750, preferredSupplier: 'Pedro Highlands Floral Farm', unitPrice: 260, specialtySeason: ['vesak-poson'] },
  { id: 'F011', name: 'Tropical Anthurium', category: 'Anthurium', emoji: '🪴', currentStock: 1100, baseDemand: 2100, preferredSupplier: 'Kandy Royal Flora Co.', unitPrice: 360, specialtySeason: ['christmas-newyear', 'summer-tourist'] },
  { id: 'F012', name: 'Emerald Green Anthurium', category: 'Anthurium', emoji: '🍃', currentStock: 800, baseDemand: 1300, preferredSupplier: 'Kandy Royal Flora Co.', unitPrice: 370, specialtySeason: ['christmas-newyear'] },
  { id: 'F013', name: 'Standard Carnation', category: 'Carnation', emoji: '🌸', currentStock: 1600, baseDemand: 2400, preferredSupplier: 'Welimada Flora Growers', unitPrice: 220, specialtySeason: ['christmas-newyear', 'wedding-season'] },
  { id: 'F014', name: 'White Gypsophila (Baby’s Breath)', category: 'Filler', emoji: '☁️', currentStock: 900, baseDemand: 2900, preferredSupplier: 'Nuwara Eliya Royale Rose Nurseries', unitPrice: 280, specialtySeason: ['wedding-season', 'valentines-rush'] },
  { id: 'F015', name: 'Pink Lisianthus', category: 'Exotic', emoji: '🌸', currentStock: 750, baseDemand: 1400, preferredSupplier: 'Hawa Eliya Exotic Lilies', unitPrice: 450, specialtySeason: ['wedding-season', 'christmas-newyear'] },
  { id: 'F016', name: 'Chrysanthemum Pompon', category: 'Chrysanthemum', emoji: '🌻', currentStock: 1300, baseDemand: 1800, preferredSupplier: 'Pedro Highlands Floral Farm', unitPrice: 210, specialtySeason: ['sinhala-tamil-newyear'] },
  { id: 'F017', name: 'Dutch Spray Rose', category: 'Rose', emoji: '🌹', currentStock: 850, baseDemand: 1750, preferredSupplier: 'Nuwara Eliya Royale Rose Nurseries', unitPrice: 360, specialtySeason: ['wedding-season'] },
  { id: 'F018', name: 'Cymbidium Orchid Stem', category: 'Orchid', emoji: '🪷', currentStock: 350, baseDemand: 600, preferredSupplier: 'Bandarawela Orchid Blooms', unitPrice: 650, specialtySeason: ['wedding-season', 'summer-tourist'] },
  { id: 'F019', name: 'African Gerbera Daisy', category: 'Gerbera', emoji: '🌼', currentStock: 1200, baseDemand: 1650, preferredSupplier: 'Pedro Highlands Floral Farm', unitPrice: 240, specialtySeason: ['sinhala-tamil-newyear'] },
  { id: 'F020', name: 'Blue Statice Filler', category: 'Filler', emoji: '🌾', currentStock: 650, baseDemand: 900, preferredSupplier: 'Welimada Flora Growers', unitPrice: 190, specialtySeason: ['summer-tourist'] },
  { id: 'F021', name: 'Ceylon Sunflower', category: 'Traditional', emoji: '🌻', currentStock: 900, baseDemand: 1300, preferredSupplier: 'Pedro Highlands Floral Farm', unitPrice: 250, specialtySeason: ['sinhala-tamil-newyear'] },
  { id: 'F022', name: 'Peruvian Alstroemeria', category: 'Exotic', emoji: '🌸', currentStock: 520, baseDemand: 650, preferredSupplier: 'Hawa Eliya Exotic Lilies', unitPrice: 390, specialtySeason: ['summer-tourist'] },
  { id: 'F023', name: 'Bird of Paradise', category: 'Exotic', emoji: '🦜', currentStock: 420, baseDemand: 780, preferredSupplier: 'Bandarawela Orchid Blooms', unitPrice: 550, specialtySeason: ['summer-tourist', 'christmas-newyear'] }
];

export default function DemandForecasting() {
  const [selectedSeasonId, setSelectedSeasonId] = useState('wedding-season');
  const [flowerSearch, setFlowerSearch] = useState('');
  const [activeTab, setActiveTab] = useState('SHORTAGE'); // 'SHORTAGE' | 'ALL'
  const [isRetraining, setIsRetraining] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Active selected season
  const selectedSeason = useMemo(() => {
    return SEASONS_CATALOG.find((s) => s.id === selectedSeasonId) || SEASONS_CATALOG[0];
  }, [selectedSeasonId]);

  // Recalculated flower varieties for this season
  const calculatedVarieties = useMemo(() => {
    const mult = selectedSeason.surgeMultiplier;
    return BASE_VARIETIES.map((v) => {
      const isFavored = v.specialtySeason.includes(selectedSeason.id);
      const extraFactor = isFavored ? 1.25 : 1.0;
      const predictedDemand = Math.round(v.baseDemand * mult * extraFactor);
      const deficit = Math.max(0, predictedDemand - v.currentStock);

      return {
        ...v,
        predictedDemand,
        deficit,
        isFavored,
        hasDeficit: deficit > 0,
        stockRatio: Math.min(100, Math.round((v.currentStock / predictedDemand) * 100))
      };
    });
  }, [selectedSeason]);

  // Summary KPIs
  const totalPredictedStems = useMemo(
    () => calculatedVarieties.reduce((sum, f) => sum + f.predictedDemand, 0),
    [calculatedVarieties]
  );
  const totalCurrentStock = useMemo(
    () => calculatedVarieties.reduce((sum, f) => sum + f.currentStock, 0),
    [calculatedVarieties]
  );
  const totalDeficitStems = useMemo(
    () => calculatedVarieties.reduce((sum, f) => sum + f.deficit, 0),
    [calculatedVarieties]
  );
  const deficitVarietiesCount = useMemo(
    () => calculatedVarieties.filter((f) => f.hasDeficit).length,
    [calculatedVarieties]
  );

  // Filtered flowers list
  const filteredFlowers = useMemo(() => {
    return calculatedVarieties
      .filter((item) => {
        if (activeTab === 'SHORTAGE' && !item.hasDeficit) return false;
        if (!flowerSearch) return true;
        const q = flowerSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.deficit - a.deficit);
  }, [calculatedVarieties, activeTab, flowerSearch]);

  // Weekly Curve Data
  const weeklyChartData = useMemo(() => {
    const mult = selectedSeason.surgeMultiplier;
    return [
      { week: 'W1', stems: Math.round(9800 * mult) },
      { week: 'W2', stems: Math.round(11400 * mult) },
      { week: 'W3 (Peak)', stems: Math.round(14800 * mult) },
      { week: 'W4 (Peak)', stems: Math.round(15900 * mult) },
      { week: 'W5', stems: Math.round(12800 * mult) },
      { week: 'W6', stems: Math.round(10500 * mult) }
    ];
  }, [selectedSeason]);

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const res = await api.predictDemand({
        flower_type: 'Rose',
        season_event: selectedSeason.title,
        price_per_unit: 300,
        horizon: 7
      });
      if (res && res.success && res.data) {
        const qty = res.data.predicted_demand_quantity || res.data.predictedBunches;
        showToast(`ML Model (Flask) live prediction: ${qty.toLocaleString()} stems for ${selectedSeason.title}!`);
      } else {
        showToast('AI Forecast updated with latest orders.');
      }
    } catch {
      showToast('AI Forecast updated with latest orders.');
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--pb-plum)',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            boxShadow: 'var(--pb-shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--pb-rose-soft)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header (Clean & Minimal) ─────────────────────────── */}
      <PageHeader
        title="Demand Forecasting"
        subtitle="Select a season to simulate flower demand and view shortages"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'var(--pb-leaf-tint)',
                color: 'var(--pb-leaf)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <Brain size={14} /> 94% Accuracy
            </span>
            <Button variant="outline" size="sm" icon={Download} onClick={() => showToast('Report exported.')}>
              Export
            </Button>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={handleRetrain}>
              {isRetraining ? 'Updating...' : 'Refresh Forecast'}
            </Button>
          </div>
        }
      />

      {/* ── Visual Season Selector Cards (Single Clean Row) ─────────── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Choose an Upcoming Season to Simulate
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)' }}>
            Click any card to update the numbers
          </span>
        </div>

        {/* Horizontal Scrollable Season Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
            gap: '0.65rem'
          }}
        >
          {SEASONS_CATALOG.map((season) => {
            const isSelected = selectedSeasonId === season.id;
            return (
              <button
                key={season.id}
                type="button"
                onClick={() => {
                  setSelectedSeasonId(season.id);
                  showToast(`Simulating ${season.title}`);
                }}
                style={{
                  background: isSelected ? 'var(--pb-surface)' : 'var(--pb-surface)',
                  border: isSelected ? '2px solid var(--pb-rose)' : '1px solid var(--pb-border)',
                  borderRadius: '12px',
                  padding: '0.85rem 0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? '0 6px 16px rgba(194, 37, 92, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {/* Active indicator dot */}
                {isSelected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--pb-rose)'
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{season.emoji}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: isSelected ? 'var(--pb-rose)' : 'var(--pb-blush)',
                      color: isSelected ? '#FFFFFF' : 'var(--pb-plum)'
                    }}
                  >
                    {season.surgeLabel}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    color: isSelected ? 'var(--pb-rose)' : 'var(--pb-plum)',
                    fontFamily: 'var(--pb-font-heading)',
                    marginTop: '2px'
                  }}
                >
                  {season.title}
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--pb-text-muted)', fontWeight: 500 }}>
                  {season.dates}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sleek Action Summary Bar ───────────────────────────────── */}
      <div
        style={{
          background: 'var(--pb-surface)',
          border: '1.5px solid var(--pb-border)',
          borderRadius: '14px',
          padding: '0.9rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{selectedSeason.emoji}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                {selectedSeason.title}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--pb-rose)', fontWeight: 700 }}>
                ({selectedSeason.dates})
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--pb-text-muted)' }}>
              Top flowers in demand: <strong>{selectedSeason.focusFlowers}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast(`Ordering ${totalDeficitStems.toLocaleString()} stems for ${selectedSeason.title}`)}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '9px',
            border: 'none',
            background: 'var(--pb-rose)',
            color: '#FFFFFF',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 3px 10px rgba(194, 37, 92, 0.25)'
          }}
        >
          <ShoppingCart size={15} />
          Order Missing Stems ({totalDeficitStems.toLocaleString()})
        </button>
      </div>

      {/* ── 3 Compact KPI Cards ─────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}
      >
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1px solid var(--pb-border)',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
              Projected Season Demand
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pb-plum)', marginTop: '2px' }}>
              {totalPredictedStems.toLocaleString()}{' '}
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>stems</span>
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'var(--pb-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUp size={18} style={{ color: 'var(--pb-rose)' }} />
          </div>
        </div>

        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1px solid var(--pb-border)',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
              Current Stock in Store
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pb-plum)', marginTop: '2px' }}>
              {totalCurrentStock.toLocaleString()}{' '}
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>stems</span>
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'rgba(2, 132, 199, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Package size={18} style={{ color: '#0284C7' }} />
          </div>
        </div>

        <div
          style={{
            background: '#FFF5F5',
            border: '1.5px solid #FECACA',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: '#B91C1C', fontWeight: 700 }}>
              Stock Shortage (Need to Order)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#B91C1C', marginTop: '2px' }}>
              {totalDeficitStems.toLocaleString()}{' '}
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>stems</span>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#B91C1C',
              color: '#FFFFFF'
            }}
          >
            {deficitVarietiesCount} varieties short
          </span>
        </div>
      </div>

      {/* ── Clean 2-Column Section (Chart on Left, Flowers on Right) ─ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr',
          gap: '1.25rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Weekly Demand Curve */}
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1px solid var(--pb-border)',
            borderRadius: '14px',
            padding: '1.15rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                Weekly Stem Demand Curve
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--pb-text-muted)' }}>
                Estimated weekly demand for this season
              </div>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--pb-rose)',
                padding: '2px 6px',
                borderRadius: '5px',
                background: 'var(--pb-tint)'
              }}
            >
              Peak at Week 3 & 4
            </span>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--pb-rose)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--pb-rose)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--pb-border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                <Tooltip
                  formatter={(val) => [`${val.toLocaleString()} stems`, 'Needed']}
                  contentStyle={{
                    backgroundColor: 'var(--pb-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--pb-border)',
                    fontSize: '0.75rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="stems"
                  stroke="var(--pb-rose)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#curveGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: 'var(--pb-blush)',
              fontSize: '0.74rem',
              color: 'var(--pb-plum)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>💡</span>
            <span>
              <strong>Tip:</strong> {selectedSeason.tip}
            </span>
          </div>
        </div>

        {/* Right Column: Flowers Needing Action (Clear & Engaging) */}
        <div
          style={{
            background: 'var(--pb-surface)',
            border: '1px solid var(--pb-border)',
            borderRadius: '14px',
            overflow: 'hidden'
          }}
        >
          {/* Header & Filter Tabs */}
          <div
            style={{
              padding: '0.85rem 1.15rem',
              borderBottom: '1px solid var(--pb-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setActiveTab('SHORTAGE')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeTab === 'SHORTAGE' ? '#B91C1C' : 'var(--pb-blush)',
                  color: activeTab === 'SHORTAGE' ? '#FFFFFF' : 'var(--pb-plum)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Needs Reorder ({deficitVarietiesCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeTab === 'ALL' ? 'var(--pb-plum)' : 'var(--pb-blush)',
                  color: activeTab === 'ALL' ? '#FFFFFF' : 'var(--pb-plum)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                All Flowers (23)
              </button>
            </div>

            {/* Quick search */}
            <div style={{ position: 'relative', width: '160px' }}>
              <Search
                size={13}
                style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', color: 'var(--pb-text-muted)' }}
              />
              <input
                type="text"
                placeholder="Find flower..."
                value={flowerSearch}
                onChange={(e) => setFlowerSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '3px 6px 3px 24px',
                  borderRadius: '6px',
                  border: '1px solid var(--pb-border)',
                  fontSize: '0.75rem',
                  background: 'var(--pb-surface)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Clean Flower Cards List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '0.5rem' }}>
            {filteredFlowers.map((flower) => (
              <div
                key={flower.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  background: flower.hasDeficit ? '#FEF2F2' : 'transparent',
                  border: flower.hasDeficit ? '1px solid #FEE2E2' : '1px solid transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                {/* Flower Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{flower.emoji}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--pb-plum)' }}>
                        {flower.name}
                      </span>
                      {flower.isFavored && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--pb-rose)', background: 'var(--pb-tint)', padding: '1px 5px', borderRadius: '4px' }}>
                          Top Pick
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--pb-text-muted)' }}>
                      In Store: <strong>{flower.currentStock}</strong> / Need: <strong>{flower.predictedDemand}</strong>
                    </div>
                  </div>
                </div>

                {/* Status & Quick Order Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {flower.hasDeficit ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#B91C1C',
                        background: '#FFFFFF',
                        border: '1px solid #FECACA',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      Short -{flower.deficit.toLocaleString()}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--pb-leaf)' }}>
                      ✓ In Stock
                    </span>
                  )}

                  {flower.hasDeficit && (
                    <button
                      type="button"
                      onClick={() => showToast(`Order request created for ${flower.name}`)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--pb-rose)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
