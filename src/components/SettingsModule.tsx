import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Layers,
  MapPin,
  CheckSquare,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { useWarehouse } from '../services/warehouseStore';
import { UserRole, User } from '../types';

export const SettingsModule: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    materials,
    locations,
    qcCriteria,
    resetData
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'roles' | 'materials' | 'locations' | 'system'>('roles');

  const systemUsers: User[] = [
    { id: 'usr-1', username: 'admin', fullName: 'Nguyễn Văn Quản Trị', email: 'admin@mms.vn', role: 'ADMIN', department: 'Ban Giám Đốc' },
    { id: 'usr-2', username: 'thukho', fullName: 'Trần Văn Nam', email: 'nam.tv@mms.vn', role: 'THUKHO', department: 'Bộ Phận Kho Vận' },
    { id: 'usr-3', username: 'qc_lead', fullName: 'Lê Thị Thu Thảo', email: 'thao.lt@mms.vn', role: 'QC', department: 'Phòng Quản Lý Chất Lượng' },
    { id: 'usr-4', username: 'sanxuat', fullName: 'Phạm Hữu Tài', email: 'tai.ph@mms.vn', role: 'SANXUAT', department: 'Xưởng Sản Xuất 1' },
    { id: 'usr-5', username: 'ketoan', fullName: 'Vũ Mạnh Cường', email: 'cuong.vm@mms.vn', role: 'KETOAN', department: 'Phòng Kế Toán' }
  ];

  // Screen permission matrix
  const permissionsMatrix = [
    { screen: 'Bảng Điều Khiển Tổng Quan', admin: true, keeper: true, qc: true, prod: true, manager: true },
    { screen: 'Nhận Hàng (PO / Không PO / Trả nội bộ)', admin: true, keeper: true, qc: false, prod: false, manager: true },
    { screen: 'Kiểm Tra Đo Đạc & Đánh Giá QC', admin: true, keeper: false, qc: true, prod: false, manager: true },
    { screen: 'Lưu Kho Lên Kệ (Putaway & Tách Batch)', admin: true, keeper: true, qc: false, prod: false, manager: true },
    { screen: 'Tồn Kho, Sơ Đồ Kệ & Kiểm Kê', admin: true, keeper: true, qc: true, prod: true, manager: true },
    { screen: 'Tạo Đề Nghị Xuất Kho', admin: true, keeper: true, qc: false, prod: true, manager: true },
    { screen: 'Phê Duyệt Đề Nghị Xuất', admin: true, keeper: false, qc: false, prod: false, manager: true },
    { screen: 'Soạn Hàng FIFO & In Phiếu Xuất', admin: true, keeper: true, qc: false, prod: false, manager: true },
    { screen: 'Báo Cáo Nhập Xuất Tồn & Sổ Giao Dịch', admin: true, keeper: true, qc: true, prod: true, manager: true },
    { screen: 'Cấu Hình Hệ Thống & Master Data', admin: true, keeper: false, qc: false, prod: false, manager: false }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" /> System Settings & Access Control
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Quản Trị Hệ Thống, Phân Quyền & Master Data (UC01 - UC02)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình ma trận phân quyền màn hình theo vai trò (Role-Based Access Control), danh mục vật tư SKU và vị trí kho.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'roles' as const, label: 'Phân Quyền Role (UC02)' },
            { id: 'materials' as const, label: 'Master Data SKU' },
            { id: 'locations' as const, label: 'Vị Trí Kệ Kho' },
            { id: 'system' as const, label: 'Hệ Thống' }
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

      {/* Tab 1: Roles and Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* User Account Switcher */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Chuyển Đổi Người Dùng Đăng Nhập (Simulated Login):</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {systemUsers.map(u => {
                const isCurrent = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{u.fullName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{u.department}</div>
                    <div className="text-[10px] text-blue-700 font-mono mt-1">user: @{u.username}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Ma Trận Phân Quyền Theo Màn Hình & Nghiệp Vụ</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình các quyền hạn được thực thi trong SQL Stored Procedures và giao diện React.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Màn Hình / Phân Hệ Nghiệp Vụ</th>
                    <th className="p-3 text-center">Quản Trị (ADMIN)</th>
                    <th className="p-3 text-center">Thủ Kho</th>
                    <th className="p-3 text-center">Kiểm Định QC</th>
                    <th className="p-3 text-center">Sản Xuất</th>
                    <th className="p-3 text-center">Ban Giám Đốc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionsMatrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{row.screen}</td>
                      <td className="p-3 text-center">{row.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '—'}</td>
                      <td className="p-3 text-center">{row.keeper ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '—'}</td>
                      <td className="p-3 text-center">{row.qc ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '—'}</td>
                      <td className="p-3 text-center">{row.prod ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '—'}</td>
                      <td className="p-3 text-center">{row.manager ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SKU Master Data */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Danh Mục Master Data Vật Tư (SKU Catalog)</h3>
              <p className="text-xs text-slate-500">Khai báo mã hàng, phân nhóm, đơn vị tính và định mức tồn an toàn.</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã SKU</th>
                  <th className="p-3">Tên Vật Tư</th>
                  <th className="p-3">Phân Nhóm</th>
                  <th className="p-3">ĐVT</th>
                  <th className="p-3 text-right">Min Tồn</th>
                  <th className="p-3 text-right">Max Tồn</th>
                  <th className="p-3 text-right">Đơn Giá Chuẩn</th>
                  <th className="p-3 text-center">Kiểm QC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map(m => (
                  <tr key={m.id}>
                    <td className="p-3 font-mono font-bold text-blue-700">{m.code}</td>
                    <td className="p-3 font-semibold text-slate-800">{m.name}</td>
                    <td className="p-3 text-slate-600">{m.categoryName}</td>
                    <td className="p-3 text-slate-500">{m.unit}</td>
                    <td className="p-3 font-mono text-right text-slate-700">{m.minStock}</td>
                    <td className="p-3 font-mono text-right text-slate-700">{m.maxStock}</td>
                    <td className="p-3 font-mono text-right text-slate-700">{m.standardPrice.toLocaleString('vi-VN')} đ</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Bắt Buộc
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Locations Master Data */}
      {activeTab === 'locations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Danh Sách Vị Trí Kệ Kho (Locations Catalog)</h3>
              <p className="text-xs text-slate-500">Mã hóa theo chuẩn: KHO - KỆ - TẦNG (e.g. KA-K01-T1).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locations.map(loc => (
              <div key={loc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-700 text-sm">{loc.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                    {loc.status}
                  </span>
                </div>
                <div className="text-slate-700 font-medium">{loc.warehouse}</div>
                <div className="text-slate-500 text-[11px]">
                  Kệ: {loc.rack} • Tầng: {loc.tier} • Sức chứa: {loc.occupied}/{loc.capacity} slot
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System Reset */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Khôi Phục Dữ Liệu Mẫu (Demo Reset)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Khôi phục toàn bộ trạng thái phiếu nhận hàng, đánh giá QC, số dư kho và đề nghị xuất về kịch bản ban đầu.
            </p>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-3">
            <div className="font-bold text-rose-900 text-xs">Lưu ý khi khôi phục:</div>
            <p className="text-xs text-rose-700 leading-relaxed">
              Thao tác này sẽ đặt lại dữ liệu trong bộ nhớ trình duyệt (localStorage), bao gồm các phiếu nhận hàng và đề nghị xuất bạn vừa tạo.
            </p>
            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu về mặc định?')) {
                  resetData();
                  alert('Đã khôi phục dữ liệu mẫu thành công!');
                }
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khôi Phục Dữ Liệu Mẫu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
