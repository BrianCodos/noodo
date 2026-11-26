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

## Verificación

- 55 pruebas automáticas: migración aditiva, cálculos, duplicación, referencias, soportes acumulativos, saldos y restauración.
- `npm run build`: verificación del sistema de diseño, TypeScript y compilación de producción.
- Recorrido en navegador con datos de prueba aislados en localhost: cuenta, presupuesto, grupo, categoría, gasto proyectado, soporte, conversión a real, duplicación, archivo/papelera/restauración y persistencia tras recarga.
- Cuenta inicial de 2.000.000 COP: proyección sin débito, conversión de 250.000 COP a real deja 1.750.000 COP. Duplicar conserva asignaciones y empieza sin gastos.
- Vistas de categorías, tabla y distribución verificadas; ancho móvil de 390 px sin desbordamiento horizontal. Los datos del usuario en 127.0.0.1 se mantienen separados de las pruebas.
