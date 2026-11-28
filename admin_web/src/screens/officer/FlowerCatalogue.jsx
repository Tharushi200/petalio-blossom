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
    name: 'Rose',
    category: 'Rose',
    unitPrice: 350,
    color: 'Red',
    stock: 185,
    reorderLevel: 50,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb_tvdU2RR7rFV9ocrmcpiq_vWvZi4YghL6L5H_Tw6p39WwvwkUaxhyow&s=10',
    colorImages: {
      Red: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb_tvdU2RR7rFV9ocrmcpiq_vWvZi4YghL6L5H_Tw6p39WwvwkUaxhyow&s=10',
      White: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9WplrCjweskxgoi8O7DP--3rRenFdyHiNgbqI1wSKV1PrLDtdW5w2xaM&s=10',
      Yellow: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfuWNvNc0Dna8j1PQVqLW2ergG9Mg9igFr-KvfDUKU4tnYJ42p4DfFD4Kj&s=10',
      Pink: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF8PFDR5srBBId2__xrwx7X0LGBkfiMttenTFZIq6xD9MnOnPu-pzPYFE&s=10'
    },
    description: 'Highland long-stem luxury roses from Nuwara Eliya misty hills. High demand for weddings & Valentine.'
  },
  {
    id: 'F002',
    name: 'Orchid',
    category: 'Orchid',
    unitPrice: 420,
    color: 'White',
    stock: 95,
    reorderLevel: 40,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA1OMi69MtnnAVjiMaBEUBZrljQ5k8eszw6kwKcteJlecE0t9UgnR0uBvD&s=10',
    colorImages: {
      White: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA1OMi69MtnnAVjiMaBEUBZrljQ5k8eszw6kwKcteJlecE0t9UgnR0uBvD&s=10',
      Purple: 'https://georgewood.com/cdn/shop/products/rouge-0000.jpg?v=1772724232',
      Pink: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtr6jvL_B3Z9b4KtQkVHIib7kru_nlPn3UNaRZ6gpB7J0wB56XvyWeeSU&s=10'
    },
    description: 'Exotic tropical shaded orchids grown in Welimada. Long-life sprays for luxury corporate lobbies.'
  },
  {
    id: 'F003',
    name: 'Lily',
    category: 'Lily',
    unitPrice: 830,
    color: 'White',
    stock: 60,
    reorderLevel: 40,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsybGsp0VZnLWS3RLEba1KLQDJaPKo9zFVH9xpdeXvBJMBplAIgqJngoQ&s=10',
    colorImages: {
      White: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsybGsp0VZnLWS3RLEba1KLQDJaPKo9zFVH9xpdeXvBJMBplAIgqJngoQ&s=10',
      Pink: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw1LlpVG8v3iKwdHx5X4nHwgZjrlo-rZmOxfDpdGhSdhpK980mi1uII74&s=10',
      Yellow: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTOPH384Y96czcSsc-4VYnZptTBGJmjicGBfbSpAIS5WLPP-ZE5OqoXKLc&s=10'
    },
    description: 'Fragrant Oriental white lilies cultivated in Ambewela alpine fields. Ideal for hotel banquets.'
  },
  {
    id: 'F004',
    name: 'Carnation',
    category: 'Carnation',
    unitPrice: 300,
    color: 'Red',
    stock: 220,
    reorderLevel: 60,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOL2BukndIVjerxnQBffIvDAzSxiNyW196fPWjdzMYO2uOFHZwbhWy2f1m&s=10',
    colorImages: {
      Red: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOL2BukndIVjerxnQBffIvDAzSxiNyW196fPWjdzMYO2uOFHZwbhWy2f1m&s=10',
      Pink: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFYzTClxcqq1AGTwQkgvxuHcbsm2uomlC_bwKfvLZIIx5bxPlbQR4Ba5xW&s=10',
      White: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLX0whgrBLGqL26TNILAQ3C8MYw6aUN3yXHEg5JKucIfwx6Nys8mg8bcNi&s=10'
    },
    description: 'Ruffled petal highland carnations from Hakgala. Very resilient cut flower.'
  },
  {
    id: 'F005',
    name: 'Chrysanthemum',
    category: 'Chrysanthemum',
    unitPrice: 240,
    color: 'White',
    stock: 140,
    reorderLevel: 50,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlAxqqHuoF68upnZFu2PPk8x6ZvJCXoiFJ7xTEUc2YXREasfiD8D8LLxLW&s=10',
    colorImages: {
      White: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlAxqqHuoF68upnZFu2PPk8x6ZvJCXoiFJ7xTEUc2YXREasfiD8D8LLxLW&s=10',
      Yellow: 'https://www.rigasziedi.lv/files/products/images/big/dzeltenas_krizantemas-3.jpg',
      Pink: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9uIAsfhK3MaHDQ0HsXPfEXXDffNQbSSLjz6kxDU9saStu8nZrNOY__2KX&s=10'
    },
    description: 'Bright festival blooms popular for Vesak, temple ceremonies, and cultural events.'
  },
  {
    id: 'F006',
    name: 'Sunshine Gerbera',
    category: 'Gerbera',
    unitPrice: 200,
    color: 'Yellow',
    stock: 45, // low stock alert
    reorderLevel: 50,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy1dUPHx8m71hPDTLGIi25Vi1D-obtPSIX2rfxzTXfZxG4UEeIJXoNZW0&s=10',
    colorImages: {
      Yellow: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy1dUPHx8m71hPDTLGIi25Vi1D-obtPSIX2rfxzTXfZxG4UEeIJXoNZW0&s=10',
      Orange: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=400',
      Pink: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&auto=format&fit=crop&q=80',
      Red: 'https://images.pexels.com/photos/931180/pexels-photo-931180.jpeg?auto=compress&cs=tinysrgb&w=400',
      White: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&auto=format&fit=crop&q=80'
    },
    description: 'Vibrant large cut gerberas from Bandarawela. Bright commercial filler for boutique floral arrangements.'
  },
  {
    id: 'F007',
    name: 'Lavender Lisianthus',
    category: 'Lisianthus',
    unitPrice: 510,
    color: 'White',
    stock: 130,
    reorderLevel: 50,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4wl-OmkBCXuQ0UEvSwByBgPAEO_Z7ejGCre1PJtqqaX_MEatY9qNqfwo&s=10',
    description: 'Double-petaled eustoma grandiflorum with extended vase life. High demand for modern wedding styling.'
  },
  {
    id: 'F008',
    name: 'English Blue Lavender',
    category: 'Lavender',
    unitPrice: 975,
    color: 'Purple',
    stock: 160,
    reorderLevel: 50,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-nzRRZzeoX2c4HXFB6JFZ0vwWPIPzMUpiCUYYVEigXZULRzJLSWak-jbb&s=10',
    description: 'Everlasting aromatic lavender with papery violet florets. Retains color and fragrance when dried.'
  },
  {
    id: 'F009',
    name: "Bridal Baby's Breath",
    category: "Baby's Breath",
    unitPrice: 1500,
    color: 'White',
    stock: 250,
    reorderLevel: 70,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKIkjS2xPZj96SP_2idOSlVs98i-v3dyRggjNFySSzbCoQfSDxWm8lmgGu&s=10',
    description: "Delicate clouds of tiny white flowers (Gypsophila). Essential wedding bouquet filler."
  },
  {
    id: 'F010',
    name: 'Ceylon Sunflower',
    category: 'Sunflower',
    unitPrice: 270,
    color: 'Yellow',
    stock: 90,
    reorderLevel: 30,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvZYqnWOFk3qQGCBg9vWpXyBVS5nOQoN9Y1vc8jc0BMI--BieVhlvRgvbt&s=10',
    description: 'Golden yellow cut sunflowers harvested from Pedro Highlands. Cheerful decorative stems.'
  },
  {
    id: 'F011',
    name: 'Dutch Garden Tulip',
    category: 'Tulip',
    unitPrice: 710,
    color: 'Red',
    stock: 75,
    reorderLevel: 35,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKRzETOSu44v07ceKy8SB1A37lzrbn1vsbpxrS6RUm8LxdNRw7qYuergow&s=10',
    description: 'Imported Grade-A elegant Dutch tulips for luxury VIP dining tables and bridal parties.'
  },
  {
    id: 'F012',
    name: 'Highland Hydrangea',
    category: 'Hydrangea',
    unitPrice: 1000,
    color: 'White',
    stock: 50,
    reorderLevel: 25,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRehG9NIkBW-Mi9U3Tf7l3VBrODUtdc8mu-iqQdMoKAwHu1DUnTsCh0Wm4&s=10',
    description: 'Massive lush round floral heads grown in Hakgala temperate climate. Premium event showpiece.'
  },
  {
    id: 'F013',
    name: 'Royal Peony',
    category: 'Peony',
    unitPrice: 1760,
    color: 'Pink',
    stock: 35,
    reorderLevel: 20,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK284b9Wj96yHD-8a1dMkU9RVF7yKBsBiXnX52GSBu_s_bcYkM-qDlKHXy&s=10',
    description: 'Full opulent blooms in soft blush and coral. The pinnacle luxury flower for high-end wedding arches.'
  },
  {
    id: 'F014',
    name: 'Standard Freesia',
    category: 'Freesia',
    unitPrice: 420,
    color: 'White',
    stock: 80,
    reorderLevel: 35,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrRmutoRtCK1O1ZG34UTNwDecCprzyEemTzmNL2doI8Wk3f2h-Gw5yf10Q&s=10',
    description: 'Sweetly scented funnel-shaped flowers popular in bridal bouquets and perfumed arrangements.'
  },
  {
    id: 'F015',
    name: 'Bird of Paradise',
    category: 'Bird of Paradise',
    unitPrice: 800,
    color: 'Orange',
    stock: 65,
    reorderLevel: 30,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRlgOeGnEHAFtrnItaMWudRItsdmYgbRd7qAy9bpPp2jikU8n_I4y5IZM&s=10',
    description: 'Stately exotic crane flower with vivid orange and blue plumage. Architectural focal bloom.'
  },
  {
    id: 'F016',
    name: 'Ranunculus Buttercup',
    category: 'Ranunculus',
    unitPrice: 995,
    color: 'Orange',
    stock: 55,
    reorderLevel: 25,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGJxZf8HeJkEIjdPYpUCJJ3SKEnQfWmHNTWqIDpHcRaUxWDMgzJMIyQSc&s=10',
    description: 'Layered papery petals resembling tiny roses. Favorite among boutique florists in Colombo.'
  },
  {
    id: 'F017',
    name: 'Fragrant Tuberose',
    category: 'Tuberose',
    unitPrice: 265,
    color: 'White',
    stock: 120,
    reorderLevel: 45,
    image: 'https://www.dutchgrown.com/cdn/shop/articles/Tuberose_789x_crop_center.jpg?v=1671195538',
    description: 'Intensely fragrant white floral spikes used extensively for garlands and evening banquets.'
  },
  {
    id: 'F018',
    name: 'Baby Blue Eucalyptus',
    category: 'Eucalyptus',
    unitPrice: 250,
    color: 'Green',
    stock: 175,
    reorderLevel: 50,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiDQYrVEtnLKPOpvCTVq0uC3laB5YpDyul0vb9q9nHBPjOCZwJPd8zyM3y&s=10',
    description: 'Aromatic silver-green rounded foliage. Indispensable filler greenery for contemporary floral styling.'
  },
  {
    id: 'F019',
    name: 'Peruvian Alstroemeria',
    category: 'Alstroemeria',
    unitPrice: 280,
    color: 'Pink',
    stock: 140,
    reorderLevel: 45,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwKVN94UCsBokXKaWZ5aKjcgG8mYR8zOehmCmlIsWHTrUxd6Efkwje9Q&s=10',
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
  'Alstroemeria',
  'Other'
];

