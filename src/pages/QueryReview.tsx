import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';

const PLATFORMS = ['chatgpt', 'perplexity', 'claude', 'gemini'];

export default function QueryReview() {
  const { scanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingQuery, setAddingQuery] = useState(false);
  const [newQuery, setNewQuery] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['scan-results', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .eq('scan_id', scanId!)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!scanId,
  });

  const uniqueQueries = results
    ? [...new Set(results.map(r => r.query_text))]
    : [];

  const queryLimit = profile?.plan === 'pro' ? 25 : 10;

  const handleEdit = async (oldQuery: string) => {
    if (!editValue.trim()) return;
    const { error } = await supabase
      .from('scan_results')
      .update({ query_text: editValue.trim() })
      .eq('scan_id', scanId!)
      .eq('query_text', oldQuery);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['scan-results', scanId] });
      setEditingIdx(null);
    }
  };

  const handleDelete = async (query: string) => {
    const { error } = await supabase
      .from('scan_results')
      .delete()
      .eq('scan_id', scanId!)
      .eq('query_text', query);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['scan-results', scanId] });
    }
  };

  const handleAdd = async () => {
    if (!newQuery.trim() || !scanId) return;
    const rows = PLATFORMS.map(platform => ({
      scan_id: scanId,
      query_text: newQuery.trim(),
      platform,
    }));
    const { error } = await supabase.from('scan_results').insert(rows);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['scan-results', scanId] });
      setNewQuery('');
      setAddingQuery(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="paper-card">
          <div className="p-5 border-b-2 border-foreground/10">
            <h2 className="font-mono-display font-bold text-lg uppercase tracking-wider">Review Your Queries</h2>
            <p className="text-xs text-muted-foreground mt-1">Edit, remove, or add queries before running the scan.</p>
          </div>
          <div className="p-5 space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {uniqueQueries.map((query, idx) => (
                  <div key={idx} className="flex items-center gap-2 border-2 border-foreground/10 rounded-sm px-3 py-2">
                    {editingIdx === idx ? (
                      <>
                        <input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="paper-input flex-1"
                          autoFocus
                        />
                        <button onClick={() => handleEdit(query)} className="p-1.5 hover:bg-secondary rounded-sm">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditingIdx(null)} className="p-1.5 hover:bg-secondary rounded-sm">
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{query}</span>
                        <button onClick={() => { setEditingIdx(idx); setEditValue(query); }} className="p-1.5 hover:bg-secondary rounded-sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(query)} className="p-1.5 hover:bg-secondary rounded-sm">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {addingQuery ? (
                  <div className="flex items-center gap-2 border-2 border-foreground/10 rounded-sm px-3 py-2">
                    <input
                      value={newQuery}
                      onChange={e => setNewQuery(e.target.value)}
                      placeholder="Enter a query..."
                      className="paper-input flex-1"
                      autoFocus
                    />
                    <button onClick={handleAdd} className="p-1.5 hover:bg-secondary rounded-sm">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setAddingQuery(false)} className="p-1.5 hover:bg-secondary rounded-sm">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : uniqueQueries.length < queryLimit ? (
                  <button onClick={() => setAddingQuery(true)} className="paper-btn-outline text-xs py-2 px-3 flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add Query
                  </button>
                ) : null}
              </>
            )}

            <div className="pt-4">
              <button
                className="paper-btn-primary w-full text-xs py-3"
                onClick={() => navigate(`/scan/${scanId}/running`)}
                disabled={uniqueQueries.length === 0}
              >
                Run Scan ({uniqueQueries.length} queries × 4 platforms) →
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
