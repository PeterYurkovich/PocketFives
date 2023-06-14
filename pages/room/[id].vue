<template>
  <div class="flex flex-col h-screen">
    <NuxtLink class="fixed top-0 left-0 right-0 text-white" to="/">
      <Icon name="tabler:cards" size="2rem" class="hover:cursor-pointer m-3" />
    </NuxtLink>
    <div class="flex grow" />
    <template v-if="!newRoom.active">
      <div class="flex flex-row">
        <div class="text-white flex-grow" />
        <div class="text-white border-2 border-white rounded-lg m-4 w-96">
          <div>
            <h1 class="text-white text-2xl flex flex-row content-center justify-center mt-2 mb-12">
              Room Number {{ parseInt(roomName) }}
              <Icon name="tabler:copy" size="1.5rem" class="hover:cursor-pointer ml-1 mt-[6px]" @click="copyRoomId" />
            </h1>
            <div>
              <h4 class="text-white text-xl flex flex-row content-center justify-center font-semibold">
                Topic: {{ roomInfo.name }}
                <Icon name="tabler:pencil" size="1rem" class="hover:cursor-pointer ml-1 mt-[7px]" @click="newRoom.active = true" />
              </h4>
              <p class="text-white italic flex flex-row content-center justify-center mb-12">
                {{ roomInfo.description }}
              </p>
            </div>
          </div>
        </div>
        <div class="text-white flex-grow" />
      </div>
      <div class="flex flex-row">
        <div class="text-white flex-grow" />
        <div class="text-white border-2 border-white rounded-lg m-4 w-96">
          <h4 class="text-white text-2xl font-semibold flex flex-row content-center justify-center">
            Average Rating
          </h4>
          <h4 class="text-white text-2xl flex flex-row content-center justify-center">
            {{ averageVote.toFixed(2) }} points
          </h4>
          <div class="m-4">
            <div class="grid grid-cols-3 gap-4">
              <button
                v-for="x in [0, 1, 2, 3, 5, 8, 13, 20, 40]"
                :key="`key_${x}`"
                :class="vote === x ? 'bg-white text-black mix-blend-screen rounded font-bold text-2xl' : 'border-2 border-white text-white rounded text-2xl'"
                @click="changeVote(x)"
              >
                {{ x }}
              </button>
            </div>
          </div>
        </div>
        <div class="text-white flex-grow" />
      </div>
    </template>
    <div v-if="newRoom.active" class="flex flex-row">
      <div class="text-white flex-grow" />
      <div class="text-white border-2 border-white rounded-lg m-4 w-96">
        <h1 class="text-white text-2xl flex flex-row content-center justify-center mt-2">
          New Topic
        </h1>
        <div class="flex flex-row justify-center">
          <input
            v-model="newRoom.name"
            class="border-b-2 focus:placeholder:text-zinc-400 placeholder:text-white bg-transparent py-1 m-2 outline-none w-[170px] text-white"
            placeholder="New Room Topic"
          >
        </div>
        <div class="flex flex-row justify-center">
          <input
            v-model="newRoom.description"
            class="border-b-2 focus:placeholder:text-zinc-400 placeholder:text-white bg-transparent py-1 m-2 outline-none w-[170px] text-white"
            placeholder="New Room Description"
            @keyup.enter="changeRoomData"
          >
        </div>
        <div class="flex flex-row justify-center text-red-600 mb-2 italic">
          {{ newRoom.error }}
        </div>
        <div class="flex flex-row content-center justify-center mb-2">
          <button class="border-2 mx-2 border-white text-white rounded p-1" @click="changeRoomData">
            Submit
          </button>
          <button class="border-2 mx-2 border-red-600 text-red-600 font-semibold rounded p-1" @click="clearRoomChange">
            Cancel
          </button>
        </div>
      </div>
      <div class="text-white flex-grow" />
    </div>
    <div class="text-white flex-grow" />
  </div>
</template>

<script setup>
import { createClient } from '@liveblocks/client'

