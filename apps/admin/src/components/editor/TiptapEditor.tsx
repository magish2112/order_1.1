import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button, Space, Divider, Upload, message } from 'antd';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { apiMethods } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUrl';
import { UrlInputModal } from './UrlInputModal';

interface TiptapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ value, onChange, placeholder: _placeholder }: TiptapEditorProps) {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  /**
   * Валидация URL
   */
  const isValidUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') {
      return false;
    }

    // Разрешаем относительные URL
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }

    // Проверяем абсолютные URL
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleImageUrlConfirm = (url: string) => {
    if (isValidUrl(url)) {
      editor.chain().focus().setImage({ src: url }).run();
      setImageModalVisible(false);
      message.success('Изображение добавлено');
    } else {
      message.error('Некорректный URL');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await apiMethods.media.upload(file, 'articles');
      const imageUrl = response.data.data.url;
      const fullUrl = getImageUrl(imageUrl);
      
      editor.chain().focus().setImage({ src: fullUrl }).run();
      message.success('Изображение загружено');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      message.error(`Ошибка загрузки изображения: ${errorMessage}`);
    }
  };

  const handleLinkConfirm = (url: string) => {
    if (isValidUrl(url)) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      setLinkModalVisible(false);
      message.success('Ссылка добавлена');
    } else {
      message.error('Некорректный URL');
    }
  };

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6 }}>
      <div style={{ padding: 8, borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Space size="small" split={<Divider type="vertical" />}>
          <Button
            type={editor.isActive('bold') ? 'primary' : 'text'}
            icon={<Bold size={16} />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <Button
            type={editor.isActive('italic') ? 'primary' : 'text'}
            icon={<Italic size={16} />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Button
            type="text"
            icon={<Underline size={16} />}
            disabled
            title="Underline не поддерживается"
          />
          <Button
            type={editor.isActive('strike') ? 'primary' : 'text'}
            icon={<Strikethrough size={16} />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </Space>

        <Space size="small" split={<Divider type="vertical" />}>
          <Button
            type={editor.isActive('bulletList') ? 'primary' : 'text'}
            icon={<List size={16} />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <Button
            type={editor.isActive('orderedList') ? 'primary' : 'text'}
            icon={<ListOrdered size={16} />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <Button
            type={editor.isActive('blockquote') ? 'primary' : 'text'}
            icon={<Quote size={16} />}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
        </Space>

        <Space size="small" split={<Divider type="vertical" />}>
          <Button
            type="text"
            icon={<LinkIcon size={16} />}
            onClick={() => setLinkModalVisible(true)}
            title="Добавить ссылку"
          />
          <Upload
            beforeUpload={(file) => {
              handleImageUpload(file);
              return false; // Отменяем автоматическую загрузку
            }}
            showUploadList={false}
            accept="image/*"
          >
            <Button
              type="text"
              icon={<ImageIcon size={16} />}
              title="Загрузить изображение"
            />
          </Upload>
          <Button
            type="text"
            icon={<ImageIcon size={16} />}
            onClick={() => setImageModalVisible(true)}
            title="Вставить изображение по URL"
          />
        </Space>

        <Space size="small" split={<Divider type="vertical" />}>
          <Button
            type="text"
            icon={<Undo size={16} />}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
          <Button
            type="text"
            icon={<Redo size={16} />}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
        </Space>
      </div>
      <EditorContent editor={editor} style={{ minHeight: 300 }} />
      
      <UrlInputModal
        visible={imageModalVisible}
        title="Добавить изображение по URL"
        placeholder="Введите URL изображения"
        onConfirm={handleImageUrlConfirm}
        onCancel={() => setImageModalVisible(false)}
      />
      
      <UrlInputModal
        visible={linkModalVisible}
        title="Добавить ссылку"
        placeholder="Введите URL"
        onConfirm={handleLinkConfirm}
        onCancel={() => setLinkModalVisible(false)}
      />
    </div>
  );
}

