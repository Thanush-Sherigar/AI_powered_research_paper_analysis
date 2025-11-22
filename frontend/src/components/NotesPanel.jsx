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
        <div className="h-[600px] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">My Notes</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Note
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isAdding && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-primary-200 animate-fade-in">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Write your note here..."
                            className="w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none resize-none min-h-[100px]"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.trim()}
                                className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
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
                                ? 'bg-purple-50 border-purple-200'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {editingId === note._id ? (
                                <div>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full bg-gray-100 text-gray-900 p-2 rounded focus:outline-none resize-none min-h-[80px]"
                                    />
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <button onClick={cancelEdit} className="p-1 text-gray-500 hover:text-gray-900">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => saveEdit(note._id)} className="p-1 text-green-600 hover:text-green-700">
                                            <Save className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                            {note.type === 'ai' && (
                                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full flex items-center">
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
                                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
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
