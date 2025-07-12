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
    public class TransaccionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransaccionesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransaccionDto>>> Get()
        {
            var transacciones = await _context.Transacciones
                .Include(t => t.Cliente)
                .Include(t => t.TiposDocumento)
                .Select(t => new TransaccionDto
                {
                    Id = t.Id,
                    TipoMovimiento = t.TipoMovimiento,
                    TiposDocumentoId = t.TiposDocumentoId,
                    NombreTipoDocumento = t.TiposDocumento.Nombre,
                    NumeroDocumento = t.NumeroDocumento,
                    Fecha = t.Fecha,
                    ClienteId = t.ClienteId,
                    NombreCliente = t.Cliente.Nombre,
                    Monto = t.Monto
                }).ToListAsync();

            return Ok(transacciones);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransaccionDto>> Get(int id)
        {
            var t = await _context.Transacciones
                .Include(t => t.Cliente)
                .Include(t => t.TiposDocumento)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (t == null) return NotFound();

            var dto = new TransaccionDto
            {
                Id = t.Id,
                TipoMovimiento = t.TipoMovimiento,
                TiposDocumentoId = t.TiposDocumentoId,
                NombreTipoDocumento = t.TiposDocumento.Nombre,
                NumeroDocumento = t.NumeroDocumento,
                Fecha = t.Fecha,
                ClienteId = t.ClienteId,
                NombreCliente = t.Cliente.Nombre,
                Monto = t.Monto
            };

            return Ok(dto);
        }

        [HttpPost]
        public async Task<ActionResult> Post(TransaccionDto dto)
        {
            var trans = new Transaccion
            {
                TipoMovimiento = dto.TipoMovimiento,
                TiposDocumentoId = dto.TiposDocumentoId,
                NumeroDocumento = dto.NumeroDocumento,
                Fecha = dto.Fecha,
                ClienteId = dto.ClienteId,
                Monto = dto.Monto
            };

            _context.Transacciones.Add(trans);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = trans.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, TransaccionDto dto)
        {
            if (id != dto.Id) return BadRequest();

            var trans = await _context.Transacciones.FindAsync(id);
            if (trans == null) return NotFound();

            trans.TipoMovimiento = dto.TipoMovimiento;
            trans.TiposDocumentoId = dto.TiposDocumentoId;
            trans.NumeroDocumento = dto.NumeroDocumento;
            trans.Fecha = dto.Fecha;
            trans.ClienteId = dto.ClienteId;
            trans.Monto = dto.Monto;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var trans = await _context.Transacciones.FindAsync(id);
            if (trans == null) return NotFound();

            _context.Transacciones.Remove(trans);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
