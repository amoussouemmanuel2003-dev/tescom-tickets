<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <router-link to="/tickets" class="text-sm font-semibold text-blue-900 hover:underline">
        ← Retour à la liste des tickets
      </router-link>
    </div>

    <AlertMessage :message="feedback" type="success" dismissible @close="feedback = ''" />
    <AlertMessage :message="errorMessage" type="error" dismissible @close="errorMessage = ''" />

    <div v-if="loading" class="rounded-xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
      Chargement du ticket...
    </div>

    <template v-else-if="ticket">
      <!-- En-tête & Informations principales -->
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900">
                {{ ticket.reference }}
              </span>
              <StatusBadge :statut="ticket.statut" />
              <PriorityBadge :priorite="ticket.priorite" />
              <span class="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {{ formatType(ticket.type_demande) }}
              </span>
            </div>
            <h1 class="mt-3 text-2xl font-bold text-slate-900">{{ ticket.titre }}</h1>
          </div>

          <button
            v-if="canEditTicket && !editMode"
            type="button"
            class="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="startEdit"
          >
            Modifier
          </button>
        </div>

        <!-- Mode édition -->
        <form v-if="editMode" class="mt-5 space-y-4 border-t border-slate-200 pt-4" @submit.prevent="submitEdit">
          <div>
            <label class="block text-sm font-medium text-slate-700">Titre *</label>
            <input
              v-model="editForm.titre"
              type="text"
              required
              maxlength="200"
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div v-if="authStore.isStaff" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-slate-700">Type de demande *</label>
              <select
                v-model="editForm.type_demande"
                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option v-for="t in TYPES_LIST" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Priorité *</label>
              <select
                v-model="editForm.priorite"
                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option v-for="p in PRIORITES_LIST" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Description *</label>
            <textarea
              v-model="editForm.description"
              rows="4"
              required
              class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              @click="editMode = false"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="actionLoading"
              class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </form>

        <!-- Description et métadonnées -->
        <template v-else>
          <p class="mt-4 whitespace-pre-line rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            {{ ticket.description }}
          </p>

          <dl class="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt class="text-xs font-medium uppercase text-slate-500">Client</dt>
              <dd class="mt-1 font-semibold text-slate-900">{{ ticket.nom_client }}</dd>
              <dd v-if="ticket.client_telephone" class="text-xs text-slate-500">
                Tél : {{ ticket.client_telephone }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-slate-500">Technicien affecté</dt>
              <dd class="mt-1 font-semibold text-slate-900">
                {{
                  ticket.technicien_nom
                    ? `${ticket.technicien_prenom} ${ticket.technicien_nom}`
                    : 'Non affecté'
                }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-slate-500">Créé par</dt>
              <dd class="mt-1 text-slate-800">
                {{ ticket.cree_par_prenom }} {{ ticket.cree_par_nom }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-slate-500">Date de création</dt>
              <dd class="mt-1 text-slate-800">{{ formatDate(ticket.date_creation) }}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-slate-500">Date de résolution</dt>
              <dd class="mt-1 text-slate-800">{{ formatDate(ticket.date_resolution) }}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-slate-500">Date de clôture</dt>
              <dd class="mt-1 text-slate-800">{{ formatDate(ticket.date_cloture) }}</dd>
            </div>
          </dl>
        </template>
      </div>

      <!-- Panneau d'actions : Affectation & Transition de statut -->
      <div
        v-if="showStaffActions"
        class="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <!-- Affectation technicien (admin / employe uniquement) -->
        <div
          v-if="authStore.isStaff && !isClosed"
          class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 class="text-base font-semibold text-slate-900">
            {{ ticket.technicien_id ? 'Réaffecter un technicien' : 'Affecter un technicien' }}
          </h2>
          <form class="mt-3 space-y-3" @submit.prevent="submitAssign">
            <select
              v-model="assignForm.technicien_id"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="" disabled>Choisir un technicien actif</option>
              <option v-for="tech in techniciens" :key="tech.id" :value="tech.id">
                {{ tech.prenom }} {{ tech.nom }} ({{ tech.email }})
              </option>
            </select>
            <input
              v-model="assignForm.commentaire"
              type="text"
              placeholder="Commentaire d'affectation (optionnel)"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              :disabled="actionLoading"
              class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {{ ticket.technicien_id ? 'Réaffecter' : 'Affecter et passer à Assigné' }}
            </button>
          </form>
        </div>

        <!-- Évolution du statut -->
        <div
          v-if="availableNextStatuses.length > 0"
          class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 class="text-base font-semibold text-slate-900">Faire évoluer le statut</h2>
          <div class="mt-3 space-y-3">
            <input
              v-model="statusComment"
              type="text"
              placeholder="Commentaire de suivi (optionnel)"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div class="flex flex-wrap gap-2">
              <button
                v-for="nextStatus in availableNextStatuses"
                :key="nextStatus"
                type="button"
                :disabled="actionLoading"
                :class="statusButtonClass(nextStatus)"
                class="rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
                @click="submitStatusChange(nextStatus)"
              >
                Passer à « {{ nextStatus }} »
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages et Historique -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <TicketMessages
            :messages="messages"
            :can-post-internal="!authStore.isClient"
            :is-closed="isClosed"
            :submitting="sendingMessage"
            @submit="handleSendMessage"
          />
        </div>
        <div>
          <TicketHistory :historique="historique" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ticketService from '../services/ticketService';
import userService from '../services/userService';
import { extractApiError } from '../services/api';
import { TYPES_LIST, PRIORITES_LIST, formatDate, formatType } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge.vue';
import PriorityBadge from '../components/PriorityBadge.vue';
import AlertMessage from '../components/AlertMessage.vue';
import TicketMessages from '../components/TicketMessages.vue';
import TicketHistory from '../components/TicketHistory.vue';

const route = useRoute();
const authStore = useAuthStore();

const ticket = ref(null);
const messages = ref([]);
const historique = ref([]);
const techniciens = ref([]);

const loading = ref(true);
const actionLoading = ref(false);
const sendingMessage = ref(false);
const editMode = ref(false);
const feedback = ref('');
const errorMessage = ref('');
const statusComment = ref('');

const editForm = reactive({
  titre: '',
  description: '',
  type_demande: 'incident',
  priorite: 'moyenne',
});

const assignForm = reactive({
  technicien_id: '',
  commentaire: '',
});

const isClosed = computed(() => ticket.value?.statut === 'Clôturé');

const canEditTicket = computed(() => {
  if (!ticket.value || isClosed.value) return false;
  if (authStore.isStaff) return true;
  if (authStore.isClient && ticket.value.statut === 'Nouveau') return true;
  return false;
});

const availableNextStatuses = computed(() => {
  if (!ticket.value || isClosed.value || authStore.isClient) return [];

  const current = ticket.value.statut;
  if (current === 'Assigné') return ['En cours'];
  if (current === 'En cours') return ['En attente client', 'Résolu'];
  if (current === 'En attente client') return ['En cours'];
  if (current === 'Résolu') {
    return authStore.isStaff ? ['Clôturé'] : [];
  }
  return [];
});

const showStaffActions = computed(
  () =>
    !isClosed.value &&
    ((authStore.isStaff) || availableNextStatuses.value.length > 0)
);

const statusButtonClass = (statut) => {
  if (statut === 'Résolu') return 'bg-emerald-600 text-white hover:bg-emerald-700';
  if (statut === 'Clôturé') return 'bg-slate-800 text-white hover:bg-slate-900';
  if (statut === 'En attente client') return 'bg-amber-500 text-white hover:bg-amber-600';
  return 'bg-blue-900 text-white hover:bg-blue-800';
};

const loadAll = async () => {
  loading.value = true;
  errorMessage.value = '';
  const id = route.params.id;
  try {
    const [ticketRes, messagesRes, historyRes] = await Promise.all([
      ticketService.getById(id),
      ticketService.getMessages(id),
      ticketService.getHistory(id),
    ]);
    ticket.value = ticketRes.data;
    messages.value = messagesRes.data;
    historique.value = historyRes.data;
    assignForm.technicien_id = ticket.value.technicien_id || '';

    if (authStore.isStaff && techniciens.value.length === 0) {
      const techRes = await userService.getTechniciens();
      techniciens.value = techRes.data;
    }
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de charger ce ticket.');
  } finally {
    loading.value = false;
  }
};

const startEdit = () => {
  editForm.titre = ticket.value.titre;
  editForm.description = ticket.value.description;
  editForm.type_demande = ticket.value.type_demande;
  editForm.priorite = ticket.value.priorite;
  editMode.value = true;
};

const submitEdit = async () => {
  actionLoading.value = true;
  feedback.value = '';
  errorMessage.value = '';
  try {
    const payload = authStore.isClient
      ? { titre: editForm.titre, description: editForm.description }
      : { ...editForm };
    const res = await ticketService.update(ticket.value.id, payload);
    ticket.value = res.data;
    editMode.value = false;
    feedback.value = res.message;
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de modifier le ticket.');
  } finally {
    actionLoading.value = false;
  }
};

const submitAssign = async () => {
  actionLoading.value = true;
  feedback.value = '';
  errorMessage.value = '';
  try {
    const res = await ticketService.assign(ticket.value.id, {
      technicien_id: Number(assignForm.technicien_id),
      commentaire: assignForm.commentaire,
    });
    feedback.value = res.message;
    assignForm.commentaire = '';
    await loadAll();
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible d\'affecter ce technicien.');
  } finally {
    actionLoading.value = false;
  }
};

const submitStatusChange = async (nextStatus) => {
  actionLoading.value = true;
  feedback.value = '';
  errorMessage.value = '';
  try {
    const res =
      nextStatus === 'Clôturé'
        ? await ticketService.close(ticket.value.id, { commentaire: statusComment.value })
        : await ticketService.changeStatus(ticket.value.id, {
            statut: nextStatus,
            commentaire: statusComment.value,
          });
    feedback.value = res.message;
    statusComment.value = '';
    await loadAll();
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible de modifier le statut.');
  } finally {
    actionLoading.value = false;
  }
};

const handleSendMessage = async (payload, resetForm) => {
  sendingMessage.value = true;
  errorMessage.value = '';
  try {
    const res = await ticketService.createMessage(ticket.value.id, payload);
    messages.value.push(res.data);
    resetForm();
  } catch (err) {
    errorMessage.value = extractApiError(err, 'Impossible d\'envoyer le message.');
  } finally {
    sendingMessage.value = false;
  }
};

onMounted(loadAll);
</script>
