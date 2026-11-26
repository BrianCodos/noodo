# Presupuestos · referencia e integración local

Fuente revisada: BrianCodos/monymi, rama main, commit 17dbd482a7d1d1df3874a0f43a46fcaf8aee3fb3.

Archivos examinados: types.ts; components/BudgetView.tsx; components/modals/CreateBudgetModal.tsx, EditBudgetModal.tsx, AddExpenseModal.tsx, EditExpenseModal.tsx; components/MoneySourcesView.tsx; hooks/useBudgetManager.ts; utils/budget.ts, budgetStats.ts, categoryStats.ts, expenseBalance.ts.

Se traslada la estructura funcional: presupuesto global → grupos opcionales → categorías y asignaciones → gastos con fuente y soporte. Incluye copiar estructura, duplicar, editar, orden, fijados, predeterminado, archivo, papelera/restauración, ejecución por categoría, vistas jerárquica/tabla/distribución/movimientos y cuentas.

Adaptaciones deliberadas:
- React y primitivas/tokens de NOODO, sin importar Firebase, autenticación, Telegram ni enlaces públicos de Monymi.
- Base noodo.admin.v1: nuevas colecciones budgets y moneySources; actualización aditiva. Archivos en noodo-admin-files.
- Duplicar remapea también los grupos (no solo las categorías), limpia estados archivado/eliminado/completado y no comparte IDs ni archivos.
- Totales: límite manual si es positivo, si no suma de asignaciones. Ejecutado = gastos reales; proyectado separado. Comprometido = real + proyectado, o máximo con asignación para categorías completadas, siguiendo el compromiso completo de Monymi. Saldo sin asignar puede ser negativo; los excesos no se ocultan.
- En Monymi los deltas de cuenta no discriminan isProjected. Aquí únicamente los gastos reales afectan saldos; convertir un proyectado a real aplica un único débito.
- Cerrar una categoría es explícito, nunca automático al exceder su asignación. Se muestra exceso; no se presenta como éxito.
- Sin purga a 30 días. Presupuestos en papelera mantienen gastos y efecto en cuentas. Anular un gasto revierte su efecto sin borrarlo; retiradas de categorías/grupos son recuperables y no destruyen gastos.
- Cuentas son registros manuales locales; ningún movimiento bancario real. No se duplican gastos en Contabilidad, que conserva su alcance por proyecto.
- Reordenación accesible con subir/bajar en lugar de dependencia drag-and-drop.

Fuera de esta sección: inversiones, deudas, bot, calendarios de pagos y publicación externa. Ningún dato financiero personal de Monymi se importa: se analiza su código.

## Verificación histórica de incorporación

- 55 pruebas automáticas: migración aditiva, cálculos, duplicación, referencias, soportes acumulativos, saldos y restauración.
- `npm run build`: verificación del sistema de diseño, TypeScript y compilación de producción.
- Recorrido en navegador con datos de prueba aislados en localhost: cuenta, presupuesto, grupo, categoría, gasto proyectado, soporte, conversión a real, duplicación, archivo/papelera/restauración y persistencia tras recarga.
- Cuenta inicial de 2.000.000 COP: proyección sin débito, conversión de 250.000 COP a real deja 1.750.000 COP. Duplicar conserva asignaciones y empieza sin gastos.
- Vistas de categorías, tabla y distribución verificadas; ancho móvil de 390 px sin desbordamiento horizontal. Los datos del usuario en 127.0.0.1 se mantienen separados de las pruebas.

## Revisión funcional · 26 de noviembre de 2026

