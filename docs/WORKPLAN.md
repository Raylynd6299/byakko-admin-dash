# Byakko Admin Panel — Work Plan

## Execution Order

```
Fase 0 (UI base) → Fase 1 (Dashboard) → Fase 2 (Clients)
                                               ↓
                               Fase 3 (Users) + Fase 4 (Categories)
                                               ↓
                                       Fase 5 (Permissions)
                                               ↓
                                   Fase 6 (Relation Conditions)
```

Clients desbloquea todo — sin `client_id` no hay users, categories, permissions ni relation conditions.

---

## Fase 0 — Componentes comunes (BLOQUEANTE)

> Todo el resto los usa. Deben existir antes de cualquier página de datos.

| Status | Componente | Para qué sirve |
|--------|-----------|----------------|
| [ ] | `components/ui/button/` | Botón tipado con variants (`default`, `destructive`, `ghost`, `outline`) |
| [ ] | `components/ui/badge/` | Status activo/inactivo, colores semánticos |
| [ ] | `components/ui/input/` | Input base reutilizable con estados de error |
| [ ] | `components/ui/dialog/` | Modal para creates y edits |
| [ ] | `components/ui/table/` | Table, Thead, Tbody, Tr, Th, Td tipados |
| [ ] | `components/common/page-header/` | Título de página + botón de acción primaria |
| [ ] | `components/common/data-table/` | Wrapper genérico `DataTable<T>` con columnas tipadas |
| [ ] | `components/common/empty-state/` | Cuando no hay datos |
| [ ] | `components/common/error-state/` | Cuando falla el fetch |
| [ ] | `components/common/status-badge/` | `active` / `inactive` visual |
| [ ] | `components/common/confirm-dialog/` | "¿Estás seguro?" antes de un delete |

---

## Fase 1 — Dashboard

> Solo lectura. Agrega datos de múltiples dominios en una sola vista.

| Status | Elemento | Datos |
|--------|---------|-------|
| [ ] | Stat card: Total clients | `GET /clients` → `length` |
| [ ] | Stat card: Total users | `GET /users` → `length` |
| [ ] | Stat card: Total permissions | `GET /permissions` → `length` |
| [ ] | Stat card: Total categories | `GET /categories` → `length` |
| [ ] | Lista reciente: últimos 5 clients | De la lista de clients |
| [ ] | Lista reciente: últimos 5 users | De la lista de users |

**Archivos:**
```
pages/dashboard/index.tsx
components/dashboard/
  index.tsx
  components/
    stat-card/index.tsx
    recent-clients/index.tsx
    recent-users/index.tsx
```

---

## Fase 2 — Clients

> Dominio central — cada entidad del sistema pertenece a un client (tenant).

| Status | Feature | Endpoints |
|--------|---------|-----------|
| [ ] | Lista paginada con status | `GET /clients` |
| [ ] | Crear client (dialog) | `POST /clients` → muestra api_key generado |
| [ ] | Editar client (dialog) | `PUT /clients/:id` |
| [ ] | Toggle activo/inactivo | `PUT /clients/:id` `{ is_active }` |
| [ ] | Eliminar client (confirm) | `DELETE /clients/:id` |
| [ ] | Detail page: info + users del client | `GET /clients/:id` + `GET /users?client_id=` |

**Archivos:**
```
services/clients.service.ts
schemas/client.schema.ts
hooks/queries/useClients.ts
hooks/mutations/useClientMutations.ts
pages/clients/index.tsx
pages/clients/detail/index.tsx
components/clients/
  index.tsx
  components/
    client-list-item/index.tsx
    client-actions/index.tsx
    client-form/index.tsx
    client-api-key-dialog/index.tsx
```

---

## Fase 3 — Users

> Depende de Clients para el filtro `client_id`.

| Status | Feature | Endpoints |
|--------|---------|-----------|
| [ ] | Lista con filtro por client y status | `GET /users?client_id=&status=` |
| [ ] | Crear user (dialog) | `POST /users` |
| [ ] | Editar user (dialog) | `PATCH /users/:id?client_id=` |
| [ ] | Eliminar user (confirm) | `DELETE /users/:id?client_id=` |
| [ ] | Detail page: info + permisos + historial | `GET /users/:id` + `/permissions` + `/history` |
| [ ] | Grant permission (dialog) | `POST /users/:id/permissions/grant` |
| [ ] | Revoke permission (confirm) | `POST /users/:id/permissions/revoke` |

**Archivos:**
```
services/users.service.ts
schemas/user.schema.ts
hooks/queries/useUsers.ts
hooks/mutations/useUserMutations.ts
pages/users/index.tsx
pages/users/detail/index.tsx
components/users/
  index.tsx
  components/
    user-list-item/index.tsx
    user-actions/index.tsx
    user-form/index.tsx
    user-permission-list/
      index.tsx
      components/
        user-permission-item/index.tsx
    user-permission-history/index.tsx
    grant-permission-dialog/index.tsx
```

---

## Fase 4 — Categories

> Depende de Clients. Estructura árbol via materialized path.

| Status | Feature | Endpoints |
|--------|---------|-----------|
| [ ] | Lista con path jerárquico | `GET /categories` |
| [ ] | Crear con parent opcional (dialog) | `POST /categories` |
| [ ] | Eliminar (confirm) | `DELETE /categories/:id?client_id=` |

**Archivos:**
```
services/categories.service.ts
schemas/category.schema.ts
hooks/queries/useCategories.ts
hooks/mutations/useCategoryMutations.ts
pages/categories/index.tsx
components/categories/
  index.tsx
  components/
    category-list-item/index.tsx
    category-actions/index.tsx
    category-form/index.tsx
```

---

## Fase 5 — Permissions

> Depende de Clients y Categories.

| Status | Feature | Endpoints |
|--------|---------|-----------|
| [ ] | Lista con category y client | `GET /permissions` |
| [ ] | Crear permiso (dialog) | `POST /permissions` |
| [ ] | Eliminar (confirm) | `DELETE /permissions/:id?client_id=` |

**Archivos:**
```
services/permissions.service.ts
schemas/permission.schema.ts
hooks/queries/usePermissions.ts
hooks/mutations/usePermissionMutations.ts
pages/permissions/index.tsx
components/permissions/
  index.tsx
  components/
    permission-list-item/index.tsx
    permission-actions/index.tsx
    permission-form/index.tsx
```

---

## Fase 6 — Relation Conditions

> Depende de Clients y Permissions.

| Status | Feature | Endpoints |
|--------|---------|-----------|
| [ ] | Lista con filtros (client, permission, is_active) | `GET /relation-conditions` |
| [ ] | Crear condition (dialog) | `POST /relation-conditions` |
| [ ] | Eliminar (confirm) | `DELETE /relation-conditions/:id?client_id=` |

**Archivos:**
```
services/relation-conditions.service.ts
schemas/relation-condition.schema.ts
hooks/queries/useRelationConditions.ts
hooks/mutations/useRelationConditionMutations.ts
pages/relation-conditions/index.tsx
components/relation-conditions/
  index.tsx
  components/
    relation-condition-list-item/index.tsx
    relation-condition-actions/index.tsx
    relation-condition-form/index.tsx
```
