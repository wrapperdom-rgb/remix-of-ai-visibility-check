import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Get unique queries
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
        <Card>
          <CardHeader>
            <CardTitle>Review Your Queries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Edit, remove, or add queries before running the scan.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {uniqueQueries.map((query, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                    {editingIdx === idx ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(query)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingIdx(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{query}</span>
                        <Button size="icon" variant="ghost" onClick={() => { setEditingIdx(idx); setEditValue(query); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(query)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}

                {addingQuery ? (
                  <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                    <Input
                      value={newQuery}
                      onChange={e => setNewQuery(e.target.value)}
                      placeholder="Enter a query..."
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" onClick={handleAdd}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setAddingQuery(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : uniqueQueries.length < queryLimit ? (
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setAddingQuery(true)}>
                    <Plus className="h-4 w-4" /> Add Query
                  </Button>
                ) : null}
              </>
            )}

            <div className="pt-4">
              <Button
                className="w-full gradient-hero border-0"
                onClick={() => navigate(`/scan/${scanId}/running`)}
                disabled={uniqueQueries.length === 0}
              >
                Run Scan ({uniqueQueries.length} queries × 4 platforms)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
