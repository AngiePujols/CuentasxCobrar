using System.Transactions;

namespace CuentasPorCobrar.Models
{
    public class Cliente
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Cedula { get; set; }
        public decimal LimiteCredito { get; set; }
        public bool Estado { get; set; }

        public ICollection<Transaccion> Transacciones { get; set; }
        public ICollection<AsientoContable> AsientosContables { get; set; }
    }
}
