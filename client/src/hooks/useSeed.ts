import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { seedData } from '../services/dbSeedService';

export const useSeed = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const response = await seedData();

      // Clear localStorage and query cache
      localStorage.clear();
      queryClient.clear();
      queryClient.setQueryData(['products'], response.data.products);

      setMessage('Database seeded successfully');
    } catch (err) {
      console.error('Seed error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSeed, message, error, isLoading };
};
