import React, { useState } from 'react';
import {
  Boxes,
  MapPin,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  ClipboardList,
  Filter,
  Plus,
  ArrowRight,
  Layers,
  Calendar,
  Grid
} from 'lucide-react';
import { useWarehouse } from '../services/warehouseStore';
import { BatchInventory, WarehouseLocation } from '../types';

export const InventoryModule: React.FC = () => {
  const {
    materials,
    batches,
    locations,
    auditTickets,
    createAuditTicket,
    completeAuditTicket,
    setActiveBarcodePrint
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'sku' | 'batch' | 'map' | 'audit'>('sku');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);

  // New Audit State
  const [isCreatingAudit, setIsCreatingAudit] = useState(false);
  const [auditWarehouse, setAuditWarehouse] = useState('Kho A - Linh kiện điện tử');
  const [auditTitle, setAuditTitle] = useState('Kiểm kê định kỳ giữa tháng');

  // Filtered SKU list
  const filteredMaterials = materials.filter(m => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.categoryName.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Batches
  const filteredBatches = batches.filter(b => {
    if (selectedWarehouse !== 'ALL' && !b.warehouse.includes(selectedWarehouse)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.batchNumber.toLowerCase().includes(q) ||
        b.materialCode.toLowerCase().includes(q) ||
        b.materialName.toLowerCase().includes(q) ||
        b.locationCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartNewAudit = () => {
    const targetBatches = batches.filter(b => b.warehouse.includes(auditWarehouse.split(' - ')[0]));
    const auditItems = targetBatches.map(b => ({
      materialId: b.materialId,
      materialCode: b.materialCode,
      materialName: b.materialName,
      batchNumber: b.batchNumber,
      locationCode: b.locationCode,
      systemQuantity: b.quantity,
      actualQuantity: b.quantity,
      difference: 0
    }));

    createAuditTicket(auditWarehouse, auditTitle, auditItems);
    setIsCreatingAudit(false);
    alert('Đã tạo phiếu kiểm kê thành công! Bạn có thể nhập số liệu thực tế.');
  };

  const getSlotColor = (status: WarehouseLocation['status']) => {
    switch (status) {
      case 'EMPTY':
        return 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600';
      case 'PARTIAL':
        return 'bg-blue-100 hover:bg-blue-200 border-blue-400 text-blue-800';
      case 'FULL':
        return 'bg-rose-100 hover:bg-rose-200 border-rose-400 text-rose-800';
      case 'MAINTENANCE':
        return 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" /> Warehouse Inventory & Traceability
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Quản Lý Tồn Kho, Batch & Sơ Đồ Vị Trí Kệ (UC15 - UC18)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tồn theo SKU, chi tiết từng Lô (Batch), sơ đồ trực quan 2D/3D và phiếu kiểm kê đối chiếu.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'sku' as const, label: 'Theo Mã SKU' },
            { id: 'batch' as const, label: 'Theo Mã Lô (Batch)' },
            { id: 'map' as const, label: 'Sơ Đồ Kệ Kho' },
            { id: 'audit' as const, label: 'Kiểm Kê Kho' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Stock by SKU */}
      {activeTab === 'sku' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm mã SKU, tên vật tư, nhóm..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-64"
              />
            </div>
            <span className="text-xs text-slate-500">
              Tổng số <strong>{filteredMaterials.length}</strong> danh mục vật tư
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Mã SKU</th>
                    <th className="p-3.5">Tên Vật Tư</th>
                    <th className="p-3.5">Phân Nhóm</th>
                    <th className="p-3.5">Đơn Vị</th>
                    <th className="p-3.5 text-right">Tổng Tồn Kho</th>
                    <th className="p-3.5 text-right">Định Mức Min - Max</th>
                    <th className="p-3.5">Số Lượng Batch</th>
                    <th className="p-3.5 text-right">Giá Chuẩn (VNĐ)</th>
                    <th className="p-3.5">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMaterials.map(mat => {
                    const matBatches = batches.filter(b => b.materialId === mat.id);
                    const totalQty = matBatches.reduce((sum, b) => sum + b.quantity, 0);
                    const isLow = totalQty <= mat.minStock;
                    const isOver = totalQty >= mat.maxStock;

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-blue-700">{mat.code}</td>
                        <td className="p-3.5 font-semibold text-slate-900 max-w-[250px] truncate">{mat.name}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                            {mat.categoryName}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">{mat.unit}</td>
                        <td className="p-3.5 font-mono font-extrabold text-right text-slate-900">
                          {totalQty}
                        </td>
                        <td className="p-3.5 font-mono text-right text-slate-500">
                          {mat.minStock} - {mat.maxStock}
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono font-semibold text-slate-700">{matBatches.length} lô</span>
                        </td>
                        <td className="p-3.5 font-mono text-right text-slate-700">
                          {mat.standardPrice.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-3.5">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Dưới Min (Cần mua)
                            </span>
                          ) : isOver ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Vượt Max
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              An Toàn
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stock by Batch */}
      {activeTab === 'batch' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã batch, SKU, vị trí kệ..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-64"
                />
              </div>

              <select
                value={selectedWarehouse}
                onChange={e => setSelectedWarehouse(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="ALL">Tất cả kho</option>
                <option value="Kho A">Kho A (Điện tử)</option>
                <option value="Kho B">Kho B (Cơ khí/Hoá chất)</option>
                <option value="Kho C">Kho C (Bao bì/Phụ liệu)</option>
              </select>
            </div>

            <span className="text-xs text-slate-500">
              Có <strong>{filteredBatches.length}</strong> lô hàng (Batches) đang lưu trữ
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Mã Lô (Batch No)</th>
                    <th className="p-3.5">Mã & Tên Vật Tư</th>
                    <th className="p-3.5">Số Lượng Tồn</th>
                    <th className="p-3.5">Vị Trí Kệ</th>
                    <th className="p-3.5">Kho Lưu Trữ</th>
                    <th className="p-3.5">Ngày Nhập</th>
                    <th className="p-3.5">Hạn Dùng (EXP)</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5 text-center">In Tem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map(batch => (
                    <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-700">{batch.batchNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{batch.materialCode}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{batch.materialName}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">
                        {batch.quantity} {batch.unit}
                      </td>
                      <td className="p-3.5 font-mono font-semibold">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded">
                          {batch.locationCode}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">{batch.warehouse}</td>
                      <td className="p-3.5 font-mono text-slate-500">{batch.createdAt}</td>
                      <td className="p-3.5 font-mono font-semibold text-rose-600">{batch.expiryDate}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {batch.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBarcodePrint({
                              title: 'Tem Lô Tồn Kho',
                              batchNumber: batch.batchNumber,
                              materialName: batch.materialName,
                              materialCode: batch.materialCode,
                              locationCode: batch.locationCode,
                              quantity: batch.quantity,
                              unit: batch.unit,
                              expiryDate: batch.expiryDate,
                              poNumber: batch.poNumber
                            });
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-blue-50 text-blue-700 rounded border border-slate-200 flex items-center gap-1 mx-auto cursor-pointer"
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
      )}

      {/* Tab 3: Interactive Visual Rack Map */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Warehouse Selector & Rack Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sơ Đồ Kệ Kho Trực Quan (Warehouse Racks Matrix)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhấp vào từng ô kệ để xem danh sách lô hàng đang chứa và sức chứa khả dụng.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300 inline-block" />
                  <span className="text-slate-600">Trống</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-400 inline-block" />
                  <span className="text-slate-600">Còn chỗ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-100 border border-rose-400 inline-block" />
                  <span className="text-slate-600">Đầy</span>
                </div>
              </div>
            </div>

            {/* Warehouse Sections */}
            {['Kho A - Linh kiện điện tử', 'Kho B - Cơ khí & Hoá chất', 'Kho C - Bao bì & Phụ liệu'].map(whName => {
              const whLocations = locations.filter(l => l.warehouse.includes(whName.split(' - ')[0]));
              return (
                <div key={whName} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> {whName}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {whLocations.map(loc => {
                      const isSelected = selectedLocation?.id === loc.id;
                      const locBatches = batches.filter(b => b.locationId === loc.id);
                      return (
                        <button
                          key={loc.id}
                          onClick={() => setSelectedLocation(loc)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${getSlotColor(
                            loc.status
                          )} ${isSelected ? 'ring-2 ring-blue-600 font-bold' : ''}`}
                        >
                          <div className="flex items-center justify-between font-mono font-bold text-xs">
                            <span>{loc.code}</span>
                            <span className="text-[10px]">{loc.status}</span>
                          </div>
                          <div className="text-[11px] mt-1">
                            Sức chứa: <strong>{loc.occupied}</strong> / {loc.capacity}
                          </div>
                          <div className="text-[10px] opacity-75 mt-0.5">
                            {locBatches.length} batches đang để
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Location Detail */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Vị Trí Kệ Được Chọn:</h3>

            {selectedLocation ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Mã Kệ:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedLocation.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Phân khu:</span>
                    <span className="font-semibold text-slate-800">{selectedLocation.warehouse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Dung lượng:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {selectedLocation.occupied} / {selectedLocation.capacity} ({Math.round((selectedLocation.occupied / selectedLocation.capacity) * 100)}%)
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-2">Các Lô Hàng Đang Nằm Tại Kệ Này:</h4>
                  {batches.filter(b => b.locationId === selectedLocation.id).length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">
                      Vị trí kệ đang trống, chưa có lô hàng nào.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {batches
                        .filter(b => b.locationId === selectedLocation.id)
                        .map(b => (
                          <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="flex justify-between font-mono font-bold text-blue-700">
                              <span>{b.batchNumber}</span>
                              <span className="text-emerald-700">{b.quantity} {b.unit}</span>
                            </div>
                            <div className="text-slate-700 font-medium truncate">{b.materialName}</div>
                            <div className="text-[10px] text-rose-600 font-mono">HSD: {b.expiryDate}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                Chọn một ô kệ trên sơ đồ bên trái để xem chi tiết vật tư đang chứa.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Stock Audit / Kiểm Kê */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Phiếu Kiểm Kê Batch & Cân Đối Tồn Kho (UC18)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm đếm thực tế, phát hiện chênh lệch thừa/thiếu và điều chỉnh số liệu kế toán.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingAudit(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tạo Đợt Kiểm Kê Mới
            </button>
          </div>

          {/* New Audit Modal */}
          {isCreatingAudit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Khởi Tạo Đợt Kiểm Kê Kho</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Đợt Kiểm Kê:</label>
                  <input
                    type="text"
                    value={auditTitle}
                    onChange={e => setAuditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khu Vực / Kho Kiểm Kê:</label>
                  <select
                    value={auditWarehouse}
                    onChange={e => setAuditWarehouse(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Kho A - Linh kiện điện tử">Kho A - Linh kiện điện tử</option>
                    <option value="Kho B - Cơ khí & Hoá chất">Kho B - Cơ khí & Hoá chất</option>
                    <option value="Kho C - Bao bì & Phụ liệu">Kho C - Bao bì & Phụ liệu</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    onClick={() => setIsCreatingAudit(false)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleStartNewAudit}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Bắt Đầu Kiểm Kê
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Tickets List */}
          <div className="space-y-4">
            {auditTickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 text-xs">{ticket.code}</span>
                      <span className="font-bold text-slate-900 text-sm">{ticket.title}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Khu vực: {ticket.warehouse} • Ngày: {ticket.date} • Kiểm bởi: {ticket.auditor}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {ticket.status}
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Mã SKU</th>
                        <th className="p-2.5">Tên Vật Tư</th>
                        <th className="p-2.5">Mã Lô (Batch)</th>
                        <th className="p-2.5">Vị Trí</th>
                        <th className="p-2.5 text-right">Số Dư Sổ Sách</th>
                        <th className="p-2.5 text-right">Thực Tế Đếm</th>
                        <th className="p-2.5 text-right">Chênh Lệch</th>
                        <th className="p-2.5">Kết Quả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ticket.items.map(item => (
                        <tr key={item.id}>
                          <td className="p-2.5 font-mono font-bold text-blue-700">{item.materialCode}</td>
                          <td className="p-2.5 text-slate-800 font-medium">{item.materialName}</td>
                          <td className="p-2.5 font-mono text-slate-700">{item.batchNumber}</td>
                          <td className="p-2.5 font-mono text-slate-700">{item.locationCode}</td>
                          <td className="p-2.5 font-mono text-right font-bold text-slate-700">{item.systemQuantity}</td>
                          <td className="p-2.5 font-mono text-right font-bold text-blue-700">{item.actualQuantity}</td>
                          <td className="p-2.5 font-mono text-right font-bold">
                            {item.difference === 0 ? (
                              <span className="text-slate-400">0</span>
                            ) : item.difference > 0 ? (
                              <span className="text-emerald-600">+{item.difference}</span>
                            ) : (
                              <span className="text-rose-600">{item.difference}</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Khớp 100%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
