<template>
  <div class="flex flex-col h-screen">
    <div class="flex grow" />
    <div class="flex flex-row">
      <div class="text-white flex-grow" />
      <div class="text-white border-2 border-white rounded-lg m-4 w-96">
        <div class="p-4">
          <h1 class="text-4xl text-center z-10">
            Pocket Fives
          </h1>
          <br>
          <h4 v-if="status !== 'authenticated'" class="text-xl text-center z-10">
            Some Sprint Poker
          </h4>
          <br>
          <div v-if="status !== 'authenticated'" class="flex flex-row justify-center m-2 mt-16">
            <button
              :class="loadingClass"
              @click="localSignIn"
            />
          </div>
          <div v-if="status !== 'authenticated'" class="flex flex-row justify-center -mt-[54px] mb-6 hover:cursor-pointer" @click="localSignIn">
            <div class="inline-block z-10 border border-white rounded-md p-2">
              <Icon name="tabler:brand-github" size="24px" class="-mt-1 mr-2" />
              Sign-In with Github
            </div>
          </div>
          <div v-if="status === 'authenticated'">
            <h4 class="text-xl text-center z-10">
              Welcome, {{ data?.user?.name }}
            </h4>
            <div class="flex flex-row justify-center mt-16">
              <input
                v-model="roomIdString"
                class="border border-white focus:placeholder:text-zinc-500 placeholder:text-white rounded-lg bg-transparent p-2 py-1 m-2 outline-none w-[170px] text-white"
                placeholder="Enter Room Code"
                @keyup.enter="gotoRoom"
              >
              <Icon name="tabler:square-rounded-arrow-right" size="22px" class="mt-[14px] -ml-[36px] hover:cursor-pointer" @click="gotoRoom" />
              <Icon v-if="roomLoading" name="tabler:circle-dashed" size="24px" class="animate-spin mt-3" />
            </div>
            <div class="flex flex-row justify-center">
              <button
                class="border border-white rounded-lg p-2 pt-[2px] pb-1 m-2 inline-block text-white"
                @click="newRoom"
              >
                New Room
              </button>
              <Icon v-if="newRoomLoading" name="tabler:circle-dashed" size="24px mt-3" class="animate-spin" />
            </div>
            <div class="flex flex-row justify-center">
              <button
                class="border-2 mx-2 mt-1 border-red-600 text-red-600 font-semibold rounded-lg p-1 pt-[1px] pb-[2px]"
                @click="() => signOut()"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="text-white flex-grow" />
    </div>
    <div class="flex-grow" />
  </div>
</template>

<script setup>
definePageMeta({ auth: false })

const { data, signIn, signOut, status } = useAuth()
const loading = ref(false)
const newRoomLoading = ref(false)
const roomLoading = ref(false)
const roomIdString = ref('')
const roomId = computed(() => {
  return parseInt(roomIdString.value)
})

const localSignIn = async () => {
  loading.value = true
  await signIn('github', { redirect: false })
  loading.value = false
}

const loadingClass = computed(() => {
  return loading.value ? 'loading' : 'notLoading'
})

const newRoom = async () => {
  newRoomLoading.value = true
  const { $client } = useNuxtApp()
  const room = await $client.room.create.useQuery({
    name: 'New Room',
    maxUsers: 10
  })
  if (room.error.value?.data || !room.data.value) {
    newRoomLoading.value = false
    return
  }
  await navigateTo({
    path: `/room/${('0000' + room.data.value.id.toString()).slice(-4)}`
  })
  newRoomLoading.value = false
}

const gotoRoom = async () => {
  roomLoading.value = true
  if (roomIdString.value.length !== 4 || isNaN(roomId.value) || roomId.value < 1 || roomId.value > 9999) {
    roomLoading.value = false
    return
  }
  const { $client } = useNuxtApp()
  const room = await $client.room.get.useQuery({ id: roomId.value })
  if (!room.data?.value?.id) {
    roomLoading.value = false
    return
  }
  await navigateTo({
    path: `/room/${('0000' + room.data.value.id.toString()).slice(-4)}`
  })
  roomLoading.value = false
}
</script>

<style scoped>
.loading {
  min-width: 198px;
  height: 50px;
  position: relative;
  cursor: pointer;
  color: white;
  text-align: center;
  line-height: 50px;
  border-radius: 10px;
}

.notLoading {
  min-width: 198px;
  height: 50px;
  position: relative;
  border-color: white;
  cursor: pointer;
  color: white;
  text-align: center;
  line-height: 50px;
  border-radius: 10px;
}

.loading::after {
  content: "";
  display: block;
  position: absolute;
  background: black;
  inset: 4px;
  color: white;
  border-radius: 5px;
}

@property --r {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@property --r2 {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@property --x {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}

.loading {
  background: conic-gradient(from calc(var(--r2) - 80deg) at var(--x) 17px, #000000 0%, #fb923c 20%, #000000 25%);
  border-radius: 10px;
  animation: -0.64s rotating2 3s linear infinite, -0.64s x 3s linear infinite;
}

@keyframes x {
  0% {
    --x: 27px;
  }
  32.82275711% {
    --x: 175px;
  }
  50% {
    --x: 175px;
  }
  82.82275711% {
    --x: 27px;
  }
  100% {
    --x: 27px;
  }
}

@keyframes rotating2 {
  0% {
    --r2: 0deg;
  }
  32.82275711% {
    --r2: 0deg;
  }
  50% {
    --r2: 180deg;
  }
  82.82275711% {
    --r2: 180deg;
  }
  100% {
    --r2: 360deg;
  }
}

</style>
