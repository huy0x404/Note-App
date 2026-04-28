/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  ArrowLeft, 
  MoreVertical, 
  Check, 
  X,
  StickyNote,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  color: string;
}

const NOTE_COLORS = [
  'bg-slate-50',
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-purple-50',
  'bg-pink-50',
  'bg-orange-50',
];

// --- Utilities ---
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('material_notes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('material_notes', JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery]);

  const addNote = () => {
    setIsCreating(true);
    setEditingNote({
      id: generateId(),
      title: '',
      content: '',
      updatedAt: Date.now(),
      color: NOTE_COLORS[0],
    });
  };

  const saveNote = (note: Note) => {
    if (isCreating) {
      setNotes([...notes, { ...note, updatedAt: Date.now() }]);
    } else {
      setNotes(notes.map(n => n.id === note.id ? { ...note, updatedAt: Date.now() } : n));
    }
    setEditingNote(null);
    setIsCreating(false);
  };

  const deleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1C1B1F] font-sans overflow-x-hidden selection:bg-blue-100">
      <AnimatePresence mode="wait">
        {!editingNote ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-screen"
          >
            {/* Header / Search */}
            <header className="px-4 py-4 sm:px-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                  <Search className="h-5 w-5 text-[#49454F]" />
                </div>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search your notes"
                  className="w-full bg-[#EFEDF1] rounded-full py-4 pl-12 pr-4 text-[#1C1B1F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </header>

            {/* Notes Grid */}
            <main className="flex-1 overflow-y-auto px-4 pb-24">
              {filteredNotes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4">
                  <StickyNote size={64} strokeWidth={1} />
                  <p className="text-xl font-medium">No notes yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredNotes.map((note) => (
                    <motion.div
                      layoutId={note.id}
                      key={note.id}
                      id={`note-${note.id}`}
                      onClick={() => setEditingNote(note)}
                      className={`${note.color} p-4 rounded-2xl border border-black/5 hover:border-black/10 cursor-pointer shadow-sm active:scale-95 transition-all group relative min-h-[160px] flex flex-col`}
                    >
                      <button 
                        onClick={(e) => deleteNote(note.id, e)}
                        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-black/5 rounded-full transition-all"
                      >
                        <Trash2 size={16} className="text-[#49454F]" />
                      </button>
                      <h3 className="font-semibold text-lg line-clamp-2 mb-1">{note.title || 'Untitled'}</h3>
                      <p className="text-[#49454F] text-sm line-clamp-4 flex-1">
                        {note.content || 'No content'}
                      </p>
                      <div className="mt-3 flex items-center text-[10px] text-[#49454F] opacity-60 uppercase tracking-wider font-bold">
                        <Clock size={10} className="mr-1" />
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </main>

            {/* Floating Action Button */}
            <motion.button
              id="fab-add"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={addNote}
              className="fixed bottom-8 right-8 w-16 h-16 bg-[#D3E3FD] shadow-lg rounded-2xl flex items-center justify-center text-[#041E49] hover:bg-[#B3D1FC] transition-colors"
            >
              <Plus size={32} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed inset-0 z-50 flex flex-col ${editingNote.color}`}
          >
            {/* Editor Header */}
            <header className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-md">
              <button 
                id="back-button"
                onClick={() => setEditingNote(null)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              
              <div className="flex gap-2">
                {NOTE_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditingNote({ ...editingNote, color })}
                    className={`w-6 h-6 rounded-full border border-black/10 ${color} ${editingNote.color === color ? 'ring-2 ring-blue-500' : ''}`}
                  />
                ))}
              </div>

              <button 
                id="save-button"
                onClick={() => saveNote(editingNote)}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Check size={20} />
                Save
              </button>
            </header>

            {/* Editor Body */}
            <main className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">
              <input
                id="title-input"
                autoFocus
                type="text"
                placeholder="Title"
                className="bg-transparent border-none text-4xl font-bold placeholder:text-black/20 focus:ring-0 mb-6 w-full"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              />
              <textarea
                id="content-input"
                placeholder="Write something..."
                className="flex-1 bg-transparent border-none text-xl leading-relaxed placeholder:text-black/20 focus:ring-0 w-full resize-none"
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
