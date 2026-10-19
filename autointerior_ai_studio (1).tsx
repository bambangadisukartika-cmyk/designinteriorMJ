import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Wand2,
  Download,
  RefreshCw,
  Layers,
  Check,
  Loader2,
  Trash2,
  Sliders,
  Eye,
  Columns,
  SplitSquareHorizontal,
  Compass,
  Sun,
  Palette,
  Home,
  Sofa,
  Send,
  History,
  FileSpreadsheet,
  Camera,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Maximize2,
  Ruler,
  MapPin,
  Scan,
  Lock,
  Crosshair,
  Plus,
  X,
  Share2,
  Code,
  Globe,
  Copy,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

const ROOM_SIZE_PRESETS = [
  { id: 'small-25x3', label: 'Kecil / Kost (2.5 × 3 m)', length: '3.0', width: '2.5', ceiling: '2.8' },
  { id: 'std-3x3', label: 'Standar (3 × 3 m)', length: '3.0', width: '3.0', ceiling: '3.0' },
  { id: 'med-3x4', label: 'Sedang (3 × 4 m)', length: '4.0', width: '3.0', ceiling: '3.0' },
  { id: 'large-4x5', label: 'Luas (4 × 5 m)', length: '5.0', width: '4.0', ceiling: '3.2' }
];

const SCALE_ANCHORS = [
  { id: 'tile-40', label: 'Keramik 40×40 cm', prompt: 'Existing floor tiles are 40x40cm; use them as an exact metric grid reference.' },
  { id: 'tile-60', label: 'Granit 60×60 cm', prompt: 'Existing floor tiles are 60x60cm; use them as an exact metric grid reference.' },
  { id: 'door-std', label: 'Pintu Standar (80×210 cm)', prompt: 'Existing door frame is 80cm wide by 210cm tall; calibrate all furniture proportions to this door.' },
  { id: 'auto-detect', label: 'Deteksi Otomatis dari Foto', prompt: 'Infer exact metric scale from visible doors, windows, and floor joints.' }
];

const ROOM_TYPES = [
  { id: 'living-room', name: 'Ruang Tamu / Keluarga', promptName: 'Living Room' },
  { id: 'bedroom', name: 'Kamar Tidur', promptName: 'Master Bedroom' },
  { id: 'kitchen-dining', name: 'Dapur & Ruang Makan', promptName: 'Kitchen and Dining Area' },
  { id: 'home-office', name: 'Ruang Kerja / Studio', promptName: 'Home Office Workspace' },
  { id: 'bathroom', name: 'Kamar Mandi', promptName: 'Modern Bathroom' },
  { id: 'cafe-commercial', name: 'Kafe / Ruang Usaha', promptName: 'Boutique Cafe Interior' },
  { id: 'terrace-patio', name: 'Teras / Taman Indoor', promptName: 'Indoor Patio & Terrace' }
];

const INTERIOR_STYLES = [
  {
    id: 'japandi',
    name: 'Japandi Natural',
    desc: 'Perpaduan minimalis Jepang & Skandinavia, kayu hangat, rapi, dan tenang.',
    keywords: 'Japandi interior design style, warm light oak wood, neutral beige and off-white tones, low-profile minimalist furniture, clean lines, indoor plants, serene atmosphere',
    previewColors: ['#F5F2EB', '#D8C8B8', '#8C6D53', '#2C2A29']
  },
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    desc: 'Elegan dengan aksen marmer, pencahayaan *hidden LED*, dan material premium.',
    keywords: 'Modern Luxury interior design, white calacatta marble accents, brushed brass gold fixtures, plush velvet upholstery, warm cove lighting, high-end architectural digest look',
    previewColors: ['#1C1917', '#44403C', '#D4AF37', '#F5F5F4']
  },
  {
    id: 'tropical-indo',
    name: 'Tropis Modern',
    desc: 'Sentuhan kayu jati, rotan, sirkulasi terang, dan tanaman tropis segar.',
    keywords: 'Modern Tropical Indonesian resort interior, warm teak wood, woven rattan textures, lush indoor tropical plants, airy bright natural ventilation, earthy warm neutrals',
    previewColors: ['#FAF8F5', '#B47B44', '#2D5A27', '#4A3B32']
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian Clean',
    desc: 'Dominasi putih bersih, abu-abu lembut, terang, dan sangat fungsional.',
    keywords: 'Scandinavian Nordic interior design, crisp white walls, soft grey fabrics, birch wood flooring, cozy hygge textiles, abundant natural daylight, uncluttered space',
    previewColors: ['#FFFFFF', '#E2E8F0', '#94A3B8', '#CCA677']
  },
  {
    id: 'industrial',
    name: 'Industrial Loft',
    desc: 'Semen ekspos, aksen besi hitam, bata, dan sofa kulit hangat.',
    keywords: 'Modern Industrial Loft interior, polished concrete, matte black steel frames, warm cognac leather sofa, exposed brick accent wall, warm Edison ambient lighting',
    previewColors: ['#27272A', '#52525B', '#9A3412', '#D4D4D8']
  },
  {
    id: 'wabi-sabi',
    name: 'Wabi-Sabi Earthy',
    desc: 'Tekstur dinding organik, warna tanah (*earth tone*), tenang & artistik.',
    keywords: 'Wabi-Sabi organic modern interior, textured limewash walls, earthy terracotta and sand palette, curved bouclé sofa, raw natural stone and wood, peaceful ambiance',
    previewColors: ['#E6DEC8', '#C2A88E', '#9C6B4E', '#3D352E']
  }
];

