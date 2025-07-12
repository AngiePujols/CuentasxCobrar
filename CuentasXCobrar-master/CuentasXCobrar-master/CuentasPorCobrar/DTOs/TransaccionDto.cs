namespace CuentasPorCobrar.DTOs
{
    public class TransaccionDto
    {
        public int Id { get; set; }
        public string TipoMovimiento { get; set; }
        public int TiposDocumentoId { get; set; }
        public string NombreTipoDocumento { get; set; }
        public string NumeroDocumento { get; set; }
        public DateTime Fecha { get; set; }
        public int ClienteId { get; set; }
        public string NombreCliente { get; set; }
        public decimal Monto { get; set; }
    }
}
