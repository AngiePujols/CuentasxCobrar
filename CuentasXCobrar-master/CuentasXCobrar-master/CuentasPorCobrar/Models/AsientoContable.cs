namespace CuentasPorCobrar.Models
{
    public class AsientoContable
    {
        public int Id { get; set; }
        public string Nombre { get; set; }

        public int ClienteId { get; set; }
        public Cliente Cliente { get; set; }

        public string Cuenta { get; set; }
        public string TipoMovimiento { get; set; }
        public DateTime FechaAsiento { get; set; }
        public decimal MontoAsiento { get; set; }
        public bool Estado { get; set; }
    }
}
