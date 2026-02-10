import odoorpc

# Conexión a Odoo (Docker expuesto en localhost)
odoo = odoorpc.ODOO('localhost', port=8069)

# Login con tus credenciales de Odoo
odoo.login(
    'odoo',                          # nombre de la base de datos
    'marthagarcia10b@gmail.com',     # tu usuario (correo)
    'Qwe.123*'                       # tu contraseña
)

# Leer oportunidades (crm.lead)
ids = odoo.env['crm.lead'].search([])
opportunities = odoo.env['crm.lead'].read(
    ids,
    ['name', 'planned_revenue', 'stage_id']
)

print(opportunities)  # Si imprime algo, YA GANASTE
