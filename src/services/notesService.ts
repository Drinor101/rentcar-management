import { supabase } from '../lib/supabase';
import type { Note } from '../types';

// Convert Supabase note to app Note type
const mapNoteFromDB = (note: any): Note => ({
  id: note.id,
  title: note.title,
  content: note.content || '',
  userId: note.user_id,
  createdAt: note.created_at,
  updatedAt: note.updated_at,
});

// Convert app Note type to Supabase insert type
const mapNoteToDB = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): any => ({
  title: note.title,
  content: note.content || null,
  user_id: note.userId,
});

export const notesService = {
  // Get all notes (for admin)
  async getAll(): Promise<Note[]> {
    const { data, error } = await (supabase
      .from('notes') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapNoteFromDB);
  },

  // Get all notes for a user
  async getByUserId(userId: string): Promise<Note[]> {
    const { data, error } = await (supabase
      .from('notes') as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapNoteFromDB);
  },

  // Get note by ID
  async getById(id: string): Promise<Note | null> {
    const { data, error } = await (supabase
      .from('notes') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapNoteFromDB(data) : null;
  },

  // Create new note
  async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const noteData = mapNoteToDB(note);
    
    const { data, error } = await (supabase
      .from('notes') as any)
      .insert(noteData as any)
      .select('*')
      .single();

    if (error) throw error;
    return mapNoteFromDB(data);
  },

  // Update note
  async update(id: string, note: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Note> {
    const updateData: any = {};
    
    if (note.title !== undefined) updateData.title = note.title;
    if (note.content !== undefined) updateData.content = note.content || null;

    const { data, error } = await (supabase
      .from('notes') as any)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapNoteFromDB(data);
  },

  // Delete note
  async delete(id: string): Promise<void> {
    const { error } = await (supabase
      .from('notes') as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
