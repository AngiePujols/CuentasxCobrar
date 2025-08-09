export type Movimiento = {
  cuenta: string;
  debe: number;
  haber: number;
};

export type EntradaContable = {
  fecha: string;
  descripcion: string;
  movimientos: Movimiento[];
};

export type EntradaRespuesta = {
  id?: string;
  _id?: string;
  uuid?: string;
  [k: string]: unknown;
};

export type FilaCxC = {
  idTransaccion: number | string;
  descripcion: string;
  fechaTransaccion: string; // "DD de Mes" en español
  monto: number;
  idAsiento?: string | null; // para columna "Id. Asiento" si la quieres mostrar también
  id_Asientos: string | null; // NUEVA columna
};