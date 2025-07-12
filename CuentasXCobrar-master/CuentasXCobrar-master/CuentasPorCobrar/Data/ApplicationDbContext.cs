namespace CuentasPorCobrar.Data
    
{
    using Microsoft.EntityFrameworkCore;
    using CuentasPorCobrar.Models;
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<TiposDocumento> TiposDocumentos { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Transaccion> Transacciones { get; set; }
        public DbSet<AsientoContable> AsientosContables { get; set; }
    }
}
