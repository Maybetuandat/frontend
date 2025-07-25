// pages/Labs.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


import toast from 'react-hot-toast';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdToggleOn, 
  MdToggleOff,
  MdClose,
  MdSave
} from 'react-icons/md';
import { Lab } from '../types/Lab';
import { labApi } from '../api/LapApi';
import { CreateLabRequest } from '../types/CreateLabRequest';

const Labs: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateLabRequest>({
    name: '',
    description: '',
    baseImage: '',
    estimatedTime: 30
  });

  // Fetch labs
  const { data: labs = [], isLoading, error } = useQuery({
    queryKey: ['labs', statusFilter],
    queryFn: () => labApi.getAllLabs(statusFilter),
  });

  // Create lab mutation
  const createMutation = useMutation({
    mutationFn: labApi.createLab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      toast.success('Lab đã được tạo thành công!');
      handleCloseModal();
    },
    onError: () => {
      toast.error('Có lỗi khi tạo lab!');
    }
  });

  // Update lab mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLabRequest }) => 
      labApi.updateLab(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      toast.success('Lab đã được cập nhật thành công!');
      handleCloseModal();
    },
    onError: () => {
      toast.error('Có lỗi khi cập nhật lab!');
    }
  });

  // Delete lab mutation
  const deleteMutation = useMutation({
    mutationFn: labApi.deleteLab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      toast.success('Lab đã được xóa thành công!');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error('Có lỗi khi xóa lab!');
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: labApi.toggleLabStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      toast.success('Trạng thái lab đã được cập nhật!');
    },
    onError: () => {
      toast.error('Có lỗi khi cập nhật trạng thái lab!');
    }
  });

  // Filter and search labs
  const filteredLabs = labs.filter(lab => 
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLabs = filteredLabs.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleCreateLab = () => {
    setEditingLab(null);
    setFormData({
      name: '',
      description: '',
      baseImage: '',
      estimatedTime: 30
    });
    setIsModalOpen(true);
  };

  const handleEditLab = (lab: Lab) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name,
      description: lab.description,
      baseImage: lab.baseImage,
      estimatedTime: lab.estimatedTime
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLab(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLab) {
      updateMutation.mutate({ id: editingLab.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Có lỗi khi tải danh sách labs!</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Labs</h1>
        <button 
          onClick={handleCreateLab}
          className="btn btn-primary flex items-center gap-2"
        >
          <MdAdd size={20} />
          Tạo Lab mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-base-100 rounded-lg shadow">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select 
            className="select select-bordered"
            value={statusFilter?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value === '' ? undefined : value === 'true');
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Tên Lab</th>
              <th>Mô tả</th>
              <th>Base Image</th>
              <th>Thời gian ước tính</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLabs.map((lab) => (
              <tr key={lab.id} className="hover">
                <td className="font-medium">{lab.name}</td>
                <td>
                  <div className="max-w-xs truncate" title={lab.description}>
                    {lab.description}
                  </div>
                </td>
                <td>
                  <code className="text-sm bg-base-200 px-2 py-1 rounded">
                    {lab.baseImage}
                  </code>
                </td>
                <td>{lab.estimatedTime} phút</td>
                <td>
                  <div 
                    className={`badge ${lab.isActive ? 'badge-success' : 'badge-error'}`}
                  >
                    {lab.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </div>
                </td>
                <td>{formatDate(lab.createdAt)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(lab.id)}
                      className={`btn btn-sm ${lab.isActive ? 'btn-warning' : 'btn-success'}`}
                      title={lab.isActive ? 'Tắt lab' : 'Bật lab'}
                    >
                      {lab.isActive ? <MdToggleOff size={16} /> : <MdToggleOn size={16} />}
                    </button>
                    <button
                      onClick={() => handleEditLab(lab)}
                      className="btn btn-sm btn-primary"
                      title="Chỉnh sửa"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(lab.id)}
                      className="btn btn-sm btn-error"
                      title="Xóa"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedLabs.length === 0 && (
          <div className="text-center py-8 text-base-content/70">
            Không tìm thấy lab nào
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            <button 
              className="join-item btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="join-item btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit Lab */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {editingLab ? 'Chỉnh sửa Lab' : 'Tạo Lab mới'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="btn btn-sm btn-circle"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Tên Lab *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nhập tên lab..."
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Mô tả *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Nhập mô tả chi tiết về lab..."
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Base Image *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.baseImage}
                  onChange={(e) => setFormData({ ...formData, baseImage: e.target.value })}
                  required
                  placeholder="vd: ubuntu:20.04"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Thời gian ước tính (phút) *</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="600"
                  className="input input-bordered w-full"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="modal-action">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="btn"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <MdSave size={20} />
                  {editingLab ? 'Cập nhật' : 'Tạo Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Xác nhận xóa</h3>
            <p className="py-4">
              Bạn có chắc chắn muốn xóa lab này? Hành động này không thể hoàn tác.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="btn"
              >
                Hủy
              </button>
              <button 
                onClick={confirmDelete}
                className="btn btn-error"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labs;