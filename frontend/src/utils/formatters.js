export const ROLE_LABELS = {
  admin: 'Administrateur',
  employe: 'Employé',
  technicien: 'Technicien',
  client: 'Client',
};

export const TYPE_LABELS = {
  incident: 'Incident',
  maintenance: 'Maintenance',
  installation: 'Installation',
  reclamation: 'Réclamation',
  information: 'Information',
  autre: 'Autre',
};

export const PRIORITE_LABELS = {
  faible: 'Faible',
  moyenne: 'Moyenne',
  haute: 'Haute',
  urgente: 'Urgente',
};

export const STATUTS_LIST = [
  'Nouveau',
  'Assigné',
  'En cours',
  'En attente client',
  'Résolu',
  'Clôturé',
];

export const TYPES_LIST = [
  { value: 'incident', label: 'Incident' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'installation', label: 'Installation' },
  { value: 'reclamation', label: 'Réclamation' },
  { value: 'information', label: 'Information' },
  { value: 'autre', label: 'Autre' },
];

export const PRIORITES_LIST = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'haute', label: 'Haute' },
  { value: 'urgente', label: 'Urgente' },
];

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export const formatRole = (role) => ROLE_LABELS[role] || role;
export const formatType = (type) => TYPE_LABELS[type] || type;
export const formatPriorite = (priorite) => PRIORITE_LABELS[priorite] || priorite;