// ─── Color palette map for flower dots ────────────────────────────────────────
const FLOWER_COLOR_HEX = {
  Red: '#E11D48',
  White: '#F8FAFC',
  Yellow: '#FBBF24',
  Pink: '#F472B6',
  Purple: '#A855F7',
  Orange: '#FB923C',
  Green: '#4ADE80',
  'Blue-Green': '#2DD4BF',
  Blue: '#38BDF8',
  Peach: '#FDBA74',
  Coral: '#FB7185',
  Cream: '#FEF3C7',
  Mixed: '#C084FC',
  Crimson: '#BE123C'
};

// ─── Single Flower Card with Interactive Color Selector ───────────────────────
function FlowerCard({ flower, onEdit, onDelete }) {
  const [activeColor, setActiveColor] = useState(flower.color || 'Default');
  const isLow = flower.stock <= flower.reorderLevel;

  // Determine which image to show based on selected color
  const displayedImage =
    (flower.colorImages && flower.colorImages[activeColor]) ||
    flower.image ||
    '/rose.jpg';

  const availableColors = flower.colorImages
    ? Object.keys(flower.colorImages)
    : [flower.color || 'Default'];

  return (
    <div
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
      <div style={{ position: 'relative', width: '100%', height: '175px', overflow: 'hidden' }}>
        <img
          src={displayedImage}
          alt={`${flower.name} (${activeColor})`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }}
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

        {/* Color Switcher Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.3rem 0 0.75rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--pb-text-muted)', fontWeight: 600 }}>Color:</span>
            {availableColors.map((clr) => {
              const bg = FLOWER_COLOR_HEX[clr] || '#CBD5E1';
              const isSelected = activeColor === clr;
              return (
                <button
                  key={clr}
                  type="button"
                  title={`${clr} variety - Click to preview`}
                  onClick={() => setActiveColor(clr)}
                  style={{
                    width: isSelected ? '18px' : '15px',
                    height: isSelected ? '18px' : '15px',
                    borderRadius: '50%',
                    background: bg,
                    border: isSelected ? '2px solid var(--pb-rose)' : '1px solid rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px rgba(225,29,72,0.25)' : 'none',
                    padding: 0,
                    transition: 'all 0.15s ease'
                  }}
                />
              );
            })}
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--pb-plum)', marginLeft: '2px' }}>
              {activeColor}
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--pb-text-muted)' }}>
            Category: <strong style={{ color: 'var(--pb-plum)' }}>{flower.category}</strong>
          </span>
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
            onClick={() => onEdit(flower)}
            style={{
              flex: 1,
              padding: '0.5rem',
              background: 'var(--pb-blush)',
              border: '1px solid var(--pb-border)',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--pb-plum)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(flower)}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#DC2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [customCategory, setCustomCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Rose',
    unitPrice: 300,
    color: '',
    stock: 100,
    reorderLevel: 50,
    image: '',
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
              colorImages: fallback?.colorImages || (dbF.color ? { [dbF.color]: dbF.image_url } : null),
              stock: dbF.inventory?.stock_quantity ?? fallback?.stock ?? 100,
              reorderLevel: dbF.inventory?.reorder_level ?? fallback?.reorderLevel ?? 50,
              image: dbF.image_url || fallback?.image || '/rose.jpg',
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
    setCustomCategory('');
    setFormData({
      name: '',
      category: 'Rose',
      unitPrice: 320,
      color: 'Crimson Red',
      stock: 150,
      reorderLevel: 50,
      image: '',
      description: 'Cultivated in Nuwara Eliya highland greenhouses.'
    });
    setModalMode('add');
  };

  // ── Open Edit Modal ─────────────────────────────────────────────────────────
  const handleOpenEdit = (flower) => {
    setActiveFlower(flower);
    const isStandardCat = CATEGORIES.includes(flower.category);
    setCustomCategory(isStandardCat ? '' : flower.category);
    setFormData({
      name: flower.name,
      category: isStandardCat ? flower.category : 'Other',
      unitPrice: flower.unitPrice,
      color: flower.color,
      stock: flower.stock,
      reorderLevel: flower.reorderLevel,
      image: flower.image || '',
      description: flower.description || ''
    });
    setModalMode('edit');
  };

  // ── Save Form (Add or Edit) ─────────────────────────────────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Resolve final category: if 'Other', use customCategory input
    const finalCategory =
      formData.category === 'Other' && customCategory.trim()
        ? customCategory.trim()
        : formData.category;

    // Pick photo by user input or category fallback
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
    const chosenImage = formData.image.trim() ? formData.image.trim() : (catImages[formData.category] || '/rose.jpg');

    if (modalMode === 'add') {
      const newId = `F${String(flowers.length + 1).padStart(3, '0')}`;
      const newFlower = {
        id: newId,
        name: formData.name,
        category: finalCategory,
        unitPrice: parseFloat(formData.unitPrice) || 300,
        color: formData.color,
        stock: parseInt(formData.stock) || 100,
        reorderLevel: parseInt(formData.reorderLevel) || 50,
        image: chosenImage,
        description: formData.description
      };

      try {
        const res = await api.createFlower({
          name: formData.name,
          category: finalCategory,
          unit_price: parseFloat(formData.unitPrice) || 300,
          color: formData.color,
          image_url: chosenImage,
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
        category: finalCategory,
        unitPrice: parseFloat(formData.unitPrice) || activeFlower.unitPrice,
        color: formData.color,
        stock: parseInt(formData.stock) || activeFlower.stock,
        reorderLevel: parseInt(formData.reorderLevel) || activeFlower.reorderLevel,
        image: formData.image.trim() || activeFlower.image,
        description: formData.description
      };

      try {
        if (activeFlower.flower_id) {
          await api.updateFlower(activeFlower.flower_id, {
            name: formData.name,
            category: finalCategory,
            unit_price: parseFloat(formData.unitPrice),
            color: formData.color,
            image_url: formData.image.trim() || activeFlower.image,
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
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus size={15} /> Add New Flower
          </Button>
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
          {filteredFlowers.map((flower) => (
            <FlowerCard
              key={flower.id}
              flower={flower}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
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

              <div style={{ display: 'grid', gridTemplateColumns: formData.category === 'Other' ? '1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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

              {formData.category === 'Other' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                    Specify Custom Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jasmine, Marigold, Lotus"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1.5px solid var(--pb-rose)', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--pb-plum)', marginBottom: '4px' }}>
                  Petal Color *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Red, Pure White, Pastel Pink"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
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
                  Image URL / Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/... or /rose.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--pb-border)', fontSize: '0.85rem' }}
                />
                {formData.image && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--pb-border)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--pb-text-muted)' }}>Image preview</span>
                  </div>
                )}
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

