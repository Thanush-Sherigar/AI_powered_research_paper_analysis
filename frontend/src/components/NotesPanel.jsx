import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, Edit2, Save, X } from 'lucide-react';
import { notesAPI } from '../services/api';

export default function NotesPanel({ paperId }) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        loadNotes();
    }, [paperId]);

    const loadNotes = async () => {
        try {
            const response = await notesAPI.getAll(paperId);
            setNotes(response.data.notes);
        } catch (error) {
            console.error('Failed to load notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            const response = await notesAPI.create(paperId, { content: newNote });
            setNotes([response.data.note, ...notes]);
            setNewNote('');
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            await notesAPI.delete(id);
            setNotes(notes.filter((n) => n._id !== id));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const startEdit = (note) => {
        setEditingId(note._id);
        setEditContent(note.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const saveEdit = async (id) => {
        try {
            const response = await notesAPI.update(id, { content: editContent });
            setNotes(notes.map((n) => (n._id === id ? response.data.note : n)));
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    return (
        <div className="h-[600px] flex flex-col bg-slate-900/50 rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg">My Notes</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center text-sm bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Note
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isAdding && (
                    <div className="bg-white/10 rounded-lg p-4 border border-primary-500/50 animate-fade-in">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Write your note here..."
                            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none min-h-[100px]"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.trim()}
                                className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="spinner w-6 h-6"></div>
                    </div>
                ) : notes.length === 0 && !isAdding ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No notes yet. Click "Add Note" to start taking notes.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note._id}
                            className={`group relative p-4 rounded-lg border transition-all ${note.type === 'ai'
                                    ? 'bg-purple-500/10 border-purple-500/30'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            {editingId === note._id ? (
                                <div>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full bg-black/20 text-white p-2 rounded focus:outline-none resize-none min-h-[80px]"
                                    />
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <button onClick={cancelEdit} className="p-1 text-gray-400 hover:text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => saveEdit(note._id)} className="p-1 text-green-400 hover:text-green-300">
                                            <Save className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                            {note.type === 'ai' && (
                                                <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full flex items-center">
                                                    <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(note)}
                                                className="p-1.5 text-gray-400 hover:text-blue-400 rounded hover:bg-white/10"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-white/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                    {note.section && (
                                        <div className="mt-2 text-xs text-gray-500 italic">
                                            Section: {note.section}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
