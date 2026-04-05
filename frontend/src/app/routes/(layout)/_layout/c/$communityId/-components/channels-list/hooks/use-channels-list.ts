import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useParams, useRouteContext, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import {
  deleteChannelsChannelIdMutation,
  getChannelsChannelIdOptions,
  getCommunitiesCommunityIdChannelsOptions,
  getCommunitiesCommunityIdOptions,
  patchChannelsChannelIdMutation,
  postCommunitiesCommunityIdChannelsMutation,
} from '@/api/@tanstack/react-query.gen'
import { useDisclosure } from '@/hooks/use-disclosure'
import { queryClient } from '@/lib/query-client'

export interface ChannelListItem {
  id: number
  communityId: number
  name: string
  description?: string
  createdAt: string
}

export function useChannelsList() {
  const router = useRouter()
  const params = useParams({ strict: false })
  const { user } = useRouteContext({ from: '__root__' })

  const communityId = Number(params.communityId)
  const channelId = params.channelId ? Number(params.channelId) : null

  const [editingChannel, setEditingChannel] = useState<ChannelListItem | null>(null)
  const [channelToDelete, setChannelToDelete] = useState<ChannelListItem | null>(null)

  const createDialog = useDisclosure()
  const updateDialog = useDisclosure(false, {
    onClose: () => setEditingChannel(null),
  })
  const deleteDialog = useDisclosure(false, {
    onClose: () => setChannelToDelete(null),
  })

  const communityQueryOptions = getCommunitiesCommunityIdOptions({
    path: { communityId },
  })
  const channelsQueryOptions = getCommunitiesCommunityIdChannelsOptions({
    path: { communityId },
  })

  const communityQuery = useSuspenseQuery(communityQueryOptions)
  const channelsQuery = useSuspenseQuery(channelsQueryOptions)

  const createChannelMutation = useMutation(postCommunitiesCommunityIdChannelsMutation())
  const updateChannelMutation = useMutation(patchChannelsChannelIdMutation())
  const deleteChannelMutation = useMutation(deleteChannelsChannelIdMutation())

  const isOwner = communityQuery.data.community.ownerId === user?.id

  const createChannel = async (value: { name: string, description: string }) => {
    const { channel } = await createChannelMutation.mutateAsync({
      path: { communityId },
      body: {
        name: value.name,
        description: value.description || undefined,
      },
    })

    createDialog.close()

    await queryClient.invalidateQueries(channelsQueryOptions)
    await router.navigate({
      to: '/c/$communityId/$channelId',
      params: {
        communityId,
        channelId: channel.id,
      },
    })
  }

  const updateChannel = async (value: { name: string, description: string }) => {
    if (!editingChannel)
      return

    await updateChannelMutation.mutateAsync({
      path: { channelId: editingChannel.id },
      body: {
        name: value.name,
        description: value.description,
      },
    })

    updateDialog.close()

    await Promise.all([
      queryClient.invalidateQueries(channelsQueryOptions),
      queryClient.invalidateQueries(getChannelsChannelIdOptions({
        path: { channelId: editingChannel.id },
      })),
    ])
  }

  const deleteChannel = async () => {
    if (!channelToDelete)
      return

    const deletedChannelId = channelToDelete.id

    await deleteChannelMutation.mutateAsync({
      path: { channelId: deletedChannelId },
    })

    deleteDialog.close()

    if (channelId === deletedChannelId) {
      await router.navigate({
        to: '/c/$communityId',
        params: { communityId },
      })
    }

    await queryClient.invalidateQueries(channelsQueryOptions)
  }

  const openCreate = () => {
    createDialog.open()
  }

  const openUpdate = (channel: ChannelListItem) => {
    setEditingChannel(channel)
    updateDialog.open()
  }

  const openDelete = (channel: ChannelListItem) => {
    setChannelToDelete(channel)
    deleteDialog.open()
  }

  return {
    state: {
      channelId,
      isOwner,
      editingChannel,
      channelToDelete,
    },
    queries: {
      community: communityQuery,
      channels: channelsQuery,
    },
    mutations: {
      createChannel: createChannelMutation,
      updateChannel: updateChannelMutation,
      deleteChannel: deleteChannelMutation,
    },
    functions: {
      createChannel,
      updateChannel,
      deleteChannel,
      openCreate,
      openUpdate,
      openDelete,
    },
    features: {
      createDialog,
      updateDialog,
      deleteDialog,
    },
  }
}
