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
    public class ClientesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClienteDto>>> Get()
        {
            var clientes = await _context.Clientes
                .Select(c => new ClienteDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Cedula = c.Cedula,
                    LimiteCredito = c.LimiteCredito,
                    Estado = c.Estado
                }).ToListAsync();

            return Ok(clientes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClienteDto>> Get(int id)
        {
            var c = await _context.Clientes.FindAsync(id);
            if (c == null) return NotFound();

            return Ok(new ClienteDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Cedula = c.Cedula,
                LimiteCredito = c.LimiteCredito,
                Estado = c.Estado
            });
        }

        [HttpPost]
        public async Task<ActionResult> Post(ClienteDto dto)
        {
            var c = new Cliente
            {
                Nombre = dto.Nombre,
                Cedula = dto.Cedula,
                LimiteCredito = dto.LimiteCredito,
                Estado = dto.Estado
            };

            _context.Clientes.Add(c);
            await _context.SaveChangesAsync();

            dto.Id = c.Id;
            return CreatedAtAction(nameof(Get), new { id = c.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, ClienteDto dto)
        {
            if (id != dto.Id) return BadRequest();

            var c = await _context.Clientes.FindAsync(id);
            if (c == null) return NotFound();

            c.Nombre = dto.Nombre;
            c.Cedula = dto.Cedula;
            c.LimiteCredito = dto.LimiteCredito;
            c.Estado = dto.Estado;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _context.Clientes.FindAsync(id);
            if (c == null) return NotFound();

            _context.Clientes.Remove(c);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

}
