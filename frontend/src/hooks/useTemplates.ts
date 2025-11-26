/**
 * Custom Hook para gestionar plantillas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockTemplatesService } from '../services/mockApi';
import { Template } from '../types';
import { toast } from 'react-toastify';

export const useTemplates = (filters?: { type?: string; search?: string }) => {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () => mockTemplatesService.getAll(filters),
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => mockTemplatesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Template>) => mockTemplatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Plantilla creada exitosamente');
    },
    onError: () => {
      toast.error('Error al crear la plantilla');
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Template> }) =>
      mockTemplatesService.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] });
      toast.success('Plantilla actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar la plantilla');
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockTemplatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Plantilla eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar la plantilla');
    },
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockTemplatesService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Plantilla duplicada exitosamente');
    },
    onError: () => {
      toast.error('Error al duplicar la plantilla');
    },
  });
};