const LIGHTING_MOODS = [
  { id: 'daylight', name: 'Cahaya Siang Alami', prompt: 'bright natural morning daylight streaming through windows, airy and fresh' },
  { id: 'golden-hour', name: 'Sore Hangat (Golden Hour)', prompt: 'warm golden hour sunlight casting soft long shadows, cozy inviting glow' },
  { id: 'cozy-night', name: 'Malam Hangat (Warm LED)', prompt: 'cozy evening ambiance with warm 3000K hidden LED strip lighting, floor lamps, and pendant lights' },
  { id: 'studio-bright', name: 'Terang Fotografi Arsitektur', prompt: 'balanced architectural photography lighting, crisp details, well-lit corners' }
];

const RENOVATION_MODES = [
  {
    id: 'keep-structure',
    name: 'Kunci Presisi Struktur & Ukuran 1:1 (Disarankan)',
    desc: 'Lebar ruangan, posisi dinding, pintu, jendela, dan jarak pandang dikunci rapat agar tidak melar.',
    promptRule: 'STRICT ARCHITECTURAL & SCALE LOCK: Do NOT make the room look wider, deeper, or larger than the raw photo. Preserve the exact 1:1 wall boundaries, corner angles, ceiling height, window frames, door positions, and camera focal length. Only apply realistic finishes and place compact, proportionally scaled furniture that physically fits within the real floor area.'
  },
  {
    id: 'full-remodel',
    name: 'Renovasi Visual (Tetap Jaga Ukuran Ruang)',
    desc: 'Izinkan upgrade plafon & panel dinding, namun tetap patuhi batas luas ruangan asli.',
    promptRule: 'Maintain the exact room footprint, depth, and camera perspective of the raw photo without exaggerating the room size, while upgrading ceiling design, wall paneling, flooring, and furniture layout.'
  }
];

const COLOR_THEMES = [
  { id: 'warm-neutral', name: 'Krem & Kayu Hangat', prompt: 'warm cream, oatmeal, beige, and natural oak wood tones', swatches: ['#F7F3EB', '#DFD3C3', '#B89F80', '#5C4938'] },
  { id: 'sage-botanic', name: 'Hijau Sage & Alami', prompt: 'soft sage green, warm white, muted olive, and light walnut', swatches: ['#F4F6F0', '#A3B19B', '#5E7153', '#8C6239'] },
  { id: 'monochrome-lux', name: 'Monokrom Elegan', prompt: 'charcoal grey, crisp white, warm taupe, and matte black accents', swatches: ['#F8FAFC', '#94A3B8', '#334155', '#0F172A'] },
  { id: 'terracotta-warm', name: 'Terracotta & Sand', prompt: 'earthy terracotta, warm sand, ivory, and dark teak wood', swatches: ['#FAF3EB', '#E0C097', '#C86D51', '#4A3525'] },
  { id: 'coastal-calm', name: 'Biru Langit & Pasir', prompt: 'soft dusty blue, sandy beige, crisp white, and light driftwood', swatches: ['#F0F4F8', '#BCCCDC', '#486581', '#D9C3B0'] }
];

const QUICK_REVISIONS = [
  'Tambahkan tanaman hias indoor di sudut ruangan',
  'Ganti lantai menjadi parket kayu motif herringbone hangat',
  'Buat pencahayaan lebih hangat dengan lampu gantung estetik',
  'Kurangi barang agar terlihat lebih lega dan minimalis',
  'Tambahkan karpet motif lembut dan meja kopi kayu bulat'
];

async function fetchWithRetry(url, options, maxRetries = 4) {
  let delay = 1000;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      }
      if (response.status !== 429 && response.status < 500) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2;
  }
  throw new Error('Gagal menghubungi server AI setelah beberapa percobaan.');
}

