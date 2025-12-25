import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button, Space, Divider } from 'antd';
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

interface TiptapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
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

  const addImage = () => {
    const url = window.prompt('Введите URL изображения:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Введите URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
            type={editor.isActive('underline') ? 'primary' : 'text'}
            icon={<Underline size={16} />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
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
            onClick={addLink}
          />
          <Button
            type="text"
            icon={<ImageIcon size={16} />}
            onClick={addImage}
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
    </div>
  );
}

