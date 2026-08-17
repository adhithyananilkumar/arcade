import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InterestService } from './interest.service';

export const interestKeys = {
  list: () => ['interests', 'list'] as const,
  mine: () => ['interests', 'mine'] as const,
};

/** Public, canonical interest taxonomy — replaces any hardcoded frontend interest list. */
export function useInterestsQuery() {
  return useQuery({
    queryKey: interestKeys.list(),
    queryFn: () => InterestService.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyInterestsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: interestKeys.mine(),
    queryFn: () => InterestService.getMine(),
    enabled,
  });
}

export function useUpdateMyInterestsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (interestIds: string[]) => InterestService.updateMine(interestIds),
    onSuccess: (updated) => {
      queryClient.setQueryData(interestKeys.mine(), updated);
    },
  });
}
