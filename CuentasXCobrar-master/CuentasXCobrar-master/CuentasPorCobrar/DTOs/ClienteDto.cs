namespace CuentasPorCobrar.DTOs
{
    public class ClienteDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Cedula { get; set; }
        public decimal LimiteCredito { get; set; }
        public bool Estado { get; set; }
    }
}
