import React, { useState } from 'react';
import {
  Baby,
  Video,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Milk,
  Layers,
  Camera,
  Mic,
  Copy,
} from 'lucide-react';

const APTAMIL_BLUE = '#003087';

const App = () => {
  const [activeTab, setActiveTab] = useState('guidelines');
  const [selectedPillar, setSelectedPillar] = useState('vlog');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(
    'AIzaSyCpZkvnLY9Cx_4-FnYEt_BCBbOMooosfrc'
  );

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

  // 2. DATA: PILLARS (Chuẩn 100% theo Brief)
  const pillars = {
    soan_gio: {
      title: 'Soạn Giỏ Sinh',
      focus: 'Chuẩn bị đi sinh',
      message: 'Aptamil là vật dụng thiết yếu không thể thiếu.',
      tags: ['#AptamilNewZealand3', '#DeKhangTriNao', '#DiSinh'],
    },
    pha_sua: {
      title: 'Pha Sữa Cùng Mẹ',
      focus: 'Hướng dẫn pha sữa',
      message: 'Lựa chọn an toàn, đúng chuẩn cho bé.',
      tags: ['#AptamilNewZealand3', '#AptamilKID', '#PhaSuaChuan'],
    },
    unbox: {
      title: 'Unbox Bỉm Sữa',
      focus: 'Khui đơn hàng',
      message: 'Định vị cao cấp, khoản đầu tư xứng đáng.',
      tags: ['#AptamilNewZealand3', '#UnboxBimSua', '#DeKhangTriNao'],
    },
    khoe_goc: {
      title: 'Khoe Góc Bỉm Sữa',
      focus: 'Góc chăm bé',
      message: 'Lựa chọn đáng tin cậy trong thói quen chăm con.',
      tags: ['#AptamilNewZealand3', '#GocBimSua', '#AptamilKID'],
    },
    vlog: {
      title: 'Vlog Mẹ Gen Z',
      focus: 'Một ngày của mẹ',
      message: 'Aptamil là người bạn đồng hành đa nhiệm.',
      tags: ['#AptamilNewZealand3', '#DailyVlog', '#MeGenZ'],
    },
    flexing: {
      title: 'Thế hệ cợt nhả',
      focus: 'Flexing bé khỏe',
      message: 'Aptamil là khoản đầu tư tốt nhất.',
      tags: ['#AptamilNewZealand3', '#Flexing', '#AptamilKID'],
    },
    qa: {
      title: 'Chọn mặt gửi vàng',
      focus: 'Q&A / Chia sẻ POV',
      message: 'Giải đáp thắc mắc về sữa công thức.',
      tags: ['#AptamilNewZealand3', '#DeKhangTriNao', '#ChiaSeKinhNghiem'],
    },
    compare: {
      title: 'So sánh các dòng sữa',
      focus: 'Review So Sánh',
      message: 'Lựa chọn không áp lực cho từng giai đoạn.',
      tags: ['#AptamilNewZealand3', '#SoSanhSua', '#AptamilKID'],
    },
  };

  // 3. DATA: PHÁT ÂM & DƯỠNG CHẤT
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

  const generateScript = async () => {
    setLoading(true);
    setAiResponse('');

    // Tối ưu System Prompt dựa trên Guideline của Brief
    const systemPrompt = `Bạn là Copywriter xuất sắc chuyên viết kịch bản TikTok/Reels cho thương hiệu sữa Aptamil New Zealand.
    Đề bài: Viết kịch bản video ngắn (dưới 60s) dựa trên Pillar [${pillars[selectedPillar].title}] và bối cảnh: "${aiPrompt}".
    
    YÊU CẦU BẮT BUỘC:
    1. Giọng văn: Gần gũi, đời thường, thấu hiểu tâm lý mẹ bỉm sữa Gen Z.
    2. Thông điệp: Phải truyền tải được Key Message: "${pillars[selectedPillar].message}".
    3. Lồng ghép tự nhiên ít nhất 1 USP: SYNBIOTIC (hỗ trợ đề kháng/sinh mổ) hoặc DHA (phát triển trí não).
    4. TỪ VỰNG CHO PHÉP: "hỗ trợ", "giúp", "phù hợp", "góp phần". Chia sẻ góc độ trải nghiệm cá nhân ("Mình thấy bé...", "Bé có vẻ...").
    5. TỪ VỰNG CẤM DÙNG (Tuyệt đối không có trong kịch bản): "ngăn ngừa", "chữa khỏi", "hoàn toàn", "100%", "đảm bảo", "chứng minh lâm sàng", "độc quyền", "bé hết táo bón", "tăng đề kháng trong 3 ngày". Không dùng thuật ngữ y khoa điều trị.
    6. Cấu trúc: Hook (gây chú ý) -> Body (câu chuyện/vấn đề + giải pháp Aptamil) -> CTA (câu hỏi tương tác). Trình bày rõ Cột Hình / Cột Âm thanh.
    7. Cuối bài luôn kèm bộ Hashtag: #AptamilNewZealand3 #AptamilKID #DeKhangTriNao`;

    try {
      // Dùng mẫu URL gọi API chuẩn (Nhớ thay thế model phù hợp nếu bạn dùng API thật)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Bối cảnh chi tiết: ${aiPrompt}` }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.7 },
          }),
        }
      );

      const result = await response.json();
      if (result.error) throw new Error(result.error.message);

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      // Dọn rác markdown nếu có
      setAiResponse(
        text
          .replace(/```html/gi, '')
          .replace(/```/gi, '')
          .trim() || 'Không thể tạo kịch bản.'
      );
    } catch (error) {
      setAiResponse(
        `Lỗi API: ${
          error.message || 'Vui lòng kiểm tra lại API Key hoặc mạng.'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-[#003087] text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Milk size={28} color="#003087" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                APTAMIL CONTENT ASSISTANT
              </h1>
              <p className="text-xs text-blue-200">
                Trợ lý sáng tạo nội dung chuẩn Guideline
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] bg-blue-800 px-2 py-1 rounded">
              VERSION PRO
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm p-1 gap-1 overflow-x-auto">
          {[
            {
              id: 'guidelines',
              label: 'Quy chuẩn Ảnh/Video',
              icon: <Camera size={18} />,
            },
            { id: 'usps', label: 'Từ điển Phát âm', icon: <Mic size={18} /> },
            { id: 'ai', label: 'Tạo Kịch Bản AI', icon: <Video size={18} /> },
            {
              id: 'check',
              label: 'Checklist & Red Flags',
              icon: <AlertTriangle size={18} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-bold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#003087] text-white shadow-md'
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
              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-600">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <Layers size={20} className="text-blue-600" /> Outfit &
                  Background
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Màu sắc:</strong> Xanh dương, Trắng (màu brand)
                      hoặc Neutral. Kín đáo, chỉn chu.
                    </span>
                  </li>
                  <li className="flex gap-2 text-red-600 font-medium">
                    <span>✕</span>
                    <span>
                      Cấm: Áo 2 dây, hở bụng, croptop, váy ngắn trên đầu gối.
                    </span>
                  </li>
                  <li className="flex gap-2 text-red-600 font-medium">
                    <span>✕</span>
                    <span>
                      Cấm bối cảnh: Màu vàng hoặc xanh ngọc (màu đối thủ).
                      Background lộn xộn, nguy hiểm (dây điện).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Bối cảnh:</strong> Sạch sẽ, đủ sáng. Giao diện
                      quen thuộc, mộc mạc. Tránh setup quá nhiều đồ sơ sinh gây
                      hiểu lầm độ tuổi.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-500">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <Milk size={20} className="text-amber-500" /> Cảnh Quay Sản
                  Phẩm
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <CheckCircle
                      size={16}
                      className="text-green-500 flex-shrink-0 mt-0.5"
                    />
                    <span>
                      Đặt thẳng đứng, chính diện. Thấy rõ Tên và Số trên lon.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle
                      size={16}
                      className="text-green-500 flex-shrink-0 mt-0.5"
                    />
                    <span>
                      <strong>Che mã QR & mã vạch bằng Sticker</strong> (Không
                      dùng hiệu ứng làm mờ).
                    </span>
                  </li>
                  <li className="flex gap-2 text-red-600 font-medium">
                    <span>✕</span>
                    <span>
                      Không quay crop mất logo, không để vật khác che khuất.
                    </span>
                  </li>
                  <li className="flex gap-2 text-red-600 font-medium">
                    <span>✕</span>
                    <span>
                      Tuyệt đối không lọt thương hiệu đối thủ vào khung hình.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Baby size={20} /> Quy Tắc Quay Em Bé & Cảnh Pha Sữa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-xl border border-blue-100">
                  <p className="font-bold text-red-600 mb-2 border-b pb-2">
                    NGUYÊN TẮC CẤM:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>
                      - <strong>KHÔNG</strong> dùng hình ảnh bé sơ sinh (nhìn
                      yếu ớt, mỏng manh).
                    </li>
                    <li>
                      - <strong>KHÔNG</strong> quay cảnh bé bú bình có núm ti.
                    </li>
                    <li>
                      - <strong>KHÔNG</strong> pha sữa trực tiếp trong bình bú
                      sơ sinh.
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100">
                  <p className="font-bold text-green-600 mb-2 border-b pb-2">
                    ĐƯỢC PHÉP LÀM:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>
                      - Bé bụ bẫm, khỏe khoắn, lanh lợi, đang chơi đùa/ngủ ngon.
                    </li>
                    <li>
                      - Chỉ quay cảnh <strong>đôi tay mẹ pha sữa</strong> (đong
                      sữa -> rót nước -> khuấy -> đút bằng muỗng hoặc cốc tập
                      uống).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Phát Âm & Dưỡng Chất */}
        {activeTab === 'usps' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-[#003087] text-white p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mic size={24} /> Từ Điển Phát Âm Bắt Buộc
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {usps.map((usp, index) => (
                  <div
                    key={index}
                    className="bg-white/10 p-3 rounded-xl border border-white/20 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start border-b border-white/10 pb-2 mb-2">
                      <span className="font-bold text-blue-50">{usp.term}</span>
                      <span className="text-amber-300 font-mono font-bold text-sm bg-black/20 px-2 py-0.5 rounded">
                        {usp.read}
                      </span>
                    </div>
                    <div className="text-xs text-blue-100 leading-relaxed">
                      {usp.benefit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl shadow-sm text-center border-b-4 border-[#003087]"
                >
                  <span className="text-2xl font-black text-[#003087]">
                    #{p.id}
                  </span>
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
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  1. Chọn Định Hướng (Pillar)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(pillars).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPillar(key)}
                      className={`p-3 rounded-xl text-xs font-bold transition-all border-2 text-left ${
                        selectedPillar === key
                          ? 'border-[#003087] bg-blue-50 text-[#003087]'
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-blue-200'
                      }`}
                    >
                      <div className="mb-1">{pillars[key].title}</div>
                      <div className="font-normal text-[10px] opacity-80">
                        {pillars[key].focus}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-2">
                  <Sparkles
                    size={16}
                    className="text-amber-500 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-slate-600 font-medium">
                    <span className="font-bold">
                      Key message cần truyền tải:
                    </span>{' '}
                    {pillars[selectedPillar].message}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  2. Cung cấp Brief cho AI (Ngữ cảnh / Tình huống)
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ví dụ: Mẹ đang review đồ dọn giỏ đi sinh, liệt kê quần áo, bỉm... Nhấn mạnh lý do vì sao hộp Aptamil số 1 lại là món quan trọng nhất..."
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#003087] focus:border-transparent outline-none min-h-[120px] text-sm"
                />
              </div>

              <button
                onClick={generateScript}
                disabled={loading || !aiPrompt || !apiKey}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  loading || !aiPrompt || !apiKey
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#003087] text-white hover:bg-blue-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {loading
                  ? 'AI Đang Suy Nghĩ & Viết Bài...'
                  : 'Tạo Kịch Bản Chuẩn Hãng'}
                {!loading && <Video size={18} />}
              </button>
            </div>

            {aiResponse && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-blue-200 animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-lg text-[#003087] flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" /> Bản
                    Nháp (Đã Lọc Từ Ngữ)
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResponse);
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
                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  {pillars[selectedPillar].tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Checklist & Red Flags */}
        {activeTab === 'check' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
              <h2 className="text-xl font-black mb-6 text-red-600 flex items-center gap-2 uppercase">
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
                  <div
                    key={i}
                    className="flex gap-3 items-start p-4 bg-red-50/50 rounded-xl border border-red-100"
                  >
                    <div className="bg-red-500 text-white p-0.5 rounded-full mt-0.5 flex-shrink-0">
                      <span className="text-[10px] font-bold block w-4 h-4 text-center leading-4">
                        ✕
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-red-800 block mb-1">
                        {item.title}
                      </span>
                      <span className="text-xs text-red-700">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200">
              <h2 className="text-xl font-black mb-6 text-green-700 flex items-center gap-2 uppercase">
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
                  <label
                    key={i}
                    className="flex items-start gap-3 p-4 bg-green-50/30 rounded-xl cursor-pointer hover:bg-green-50 transition-colors border border-transparent hover:border-green-100"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating API Key input */}
      {activeTab === 'ai' && !apiKey && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-amber-50 border-t border-amber-200 z-20 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <p className="text-xs font-bold text-amber-800 flex items-center gap-2">
              <AlertTriangle size={16} /> Nhập API Key (Gemini) để mở khóa tính
              năng AI:
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 p-2.5 rounded-lg border-2 border-amber-300 focus:border-amber-500 outline-none text-sm font-mono w-full sm:w-auto"
              placeholder="Dán API Key vào đây..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
