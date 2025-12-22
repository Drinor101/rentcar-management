import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, X, Save } from 'lucide-react';
import { Note } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface NotesManagementProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, note: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  onDeleteNote: (id: string) => void;
}

const NotesManagement: React.FC<NotesManagementProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; note: Note | null }>({
    isOpen: false,
    note: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleAddNote = () => {
    setEditingNote(null);
    setFormData({ title: '', content: '' });
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setIsModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Ju lutem shkruani një titull për shenimin!');
      return;
    }

    if (editingNote) {
      onUpdateNote(editingNote.id, formData);
    } else {
      onAddNote(formData);
    }
    
    setIsModalOpen(false);
    setFormData({ title: '', content: '' });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({ title: '', content: '' });
    setEditingNote(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sq-AL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Shenimet</h2>
          <p className="text-sm text-gray-600 mt-1">Menaxho shenimet dhe kujtesat tuaja</p>
        </div>
        <button
          onClick={handleAddNote}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Shenim i Ri
        </button>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka shenime</h3>
          <p className="text-gray-500 mb-4">Kliko "Shenim i Ri" për të krijuar shenimin të parë</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-2">
                  {note.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
                    title="Ndrysho"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, note })}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                    title="Fshi"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {note.content && (
                <div className="text-sm text-gray-600 mb-4 whitespace-pre-wrap break-words">
                  {note.content}
                </div>
              )}

              <div className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                {formatDate(note.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingNote ? 'Ndrysho Shenimin' : 'Shenim i Ri'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titulli *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Shkruani titullin e shenimit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Përmbajtja
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Shkruani përmbajtjen e shenimit..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingNote ? 'Ruaj Ndryshimet' : 'Ruaj Shenimin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Fshi Shenimin"
        message="A jeni të sigurt që dëshironi të fshini këtë shenim?"
        itemName={deleteModal.note ? deleteModal.note.title : undefined}
        onConfirm={async () => {
          if (deleteModal.note) {
            setIsDeleting(true);
            try {
              await onDeleteNote(deleteModal.note.id);
              setDeleteModal({ isOpen: false, note: null });
            } catch (error) {
              console.error('Error deleting note:', error);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
        onCancel={() => setDeleteModal({ isOpen: false, note: null })}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default NotesManagement;
