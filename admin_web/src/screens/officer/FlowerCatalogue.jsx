import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../api';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Flower2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Package,
  X,
  Sparkles
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

// ─── 19 Commercial Flower Varieties Matching ML Dataset ─────────────────────
/* =========================================================================
   💡 NOTE FOR IMAGE CUSTOMIZATION:
   To change the image for any flower, simply edit the `image:` property below.
   You can put your image file in `admin_web/public/` (e.g. image: '/my_rose.jpg')
   or use any online web image URL (e.g. image: 'https://example.com/image.jpg').
   ========================================================================= */
const INITIAL_FLOWERS = [
  {
    id: 'F001',
    name: 'Red Naomi Rose',
    category: 'Rose',
    unitPrice: 350,
    color: 'Red',
    grade: 'A+',
    stock: 185,
    reorderLevel: 50,
    vaseLife: '12 days',
    image: '/rose.jpg', // 👈 Change Rose image here
    description: 'Highland long-stem luxury red roses from Nuwara Eliya misty hills. High demand for weddings & Valentine.'
  },
  {
    id: 'F002',
    name: 'Dendrobium Orchid',
    category: 'Orchid',
    unitPrice: 420,
    color: 'White',
    grade: 'A+',
    stock: 95,
    reorderLevel: 40,
    vaseLife: '21 days',
    image: '/orchid.jpg', // 👈 Change Orchid image here
    description: 'Exotic tropical shaded orchids grown in Welimada. Long-life sprays for luxury corporate lobbies.'
  },
  {
    id: 'F003',
    name: 'Casablanca White Lily',
    category: 'Lily',
    unitPrice: 830,
    color: 'White',
    grade: 'A+',
    stock: 60,
    reorderLevel: 40,
    vaseLife: '10 days',
    image: '/lily.jpg', // 👈 Change Lily image here
    description: 'Fragrant Oriental white lilies cultivated in Ambewela alpine fields. Ideal for hotel banquets.'
  },
  {
    id: 'F004',
    name: 'Standard Pink Carnation',
    category: 'Carnation',
    unitPrice: 300,
    color: 'Red',
    grade: 'A',
    stock: 220,
    reorderLevel: 60,
    vaseLife: '14 days',
    image: '/carnation.jpg', // 👈 Change Carnation image here
    description: 'Ruffled petal highland carnations from Hakgala. Very resilient cut flower.'
  },
  {
    id: 'F005',
    name: 'Golden Chrysanthemum',
    category: 'Chrysanthemum',
    unitPrice: 240,
    color: 'White',
    grade: 'B',
    stock: 140,
    reorderLevel: 50,
    vaseLife: '12 days',
    image: '/chrysanthemum.jpg', // 👈 Change Chrysanthemum image here
    description: 'Bright festival blooms popular for Vesak, temple ceremonies, and cultural events.'
  },
  {
    id: 'F006',
    name: 'Sunshine Gerbera',
    category: 'Gerbera',
    unitPrice: 200,
    color: 'Red',
    grade: 'B',
    stock: 45, // low stock alert
    reorderLevel: 50,
    vaseLife: '9 days',
    image: '/daisies.jpg', // 👈 Change Gerbera image here
    description: 'Vibrant large cut gerberas from Bandarawela. Bright commercial filler for boutique floral arrangements.'
  },
  {
    id: 'F007',
    name: 'Lavender Lisianthus',
    category: 'Lisianthus',
    unitPrice: 510,
    color: 'White',
    grade: 'A',
    stock: 130,
    reorderLevel: 50,
    vaseLife: '14 days',
    image: '/lisianthus.jpg', // 👈 Change Lisianthus image here
    description: 'Double-petaled eustoma grandiflorum with extended vase life. High demand for modern wedding styling.'
  },
  {
    id: 'F008',
    name: 'English Blue Lavender',
    category: 'Lavender',
    unitPrice: 975,
    color: 'Purple',
    grade: 'A',
    stock: 160,
    reorderLevel: 50,
    vaseLife: '18 days',
    image: '/sea_lavenders.jpg', // 👈 Change Lavender image here
    description: 'Everlasting aromatic lavender with papery violet florets. Retains color and fragrance when dried.'
  },
  {
    id: 'F009',
    name: "Bridal Baby's Breath",
    category: "Baby's Breath",
    unitPrice: 1500,
    color: 'White',
    grade: 'A',
    stock: 250,
    reorderLevel: 70,
    vaseLife: '10 days',
    image: '/baby_breath.jpg', // 👈 Change Baby's Breath image here
    description: "Delicate clouds of tiny white flowers (Gypsophila). Essential wedding bouquet filler."
  },
  {
    id: 'F010',
    name: 'Ceylon Sunflower',
    category: 'Sunflower',
    unitPrice: 270,
    color: 'Yellow',
    grade: 'A',
    stock: 90,
    reorderLevel: 30,
    vaseLife: '10 days',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80', // 👈 Change Sunflower image here
    description: 'Golden yellow cut sunflowers harvested from Pedro Highlands. Cheerful decorative stems.'
  },
  {
    id: 'F011',
    name: 'Dutch Garden Tulip',
    category: 'Tulip',
    unitPrice: 710,
    color: 'Red',
    grade: 'A+',
    stock: 75,
    reorderLevel: 35,
    vaseLife: '8 days',
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80', // 👈 Change Tulip image here
    description: 'Imported Grade-A elegant Dutch tulips for luxury VIP dining tables and bridal parties.'
  },
  {
    id: 'F012',
    name: 'Highland Hydrangea',
    category: 'Hydrangea',
    unitPrice: 1000,
    color: 'White',
    grade: 'A+',
    stock: 50,
    reorderLevel: 25,
    vaseLife: '9 days',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80', // 👈 Change Hydrangea image here
    description: 'Massive lush round floral heads grown in Hakgala temperate climate. Premium event showpiece.'
  },
  {
    id: 'F013',
    name: 'Royal Peony',
    category: 'Peony',
    unitPrice: 1760,
    color: 'Pink',
    grade: 'A+',
    stock: 35,
    reorderLevel: 20,
    vaseLife: '7 days',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', // 👈 Change Peony image here
    description: 'Full opulent blooms in soft blush and coral. The pinnacle luxury flower for high-end wedding arches.'
  },
  {
    id: 'F014',
    name: 'Standard Freesia',
    category: 'Freesia',
    unitPrice: 420,
    color: 'White',
    grade: 'A',
    stock: 80,
    reorderLevel: 35,
    vaseLife: '12 days',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80', // 👈 Change Freesia image here
    description: 'Sweetly scented funnel-shaped flowers popular in bridal bouquets and perfumed arrangements.'
  },
  {
    id: 'F015',
    name: 'Bird of Paradise',
    category: 'Bird of Paradise',
    unitPrice: 800,
    color: 'Orange',
    grade: 'A+',
    stock: 65,
    reorderLevel: 30,
    vaseLife: '16 days',
    image: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=600&q=80', // 👈 Change Bird of Paradise image here
    description: 'Stately exotic crane flower with vivid orange and blue plumage. Architectural focal bloom.'
  },
  {
    id: 'F016',
    name: 'Ranunculus Buttercup',
    category: 'Ranunculus',
    unitPrice: 995,
    color: 'Orange',
    grade: 'A',
    stock: 55,
    reorderLevel: 25,
    vaseLife: '11 days',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80', // 👈 Change Ranunculus image here
    description: 'Layered papery petals resembling tiny roses. Favorite among boutique florists in Colombo.'
  },
  {
    id: 'F017',
    name: 'Fragrant Tuberose',
    category: 'Tuberose',
    unitPrice: 265,
    color: 'White',
    grade: 'A',
    stock: 120,
    reorderLevel: 45,
    vaseLife: '10 days',
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=600&q=80', // 👈 Change Tuberose image here
    description: 'Intensely fragrant white floral spikes used extensively for garlands and evening banquets.'
  },
  {
    id: 'F018',
    name: 'Baby Blue Eucalyptus',
    category: 'Eucalyptus',
    unitPrice: 250,
    color: 'Green',
    grade: 'A',
    stock: 175,
    reorderLevel: 50,
    vaseLife: '20 days',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80', // 👈 Change Eucalyptus image here
    description: 'Aromatic silver-green rounded foliage. Indispensable filler greenery for contemporary floral styling.'
  },
  {
    id: 'F019',
    name: 'Peruvian Alstroemeria',
    category: 'Alstroemeria',
    unitPrice: 280,
    color: 'Pink',
    grade: 'A',
    stock: 140,
    reorderLevel: 45,
    vaseLife: '15 days',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80', // 👈 Change Alstroemeria image here
    description: 'Lily of the Incas with multiple miniature blooms per stem. Long vase life with striped throat petals.'
  }
];

