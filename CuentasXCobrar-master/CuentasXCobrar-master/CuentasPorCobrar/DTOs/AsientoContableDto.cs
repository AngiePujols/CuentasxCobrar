namespace CuentasPorCobrar.DTOs
{
    public class AsientoContableDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public int ClienteId { get; set; }
        public string NombreCliente { get; set; }
        public string Cuenta { get; set; }
        public string TipoMovimiento { get; set; }
        public DateTime FechaAsiento { get; set; }
        public decimal MontoAsiento { get; set; }
        public bool Estado { get; set; }
    }
}
