import React, { useState } from 'react';
import {
  Truck,
  Plus,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Barcode,
  Package,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useWarehouse } from '../services/warehouseStore';
import { ReceivingType, ReceivingOrder } from '../types';

export const ReceivingModule: React.FC = () => {
  const {
    receivingOrders,
    materials,
    createReceivingOrder,
    setActiveBarcodePrint,
    currentUser
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ReceivingOrder | null>(null);

  // Form states for creating a receiving order
  const [orderType, setOrderType] = useState<ReceivingType>('PO');
  const [poNumber, setPoNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<{
    materialId: string;
    receivedQuantity: number;
    batchNumber: string;
    manufactureDate: string;
    expiryDate: string;
    note: string;
  }[]>([
    {
      materialId: materials[0]?.id || '',
      receivedQuantity: 100,
      batchNumber: `BAT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
      manufactureDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      note: ''
    }
  ]);

  const handleAddItemRow = () => {
    setOrderItems([
      ...orderItems,
      {
        materialId: materials[0]?.id || '',
        receivedQuantity: 50,
        batchNumber: `BAT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0${orderItems.length + 1}`,
        manufactureDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        note: ''
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    (updated[index] as any)[field] = value;
    setOrderItems(updated);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim() && orderType !== 'INTERNAL_RETURN') {
      alert('Vui lòng nhập tên nhà cung cấp!');
      return;
    }

    const itemsPayload = orderItems.map((item, idx) => {
      const mat = materials.find(m => m.id === item.materialId);
      return {
        id: `RI-${Date.now()}-${idx}`,
        materialId: item.materialId,
        materialCode: mat?.code || '',
        materialName: mat?.name || '',
        unit: mat?.unit || '',
        poQuantity: item.receivedQuantity,
        receivedQuantity: Number(item.receivedQuantity),
        batchNumber: item.batchNumber,
        manufactureDate: item.manufactureDate,
        expiryDate: item.expiryDate,
        note: item.note
      };
    });

    const newOrder = createReceivingOrder({
      type: orderType,
      poNumber: poNumber.trim() || undefined,
      supplier: orderType === 'INTERNAL_RETURN' ? 'Xưởng Sản Xuất Nội Bộ' : supplier,
      notes,
      items: itemsPayload
    });

    alert(`Đã tạo phiếu nhận hàng ${newOrder.code} thành công! Hệ thống đã tự động chuyển sang quy trình kiểm định chất lượng QC.`);
    setActiveTab('list');
    setSelectedOrder(newOrder);
  };

  const filteredOrders = receivingOrders.filter(order => {
    if (filterType !== 'ALL' && order.type !== filterType) return false;
    if (filterStatus !== 'ALL' && order.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = order.code.toLowerCase().includes(q);
      const matchPO = order.poNumber?.toLowerCase().includes(q);
      const matchSupplier = order.supplier.toLowerCase().includes(q);
      const matchItem = order.items.some(
        it => it.materialCode.toLowerCase().includes(q) || it.materialName.toLowerCase().includes(q)
      );
      return matchCode || matchPO || matchSupplier || matchItem;
    }
    return true;
  });

  const getStatusBadge = (status: ReceivingOrder['status']) => {
    switch (status) {
      case 'WAITING_QC':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Chờ Kiểm QC</span>;
      case 'QC_IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Đang Đo Kiểm</span>;
      case 'QC_PASSED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> QC Đạt - Chờ Lưu Kho</span>;
      case 'QC_REJECTED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> QC Từ Chối</span>;
      case 'PUTAWAY_COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Đã Lưu Lên Kệ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" /> Inbound Logistics & Receiving
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Quản Lý Nhận Hàng & Tạm Nhận Vật Tư (UC03 - UC07)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Nhận hàng theo PO nhà cung cấp, hàng mẫu không PO, hoặc thu hồi thừa từ chuyền sản xuất nội bộ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Danh Sách Phiếu ({receivingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Tạo Phiếu Nhận Hàng
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* Create Receiving Order Form */
        <form onSubmit={handleCreateOrder} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="font-bold text-slate-900 text-base">Thông Tin Phiếu Nhận Hàng Mới</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống sẽ sinh mã số phiếu tự động và tạo liên kết kiểm tra QC đối với các nhóm vật tư yêu cầu kiểm định.
            </p>
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: 'PO' as ReceivingType, label: 'Nhận theo PO', desc: 'Có đơn đặt hàng từ nhà cung cấp' },
              { type: 'NON_PO' as ReceivingType, label: 'Nhận không PO (Mẫu / Khẩn)', desc: 'Hàng mẫu thử nghiệm, quà tặng, linh kiện khẩn' },
              { type: 'INTERNAL_RETURN' as ReceivingType, label: 'Nhận trả nội bộ', desc: 'Xưởng sản xuất hoàn trả vật tư dư thừa' }
            ].map(t => (
              <button
                type="button"
                key={t.type}
                onClick={() => setOrderType(t.type)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  orderType === t.type
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{t.label}</div>
                <div className="text-[11px] text-slate-500 mt-1">{t.desc}</div>
              </button>
            ))}
          </div>

          {/* Header Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderType === 'PO' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số Đơn Mua Hàng (PO No.) *
                </label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={e => setPoNumber(e.target.value)}
                  placeholder="e.g. PO-2026-0815"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {orderType === 'INTERNAL_RETURN' ? 'Đơn vị / Chuyền giao hoàn trả *' : 'Nhà Cung Cấp / Đơn Vị Giao *'}
              </label>
              <input
                type="text"
                required
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder={orderType === 'INTERNAL_RETURN' ? 'e.g. Chuyền SMT 1 - Xưởng 1' : 'e.g. STMicroelectronics, Nichicon...'}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ghi Chú Vận Chuyển / Kiện Hàng
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Số kiện, tình trạng niêm phong, tài xế..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Item List Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Danh Sách Vật Tư Nhận Thực Tế
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Dòng Vật Tư
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Mã & Tên Vật Tư (SKU)</th>
                    <th className="p-3">Số Lượng</th>
                    <th className="p-3">Mã Lô (Batch No)</th>
                    <th className="p-3">Ngày SX</th>
                    <th className="p-3">Hạn Dùng (EXP)</th>
                    <th className="p-3">Ghi Chú</th>
                    <th className="p-3 w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orderItems.map((item, idx) => {
                    const selMat = materials.find(m => m.id === item.materialId);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 min-w-[220px]">
                          <select
                            value={item.materialId}
                            onChange={e => handleItemChange(idx, 'materialId', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                          >
                            {materials.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.code} - {m.name} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 w-28">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={item.receivedQuantity}
                              onChange={e => handleItemChange(idx, 'receivedQuantity', Math.max(1, Number(e.target.value)))}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono font-bold text-blue-700 text-right"
                            />
                            <span className="text-[11px] text-slate-500 shrink-0">{selMat?.unit}</span>
                          </div>
                        </td>
                        <td className="p-3 min-w-[150px]">
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={e => handleItemChange(idx, 'batchNumber', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono"
                          />
                        </td>
                        <td className="p-3 w-32">
                          <input
                            type="date"
                            value={item.manufactureDate}
                            onChange={e => handleItemChange(idx, 'manufactureDate', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono"
                          />
                        </td>
                        <td className="p-3 w-32">
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={e => handleItemChange(idx, 'expiryDate', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-mono text-rose-600 font-semibold"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.note}
                            onChange={e => handleItemChange(idx, 'note', e.target.value)}
                            placeholder="Khay/cuộn..."
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={orderItems.length === 1}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer"
            >
              Lưu & Xác Nhận Tạm Nhận Hàng
            </button>
          </div>
        </form>
      ) : (
        /* List View of Receiving Orders */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm số phiếu, PO, nhà cung cấp..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-56 sm:w-64"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="ALL">Tất cả loại nhận</option>
                <option value="PO">Có PO</option>
                <option value="NON_PO">Không PO (Mẫu/Khẩn)</option>
                <option value="INTERNAL_RETURN">Trả nội bộ</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="WAITING_QC">Chờ kiểm QC</option>
                <option value="QC_IN_PROGRESS">Đang kiểm QC</option>
                <option value="QC_PASSED">QC Đạt</option>
                <option value="QC_REJECTED">QC Từ chối</option>
                <option value="PUTAWAY_COMPLETED">Đã lưu kho</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Tìm thấy <strong className="text-slate-800">{filteredOrders.length}</strong> phiếu nhận
            </span>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Mã Phiếu</th>
                    <th className="p-3.5">Loại</th>
                    <th className="p-3.5">Số PO / Đơn Hàng</th>
                    <th className="p-3.5">Nhà Cung Cấp</th>
                    <th className="p-3.5">Số Mục</th>
                    <th className="p-3.5">Ngày Nhận</th>
                    <th className="p-3.5">Người Nhận</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700">
                        {order.code}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {order.type === 'PO' ? 'PO' : order.type === 'NON_PO' ? 'Không PO' : 'Trả nội bộ'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-slate-800">
                        {order.poNumber || '—'}
                      </td>
                      <td className="p-3.5 font-medium text-slate-800 max-w-[200px] truncate">
                        {order.supplier}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-600">
                        {order.items.length} mặt hàng
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">
                        {order.receivedDate}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {order.receiver}
                      </td>
                      <td className="p-3.5">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Chi Tiết Phiếu Nhận Hàng
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  {selectedOrder.code}
                  {getStatusBadge(selectedOrder.status)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Số PO:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedOrder.poNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nhà Cung Cấp:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.supplier}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Ngày Nhận:</span>
                  <span className="font-mono text-slate-700">{selectedOrder.receivedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Người Tiếp Nhận:</span>
                  <span className="font-semibold text-slate-700">{selectedOrder.receiver}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Danh Sách Mặt Hàng Tiếp Nhận</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Mã SKU</th>
                        <th className="p-2.5">Tên Vật Tư</th>
                        <th className="p-2.5 text-right">SL Nhận</th>
                        <th className="p-2.5">Batch No</th>
                        <th className="p-2.5">HSD</th>
                        <th className="p-2.5 text-center">In Tem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-mono font-bold text-blue-700">{item.materialCode}</td>
                          <td className="p-2.5 font-medium text-slate-800">{item.materialName}</td>
                          <td className="p-2.5 font-mono font-bold text-right text-emerald-700">
                            {item.receivedQuantity} {item.unit}
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">{item.batchNumber || '—'}</td>
                          <td className="p-2.5 font-mono text-rose-600">{item.expiryDate || '—'}</td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => {
                                setActiveBarcodePrint({
                                  title: 'Tem Nhận Hàng',
                                  batchNumber: item.batchNumber || 'BAT-TEMP',
                                  materialName: item.materialName,
                                  materialCode: item.materialCode,
                                  locationCode: 'KHU TẠM NHẬN',
                                  quantity: item.receivedQuantity,
                                  unit: item.unit,
                                  expiryDate: item.expiryDate || '',
                                  poNumber: selectedOrder.poNumber
                                });
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-blue-50 text-blue-700 rounded border border-slate-200 flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <Barcode className="w-3 h-3" /> In Tem
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">MMS Inbound Control</span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
