import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Flower2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Users,
  Truck,
  CheckCircle2,
  Lock,
  Layers,
  BarChart3,
  Scale,
  Brain,
  Receipt,
  Briefcase,
  Menu,
  X,
  Smartphone,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import '../../styles/landing.css';

// 4 Signature Highland Flower Varieties (Curated highlight instead of overwhelming list)
const FEATURED_FLOWERS = [
  {
    id: 1,
    name: 'Emerald Coral Highland Roses',
    category: 'Highland Roses',
    image: '/rose.jpg',
    description: 'Grade A long-stem luxury roses cultivated in Nuwara Eliya misty climate. Velvety petals ideal for banquet and event decor.',
    price: 'Rs 300 / Stem',
    vaseLife: '12–16 Days Longevity'
  },
  {
    id: 2,
    name: 'Exotic Dendrobium Orchids',
    category: 'Highland Orchids',
    image: '/orchid.jpg',
    description: 'Upscale tropical highland shaded orchid sprays for corporate suites and luxury hospitality styling with extended vase life.',
    price: 'Rs 410 / Spray',
    vaseLife: '15–20 Days Longevity'
  },
  {
    id: 3,
    name: 'Oriental Asiatic Lilies',
    category: 'Asiatic Lilies',
    image: '/lily.jpg',
    description: 'Fragrant Asiatic lilies with stately stems grown in Ambewela alpine fields. Majestic star-shaped blooms in blush tones.',
    price: 'Rs 810 / Stem',
    vaseLife: '10–12 Days Longevity'
  },
  {
    id: 4,
    name: 'Highland White & Gold Daisies',
    category: 'Highland Daisies',
    image: '/daisies.jpg',
    description: 'Fresh crisp highland daisies harvested from Hakgala terraced greenhouses, prized for pure white contrast and longevity.',
    price: 'Rs 195 / Stem',
    vaseLife: '10–14 Days Longevity'
  }
];

// 4 Core Platform Capabilities (Compact 1-row summary without clutter)
const CORE_FEATURES = [
  {
    icon: Flower2,
    title: 'Catalogue & Stem Grading',
    desc: 'Standardized cut-flower grades, stem counts, and commercial wholesale pricing.'
  },
  {
    icon: Users,
    title: 'Highland Grower Network',
    desc: 'Direct harvest coordination with accredited Nuwara Eliya and Welimada farms.'
  },
  {
    icon: Layers,
    title: 'Warehouse & Inventory Control',
    desc: 'Automated batch tracking with real-time stem freshness and stock monitoring.'
  },
  {
    icon: Truck,
    title: 'Fleet & Delivery Logistics',
    desc: 'Scheduled cut-flower deliveries directly to wholesale florists and banquet venues.'
  }
];

// Demand Forecasting Historical vs Predicted Data for Recharts
const FORECAST_CHART_DATA = [
  { month: 'Jan', actual: 4200, forecast: 4100 },
  { month: 'Feb', actual: 5100, forecast: 5000 },
  { month: 'Mar', actual: 6400, forecast: 6200 },
  { month: 'Apr (New Year)', actual: 9800, forecast: 9600 },
  { month: 'May', actual: 7200, forecast: 7100 },
  { month: 'Jun', actual: 5900, forecast: 6000 },
  { month: 'Jul', actual: 6800, forecast: 6900 },
  { month: 'Aug (Weddings)', actual: 11200, forecast: 11000 },
  { month: 'Sep', actual: 7800, forecast: 7900 },
  { month: 'Oct', actual: 8600, forecast: 8700 },
  { month: 'Nov (Festival)', actual: 10400, forecast: 10500 },
  { month: 'Dec (Holidays)', actual: null, forecast: 11800 }
];

