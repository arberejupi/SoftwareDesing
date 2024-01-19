using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UniversityManagementSystem.Data;
using UniversityManagementSystem.Models;

namespace UniversityManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UniversityController : ControllerBase
    {
        private readonly DataContext _context; // Replace YourDbContext with your actual DbContext name

        public UniversityController(DataContext context)
        {
            _context = context;
        }

        // GET: api/University
        [HttpGet]
        public async Task<ActionResult<IEnumerable<University>>> GetUniversities()
        {
            return await _context.University.ToListAsync();
        }

        // GET: api/University/5
        [HttpGet("{id}")]
        public async Task<ActionResult<University>> GetUniversity(int id)
        {
            var university = await _context.University.FindAsync(id);

            if (university == null)
            {
                return NotFound();
            }

            return university;
        }

        // POST: api/University
        [HttpPost]
        public async Task<ActionResult<University>> PostUniversity(University university)
        {
            _context.University.Add(university);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUniversity), new { id = university.university_id }, university);
        }

        // PUT: api/University/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUniversity(int id, University university)
        {
            if (id != university.university_id)
            {
                return BadRequest();
            }

            _context.Entry(university).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UniversityExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/University/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUniversity(int id)
        {
            var university = await _context.University.FindAsync(id);
            if (university == null)
            {
                return NotFound();
            }

            _context.University.Remove(university);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UniversityExists(int id)
        {
            return _context.University.Any(e => e.university_id == id);
        }
    }
}
