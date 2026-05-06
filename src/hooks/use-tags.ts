import { useMutation, useQuery } from 'convex/react';

import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { TagField } from '../constants/tags';

export type Tag = {
  id: string;
  label: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
};

export function useTags(field: TagField) {
  const data = useQuery(api.tags.getTags, { field });

  return {
    tags: data ?? [],
    isLoading: data === undefined,
  };
}

export function useHasSystemTags() {
  const data = useQuery(api.tags.hasSystemTags, {});
  return {
    hasSystemTags: data ?? false,
    isLoading: data === undefined,
  };
}

export function useEnsureSystemTags() {
  const mutate = useMutation(api.tags.ensureSystemTags);

  return async () => {
    return await mutate({});
  };
}

export function useSyncSystemTags() {
  const mutate = useMutation(api.tags.syncSystemTags);

  return async () => {
    return await mutate({});
  };
}

export function useAddTag() {
  const mutate = useMutation(api.tags.addTag);

  return async (field: TagField, label: string) => {
    return await mutate({ field, label });
  };
}

export function useDisableTag() {
  const mutate = useMutation(api.tags.disableTag);

  return async (id: string) => {
    await mutate({ id: id as Id<'tags'> });
  };
}

export function useDeleteTag() {
  const mutate = useMutation(api.tags.deleteTag);

  return async (id: string) => {
    await mutate({ id: id as Id<'tags'> });
  };
}
