import { useCallback } from 'react';
import { useToast } from '../state/toast';

/** Екрани, яких немає в затвердженому макеті ЛР6, показують пояснення замість переходу */
export function useOutOfScope() {
  const toast = useToast();
  return useCallback(
    (what?: string) =>
      toast.show({
        text: what ? `${what}: цей екран поза макетом лабораторної роботи.` : 'Цей екран поза макетом лабораторної роботи.',
        persistent: true,
      }),
    [toast],
  );
}

export const isFrameMode = () => typeof document !== 'undefined' && !!document.documentElement.dataset.frame;
