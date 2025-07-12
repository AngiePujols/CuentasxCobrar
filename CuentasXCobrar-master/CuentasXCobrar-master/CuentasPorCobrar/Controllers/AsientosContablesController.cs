using CuentasPorCobrar.Data;
using CuentasPorCobrar.DTOs;
using CuentasPorCobrar.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CuentasPorCobrar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AsientosContablesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AsientosContablesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AsientoContableDto>>> Get()
        {
            var asientos = await _context.AsientosContables
                .Include(a => a.Cliente)
                .Select(a => new AsientoContableDto
                {
                    Id = a.Id,
                    Nombre = a.Nombre,
                    ClienteId = a.ClienteId,
                    NombreCliente = a.Cliente.Nombre,
                    Cuenta = a.Cuenta,
                    TipoMovimiento = a.TipoMovimiento,
                    FechaAsiento = a.FechaAsiento,
                    MontoAsiento = a.MontoAsiento,
                    Estado = a.Estado
                }).ToListAsync();

            return Ok(asientos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AsientoContableDto>> Get(int id)
        {
            var asiento = await _context.AsientosContables
                .Include(a => a.Cliente)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (asiento == null) return NotFound();

            var dto = new AsientoContableDto
            {
                Id = asiento.Id,
                Nombre = asiento.Nombre,
                ClienteId = asiento.ClienteId,
                NombreCliente = asiento.Cliente.Nombre,
                Cuenta = asiento.Cuenta,
                TipoMovimiento = asiento.TipoMovimiento,
                FechaAsiento = asiento.FechaAsiento,
                MontoAsiento = asiento.MontoAsiento,
                Estado = asiento.Estado
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult> Post(AsientoContableDto dto)
        {
            var asiento = new AsientoContable
            {
                Nombre = dto.Nombre,
                ClienteId = dto.ClienteId,
                Cuenta = dto.Cuenta,
                TipoMovimiento = dto.TipoMovimiento,
                FechaAsiento = dto.FechaAsiento,
                MontoAsiento = dto.MontoAsiento,
                Estado = dto.Estado
            };

            _context.AsientosContables.Add(asiento);
            await _context.SaveChangesAsync();

            dto.Id = asiento.Id;
            return CreatedAtAction(nameof(Get), new { id = asiento.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, AsientoContableDto dto)
        {
            if (id != dto.Id) return BadRequest();

            var asiento = await _context.AsientosContables.FindAsync(id);
            if (asiento == null) return NotFound();

            asiento.Nombre = dto.Nombre;
            asiento.ClienteId = dto.ClienteId;
            asiento.Cuenta = dto.Cuenta;
            asiento.TipoMovimiento = dto.TipoMovimiento;
            asiento.FechaAsiento = dto.FechaAsiento;
            asiento.MontoAsiento = dto.MontoAsiento;
            asiento.Estado = dto.Estado;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var asiento = await _context.AsientosContables.FindAsync(id);
            if (asiento == null) return NotFound();

            _context.AsientosContables.Remove(asiento);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
