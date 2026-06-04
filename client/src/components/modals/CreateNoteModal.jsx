import { useState, useEffect } from 'react';
import { X, Pin, Tag, Loader } from 'lucide-react';
import useStore from '../../store/useStore';
import useToast from '../../store/useToast';

const colors = [
  'bg-[var(--surface-color)]', // default
  'bg-red-500/10',
  'bg-blue-500/10',
  'bg-green-500/10',
  'bg-yellow-500/10',
  'bg-purple-500/10'
];

const CreateNoteModal = ({ isOpen, onClose, initialData = null }) => {
  const { addNote, updateNote } = useStore();
  const { addToast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState(colors[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setIsPinned(initialData.isPinned || false);
      setColor(initialData.color || colors[0]);
      setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
      setColor(colors[0]);
      setTagsInput('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    setLoading(true);
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      isPinned,
      color,
      tags: tagsArray
    };

    try {
      if (initialData) {
        await updateNote(initialData._id, noteData);
        addToast('Note updated successfully!');
      } else {
        await addNote(noteData);
        addToast('Note created successfully!');
      }
      onClose();
    } catch (error) {
      addToast('Failed to save note', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-[var(--border-color)] overflow-hidden ${color}`}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]/30 bg-[var(--surface-color)]/50">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Note' : 'Create Note'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              className="w-full bg-transparent text-xl font-bold border-none focus:outline-none focus:ring-0 placeholder:opacity-40"
              autoFocus
            />
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something brilliant..."
              className="w-full bg-transparent min-h-[150px] resize-none border-none focus:outline-none focus:ring-0 placeholder:opacity-40"
            />

            <div className="pt-4 border-t border-[var(--border-color)]/30 space-y-4">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Tags (comma separated)..."
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${c} ${color === c ? 'border-[var(--text-primary)] scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    />
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${isPinned ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:bg-black/10'}`}
                >
                  <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">{isPinned ? 'Pinned' : 'Pin'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!title.trim() && !content.trim())}
              className="btn-primary flex items-center gap-2"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {initialData ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNoteModal;
