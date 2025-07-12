namespace CuentasPorCobrar.Models
{
    public class Transaccion
    {
        public int Id { get; set; }
        public string TipoMovimiento { get; set; }
        public int TiposDocumentoId { get; set; }
        public TiposDocumento TiposDocumento { get; set; }

        public string NumeroDocumento { get; set; }
        public DateTime Fecha { get; set; }

        public int ClienteId { get; set; }
        public Cliente Cliente { get; set; }

        public decimal Monto { get; set; }
    }
}