Alcance confirmado por el usuario: **solo Presupuestos**. El usuario eligió mantener las reglas actuales de NOODO y equiparar las funciones. Se consultó nuevamente `main` mediante el conector GitHub: continúa en [17dbd482](https://github.com/BrianCodos/monymi/commit/17dbd482a7d1d1df3874a0f43a46fcaf8aee3fb3). No se ejecutó ni modificó Monymi ni se importaron datos de sus usuarios.

| Función de Monymi | Resultado en el dashboard |
| --- | --- |
| Crear, editar, copiar y duplicar presupuesto | Disponible; grupos y categorías reciben IDs nuevos, la copia empieza sin ejecución ni aprobación. |
| Grupos opcionales, categorías, asignaciones, cambios de grupo | Disponible; se añadieron totales de asignación, real, proyectado y disponible por grupo. |
| Edición directa de montos | Acceso por icono desde el total o la asignación, usando el diálogo y campo numérico del dashboard. |
| Ordenar grupos y categorías | Controles de subir/bajar accesibles. Corregido: omiten retirados y otras categorías ajenas al grupo visible. |
| Registrar y editar gasto, fecha, categoría, fuente, soporte | Disponible; se añadió Guardar y registrar otro conservando la categoría y abriendo un formulario limpio. |
| Vista Tabla con gastos desplegables | Añadida expansión por categoría con las mismas acciones de edición, soporte y anulación. |
| Historial: búsqueda y filtros | Búsqueda por concepto, categoría y cuenta; selección múltiple de grupos, categorías y cuentas, fechas e importes inclusivos, estado real/proyectado/anulado. Rangos invertidos muestran error. |
| Ordenar historial | Ordenación por concepto, fecha, importe, cuenta y estado mediante DataTable. |
| Gráficos por grupo y tendencia de 30 días | Incorporados con tokens NOODO, sin dependencias nuevas. Tendencia diaria real + proyectado, con detalle tabular accesible y fechas de Colombia. Anulados excluidos. |
| Fijar, predeterminado, archivo y papelera | Se conserva la implementación local y el límite de cinco fijados; reapertura y restauración conservan IDs. |
| Compartir públicamente y sincronización de Monymi | Pendiente de backend/autenticación en NOODO. Copiar enlace sigue siendo local; no se presenta como compartición remota. |

Fuentes funcionales: [BudgetView](https://github.com/BrianCodos/monymi/blob/17dbd482a7d1d1df3874a0f43a46fcaf8aee3fb3/components/BudgetView.tsx), [ExpenseHistoryCard](https://github.com/BrianCodos/monymi/blob/17dbd482a7d1d1df3874a0f43a46fcaf8aee3fb3/components/ExpenseHistoryCard.tsx), [useBudgetManager](https://github.com/BrianCodos/monymi/blob/17dbd482a7d1d1df3874a0f43a46fcaf8aee3fb3/hooks/useBudgetManager.ts) y [budgetStats](https://github.com/BrianCodos/monymi/blob/17dbd482a7d1d1df3874a0f43a46fcaf8aee3fb3/utils/budgetStats.ts).

Las adaptaciones deliberadas de la primera sección siguen vigentes: sobreasignaciones visibles, completar manualmente, solo gasto real descuenta cuenta, conservación de archivos/historial y ausencia de purga. Las funciones externas de compartir no se simulan. La administración de Cuentas, inversiones, deudas y calendarios quedó fuera de esta tarea.

### Comprobación nueva

- 75 pruebas en 14 archivos, `design:check` y compilación correctos. Permanece el aviso de Vite por el tamaño del paquete JS; no impide compilar.
- Fixture contrastado con la fórmula de Monymi: total 1.000, asignaciones 900, gasto efectivo/compromiso 500, disponible 500 y saldo sin asignar 100. Se comprueban además filtros combinados, límites inclusivos, anulados, días vacíos/bisiestos y ordenación sin mover registros ocultos.
- QA en `localhost:5173`: grupo y categoría, real de 120.000 y proyección de 80.000 mediante guardado consecutivo; el total disponible fue 1.800.000 sobre 2.000.000. Editar el real a 125.000 actualizó disponible a 1.795.000; cambiar asignación a 600.000 dejó 395.000 disponibles en la categoría. Soporte TXT guardado y abierto dentro del visor.
- Filtros por grupo, categoría, sin cuenta, fecha e importe devolvieron un único gasto. CSV descargado y leído: encabezado y una sola fila del gasto filtrado. Rango invertido de fechas rechazado.
- Duplicación con grupo y categoría preservados, sin gastos, soportes ni aprobación. Archivo/reapertura y papelera/restauración comprobados en la copia; contenido conservado después de recargar.
- Tabla expandida y gráficos revisados a 390 × 844; ancho del documento igual al viewport disponible, sin desbordamiento global. Controles con teclado y foco de diálogos reutilizados. Datos del usuario en `127.0.0.1:5173` no usados para pruebas de escritura.