// Streamlined 4-Step Operational Flow
const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Order Placement',
    desc: 'Wholesale hospitality buyers and boutique florists place consignment orders specifying varieties and dates via the mobile app.'
  },
  {
    step: '02',
    title: 'Supplier Capacity Matching',
    desc: 'Petalio Blossom automatically matches requisition requirements against accredited highland grower harvest capacities.'
  },
  {
    step: '03',
    title: 'Warehouse Quality Inbound',
    desc: 'Harvested stems arrive at the central facility, undergo quality inspection, and are safely inventoried in fresh storage.'
  },
  {
    step: '04',
    title: 'Fleet Delivery Dispatch',
    desc: 'Consignments are packed in protective sleeves and transported in dedicated fleet vehicles directly to client venues.'
  }
];

export default function PublicLandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-root">
      {/* ====================================================================
          1. STICKY NAVBAR (Only login entry point)
          ==================================================================== */}
      <header className="landing-navbar">
        <div className="landing-navbar-container">
          <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="landing-brand">
            <img src="/logo.png" alt="Petalio Blossom Logo" className="landing-logo-img" />
            <div className="landing-brand-text">
              <span className="landing-brand-name">Petalio Blossom</span>
              <span className="landing-brand-tagline">Floriculture Farm System</span>
            </div>
          </a>

          <nav>
            <ul className="landing-nav-links">
              <li>
                <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="landing-nav-link">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="landing-nav-link">
                  About
                </a>
              </li>
              <li>
                <a href="#flowers" onClick={(e) => scrollToSection(e, 'flowers')} className="landing-nav-link">
                  Flowers
                </a>
              </li>
              <li>
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="landing-nav-link">
                  Features
                </a>
              </li>
              <li>
                <a href="#forecasting" onClick={(e) => scrollToSection(e, 'forecasting')} className="landing-nav-link">
                  AI Forecasting
                </a>
              </li>
              <li>
                <a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')} className="landing-nav-link">
                  Workflow
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="landing-nav-link">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.35rem', gap: '0.45rem' }}
            >
              <Lock size={15} />
              <span>Staff Login</span>
            </button>

            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="landing-mobile-menu">
            <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="landing-mobile-link">
              Home
            </a>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="landing-mobile-link">
              About
            </a>
            <a href="#flowers" onClick={(e) => scrollToSection(e, 'flowers')} className="landing-mobile-link">
              Signature Flowers
            </a>
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="landing-mobile-link">
              Core Capabilities
            </a>
            <a href="#forecasting" onClick={(e) => scrollToSection(e, 'forecasting')} className="landing-mobile-link">
              Demand Forecasting
            </a>
            <a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')} className="landing-mobile-link">
              How It Works
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="landing-mobile-link">
              Contact & Location
            </a>
          </div>
        )}
      </header>

      {/* ====================================================================
          2. HERO SECTION
          ==================================================================== */}
      <section id="home" className="landing-hero">
        <div className="hero-content">
          <span className="section-tag">
            <Sparkles size={13} />
            Smart Floriculture Supply Chain Platform
          </span>

          <h1 className="hero-heading">
            Growing Beauty, <br />
            <span className="hero-heading-gradient">Managing Nature.</span>
          </h1>

          <p className="hero-desc">
            An intelligent floriculture farm management platform connecting highland flower growers, warehouse inventory and business operations through smart predictive technology.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'about')}
              className="btn btn-primary btn-lg"
              style={{ gap: '0.5rem' }}
            >
              Explore Our Platform
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="hero-stat-pills">
            <div className="hero-stat-item">
              <span className="hero-stat-number">Fresh Inventory</span>
              <span className="hero-stat-label">Real-Time Warehouse Batches</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">86+ Growers</span>
              <span className="hero-stat-label">Nuwara Eliya & Welimada</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">AI Forecasting</span>
              <span className="hero-stat-label">Machine Learning Predictions</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Right */}
        <div className="hero-visual-wrap">
          <div className="hero-image-frame">
            <img
              src="/petalio_hero_bright.jpg"
              alt="Highland floriculture cut-flower farm in Nuwara Eliya with growers harvesting fresh stems"
              className="hero-image"
            />
          </div>

          {/* Floating Metric Card Top */}
          <div className="hero-floating-card top">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--color-lavender-pink)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Flower2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Central Flower Warehouse
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-deep-plum)' }}>
                15,420 Stems In Stock
              </div>
            </div>
          </div>

          {/* Floating Metric Card Bottom */}
          <div className="hero-floating-card bottom">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Peak Season Model
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-success)' }}>
                +28% Wedding Surge Predicted
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. ABOUT SECTION
          ==================================================================== */}
      <section id="about" className="landing-section">
        <div className="about-grid">
          <div className="about-image-frame">
            <img
              src="/farm_field.jpg"
              alt="Highland terraced flower greenhouse farm in Nuwara Eliya, Sri Lanka"
              className="about-image"
              loading="lazy"
            />
          </div>

          <div>
            <span className="section-tag">
              <Flower2 size={13} />
              About Petalio Blossom
            </span>
            <h2 className="section-title">Where Floriculture Meets Smart Technology</h2>
            <p className="section-desc" style={{ marginBottom: '1.25rem' }}>
              Petalio Blossom is a centralized floriculture supply chain platform specifically developed for the Sri Lankan cut-flower industry.
            </p>
            <p className="section-desc" style={{ marginBottom: '1.75rem' }}>
              By connecting independent highland growers with commercial hotel banquets and boutique florists, Petalio Blossom replaces informal phone calls with automated order processing, fresh-batch preservation, and reliable delivery.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--pb-blush)',
                border: '1px dashed var(--pb-border)'
              }}
            >
              <Smartphone size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-deep-plum)' }}>Ecosystem Separation: </strong>
                Customers and growers access dedicated Android mobile apps, while this web platform handles operations and governance.
              </div>
            </div>
          </div>
        </div>

        {/* 3 Highlight Cards */}
        <div className="about-cards-row">
          <div className="about-card">
            <div className="about-card-icon">
              <Layers size={24} />
            </div>
            <h3 className="about-card-title">Connected Supply Chain</h3>
            <p className="about-card-desc">
              Directly links independent highland growers in Nuwara Eliya and Welimada with commercial buyers, eliminating intermediaries.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">
              <ShieldCheck size={24} />
            </div>
            <h3 className="about-card-title">Operations Control</h3>
            <p className="about-card-desc">
              Consolidates cut-flower grading, warehouse batch tracking, customer invoicing, and logistics management into one system.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">
              <TrendingUp size={24} />
            </div>
            <h3 className="about-card-title">Data-Driven Decisions</h3>
            <p className="about-card-desc">
              Historical sales analysis and machine learning forecasting predict surges to optimize harvest schedules.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. SIGNATURE FLOWER SHOWCASE (Curated 4 Varieties Only)
          ==================================================================== */}
      <section id="flowers" className="landing-section" style={{ background: 'var(--pb-surface)', borderRadius: '28px', margin: '2rem auto' }}>
        <div className="section-header-center">
          <span className="section-tag">
            <Flower2 size={13} />
            Highland Floral Varieties
          </span>
          <h2 className="section-title">Signature Cut-Flowers</h2>
          <p className="section-desc">
            Carefully cultivated in misty mountain microclimates and stored at 4°C to guarantee peak freshness and extended vase life.
          </p>
        </div>

        {/* 4 Focused Flower Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {FEATURED_FLOWERS.map((flower) => (
            <div key={flower.id} className="flower-card">
              <div className="flower-card-image-wrap">
                <img
                  src={flower.image}
                  alt={flower.name}
                  className="flower-card-image"
                  loading="lazy"
                />
                <span className="flower-card-category-badge">{flower.category}</span>
              </div>

              <div className="flower-card-body">
                <h3 className="flower-card-name">{flower.name}</h3>
                <p className="flower-card-desc">{flower.description}</p>
                <div className="flower-card-footer">
                  <span className="flower-card-price">{flower.price}</span>
                  <span>{flower.vaseLife}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          5. CORE PLATFORM CAPABILITIES (4 Compact Cards in 1 Clean Row)
          ==================================================================== */}
      <section id="features" className="landing-section">
        <div className="section-header-center" style={{ marginBottom: '2.5rem' }}>
          <span className="section-tag">
            <Sparkles size={13} />
            Platform Capabilities
          </span>
          <h2 className="section-title">Core Operations Management</h2>
          <p className="section-desc" style={{ fontSize: '0.92rem' }}>
            Essential operational modules keeping flower supply, quality, and delivery logistics synchronized.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
          {CORE_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="feature-box" style={{ padding: '1.4rem 1.25rem' }}>
                <div className="feature-box-icon" style={{ width: '40px', height: '40px', marginBottom: '0.85rem' }}>
                  <Icon size={20} />
                </div>
                <h3 className="feature-box-title" style={{ fontSize: '0.98rem', marginBottom: '0.35rem' }}>{feat.title}</h3>
                <p className="feature-box-desc" style={{ fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          6. SMART DEMAND FORECASTING (Machine Learning Feature)
          ==================================================================== */}
      <section id="forecasting" className="landing-section">
        <div className="forecasting-container">
          <div>
            <span className="section-tag">
              <Brain size={13} />
              Machine Learning Feature
            </span>
            <h2 className="section-title">Predict Demand. Plan Smarter.</h2>
            <p className="section-desc" style={{ marginBottom: '1.25rem' }}>
              Historical order volumes and regression forecasting predict upcoming demand shifts to support proactive harvest and inventory planning.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Short-Term Forecast (7–14 Days):</strong> Guides buffer stock allocation for upcoming hotel banquet orders.
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Seasonal Peak Modeling:</strong> Highlights volume surges during April New Year and August–November wedding cycles.
                </span>
              </li>
            </ul>

            <div className="forecast-card-highlight">
              <div className="forecast-metric-box">
                <div className="forecast-metric-val">94.2%</div>
                <div className="forecast-metric-label">Model Accuracy (R² Score)</div>
              </div>
              <div className="forecast-metric-box">
                <div className="forecast-metric-val">+22.4%</div>
                <div className="forecast-metric-label">Projected Next-Cycle Demand</div>
              </div>
            </div>
          </div>

          {/* Forecasting Interactive Area Chart */}
          <div
            style={{
              background: 'var(--pb-blush)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-deep-plum)' }}>
                  Seasonal Flower Stem Demand Curve
                </h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Actual sales vs Machine Learning forecast (stems volume)
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px',
                  background: 'var(--color-lavender-pink)',
                  color: 'var(--color-primary)'
                }}
              >
                ML Simulation Model
              </span>
            </div>

            <div style={{ height: '260px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FORECAST_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--pb-rose)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--pb-rose)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--pb-rose-soft)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--pb-rose-soft)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--pb-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--pb-text-muted)' }} stroke="var(--pb-border)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--pb-surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--pb-border)',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="Actual Orders"
                    stroke="var(--pb-rose)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#actualSalesGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    name="ML Predicted Demand"
                    stroke="var(--pb-rose-soft)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#predictedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. HOW IT WORKS (Streamlined 4 Steps)
          ==================================================================== */}
      <section id="workflow" className="landing-section">
        <div className="section-header-center">
          <span className="section-tag">
            <Layers size={13} />
            Operations Workflow
          </span>
          <h2 className="section-title">How Petalio Blossom Operates</h2>
          <p className="section-desc">
            A cohesive 4-step lifecycle linking mobile clients with the central farm operations terminal.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {WORKFLOW_STEPS.map((wf) => (
            <div key={wf.step} className="workflow-card">
              <div className="workflow-step-num">{wf.step}</div>
              <h3 className="workflow-title">{wf.title}</h3>
              <p className="workflow-desc">{wf.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          8. APPLICATION ACTORS
          ==================================================================== */}
      <section className="landing-section">
        <div className="section-header-center">
          <span className="section-tag">
            <ShieldCheck size={13} />
            Web Workspaces
          </span>
          <h2 className="section-title">Built for Farm Operations & Governance</h2>
          <p className="section-desc">
            Two specialized operational workspaces built for daily cut-flower management.
          </p>
        </div>

        <div className="actors-grid">
          {/* Admin Card */}
          <div className="actor-card plum-accent">
            <div>
              <span className="actor-badge admin">
                <ShieldCheck size={13} />
                Executive Governance
              </span>
              <h3 className="actor-title">System Administrator</h3>
              <p className="actor-desc">
                Provides farm-wide system oversight, security policy management, grower accreditation, and access control.
              </p>

              <ul className="actor-feature-list">
                <li className="actor-feature-item">
                  <CheckCircle2 size={16} className="actor-feature-icon" />
                  <span>User Management & Role Permissions</span>
                </li>
                <li className="actor-feature-item">
                  <CheckCircle2 size={16} className="actor-feature-icon" />
                  <span>Highland Supplier Verifications & Approvals</span>
                </li>
                <li className="actor-feature-item">
                  <CheckCircle2 size={16} className="actor-feature-icon" />
                  <span>System-Wide Executive Audit Reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Business Officer Card */}
          <div className="actor-card primary-accent">
            <div>
              <span className="actor-badge officer">
                <Briefcase size={13} />
                Operational Suite
              </span>
              <h3 className="actor-title">Business Officer</h3>
              <p className="actor-desc">
                Manages daily floral catalogue grades, warehouse inventory, supplier demand matching, and dispatch.
              </p>

              <ul className="actor-feature-list">
                <li className="actor-feature-item">
                  <CheckCircle2 size={16} className="actor-feature-icon" />
                  <span>Flower Catalogue & Stem Grade Standards</span>
                </li>
                <li className="actor-feature-item">
                  <CheckCircle2 size={16} className="actor-feature-icon" />
                  <span>Warehouse Inventory & Stem Grade Management</span>
                </li>
                <li className="actor-feature-item">
                  <CheckCircle2 size={16} className="actor-feature-icon" />
                  <span>Order Processing & Fleet Dispatch Scheduling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. FOOTER
          ==================================================================== */}
      <footer id="contact" className="landing-footer">
        <div className="landing-footer-container">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="Petalio Blossom" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-deep-plum)', margin: 0 }}>
                  Petalio Blossom
                </h4>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Floriculture Farm Management System
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, maxWidth: '320px' }}>
              Centralized platform connecting highland flower growers with fresh flower inventory and commercial operations.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
              <MapPin size={15} style={{ color: 'var(--color-primary)' }} />
              <span>Nuwara Eliya • Welimada • Colombo, Sri Lanka</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="footer-col-title">Navigation</h5>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <ul className="footer-links">
                <li>
                  <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="footer-link">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="footer-link">
                    About Platform
                  </a>
                </li>
                <li>
                  <a href="#flowers" onClick={(e) => scrollToSection(e, 'flowers')} className="footer-link">
                    Signature Flowers
                  </a>
                </li>
              </ul>
              <ul className="footer-links">
                <li>
                  <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="footer-link">
                    Platform Features
                  </a>
                </li>
                <li>
                  <a href="#forecasting" onClick={(e) => scrollToSection(e, 'forecasting')} className="footer-link">
                    Demand Forecasting
                  </a>
                </li>
                <li>
                  <a href="#workflow" onClick={(e) => scrollToSection(e, 'workflow')} className="footer-link">
                    Operations Workflow
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar" style={{ justifyContent: 'center' }}>
          <span>© 2026 Petalio Blossom. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
