import { useEffect, useState } from 'react';
import { BookOpen, Plus, Pin, Tag, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import useToast from '../../store/useToast';
import CreateNoteModal from '../../components/modals/CreateNoteModal';

const NotesPage = () => {
  const { notes, fetchNotes, loadingNotes, deleteNote, updateNote } = useStore();
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (loadingNotes && notes.length === 0) return <div className="p-8 text-[var(--text-secondary)]">Loading notes...</div>;

  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setActiveDropdown(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      addToast('Note deleted', 'success');
    } catch (err) {
      addToast('Failed to delete note', 'error');
    }
    setActiveDropdown(null);
  };

  const togglePin = async (note) => {
    try {
      await updateNote(note._id, { isPinned: !note.isPinned });
      addToast(note.isPinned ? 'Note unpinned' : 'Note pinned', 'success');
    } catch (err) {
      addToast('Failed to pin note', 'error');
    }
    setActiveDropdown(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="text-[var(--primary-color)]" size={32} />
            Quick Notes
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Capture ideas before they disappear.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-black font-bold py-2 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
        >
          <Plus size={20} /> New Note
        </button>
      </div>

      {/* Notes Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 mt-4">
        {notes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--surface-color)]/30">
            <BookOpen size={48} className="opacity-20 mb-4" />
            <p className="text-lg font-medium">No notes yet</p>
            <p className="text-sm mb-4">Click "New Note" to capture your first idea.</p>
            <button 
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg font-medium hover:bg-[var(--primary-color)]/20 transition-colors"
            >
              Create Note
            </button>
          </div>
        )}
        
        {notes.map((note) => (
          <div key={note._id} className={`break-inside-avoid p-5 rounded-2xl border border-[var(--border-color)] transition-all hover:-translate-y-1 hover:shadow-xl group ${note.color || 'bg-[var(--surface-color)]'}`}>
            <div className="flex justify-between items-start mb-3 relative">
              <h3 className="font-bold text-lg leading-tight">{note.title}</h3>
              <div className="flex gap-1 text-[var(--text-secondary)] relative">
                {note.isPinned && <Pin size={16} className="text-[var(--primary-color)]" fill="currentColor" />}
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === note._id ? null : note._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-md"
                >
                  <MoreVertical size={16} />
                </button>
                
                {/* Dropdown Menu */}
                {activeDropdown === note._id && (
                  <div className="absolute right-0 top-6 w-32 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg shadow-xl overflow-hidden z-20">
                    <button onClick={() => togglePin(note)} className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-color)] flex items-center gap-2">
                      <Pin size={14} /> {note.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => handleOpenEdit(note)} className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-color)] flex items-center gap-2">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(note._id)} className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-color)] text-[var(--error)] flex items-center gap-2">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line mb-4 line-clamp-6">
              {note.content}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {note.tags?.map(tag => (
                <span key={tag} className="text-[10px] font-medium px-2 py-1 bg-[var(--bg-color)]/50 rounded-md flex items-center gap-1 border border-[var(--border-color)]/50 text-[var(--text-secondary)]">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateNoteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingNote}
      />
    </div>
  );
};

export default NotesPage;