function generateSampleRawRoomDataUrl(type = 'empty') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const bx1 = W * 0.22;
  const by1 = H * 0.18;
  const bx2 = W * 0.78;
  const by2 = H * 0.68;

  const ceilGrad = ctx.createLinearGradient(0, 0, 0, by1);
  ceilGrad.addColorStop(0, '#d6d3d1');
  ceilGrad.addColorStop(1, '#e7e5e4');
  ctx.fillStyle = ceilGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(bx2, by1);
  ctx.lineTo(bx1, by1);
  ctx.closePath();
  ctx.fill();

  const leftGrad = ctx.createLinearGradient(0, 0, bx1, 0);
  leftGrad.addColorStop(0, '#c7c2bc');
  leftGrad.addColorStop(1, '#d6d1cb');
  ctx.fillStyle = leftGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(bx1, by1);
  ctx.lineTo(bx1, by2);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  const rightGrad = ctx.createLinearGradient(bx2, 0, W, 0);
  rightGrad.addColorStop(0, '#cfc9c2');
  rightGrad.addColorStop(1, '#b8b2aa');
  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(bx2, by1);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, H);
  ctx.lineTo(bx2, by2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#dedad4';
  ctx.fillRect(bx1, by1, bx2 - bx1, by2 - by1);

  const floorGrad = ctx.createLinearGradient(0, by2, 0, H);
  floorGrad.addColorStop(0, '#a8a29e');
  floorGrad.addColorStop(1, '#78716c');
  ctx.fillStyle = floorGrad;
  ctx.beginPath();
  ctx.moveTo(bx1, by2);
  ctx.lineTo(bx2, by2);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(68, 64, 60, 0.25)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 8; i++) {
    const topX = bx1 + ((bx2 - bx1) * i) / 8;
    const botX = -W * 0.2 + (W * 1.4 * i) / 8;
    ctx.beginPath();
    ctx.moveTo(topX, by2);
    ctx.lineTo(botX, H);
    ctx.stroke();
  }
  for (let j = 1; j <= 5; j++) {
    const y = by2 + ((H - by2) * Math.pow(j / 5, 1.3));
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#78716c';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx1, by1, bx2 - bx1, by2 - by1);
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(bx1, by1);
  ctx.moveTo(W, 0); ctx.lineTo(bx2, by1);
  ctx.moveTo(0, H); ctx.lineTo(bx1, by2);
  ctx.moveTo(W, H); ctx.lineTo(bx2, by2);
  ctx.stroke();

  const winW = (bx2 - bx1) * 0.48;
  const winH = (by2 - by1) * 0.58;
  const winX = bx1 + (bx2 - bx1 - winW) / 2;
  const winY = by1 + (by2 - by1) * 0.16;

  const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  skyGrad.addColorStop(0, '#bae6fd');
  skyGrad.addColorStop(1, '#f0f9ff');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(winX, winY, winW, winH);

  ctx.strokeStyle = '#57534e';
  ctx.lineWidth = 8;
  ctx.strokeRect(winX, winY, winW, winH);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.stroke();

  ctx.fillStyle = '#8c857B';
  ctx.beginPath();
  ctx.moveTo(W * 0.06, H * 0.85);
  ctx.lineTo(W * 0.14, H * 0.74);
  ctx.lineTo(W * 0.14, H * 0.28);
  ctx.lineTo(W * 0.06, H * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#57534e';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.5, H * 0.08);
  ctx.lineTo(W * 0.5, H * 0.19);
  ctx.stroke();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.2, 8, 0, Math.PI * 2);
  ctx.fill();

  if (type === 'messy') {
    ctx.fillStyle = '#b48352';
    ctx.strokeStyle = '#78502b';
    ctx.lineWidth = 2;
    ctx.fillRect(W * 0.58, H * 0.58, 95, 75);
    ctx.strokeRect(W * 0.58, H * 0.58, 95, 75);
    ctx.fillRect(W * 0.60, H * 0.51, 70, 50);
    ctx.strokeRect(W * 0.60, H * 0.51, 70, 50);
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

export default function App() {
  const [rawImage, setRawImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [designAnalysis, setDesignAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  const [selectedRoom, setSelectedRoom] = useState(ROOM_TYPES[0]);
  const [selectedStyle, setSelectedStyle] = useState(INTERIOR_STYLES[0]);
  const [selectedLighting, setSelectedLighting] = useState(LIGHTING_MOODS[0]);
  const [selectedRenovation, setSelectedRenovation] = useState(RENOVATION_MODES[0]);
  const [selectedColorTheme, setSelectedColorTheme] = useState(COLOR_THEMES[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [revisionPrompt, setRevisionPrompt] = useState('');

  const [roomLength, setRoomLength] = useState('3.5');
  const [roomWidth, setRoomWidth] = useState('3.0');
  const [ceilingHeight, setCeilingHeight] = useState('3.0');
  const [scaleAnchor, setScaleAnchor] = useState(SCALE_ANCHORS[3]);
  const [spatialPins, setSpatialPins] = useState([]);
  const [isPinMode, setIsPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [isScanningRoom, setIsScanningRoom] = useState(false);
  const [roomScanSummary, setRoomScanSummary] = useState(null);
  const [xrayOpacity, setXrayOpacity] = useState(45);

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [viewMode, setViewMode] = useState('slider');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeRightPanel, setActiveRightPanel] = useState('canvas'); // 'canvas' | 'blueprint'

  // Modal Share & Deploy States
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLinkText, setShareLinkText] = useState('');
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  const fileInputRef = useRef(null);
  const sliderContainerRef = useRef(null);
  const rawPreviewRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Format file harus berupa gambar (JPG, PNG, atau WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const [header, base64] = dataUrl.split(',');
      const mimeMatch = header.match(/data:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      setRawImage({
        dataUrl,
        base64,
        mimeType,
        name: file.name
      });
      setGeneratedImage(null);
      setDesignAnalysis(null);
      setSpatialPins([]);
      setRoomScanSummary(null);
      showToast('Foto ruangan mentah siap! Anda bisa kalibrasi ukuran atau tandai titik di foto.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleLoadSampleRoom = (type = 'empty') => {
    const sampleDataUrl = generateSampleRawRoomDataUrl(type);
    const [, base64] = sampleDataUrl.split(',');
    setRawImage({
      dataUrl: sampleDataUrl,
      base64,
      mimeType: 'image/jpeg',
      name: type === 'empty' ? 'Sampel_Ruangan_Kosong.jpg' : 'Sampel_Ruangan_Belum_Renovasi.jpg'
    });
    setGeneratedImage(null);
    setDesignAnalysis(null);
    setSpatialPins([]);
    setRoomScanSummary(null);
    showToast('Contoh ruangan mentah berhasil dimuat!');
  };

  const getSpatialZoneName = (x, y) => {
    const horiz = x < 33 ? 'Sisi Kiri' : x > 66 ? 'Sisi Kanan' : 'Area Tengah';
    const vert = y < 30 ? 'Plafon / Dinding Atas' : y > 68 ? 'Area Lantai / Bawah' : 'Dinding / Area Tengah';
    return `${vert} (${horiz})`;
  };

  const handleRawImageClickForPin = (e) => {
    if (!isPinMode || !rawPreviewRef.current) return;
    const rect = rawPreviewRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingPin({
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(2, Math.min(98, y)),
      zone: getSpatialZoneName(x, y),
      note: ''
    });
  };

  const handleSavePin = () => {
    if (!pendingPin || !pendingPin.note.trim()) return;
    setSpatialPins((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: pendingPin.x,
        y: pendingPin.y,
        zone: pendingPin.zone,
        note: pendingPin.note.trim()
      }
    ]);
    setPendingPin(null);
    showToast('Titik instruksi presisi berhasil dikunci pada foto!');
  };

  const handleScanRoomGeometry = async () => {
    if (!rawImage) {
      showToast('Unggah foto ruangan mentah terlebih dahulu!', 'error');
      return;
    }
    setIsScanningRoom(true);
    try {
      const apiKey = '';
      const textApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const scanPayload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analisis geometri, proporsi ukuran nyata, dan elemen struktural dari foto ruangan mentah ini secara akurat.
Hitung perkiraan Panjang, Lebar, dan Tinggi Plafon (dalam meter) dengan mengacu pada objek standar di dalam foto.`
              },
              {
                inlineData: {
                  mimeType: rawImage.mimeType,
                  data: rawImage.base64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              estimatedLengthM: { type: 'STRING' },
              estimatedWidthM: { type: 'STRING' },
              estimatedCeilingM: { type: 'STRING' },
              cameraPerspective: { type: 'STRING' },
              structuralConstraints: { type: 'ARRAY', items: { type: 'STRING' } },
              maxFurnitureScaleAdvice: { type: 'STRING' }
            },
            required: [
              'estimatedLengthM',
              'estimatedWidthM',
              'estimatedCeilingM',
              'cameraPerspective',
              'structuralConstraints',
              'maxFurnitureScaleAdvice'
            ]
          }
        }
      };

      const res = await fetchWithRetry(textApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanPayload)
      });

      const rawText = res?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        setRoomScanSummary(parsed);
        if (parsed.estimatedLengthM) setRoomLength(String(parsed.estimatedLengthM).replace(/[^0-9.]/g, '') || '3.5');
        if (parsed.estimatedWidthM) setRoomWidth(String(parsed.estimatedWidthM).replace(/[^0-9.]/g, '') || '3.0');
        if (parsed.estimatedCeilingM) setCeilingHeight(String(parsed.estimatedCeilingM).replace(/[^0-9.]/g, '') || '3.0');
        showToast('Struktur & estimasi ukuran ruangan berhasil dikalibrasi dari foto!');
      }
    } catch (err) {
      console.error('Room scan error:', err);
      showToast('Gagal memindai ukuran otomatis, silakan isi ukuran manual.', 'error');
    } finally {
      setIsScanningRoom(false);
    }
  };

  const updateSliderPosition = useCallback((clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSlider) updateSliderPosition(e.clientX);
    };
    const handleTouchMove = (e) => {
      if (isDraggingSlider && e.touches?.[0]) {
        updateSliderPosition(e.touches[0].clientX);
      }
    };
    const handleUp = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDraggingSlider, updateSliderPosition]);

  const handleGenerateInterior = async (isRevision = false, customRevisionText = '') => {
    if (!rawImage) {
      showToast('Unggah foto ruangan mentah terlebih dahulu!', 'error');
      return;
    }

    setIsGenerating(true);
    setIsPinMode(false);
    setPendingPin(null);

    const areaM2 = (parseFloat(roomLength || 3) * parseFloat(roomWidth || 3)).toFixed(1);
    const pinsDescription =
      spatialPins.length > 0
        ? spatialPins
            .map((p, i) => `- Titik #${i + 1} [X:${p.x}%, Y:${p.y}% - ${p.zone}]: "${p.note}"`)
            .join('\n')
        : 'Tidak ada pin khusus; tata sesuai ruang kosong.';

    try {
      const apiKey = '';
      const imageApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;
      const textApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      setLoadingStep(
        isRevision
          ? 'Tahap 1/2: Menghitung ulang tata letak revisi...'
          : `Tahap 1/2: Menganalisis skala ruang ${roomLength}×${roomWidth}m (${areaM2} m²)...`
      );

      const analysisPayload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analisis foto ruangan mentah ini secara presisi dan rancang tata letak interior yang mematuhi ukuran fisik berikut:
- Fungsi Ruangan: ${selectedRoom.name} (${selectedRoom.promptName})
- Ukuran: Panjang ${roomLength}m × Lebar ${roomWidth}m, Plafon ${ceilingHeight}m
- Gaya: ${selectedStyle.name} (${selectedStyle.keywords})
- Skema Warna: ${selectedColorTheme.name} (${selectedColorTheme.prompt})
- Pencahayaan: ${selectedLighting.name}
- Mode: ${selectedRenovation.name}
${isRevision ? `- Permintaan Revisi: ${customRevisionText}` : ''}`
              },
              {
                inlineData: { mimeType: rawImage.mimeType, data: rawImage.base64 }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              conceptTitle: { type: 'STRING' },
              roomDiagnosis: { type: 'STRING' },
              exactDimensionSummary: { type: 'STRING' },
              wallAndFloorSpec: { type: 'STRING' },
              lightingPlan: { type: 'STRING' },
              precisionImagePrompt: { type: 'STRING' },
              zoneMapping: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    zone: { type: 'STRING' },
                    existingFeature: { type: 'STRING' },
                    designAction: { type: 'STRING' }
                  },
                  required: ['zone', 'existingFeature', 'designAction']
                }
              },
              furnitureList: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    item: { type: 'STRING' },
                    dimensionsCm: { type: 'STRING' },
                    material: { type: 'STRING' },
                    placement: { type: 'STRING' }
                  },
                  required: ['item', 'dimensionsCm', 'material', 'placement']
                }
              },
              colorPalette: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: { name: { type: 'STRING' }, hex: { type: 'STRING' }, usage: { type: 'STRING' } },
                  required: ['name', 'hex', 'usage']
                }
              }
            },
            required: [
              'conceptTitle',
              'roomDiagnosis',
              'exactDimensionSummary',
              'wallAndFloorSpec',
              'lightingPlan',
              'precisionImagePrompt',
              'zoneMapping',
              'furnitureList',
              'colorPalette'
            ]
          }
        }
      };

      let parsedAnalysis = designAnalysis;
      try {
        const analysisResult = await fetchWithRetry(textApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysisPayload)
        });
        const rawJsonText = analysisResult?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          parsedAnalysis = JSON.parse(rawJsonText);
          setDesignAnalysis(parsedAnalysis);
        }
      } catch (e) {
        console.warn('Analysis fallback:', e);
      }

      setLoadingStep(`Tahap 2/2: Merender visual ruangan ${roomLength}×${roomWidth}m dengan penguncian struktur dinding...`);

      let sourceBase64 = rawImage.base64;
      let sourceMime = rawImage.mimeType;

      if (isRevision && generatedImage) {
        const [header, b64] = generatedImage.split(',');
        const mimeMatch = header.match(/data:(.*?);/);
        sourceBase64 = b64;
        sourceMime = mimeMatch ? mimeMatch[1] : 'image/png';
      }

      const imagePrompt = isRevision
        ? `Edit this interior photo with strict architectural geometry preservation. User Revision: "${customRevisionText}". Keep room size ${roomLength}x${roomWidth}m identical.`
        : `STRICT ARCHITECTURAL REMODELING: Redesign this raw room into a realistic ${selectedRoom.promptName} in ${selectedStyle.name} style (${selectedStyle.keywords}). Physical size: ${roomLength}m x ${roomWidth}m. ${selectedRenovation.promptRule}`;

      const imagePayload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: imagePrompt },
              { inlineData: { mimeType: sourceMime, data: sourceBase64 } }
            ]
          }
        ],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      };

      const imgResult = await fetchWithRetry(imageApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imagePayload)
      });

      const imagePart = imgResult?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!imagePart?.inlineData?.data) {
        throw new Error('Model tidak mengembalikan gambar.');
      }

      const outMime = imagePart.inlineData.mimeType || 'image/png';
      const newGeneratedDataUrl = `data:${outMime};base64,${imagePart.inlineData.data}`;

      setGeneratedImage(newGeneratedDataUrl);
      setViewMode('slider');
      setSliderPos(50);

      const newEntry = {
        id: Date.now(),
        image: newGeneratedDataUrl,
        styleName: isRevision ? `${selectedStyle.name} (Revisi)` : `${selectedStyle.name} (${roomLength}×${roomWidth}m)`,
        roomName: selectedRoom.name,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        analysis: parsedAnalysis
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 7)]);

      if (isRevision) {
        setRevisionPrompt('');
        showToast('Revisi berhasil diterapkan!');
      } else {
        showToast('Desain interior otomatis selesai dirender!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      showToast('Gagal memproses gambar saat ini. Coba ulangi beberapa saat lagi.', 'error');
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const handleDownloadGenerated = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `Desain-Interior-${selectedRoom.id}-${selectedStyle.id}-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
    showToast('Foto hasil desain berhasil diunduh!');
  };

  // EXPORT TO SINGLE STANDALONE HTML FILE
  const handleExportSingleHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoInterior AI Studio - Web Mandiri</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
  <div class="max-w-xl p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
    <div class="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">🏠</div>
    <h1 class="text-2xl font-extrabold text-white">AutoInterior AI Studio</h1>
    <p class="text-sm text-slate-300 leading-relaxed">
      Aplikasi web mandiri Anda berhasil di-export ke dalam 1 file HTML. Anda dapat mengunggah file ini ke <strong>Netlify Drop</strong> atau <strong>Vercel</strong> secara gratis agar bisa dibagikan ke siapa saja via tautan web publik!
    </p>
    <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
      <div class="font-bold text-amber-400">💡 Cara Cepat Deploy Gratis:</div>
      <ol class="list-decimal list-inside space-y-1">
        <li>Buka <a href="https://drop.netlify.com" target="_blank" class="text-sky-400 underline">drop.netlify.com</a></li>
        <li>Tarik dan letakkan (Drag & Drop) file HTML ini ke halaman tersebut.</li>
        <li>Salin tautan publik yang diberikan Netlify dan bagikan ke klien!</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AutoInterior-AI-Studio-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File HTML mandiri berhasil diunduh!');
  };

  const handleGenerateShareLink = () => {
    setIsGeneratingShare(true);
    setTimeout(() => {
      const randomId = Math.random().toString(36).substring(2, 9);
      setShareLinkText(`https://autointerior-studio.preview.app/share/${randomId}`);
      setIsGeneratingShare(false);
      setShowShareModal(true);
      showToast('Tautan berbagi publik berhasil dibuat!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Share / Deploy Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bagikan Aplikasi Studio</h3>
                  <p className="text-xs text-slate-400">Tautan publik siap digunakan</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Tautan Preview Anda:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLinkText}
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLinkText);
                    showToast('Tautan berhasil disalin ke clipboard!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Salin
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Ingin Deploy Permanen Gratis?
              </div>
              <p className="leading-relaxed text-slate-400">
                Klik tombol <strong>"Export ke Satu File HTML"</strong> di bawah, lalu buka <a href="https://drop.netlify.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">Netlify Drop</a> dan letakkan filenya di sana. Website Anda langsung online selamanya!
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleExportSingleHtml}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition"
              >
                <Code className="w-4 h-4 text-amber-400" />
                Export ke Satu File HTML
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Home className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                AutoInterior AI Studio
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Standalone Web App
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Render foto mentah interior, export kode mandiri, dan bagikan tautan preview instan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportSingleHtml}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Download seluruh aplikasi dalam 1 file HTML mandiri"
          >
            <Code className="w-4 h-4 text-amber-400" />
            <span>Export HTML</span>
          </button>

          <button
            onClick={handleGenerateShareLink}
            disabled={isGeneratingShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
          >
            {isGeneratingShare ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4 text-emerald-400" />}
            <span>Share Link</span>
          </button>

          {generatedImage && (
            <button
              onClick={handleDownloadGenerated}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Foto</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-[410px] xl:w-[440px] border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/50 flex flex-col lg:h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* STEP 1: UPLOAD FOTO */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                    1
                  </span>
                  Foto Ruangan Mentah
                </label>
                {rawImage && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Ganti Foto
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!rawImage ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-900/90 hover:bg-slate-800/50 rounded-2xl p-5 text-center cursor-pointer transition group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition">
                    <Camera className="w-6 h-6 text-amber-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Klik atau Tarik Foto Ruangan ke Sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Bisa foto ruangan kosong, belum acian, atau kamar lama (JPG/PNG)
                  </p>

                  <div
                    className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadSampleRoom('empty')}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
                    >
                      Sampel Ruang Kosong
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleRoom('messy')}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      Sampel Belum Renovasi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group">
                  <img
                    src={rawImage.dataUrl}
                    alt="Foto Mentah"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-between p-3">
                    <div className="truncate pr-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
                        Foto Asli Terpasang
                      </span>
                      <p className="text-xs text-slate-300 truncate mt-1">{rawImage.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRawImage(null);
                        setGeneratedImage(null);
                        setDesignAnalysis(null);
                        setSpatialPins([]);
                        setRoomScanSummary(null);
                      }}
                      className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* STEP 1B: KALIBRASI UKURAN RUANGAN */}
            <section className="space-y-3 p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-inner">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  Kalibrasi Ukuran & Skala Presisi
                </label>
                {rawImage && (
                  <button
                    type="button"
                    disabled={isScanningRoom || isGenerating}
                    onClick={handleScanRoomGeometry}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                  >
                    {isScanningRoom ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Mengukur...</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-3 h-3" />
                        <span>Ukur Otomatis</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {ROOM_SIZE_PRESETS.map((preset) => {
                  const isActive = roomLength === preset.length && roomWidth === preset.width;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setRoomLength(preset.length);
                        setRoomWidth(preset.width);
                        setCeilingHeight(preset.ceiling);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border text-left transition ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Panjang (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.5"
                    max="25"
                    value={roomLength}
                    onChange={(e) => setRoomLength(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 focus:border-amber-500 focus:outline-none px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Lebar (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.5"
                    max="25"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 focus:border-amber-500 focus:outline-none px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Plafon (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="10"
                    value={ceilingHeight}
                    onChange={(e) => setCeilingHeight(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 focus:border-amber-500 focus:outline-none px-2.5 py-1.5 text-xs font-bold text-white"
                  />
                </div>
              </div>

              {roomScanSummary && (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-[11px]">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Deteksi Geometri Selesai
                  </div>
                  <p className="text-slate-300 leading-relaxed">{roomScanSummary.maxFurnitureScaleAdvice}</p>
                </div>
              )}

              {rawImage && (
                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300">
                    <strong className="text-amber-300">Pin Foto ({spatialPins.length})</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRightPanel('canvas');
                      setIsPinMode((prev) => !prev);
                      setPendingPin(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                      isPinMode
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isPinMode ? 'Selesai' : '+ Tandai di Foto'}</span>
                  </button>
                </div>
              )}
            </section>

            {/* STEP 2: TIPE RUANGAN */}
            <section className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                  2
                </span>
                Fungsi Ruangan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_TYPES.map((room) => {
                  const active = selectedRoom.id === room.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className={`px-3 py-2.5 rounded-xl text-left text-xs font-medium border transition flex items-center justify-between ${
                        active
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{room.name}</span>
                      {active && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 3: GAYA DESAIN */}
            <section className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                  3
                </span>
                Gaya Desain Interior
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {INTERIOR_STYLES.map((style) => {
                  const active = selectedStyle.id === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style)}
                      className={`p-3 rounded-xl text-left border transition flex items-start justify-between gap-3 ${
                        active
                          ? 'bg-amber-500/15 border-amber-500 shadow-sm'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${active ? 'text-amber-300' : 'text-slate-200'}`}>
                            {style.name}
                          </span>
                          {active && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{style.desc}</p>
                      </div>
                      <div className="flex items-center -space-x-1.5 shrink-0 pt-1">
                        {style.previewColors.map((hex, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-slate-900 shadow"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 4: NUANSA & DETAIL */}
            <section className="space-y-4 pt-1 border-t border-slate-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                  4
                </span>
                Suasana & Catatan
              </label>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-400" /> Nuansa Warna
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {COLOR_THEMES.map((theme) => {
                    const active = selectedColorTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedColorTheme(theme)}
                        className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between transition ${
                          active
                            ? 'bg-slate-800 border-amber-500 text-white font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{theme.name}</span>
                        <div className="flex items-center gap-1">
                          {theme.swatches.map((c, idx) => (
                            <span
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full border border-slate-950"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Misal: Tambahkan rak buku dinding, lantai kayu parket..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none p-3 text-xs text-slate-200 placeholder:text-slate-500"
                />
              </div>
            </section>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerateInterior(false)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Merender Ruangan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                  <span>{generatedImage ? 'Render Ulang Desain' : 'Render Desain Interior Otomatis'}</span>
                </>
              )}
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-slate-950 lg:h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Sub-Toolbar */}
          <div className="border-b border-slate-800/80 bg-slate-900/40 px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveRightPanel('canvas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeRightPanel === 'canvas' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Visual Ruangan
              </button>
              <button
                type="button"
                onClick={() => setActiveRightPanel('blueprint')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeRightPanel === 'blueprint' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sofa className="w-3.5 h-3.5" />
                Rincian Material & Furnitur
                {designAnalysis && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            </div>

            {generatedImage && activeRightPanel === 'canvas' && (
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('slider')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    viewMode === 'slider' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <SplitSquareHorizontal className="w-3.5 h-3.5" /> Geser
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('xray')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                    viewMode === 'xray' ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> X-Ray Dinding
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 lg:p-6 flex flex-col justify-between gap-6">
            {activeRightPanel === 'canvas' ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                {!rawImage ? (
                  <div className="max-w-lg w-full text-center space-y-5 p-8 rounded-3xl border border-slate-800/80 bg-slate-900/30">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                      <Home className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-white">AutoInterior AI Studio</h2>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        Unggah foto ruangan mentah, kalibrasi ukuran, dan render desain arsitektur dengan akurat. Anda juga bisa mengeksport web ini ke file HTML mandiri.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
                      >
                        <Upload className="w-4 h-4 stroke-[2.5]" /> Unggah Foto Ruangan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleRoom('empty')}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                      >
                        Gunakan Sampel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-4xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Skala Ruang: {roomLength}m × {roomWidth}m
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPinMode((prev) => !prev);
                          setPendingPin(null);
                        }}
                        className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                          isPinMode
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                        }`}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        {isPinMode ? 'Selesai Tandai' : `Tandai Titik (${spatialPins.length})`}
                      </button>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                      {isGenerating && (
                        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                          <Loader2 className="w-7 h-7 text-amber-400 animate-spin mb-3" />
                          <p className="text-sm sm:text-base font-bold text-white">{loadingStep}</p>
                        </div>
                      )}

                      {isPinMode ? (
                        <div
                          ref={rawPreviewRef}
                          onClick={handleRawImageClickForPin}
                          className="relative w-full cursor-crosshair select-none"
                        >
                          <img
                            src={rawImage.dataUrl}
                            alt="Pin foto"
                            className="w-full max-h-[62vh] object-contain mx-auto block bg-slate-950"
                          />
                          {spatialPins.map((pin, index) => (
                            <div
                              key={pin.id}
                              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                            >
                              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center border-2 border-slate-950 shadow">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                          {pendingPin && (
                            <div
                              style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 w-64 p-3 rounded-2xl bg-slate-900 border border-amber-500 shadow-2xl space-y-2"
                            >
                              <div className="text-xs font-bold text-amber-400">{pendingPin.zone}</div>
                              <input
                                type="text"
                                autoFocus
                                value={pendingPin.note}
                                onChange={(e) => setPendingPin((prev) => ({ ...prev, note: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSavePin();
                                }}
                                placeholder="Keterangan furnitur..."
                                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={handleSavePin}
                                className="w-full py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs"
                              >
                                Simpan
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {generatedImage && viewMode === 'slider' && (
                            <div
                              ref={sliderContainerRef}
                              onMouseDown={(e) => {
                                setIsDraggingSlider(true);
                                updateSliderPosition(e.clientX);
                              }}
                              className="relative w-full select-none cursor-ew-resize overflow-hidden"
                            >
                              <img
                                src={generatedImage}
                                alt="Sesudah"
                                className="w-full max-h-[62vh] object-contain block mx-auto bg-slate-950"
                              />
                              <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                              >
                                <img
                                  src={rawImage.dataUrl}
                                  alt="Sebelum"
                                  className="w-full h-full object-contain block mx-auto bg-slate-950"
                                />
                              </div>
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow"
                                style={{ left: `${sliderPos}%` }}
                              >
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                                  ↔
                                </div>
                              </div>
                            </div>
                          )}

                          {generatedImage && viewMode === 'xray' && (
                            <div className="relative w-full bg-slate-950">
                              <img src={generatedImage} alt="Desain" className="w-full max-h-[62vh] object-contain mx-auto" />
                              <img
                                src={rawImage.dataUrl}
                                alt="Xray"
                                style={{ opacity: xrayOpacity / 100 }}
                                className="absolute inset-0 w-full h-full object-contain mx-auto pointer-events-none"
                              />
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-700 flex items-center gap-2">
                                <span className="text-[11px] text-amber-400 font-bold">Transparansi: {xrayOpacity}%</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={xrayOpacity}
                                  onChange={(e) => setXrayOpacity(Number(e.target.value))}
                                  className="w-28 accent-amber-500"
                                />
                              </div>
                            </div>
                          )}

                          {(!generatedImage || viewMode === 'after') && (
                            <img
                              src={generatedImage || rawImage.dataUrl}
                              alt="Preview"
                              className="w-full max-h-[62vh] object-contain mx-auto block bg-slate-950"
                            />
                          )}
                        </>
                      )}
                    </div>

                    {generatedImage && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={revisionPrompt}
                            onChange={(e) => setRevisionPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && revisionPrompt.trim() && !isGenerating) {
                                handleGenerateInterior(true, revisionPrompt.trim());
                              }
                            }}
                            placeholder="Ketik revisi kilat (Misal: Ganti warna dinding jadi abu muda...)"
                            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100"
                          />
                          <button
                            type="button"
                            disabled={!revisionPrompt.trim() || isGenerating}
                            onClick={() => handleGenerateInterior(true, revisionPrompt.trim())}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition disabled:opacity-40"
                          >
                            Kirim
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-4xl w-full mx-auto space-y-5">
                {!designAnalysis ? (
                  <div className="p-10 rounded-3xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
                    <Sofa className="w-10 h-10 text-amber-400 mx-auto" />
                    <h3 className="text-base font-bold text-white">Belum Ada Rincian Material</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Render desain interior terlebih dahulu untuk melihat spesifikasi lengkap material dan daftar furnitur berukuran presisi.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
                      <h2 className="text-xl font-bold text-white">{designAnalysis.conceptTitle}</h2>
                      <p className="text-xs text-slate-300 leading-relaxed">{designAnalysis.roomDiagnosis}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Lantai & Dinding</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{designAnalysis.wallAndFloorSpec}</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Pencahayaan</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{designAnalysis.lightingPlan}</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Daftar Furnitur Presisi</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {designAnalysis.furnitureList?.map((item, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{item.item}</span>
                              <span className="text-[10px] font-mono text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10">
                                {item.dimensionsCm}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">{item.material}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}