const CATEGORIES = [
  'All',
  'Rose',
  'Orchid',
  'Lily',
  'Carnation',
  'Chrysanthemum',
  'Gerbera',
  'Lisianthus',
  'Lavender',
  "Baby's Breath",
  'Sunflower',
  'Tulip',
  'Hydrangea',
  'Peony',
  'Freesia',
  'Bird of Paradise',
  'Ranunculus',
  'Tuberose',
  'Eucalyptus',
  'Alstroemeria'
];

export default function FlowerCatalogue() {
  const [flowers, setFlowers] = useState(INITIAL_FLOWERS);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [toastMessage, setToastMessage] = useState(null);

  // Form Modal States (Add & Edit)
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [activeFlower, setActiveFlower] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Rose',
    unitPrice: 300,
    color: '',
    grade: 'A+',
    stock: 100,
    reorderLevel: 50,
    vaseLife: '12 days',
    description: ''
  });

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Fetch from MySQL Database if Backend is Running ─────────────────────────
  useEffect(() => {
    let isMounted = true;
    api.getFlowers()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setIsLiveConnected(true);
          const dbMapped = res.data.map((dbF, idx) => {
            const fallback = INITIAL_FLOWERS.find(
              (p) => p.name.toLowerCase() === dbF.name.toLowerCase() || p.category.toLowerCase() === (dbF.category || '').toLowerCase()
            );
            return {
              id: `F${String(dbF.flower_id || idx + 1).padStart(3, '0')}`,
              flower_id: dbF.flower_id,
              name: dbF.name,
              category: dbF.category || 'Rose',
              unitPrice: parseFloat(dbF.unit_price) || 300,
              color: dbF.color || fallback?.color || 'Multicolor',
              grade: fallback?.grade || 'A',
              stock: dbF.inventory?.stock_quantity ?? fallback?.stock ?? 100,
              reorderLevel: dbF.inventory?.reorder_level ?? fallback?.reorderLevel ?? 50,
              vaseLife: fallback?.vaseLife || '12 days',
              image: fallback?.image || '/rose.jpg',
              description: dbF.description || fallback?.description || 'Fresh highland cut flower.'
            };
          });

          const dbNames = new Set(dbMapped.map((f) => f.name.toLowerCase()));
          const remaining = INITIAL_FLOWERS.filter((p) => !dbNames.has(p.name.toLowerCase()));
          setFlowers([...dbMapped, ...remaining]);
        }
      })
      .catch(() => {
        // Silently use clean offline preset
      });

    return () => { isMounted = false; };
  }, []);

  // ── KPI Calculations ────────────────────────────────────────────────────────
  const totalVarieties = flowers.length;
  const totalStems = flowers.reduce((acc, f) => acc + (f.stock || 0), 0);
  const lowStockCount = flowers.filter((f) => f.stock <= f.reorderLevel).length;
  const avgPrice = Math.round(
    flowers.reduce((acc, f) => acc + f.unitPrice, 0) / (flowers.length || 1)
  );

  // ── Filter and Sort ─────────────────────────────────────────────────────────
  const filteredFlowers = useMemo(() => {
    let list = [...flowers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.color.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      list = list.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.unitPrice - b.unitPrice);
        break;
      case 'price_desc':
        list.sort((a, b) => b.unitPrice - a.unitPrice);
        break;
      case 'stock_asc':
        list.sort((a, b) => a.stock - b.stock);
        break;
      default:
        list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [flowers, search, selectedCategory, sortBy]);

  // ── Open Add Modal ──────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setActiveFlower(null);
    setFormData({
      name: '',
      category: 'Rose',
      unitPrice: 320,
      color: 'Crimson Red',
      grade: 'A+',
      stock: 150,
      reorderLevel: 50,
      vaseLife: '12 days',
      description: 'Cultivated in Nuwara Eliya highland greenhouses.'
    });
    setModalMode('add');
  };

  // ── Open Edit Modal ─────────────────────────────────────────────────────────
  const handleOpenEdit = (flower) => {
    setActiveFlower(flower);
    setFormData({
      name: flower.name,
      category: flower.category,
      unitPrice: flower.unitPrice,
      color: flower.color,
      grade: flower.grade || 'A+',
      stock: flower.stock,
      reorderLevel: flower.reorderLevel,
      vaseLife: flower.vaseLife || '12 days',
      description: flower.description || ''
    });
    setModalMode('edit');
  };

  // ── Save Form (Add or Edit) ─────────────────────────────────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Pick photo by category
    const catImages = {
      Rose: '/rose.jpg',
      Orchid: '/orchid.jpg',
      Lily: '/lily.jpg',
      Anthurium: '/anthurium.jpg',
      Carnation: '/carnation.jpg',
      Chrysanthemum: '/chrysanthemum.jpg',
      Daisies: '/daisies.jpg',
      Lisianthus: '/lisianthus.jpg',
      'Sea Lavenders': '/sea_lavenders.jpg',
      'Baby Breath': '/baby_breath.jpg'
    };
    const chosenImage = catImages[formData.category] || '/rose.jpg';

    if (modalMode === 'add') {
      const newId = `F${String(flowers.length + 1).padStart(3, '0')}`;
      const newFlower = {
        id: newId,
        name: formData.name,
        category: formData.category,
        unitPrice: parseFloat(formData.unitPrice) || 300,
        color: formData.color,
        grade: formData.grade,
        stock: parseInt(formData.stock) || 100,
        reorderLevel: parseInt(formData.reorderLevel) || 50,
        vaseLife: formData.vaseLife,
        image: chosenImage,
        description: formData.description
      };

      try {
        const res = await api.createFlower({
          name: formData.name,
          category: formData.category,
          unit_price: parseFloat(formData.unitPrice) || 300,
          color: formData.color,
          description: formData.description,
          initial_stock: parseInt(formData.stock) || 100,
          reorder_level: parseInt(formData.reorderLevel) || 50
        });
        if (res && res.success) {
          showToast(`🌸 "${formData.name}" saved to MySQL Database!`);
        } else {
          showToast(`🌸 "${formData.name}" added to catalogue.`);
        }
      } catch {
        showToast(`🌸 "${formData.name}" added to catalogue.`);
      }

      setFlowers([newFlower, ...flowers]);
      setSelectedCategory('All');
      setSearch('');
    } else if (modalMode === 'edit' && activeFlower) {
      const updatedFields = {
        name: formData.name,
        category: formData.category,
        unitPrice: parseFloat(formData.unitPrice) || activeFlower.unitPrice,
        color: formData.color,
        grade: formData.grade,
        stock: parseInt(formData.stock) || activeFlower.stock,
        reorderLevel: parseInt(formData.reorderLevel) || activeFlower.reorderLevel,
        vaseLife: formData.vaseLife,
        description: formData.description
      };

      try {
        if (activeFlower.flower_id) {
          await api.updateFlower(activeFlower.flower_id, {
            name: formData.name,
            category: formData.category,
            unit_price: parseFloat(formData.unitPrice),
            color: formData.color,
            description: formData.description
          });
          showToast(`🌸 "${formData.name}" updated in MySQL Database!`);
        } else {
          showToast(`🌸 "${formData.name}" updated successfully.`);
        }
      } catch {
        showToast(`🌸 "${formData.name}" updated.`);
      }

      setFlowers((prev) =>
        prev.map((f) => (f.id === activeFlower.id ? { ...f, ...updatedFields } : f))
      );
    }

    setModalMode(null);
  };

  // ── Delete Handler ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.flower_id) {
        await api.deleteFlower(deleteTarget.flower_id);
        showToast(`🗑️ "${deleteTarget.name}" deleted from MySQL Database.`);
      } else {
        showToast(`🗑️ "${deleteTarget.name}" deleted from catalogue.`);
      }
    } catch {
      showToast(`🗑️ "${deleteTarget.name}" removed.`);
    }

    setFlowers((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--pb-plum)',
            color: '#fff',
            padding: '0.8rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} color="var(--pb-leaf)" />
          {toastMessage}
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Flower Catalogue"
        subtitle="Manage commercial flower varieties, stock levels, and wholesale prices"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                background: isLiveConnected ? '#DCFCE7' : '#FEF3C7',
                color: isLiveConnected ? '#15803D' : '#B45309',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isLiveConnected ? '#22C55E' : '#F59E0B'
                }}
              />
              {isLiveConnected ? 'MySQL Connected' : 'Offline Mode'}
            </span>

            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              <Plus size={15} /> Add New Flower
            </Button>
          </div>
        }
      />

      {/* ── 4 Simple KPI Cards ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          margin: '1.25rem 0 1.5rem 0'
        }}
      >
        <div
          style={{
            background: 'var(--pb-surface)',
            padding: '1.1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--pb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'var(--pb-blush)',
              color: 'var(--pb-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Flower2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Varieties</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>{totalVarieties}</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--pb-surface)',
            padding: '1.1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--pb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Total Stock</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>{totalStems.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>stems</span></div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--pb-surface)',
            padding: '1.1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--pb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: lowStockCount > 0 ? '#FEE2E2' : '#DCFCE7',
              color: lowStockCount > 0 ? '#DC2626' : '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Low Stock Alert</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: lowStockCount > 0 ? '#DC2626' : '#15803D' }}>
              {lowStockCount} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>varieties</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--pb-surface)',
            padding: '1.1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--pb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Avg. Wholesale Price</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pb-plum)' }}>Rs. {avgPrice} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/ stem</span></div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls Bar ────────────────────────── */}
      <div
        style={{
          background: 'var(--pb-surface)',
          padding: '0.85rem 1.15rem',
          borderRadius: '12px',
          border: '1px solid var(--pb-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--pb-blush)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              width: '100%',
              maxWidth: '340px'
            }}
          >
            <Search size={16} color="var(--pb-text-muted)" />
            <input
              type="text"
              placeholder="Search flowers by name, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.85rem',
                width: '100%',
                color: 'var(--pb-plum)'
              }}
            />
            {search && (
              <X
                size={14}
                style={{ cursor: 'pointer', color: 'var(--pb-text-muted)' }}
                onClick={() => setSearch('')}
              />
            )}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>
            Showing {filteredFlowers.length} of {flowers.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--pb-text-muted)' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1px solid var(--pb-border)',
                background: 'var(--pb-surface)',
                fontSize: '0.82rem',
                color: 'var(--pb-plum)',
                fontWeight: 600
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--pb-text-muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1px solid var(--pb-border)',
                background: 'var(--pb-surface)',
                fontSize: '0.82rem',
                color: 'var(--pb-plum)',
                fontWeight: 600
              }}
            >
              <option value="name">Name (A–Z)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Lowest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Clean Flower Card Grid ──────────────────────────────── */}
      {filteredFlowers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: 'var(--pb-surface)',
            borderRadius: '16px',
            border: '1px dashed var(--pb-border)'
          }}
        >
          <Flower2 size={42} style={{ color: 'var(--pb-text-muted)', margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ fontSize: '1.1rem', color: 'var(--pb-plum)', margin: '0 0 0.35rem 0' }}>No flower varieties found</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--pb-text-muted)', margin: 0 }}>
            Try adjusting your search query or category filter.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {filteredFlowers.map((flower) => {
            const isLow = flower.stock <= flower.reorderLevel;
            return (
              <div
                key={flower.id}
                style={{
                  background: 'var(--pb-surface)',
                  borderRadius: '14px',
                  border: isLow ? '1.5px solid #FCA5A5' : '1px solid var(--pb-border)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Flower Image with Badges */}
                <div style={{ position: 'relative', width: '100%', height: '170px', overflow: 'hidden' }}>
                  <img
                    src={flower.image}
                    alt={flower.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/rose.jpg';
                    }}
                  />

                  {/* ID Tag */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '5px'
                    }}
                  >
                    {flower.id}
                  </span>

                  {/* Stock Status Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: isLow ? '#FEE2E2' : '#DCFCE7',
                      color: isLow ? '#DC2626' : '#15803D',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {isLow ? '⚠️ Low Stock' : '✓ In Stock'}
                  </span>

                  {/* Category Pill */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'rgba(255,255,255,0.92)',
                      color: 'var(--pb-plum)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    {flower.category}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                      {flower.name}
                    </h3>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--pb-text-muted)', marginBottom: '0.75rem' }}>
                    Color: <strong style={{ color: 'var(--pb-plum)' }}>{flower.color}</strong> · Grade: <strong style={{ color: 'var(--pb-plum)' }}>{flower.grade || 'A'}</strong>
                  </div>

                  {/* Price & Stock Stats */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--pb-blush)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--pb-text-muted)' }}>Wholesale Price</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--pb-rose)' }}>
                        Rs. {flower.unitPrice} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>/ stem</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--pb-text-muted)' }}>Inventory Stock</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isLow ? '#DC2626' : '#15803D' }}>
                        {flower.stock} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>stems</span>
                      </div>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--pb-text-body)',
                      lineHeight: 1.4,
                      margin: '0 0 1rem 0',
                      flex: 1
                    }}
                  >
                    {flower.description}
                  </p>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--pb-border)' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(flower)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: 'var(--pb-blush)',
                        border: '1px solid var(--pb-border)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--pb-plum)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      <Edit2 size={13} color="var(--pb-rose)" /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(flower)}
                      style={{
                        padding: '0.5rem 0.85rem',
                        background: '#FEE2E2',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#DC2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Variety Modal ────────────────────────────── */}
      {modalMode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setModalMode(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--pb-surface)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid var(--pb-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flower2 size={22} color="var(--pb-rose)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--pb-plum)', margin: 0 }}>
                  {modalMode === 'add' ? 'Add Flower Variety' : `Edit Flower: ${activeFlower?.id}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pb-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Flower Variety Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Naomi Rose"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  >
                    <option value="Rose">Rose</option>
                    <option value="Orchid">Orchid</option>
                    <option value="Lily">Lily</option>
                    <option value="Anthurium">Anthurium</option>
                    <option value="Carnation">Carnation</option>
                    <option value="Chrysanthemum">Chrysanthemum</option>
                    <option value="Daisies">Daisies</option>
                    <option value="Lisianthus">Lisianthus</option>
                    <option value="Sea Lavenders">Sea Lavenders</option>
                    <option value="Baby Breath">Baby's Breath</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Wholesale Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    placeholder="350"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Petal Color *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep Red"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Quality Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  >
                    <option value="A+">Grade A+ (Export)</option>
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Stock Quantity (Stems)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Description & Origin
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Highland greenhouse cultivated..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={() => setModalMode(null)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" style={{ flex: 1 }}>
                  {modalMode === 'add' ? 'Save Flower' : 'Update Flower'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────────── */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--pb-surface)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1.5px solid var(--pb-border)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto'
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--pb-plum)', margin: '0 0 0.4rem 0' }}>
              Delete Flower Variety?
            </h3>

            <p style={{ fontSize: '0.84rem', color: 'var(--pb-text-muted)', lineHeight: 1.45, margin: '0 0 1.25rem 0' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--pb-plum)' }}>{deleteTarget.name}</strong> ({deleteTarget.id})?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
