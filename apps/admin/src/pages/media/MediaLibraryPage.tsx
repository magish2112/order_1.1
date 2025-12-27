import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Button, Space, message, Input, Image, Modal, Popconfirm } from 'antd';
import { Upload as UploadIcon, Search, Trash2, Folder } from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { Media } from '../../lib/types';

export function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [selectedFolder] = useState<string | undefined>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: media, isLoading } = useQuery({
    queryKey: ['media', 'admin', selectedFolder],
    queryFn: async () => {
      const response = await apiMethods.media.list({ folder: selectedFolder });
      return response.data.data as Media[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiMethods.media.delete(id);
    },
    onSuccess: () => {
      message.success('Файл удален');
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Ошибка удаления');
    },
  });

  const handleUpload = async (file: File) => {
    try {
      await apiMethods.media.upload(file, selectedFolder, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      message.success('Файл загружен');
      queryClient.invalidateQueries({ queryKey: ['media'] });
    } catch (error) {
      message.error('Ошибка загрузки файла');
    }
  };

  const filteredMedia = media?.filter((item) =>
    item.originalName.toLowerCase().includes(searchText.toLowerCase())
  );

  const imageMedia = filteredMedia?.filter((item) => item.mimeType.startsWith('image/'));
  const otherMedia = filteredMedia?.filter((item) => !item.mimeType.startsWith('image/'));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <h1>Медиатека</h1>
        <Space>
          <Input
            placeholder="Поиск..."
            prefix={<Search />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Upload
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
            showUploadList={false}
            accept="image/*"
          >
            <Button type="primary" icon={<UploadIcon />}>
              Загрузить файл
            </Button>
          </Upload>
        </Space>
      </div>

      {imageMedia && imageMedia.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 16 }}>Изображения</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {imageMedia.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 8,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    paddingTop: '100%',
                    position: 'relative',
                    marginBottom: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => setPreviewImage(item.url)}
                >
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.originalName}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 4,
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  {item.originalName}
                </div>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>
                  {formatFileSize(item.size)}
                </div>
                <Popconfirm
                  title="Удалить файл?"
                  onConfirm={() => deleteMutation.mutate(item.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<Trash2 />}
                    style={{ width: '100%' }}
                  >
                    Удалить
                  </Button>
                </Popconfirm>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherMedia && otherMedia.length > 0 && (
        <div>
          <h2 style={{ marginBottom: 16 }}>Другие файлы</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {otherMedia.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 12,
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  justifyContent: 'space-between',
                }}
              >
                <Space>
                  <Folder />
                  <div>
                    <div>{item.originalName}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {formatFileSize(item.size)} • {item.mimeType}
                    </div>
                  </div>
                </Space>
                <Popconfirm
                  title="Удалить файл?"
                  onConfirm={() => deleteMutation.mutate(item.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="text" danger icon={<Trash2 />}>
                    Удалить
                  </Button>
                </Popconfirm>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!filteredMedia || filteredMedia.length === 0) && !isLoading && (
        <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
          Нет файлов. Загрузите первый файл.
        </div>
      )}

      <Modal
        open={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage(null)}
        width={800}
        centered
      >
        {previewImage && <Image src={previewImage} alt="Preview" style={{ width: '100%' }} />}
      </Modal>
    </div>
  );
}

