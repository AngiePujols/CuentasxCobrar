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
    public class TiposDocumentosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TiposDocumentosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TiposDocumentoDto>>> Get()
        {
            var tipos = await _context.TiposDocumentos
                .Select(t => new TiposDocumentoDto
                {
                    Id = t.Id,
                    Nombre = t.Nombre,
                    CuentaContable = t.CuentaContable,
                    Estado = t.Estado
                }).ToListAsync();

            return Ok(tipos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TiposDocumentoDto>> Get(int id)
        {
            var tipo = await _context.TiposDocumentos.FindAsync(id);
            if (tipo == null) return NotFound();

            return Ok(new TiposDocumentoDto
            {
                Id = tipo.Id,
                Nombre = tipo.Nombre,
                CuentaContable = tipo.CuentaContable,
                Estado = tipo.Estado
            });
        }

        [HttpPost]
        public async Task<ActionResult> Post(TiposDocumentoDto dto)
        {
            var tipo = new TiposDocumento
            {
                Nombre = dto.Nombre,
                CuentaContable = dto.CuentaContable,
                Estado = dto.Estado
            };

            _context.TiposDocumentos.Add(tipo);
            await _context.SaveChangesAsync();

            dto.Id = tipo.Id;
            return CreatedAtAction(nameof(Get), new { id = tipo.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, TiposDocumentoDto dto)
        {
            if (id != dto.Id) return BadRequest();

            var tipo = await _context.TiposDocumentos.FindAsync(id);
            if (tipo == null) return NotFound();

            tipo.Nombre = dto.Nombre;
            tipo.CuentaContable = dto.CuentaContable;
            tipo.Estado = dto.Estado;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tipo = await _context.TiposDocumentos.FindAsync(id);
            if (tipo == null) return NotFound();

            _context.TiposDocumentos.Remove(tipo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
