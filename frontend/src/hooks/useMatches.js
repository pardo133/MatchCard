import { useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

export function useMatches() {
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get('/matches');
      setMatches(data.matches);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando matches');
    } finally {
      setLoading(false);
    }
  }, []);

  const findMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get('/matches/find');
      setMatches(data.matches);
      return data.matches;
    } catch (err) {
      setError(err.response?.data?.message || 'Error buscando matches');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (matchId, status) => {
    try {
      await axiosClient.put(`/matches/${matchId}/status`, { status });
      setMatches(prev =>
        prev.map(m => m._id === matchId ? { ...m, status } : m)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Error actualizando match');
    }
  }, []);

  return { matches, loading, error, fetchMatches, findMatches, updateStatus };
}
