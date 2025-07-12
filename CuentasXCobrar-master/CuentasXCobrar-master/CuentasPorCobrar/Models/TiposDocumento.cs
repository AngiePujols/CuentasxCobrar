using System.Transactions;

namespace CuentasPorCobrar.Models
{
    public class TiposDocumento
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string CuentaContable { get; set; }
        public bool Estado { get; set; }

        public ICollection<Transaccion> Transacciones { get; set; }
    }
}
