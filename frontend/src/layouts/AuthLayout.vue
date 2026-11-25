<template>
  <div class="flex min-h-screen flex-col justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-md text-center">
      <div class="inline-flex items-center gap-2 rounded-lg bg-blue-900/60 px-3 py-1.5 text-sm font-semibold text-blue-200">
        TESCOM-CI
      </div>
      <h1 class="mt-3 text-2xl font-bold tracking-tight text-white">
        Gestion des Tickets d'Assistance
      </h1>
    </div>

    <div class="mx-auto mt-6 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <router-view />
    </div>
  </div>
</template>
