import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { seedData } from '../services/dbSeedService';
import { toast } from 'react-hot-toast';

export const useSeed = () => {
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, try to seed the database
      const response = await seedData();
      toast.success(response.message);
      // Only clear localStorage and query cache AFTER successful seeding
      localStorage.clear();
      queryClient.clear();
      queryClient.setQueryData(['products'], response.data.data.products);
    } catch (err) {
      console.error('Seed error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSeed, error, isLoading };
};
