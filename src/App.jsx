import React, { useState, useEffect } from 'react';
import {
  Baby,
  Video,
  CheckCircle,
  AlertTriangle,
  Milk,
  Layers,
  Camera,
  Mic,
  Copy
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  // API Key lấy từ cấu hình Vercel hoặc file .env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // --- STATE CHO GOOGLE SHEET ---
  const [sheetData, setSheetData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loadStatus, setLoadStatus] = useState('');

  // 1. DATA: SẢN PHẨM
  const products = [
    {
      id: 1,
      name: 'Aptamil Số 1',
      age: '0 - 12 tháng',
      focus: 'Sinh mổ & Đề kháng',
    },
    {
      id: 2,
      name: 'Aptamil Số 2',
      age: '12 - 24 tháng',
      focus: 'Phát triển toàn diện',
    },
    {
      id: 3,
      name: 'Aptamil Số 3 (KID)',
      age: 'Trên 2 tuổi',
      focus: 'Hệ miễn dịch & Trí não',
    },
  ];

  // 2. DATA: PHÁT ÂM & DƯỠNG CHẤT
  const usps = [
    {
      term: 'Aptamil New Zealand',
      read: 'Áp-ta-miu Niu-zi-lân',
      benefit: 'Thương hiệu xuất xứ chuẩn châu Âu.',
    },
    {
      term: 'SYNBIOTIC',
      read: 'Xin-bai-ô-tíc',
      benefit: 'Dưỡng chất độc quyền hỗ trợ đề kháng (hợp bé sinh mổ).',
    },
    {
      term: 'Cesarbiotik',
      read: 'Xê-gia-bai-ô-tíc',
      benefit: 'Dòng sản phẩm hỗ trợ miễn dịch.',
    },
    {
      term: 'Profutura',
      read: 'Rô-phu-tu-ra',
      benefit: 'Dòng sản phẩm cao cấp.',
    },
    { term: 'Prebiotics', read: 'Prì-bai-ô-tíc', benefit: 'Chất xơ.' },
    { term: 'Probiotic', read: 'Prò-bai-ô-tíc', benefit: 'Lợi khuẩn.' },
    {
      term: 'B.breve M-16V',
      read: 'Bi-bơ-ri Mờ 16 Vê',
      benefit: 'Chủng lợi khuẩn.',
    },
    { term: 'GOS/FOS', read: 'Góts / Phóts', benefit: 'Hệ chất xơ.' },
    { term: 'DHA', read: 'Đê-hắc-a', benefit: 'Phát triển trí não.' },
    { term: 'Lutein', read: 'Lu-thê-in', benefit: 'Hỗ trợ thị giác.' },
    { term: 'Choline', read: 'Cô-lin', benefit: 'Hỗ trợ não bộ.' },
  ];

  // --- HÀM TẢI VÀ ĐỌC GOOGLE SHEET (GẮN CỨNG LINK CỦA BẠN) ---
  const handleLoadSheet = async () => {
    setLoadStatus('⏳ Đang đồng bộ dữ liệu mới nhất từ Google Sheet...');
    try {
      const sheetId = '1XKAlmbObMy70FbYSL31cU0uyVufKcLGZ-TRtzk2jPoU';
      const gid = '785775318';
      const fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=tsv&gid=${gid}`;
      
      const response = await fetch(fetchUrl);
      
      if (!response.ok) throw new Error('Không thể đọc Sheet. Đảm bảo bạn đã mở quyền "Bất kỳ ai có liên kết".');
      
      const text = await response.text();
      const lines = text.split('\n');
      if (lines.length < 2) throw new Error('Sheet trống hoặc không đúng định dạng.');

      let headerIndex = -1;
      let headers = [];
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const cols = lines[i].split('\t').map(h => h.trim());
        if (cols.includes('Phân loại')) {
          headerIndex = i;
          headers = cols;
          break;
        }
      }

      if (headerIndex === -1) {
        throw new Error('Không tìm thấy cột "Phân loại". Hãy kiểm tra xem có bị gõ thừa dấu cách trong Sheet không nhé!');
      }

      const data = lines.slice(headerIndex + 1).map(line => {
        const values = line.split('\t');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] ? values[index].trim() : '';
          return obj;
        }, {});
      }).filter(row => row['Phân loại']); 

      if (data.length === 0) throw new Error('Bảng của bạn đang không có nội dung nào bên dưới cột Phân loại.');

      const uniqueCategories = [...new Set(data.map(item => item['Phân loại']))];
      
      setSheetData(data);
      setCategories(uniqueCategories);
      
      if (!selectedCategory || !uniqueCategories.includes(selectedCategory)) {
        setSelectedCategory(uniqueCategories[0]); 
      }
      
      setLoadStatus(`✅ Đã đồng bộ ${data.length} kịch bản & ${uniqueCategories.length} phân loại.`);

    } catch (error) {
      setLoadStatus(`❌ Lỗi: ${error.message}`);
      setSheetData([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai' && sheetData.length === 0) {
      handleLoadSheet();
    }
  }, [activeTab]);

  // --- HÀM GỌI AI VÀ BỐC THĂM BRAND PICK ---
  const generateScript = async () => {
    if (!apiKey) {
      alert("Hệ thống chưa được kết nối API Key của Gemini. Vui lòng cấu hình file .env hoặc biến môi trường trên Host!");
      return;
    }

    if (sheetData.length === 0) {
      alert("Chưa có dữ liệu từ Google Sheet. Vui lòng bấm 'Làm mới dữ liệu'!");
      return;
    }

    setLoading(true);
    setAiResponse('');

    const matchingRows = sheetData.filter(row => {
      const isRightCategory = row['Phân loại'] === selectedCategory;
      const brandPickValue = row['Brand Pick'] ? row['Brand Pick'].toString().trim().toUpperCase() : 'FALSE';
      const isPicked = (brandPickValue === 'TRUE' || brandPickValue === '1' || brandPickValue === 'TRUE ');
      return isRightCategory && isPicked;
    });

    if (matchingRows.length === 0) {
      alert(`Opps! Không tìm thấy kịch bản nào thuộc phân loại "${selectedCategory}" được tick chọn "Brand Pick" cả. Bạn hãy kiểm tra lại file Sheet nhé!`);
      setLoading(false);
      return;
    }

    const randomRow = matchingRows[Math.floor(Math.random() * matchingRows.length)];

    const systemPrompt = `Bạn là Copywriter xuất sắc chuyên viết kịch bản TikTok/Reels cho thương hiệu sữa Aptamil New Zealand.
    Đề bài: Viết kịch bản video ngắn (dưới 60s) dựa trên các nguyên liệu sau:
    - Chủ đề: "${randomRow['Chủ đề']}"
    - Insight khách hàng: "${randomRow['Insight']}"
    - Câu Hook mở đầu: "${randomRow['Hook']}"
    - Thông điệp chính (Key Message): "${randomRow['Key message']}"
    - Hình ảnh mong muốn (Visual): "${randomRow['Visual']}"
    - Kêu gọi hành động (CTA): "${randomRow['CTA']}"
    
    YÊU CẦU BẮT BUỘC:
    1. Giọng văn: Gần gũi, đời thường, thấu hiểu tâm lý mẹ bỉm sữa Gen Z.
    2. Lồng ghép tự nhiên ít nhất 1 USP: SYNBIOTIC (hỗ trợ đề kháng/sinh mổ) hoặc DHA (phát triển trí não).
    3. TỪ VỰNG CHO PHÉP: "hỗ trợ", "giúp", "phù hợp", "góp phần". Chia sẻ góc độ trải nghiệm cá nhân.
    4. TỪ VỰNG CẤM DÙNG: "ngăn ngừa", "chữa khỏi", "hoàn toàn", "100%", "đảm bảo", "chứng minh lâm sàng", "độc quyền", "bé hết táo bón". Không dùng thuật ngữ y khoa điều trị.
    5. Cấu trúc rõ ràng 2 cột: Hình ảnh (Visual) | Âm thanh/Lời đọc (Audio).
    6. Cuối bài luôn kèm bộ Hashtag: #AptamilNewZealand3 #AptamilKID #DeKhangTriNao
    7. Không sử dụng markdown code block, chỉ format text thông thường.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hãy viết kịch bản theo đúng nguyên liệu được giao." }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.7 },
          }),
        }
      );

      const result = await response.json();
      if (result.error) throw new Error(result.error.message);

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiResponse(
        `🎲 Lọc được ${matchingRows.length} bài Brand Pick. Đã bốc thăm trúng Chủ đề: ${randomRow['Chủ đề']}\n\n` +
        (text.replace(/```html/gi, '').replace(/```/gi, '').trim() || 'Không thể tạo kịch bản.')
      );
    } catch (error) {
      setAiResponse(`Lỗi API: ${error.message || 'Vui lòng kiểm tra lại API Key hoặc mạng.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header - Màu Xanh da trời */}
      <header className="bg-sky-500 text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg flex items-center justify-center h-12 w-20 overflow-hidden">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFQyjdYt_mt19cs0SMTyVJFJtftyv7FG4tAg&s" 
                alt="Aptamil Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                APTAMIL CONTENT ASSISTANT
              </h1>
              <p className="text-xs text-sky-100">
                Trợ lý sáng tạo nội dung chuẩn Guideline
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] bg-sky-600 px-2 py-1 rounded font-bold">
              VERSION PRO
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm p-1 gap-1 overflow-x-auto">
          {[
            { id: 'guidelines', label: 'Quy chuẩn Ảnh/Video', icon: <Camera size={18} /> },
            { id: 'usps', label: 'Từ điển Phát âm', icon: <Mic size={18} /> },
            { id: 'ai', label: 'Tạo Kịch Bản AI', icon: <Video size={18} /> },
            { id: 'check', label: 'Checklist & Red Flags', icon: <AlertTriangle size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-bold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Guidelines */}
        {activeTab === 'guidelines' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-sky-500">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <Layers size={20} className="text-sky-500" /> Outfit & Background
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">•</span>
                    <span><strong>Màu sắc:</strong> Xanh dương, Trắng (màu brand) hoặc Neutral. Kín đáo, chỉn chu.</span>
                  </li>
                  <li className="flex gap-2 text-red-500 font-medium">
                    <span>✕</span>
                    <span>Cấm: Áo 2 dây, hở bụng, croptop, váy ngắn trên đầu gối.</span>
                  </li>
                  <li className="flex gap-2 text-red-500 font-medium">
                    <span>✕</span>
                    <span>Cấm bối cảnh: Màu vàng hoặc xanh ngọc (màu đối thủ). Background lộn xộn, nguy hiểm.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">•</span>
                    <span><strong>Bối cảnh:</strong> Sạch sẽ, đủ sáng. Mộc mạc. Tránh setup quá nhiều đồ sơ sinh.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-400">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <Milk size={20} className="text-amber-500" /> Cảnh Quay Sản Phẩm
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Đặt thẳng đứng, chính diện. Thấy rõ Tên và Số trên lon.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Che mã QR & mã vạch bằng Sticker</strong> (Không dùng hiệu ứng làm mờ).</span>
                  </li>
                  <li className="flex gap-2 text-red-500 font-medium">
                    <span>✕</span>
                    <span>Không quay crop mất logo, không để vật khác che khuất.</span>
                  </li>
                  <li className="flex gap-2 text-red-500 font-medium">
                    <span>✕</span>
                    <span>Tuyệt đối không lọt thương hiệu đối thủ vào khung hình.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-sky-50 p-5 rounded-2xl border border-sky-200">
              <h3 className="font-bold text-sky-700 mb-3 flex items-center gap-2">
                <Baby size={20} /> Quy Tắc Quay Em Bé & Cảnh Pha Sữa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
                  <p className="font-bold text-red-500 mb-2 border-b pb-2">NGUYÊN TẮC CẤM:</p>
                  <ul className="space-y-2 text-slate-700">
                    <li>- <strong>KHÔNG</strong> dùng hình ảnh bé sơ sinh (yếu ớt).</li>
                    <li>- <strong>KHÔNG</strong> quay cảnh bé bú bình có núm ti.</li>
                    <li>- <strong>KHÔNG</strong> pha sữa trực tiếp trong bình bú sơ sinh.</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
                  <p className="font-bold text-green-600 mb-2 border-b pb-2">ĐƯỢC PHÉP LÀM:</p>
                  <ul className="space-y-2 text-slate-700">
                    <li>- Bé bụ bẫm, khỏe khoắn, đang chơi đùa/ngủ ngon.</li>
                    <li>- Chỉ quay cảnh <strong>đôi tay mẹ pha sữa</strong> (đong -&gt; rót nước -&gt; khuấy -&gt; đút bằng muỗng).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Phát Âm & Dưỡng Chất */}
        {activeTab === 'usps' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-sky-500 text-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mic size={24} /> Từ Điển Phát Âm Bắt Buộc
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {usps.map((usp, index) => (
                  <div key={index} className="bg-white/10 p-3 rounded-xl border border-white/20 flex flex-col justify-between">
                    <div className="flex justify-between items-start border-b border-white/10 pb-2 mb-2">
                      <span className="font-bold text-sky-50">{usp.term}</span>
                      <span className="text-amber-300 font-mono font-bold text-sm bg-black/20 px-2 py-0.5 rounded">
                        {usp.read}
                      </span>
                    </div>
                    <div className="text-xs text-sky-100 leading-relaxed">
                      {usp.benefit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm text-center border-b-4 border-sky-400">
                  <span className="text-2xl font-black text-sky-500">#{p.id}</span>
                  <p className="font-bold mt-1 text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500 mb-2">{p.age}</p>
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    {p.focus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: AI Script Generator */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              
              {/* BƯỚC 1: CHỌN PHÂN LOẠI */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    1. Chọn Phân Loại Content
                  </label>
                  <button 
                    onClick={handleLoadSheet} 
                    className="text-xs text-sky-600 hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 flex items-center gap-1 font-bold transition-colors"
                    title="Bấm để lấy dữ liệu mới nhất nếu bạn vừa cập nhật Google Sheet"
                  >
                    🔄 Làm mới dữ liệu
                  </button>
                </div>
                
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={categories.length === 0}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))
                    ) : (
                      <option value="">(Đang tải dữ liệu từ Sheet...)</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    ▼
                  </div>
                </div>
                {loadStatus && (
                  <p className={`mt-2 text-xs font-medium italic ${loadStatus.includes('❌') ? 'text-red-500' : 'text-slate-500'}`}>
                    {loadStatus}
                  </p>
                )}
              </div>

              {/* BƯỚC 2: NÚT TẠO KỊCH BẢN */}
              <button
                onClick={generateScript}
                disabled={loading || categories.length === 0}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  loading || categories.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {loading ? 'AI Đang Bốc Thăm & Viết Bài...' : '✨ Tự Động Bốc Thăm & Viết Kịch Bản'}
                {!loading && <Video size={18} />}
              </button>
            </div>

            {/* KHU VỰC HIỂN THỊ KẾT QUẢ AI */}
            {aiResponse && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-sky-400 animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-lg text-sky-600 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" /> Bản Nháp (Bám sát file Sheet)
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResponse.trim());
                      alert('Đã copy kịch bản!');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors"
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Checklist & Red Flags */}
        {activeTab === 'check' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
              <h2 className="text-xl font-black mb-6 text-red-500 flex items-center gap-2 uppercase">
                <AlertTriangle size={24} /> Vùng Cấm (Red Flags)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Từ vựng cấm',
                    desc: 'Ngăn ngừa, chữa khỏi, 100%, hoàn toàn, đảm bảo, bé hết táo bón.',
                  },
                  {
                    title: 'Thuật ngữ nhạy cảm',
                    desc: "Không dùng 'Chứng minh lâm sàng', 'Độc quyền', hay các thuật ngữ y khoa trị bệnh.",
                  },
                  {
                    title: 'Hình ảnh bé',
                    desc: 'Tuyệt đối không dùng bé sơ sinh, yếu ớt, mong manh.',
                  },
                  {
                    title: 'Phụ kiện Cấm',
                    desc: 'Tuyệt đối KHÔNG quay cảnh bé bú bình có núm ti.',
                  },
                  {
                    title: 'Lỗi hiển thị',
                    desc: 'Không hiển thị Số 1 trên lon đối với Content không nhắc đến số 1. Cấm lọt logo đối thủ.',
                  },
                  {
                    title: 'Lỗi trang phục',
                    desc: 'Áo 2 dây, hở ngực, hở bụng, croptop, váy ngắn trên đầu gối.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start p-4 bg-red-50/50 rounded-xl border border-red-100">
                    <div className="bg-red-500 text-white p-0.5 rounded-full mt-0.5 flex-shrink-0">
                      <span className="text-[10px] font-bold block w-4 h-4 text-center leading-4">✕</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-red-800 mb-1">{item.title}</span>
                      <span className="text-xs text-red-700">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200">
              <h2 className="text-xl font-black mb-6 text-green-600 flex items-center gap-2 uppercase">
                <CheckCircle size={24} /> Checklist Trước Khi Đăng
              </h2>
              <div className="space-y-3">
                {[
                  'Phát âm TẤT CẢ từ khóa đã chuẩn chưa? (Xin-bai-ô-tíc, Đê-hắc-a...)',
                  'Sản phẩm đặt thẳng, chính diện, KHÔNG bị vật khác che khuất logo?',
                  'Đã che mã QR và mã vạch ở đáy/hông lon bằng Sticker dễ thương chưa?',
                  'Outfit tone Xanh/Trắng/Neutral lịch sự và Background đã gọn gàng chưa?',
                  "Text/Voice dùng đúng từ: 'Hỗ trợ', 'Giúp', 'Phù hợp', 'Góp phần' chưa?",
                  'Đã gắn đủ 3 Hashtags bắt buộc chưa?',
                ].map((item, i) => (
                  <label key={i} className="flex items-start gap-3 p-4 bg-green-50/30 rounded-xl cursor-pointer hover:bg-green-50 transition-colors border border-transparent hover:border-green-100">
                    <input type="checkbox" className="w-5 h-5 mt-0.5 rounded border-slate-300 text-green-500 focus:ring-green-400" />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;