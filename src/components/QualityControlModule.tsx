import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Printer,
  Sliders,
  Award,
  Layers,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useWarehouse } from '../services/warehouseStore';
import { QCTicket, QCEvaluation } from '../types';

export const QualityControlModule: React.FC = () => {
  const {
    qcTickets,
    qcCriteria,
    evaluateQCTicket,
    currentUser,
    setActiveBarcodePrint
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'tickets' | 'criteria'>('tickets');
  const [filterEval, setFilterEval] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingTicket, setInspectingTicket] = useState<QCTicket | null>(null);

  // Form states during inspection evaluation
  const [evalDecision, setEvalDecision] = useState<QCEvaluation>('PASS');
  const [evalNotes, setEvalNotes] = useState('');
  const [evalCheckDetails, setEvalCheckDetails] = useState<any[]>([]);

  const handleStartInspection = (ticket: QCTicket) => {
    setInspectingTicket(ticket);
    setEvalDecision(ticket.evaluation === 'PENDING' ? 'PASS' : ticket.evaluation);
    setEvalNotes(ticket.notes || '');
    setEvalCheckDetails(
      ticket.checkDetails.map(cd => ({
        ...cd,
        passed: cd.passed ?? true,
        actualValue: cd.actualValue === 'Chờ đo kiểm tra' ? 'Đạt tiêu chuẩn kỹ thuật' : cd.actualValue
      }))
    );
  };

  const handleSaveEvaluation = () => {
    if (!inspectingTicket) return;
    evaluateQCTicket(inspectingTicket.id, evalDecision, evalCheckDetails, evalNotes);
    alert(`Đã lưu kết quả kiểm định ${evalDecision} cho phiếu ${inspectingTicket.code} thành công!`);
    setInspectingTicket(null);
  };

  const filteredTickets = qcTickets.filter(t => {
    if (filterEval !== 'ALL' && t.evaluation !== filterEval) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.materialCode.toLowerCase().includes(q) ||
        t.materialName.toLowerCase().includes(q) ||
        t.batchNumber.toLowerCase().includes(q) ||
        t.receivingOrderCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getEvaluationBadge = (evaluation: QCEvaluation) => {
    switch (evaluation) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Đang Chờ Kiểm</span>;
      case 'PASS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Đạt (QC Pass)</span>;
      case 'FAIL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Không Đạt (Fail)</span>;
      case 'CONCESSION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Nhân Nhượng</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" /> Quality Control & Inspection
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Kiểm Tra Chất Lượng & Đánh Giá QC (UC12 - UC14)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm tra ngoại quan, CO/CQ, đo đạc kích thước & tính năng điện tử trước khi cho phép lưu kho lên kệ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Phiếu Kiểm Định ({qcTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'criteria'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Bộ Tiêu Chí QC ({qcCriteria.length})
          </button>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã phiếu QC, SKU, Batch, PO..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-64"
                />
              </div>

              <select
                value={filterEval}
                onChange={e => setFilterEval(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="ALL">Tất cả kết quả</option>
                <option value="PENDING">Đang chờ kiểm</option>
                <option value="PASS">QC Đạt (Pass)</option>
                <option value="FAIL">Không đạt (Fail)</option>
                <option value="CONCESSION">Nhân nhượng</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Tìm thấy <strong className="text-slate-800">{filteredTickets.length}</strong> phiếu kiểm
            </span>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Mã Phiếu QC</th>
                    <th className="p-3.5">Phiếu Nhận Hàng</th>
                    <th className="p-3.5">Vật Tư & SKU</th>
                    <th className="p-3.5">Mã Lô (Batch No)</th>
                    <th className="p-3.5">Cỡ Mẫu / Tổng Lô</th>
                    <th className="p-3.5">Người Kiểm</th>
                    <th className="p-3.5">Ngày Kiểm</th>
                    <th className="p-3.5">Đánh Giá</th>
                    <th className="p-3.5 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700">
                        {ticket.code}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {ticket.receivingOrderCode}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{ticket.materialCode}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{ticket.materialName}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 font-semibold">
                        {ticket.batchNumber}
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="text-blue-700 font-bold">{ticket.sampleQuantity}</span>
                        <span className="text-slate-400"> / {ticket.lotQuantity}</span>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">
                        {ticket.inspector}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">
                        {ticket.inspectionDate}
                      </td>
                      <td className="p-3.5">
                        {getEvaluationBadge(ticket.evaluation)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleStartInspection(ticket)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          {ticket.evaluation === 'PENDING' ? 'Đo & Đánh Giá' : 'Xem / Cập Nhật'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* QC Criteria View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Danh Mục Tiêu Chí Đánh Giá Chất Lượng</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Áp dụng bắt buộc cho các nhóm Linh kiện điện tử, Cơ khí kim loại và Hoá chất công nghiệp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qcCriteria.map(cri => (
              <div key={cri.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{cri.name}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    cri.importance === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {cri.importance}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Yêu cầu tiêu chuẩn: </span>
                  <span className="text-slate-800 font-semibold">{cri.standardValue}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Phương pháp đo kiểm: </span>
                  <span className="text-slate-700">{cri.testMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspecting & Evaluation Modal */}
      {inspectingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Đánh Giá Tiêu Chuẩn Chất Lượng Vật Tư
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  {inspectingTicket.code} • {inspectingTicket.materialCode}
                </h3>
              </div>
              <button
                onClick={() => setInspectingTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Summary card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                <div>
                  <span className="text-blue-600 font-medium block">Tên Vật Tư:</span>
                  <span className="font-bold text-slate-900">{inspectingTicket.materialName}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium block">Số Lô (Batch):</span>
                  <span className="font-bold text-slate-900 font-mono">{inspectingTicket.batchNumber}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium block">Lấy Mẫu / Tổng:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {inspectingTicket.sampleQuantity} / {inspectingTicket.lotQuantity}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium block">Phiếu Nhận:</span>
                  <span className="font-bold text-slate-900 font-mono">{inspectingTicket.receivingOrderCode}</span>
                </div>
              </div>

              {/* Criteria Checklist */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Bảng Kiểm Tra Từng Tiêu Chí Kỹ Thuật:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {evalCheckDetails.map((detail, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{detail.criterionName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Tiêu chuẩn: <span className="font-medium text-slate-700">{detail.standardValue}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={detail.actualValue}
                          onChange={e => {
                            const updated = [...evalCheckDetails];
                            updated[idx].actualValue = e.target.value;
                            setEvalCheckDetails(updated);
                          }}
                          placeholder="Thực tế đo được..."
                          className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg w-48 bg-slate-50 focus:bg-white"
                        />

                        {/* Pass / Fail Toggle */}
                        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...evalCheckDetails];
                              updated[idx].passed = true;
                              setEvalCheckDetails(updated);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                              detail.passed ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Đạt
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...evalCheckDetails];
                              updated[idx].passed = false;
                              setEvalCheckDetails(updated);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                              !detail.passed ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Không Đạt
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation Decision */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-900">Kết Luận Đánh Giá Chất Lượng Chung:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'PASS' as QCEvaluation, label: 'ĐẠT (QC PASS)', desc: 'Cho phép lưu kho lên kệ', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                    { val: 'FAIL' as QCEvaluation, label: 'KHÔNG ĐẠT (FAIL)', desc: 'Từ chối, cách ly hàng lỗi', color: 'border-rose-500 bg-rose-50 text-rose-900' },
                    { val: 'CONCESSION' as QCEvaluation, label: 'NHÂN NHƯỢNG', desc: 'Sử dụng có điều kiện', color: 'border-purple-500 bg-purple-50 text-purple-900' }
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setEvalDecision(opt.val)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        evalDecision === opt.val
                          ? `${opt.color} ring-2 ring-blue-500/20 font-bold`
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Ghi Chú Kết Luận & Khuyến Nghị:</label>
                  <textarea
                    rows={2}
                    value={evalNotes}
                    onChange={e => setEvalNotes(e.target.value)}
                    placeholder="Ghi chú chi tiết kết quả thử nghiệm..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                Người kiểm định: <strong>{currentUser.fullName}</strong>
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInspectingTicket(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Xác Nhận & Lưu Kết Quả QC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