const route = useRoute()
const roomName = ref(typeof route.params.id === 'object' ? '' : route.params.id)
const vote = ref(null)
const newRoom = ref({
  active: true,
  name: '',
  description: '',
  error: ''
})
const roomInfo = ref({
  name: 'Gamers',
  description: 'Do gamers deserve rights?'
})
const session = await useAuth().getSession()
const allUsers = ref([])
const { $client } = useNuxtApp()

const client = createClient({
  authEndpoint: '/api/liveAuth/auth'
})

const room = client.enter(roomName.value, {
  initialPresence: {
    id: unref(session?.userId ?? '0'),
    name: unref(useAuth().data.value?.user?.name || ':)'),
    vote: unref(vote.value)
  },
  initialStorage: {
    topic: {
      name: roomInfo.value.name,
      description: roomInfo.value.description
    }
  }
})

const unsubscribeRoomOthers = room.subscribe('others', (others) => {
  allUsers.value = [...others]
})

const { root } = await room.getStorage()
if (root.get('topic').name !== 'Gamers') {
  newRoom.value.active = false
}

const updateRoomInfo = (newRoot) => {
  const topic = newRoot.get('topic')
  roomInfo.value.name = topic.name
  roomInfo.value.description = topic.description
  if (roomInfo.value.name !== 'Gamers') {
    newRoom.value.active = false
  }
}

const averageVote = computed(() => {
  const votes = allUsers.value.map(user => user.presence.vote)
  votes.push(vote.value)
  const sum = votes.reduce((a, b) => b === null ? a : a + b, 0)
  return sum / votes.length
})

const saveVote = async (name, description, roomId, vote) => {
  const createdVote = await $client.vote.create.useQuery({
    name,
    description,
    roomId,
    vote
  })
  if (createdVote.error.value?.data || !createdVote.data.value) {
    newRoom.value.error = 'Failed to create topic'
  }
}

const unsubscribeRoomStorage = room.subscribe(root, (newRoot) => {
  saveVote(roomInfo.value.name, roomInfo.value.description, parseInt(roomName.value), vote.value)
  updateRoomInfo(newRoot)
})

updateRoomInfo(root)

onUnmounted(() => {
  unsubscribeRoomOthers()
  unsubscribeRoomStorage()
})

const changeVote = (newVote) => {
  vote.value = newVote
  room.updatePresence({
    id: session.userId,
    name: useAuth().data.value?.user?.name || ':)',
    vote: newVote
  })
}

const clearRoomChange = () => {
  newRoom.value.name = ''
  newRoom.value.description = ''
  newRoom.value.error = ''
  newRoom.value.active = false
  changeVote(0)
}

const changeRoomData = async () => {
  if (!newRoom.value.name) {
    newRoom.value.error = 'Name is required'
    return
  }
  if (!newRoom.value.description) {
    newRoom.value.error = 'Description is required'
    return
  }
  if (roomInfo.value.name === newRoom.value.name && roomInfo.value.description === newRoom.value.description) {
    newRoom.value.error = 'No changes made'
    return
  }
  if (roomInfo.value.name !== 'Gamers' || roomInfo.value.description !== 'Do gamers deserve rights?') {
    const createdVote = await $client.topic.create.useQuery({
      name: roomInfo.value.name,
      description: roomInfo.value.description,
      roomId: parseInt(roomName.value),
      vote: vote.value
    })
    if (createdVote.error.value?.data || !createdVote.data.value) {
      newRoom.value.error = 'Failed to create topic'
      return
    }
  }
  root.set('topic', {
    name: newRoom.value.name,
    description: newRoom.value.description
  })
  clearRoomChange()
}

definePageMeta({
  validate: async (route) => {
    if (typeof route.params.id === 'object') {
      return false
    }
    if (route.params.id.length !== 4) {
      return false
    }
    const roomId = parseInt(route.params.id)
    if (isNaN(roomId) || roomId < 1 || roomId > 9999) {
      return false
    }
    const { $client } = useNuxtApp()
    const room = await $client.room.get.useQuery({ id: roomId })
    if (!room.data?.value?.id) {
      return false
    }
    return true
  }
})

const copyRoomId = () => {
  const { copy } = useClipboard()
  copy(roomName.value)
}
</script>
